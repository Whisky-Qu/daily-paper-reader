"""Publish Chinese journal introductions with local CPU translation, never an API.

The NLLB-200 600M int8 weights are pinned and checksum-verified. Existing
English abstracts and reader notes remain in place; translations are cached by
exact DOI and source fingerprint. A summary is an excerpt, not a new claim.
"""
from __future__ import annotations
import argparse
import base64
import gzip
import io
import os
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import urllib.request
import unicodedata

ENGINE = 'NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1'
# Meta NLLB-200 distilled 600M (CC-BY-NC-4.0), converted to int8 by
# JustFrederik. Public personal research use; no model code is executed.
MODEL_BASE = 'https://huggingface.co/JustFrederik/nllb-200-distilled-600M-ct2-int8/resolve/302d78f00e6fdb50a1064059df7c392b735e9d05/'
MODEL_FILES = {
    'config.json':'0c2f6fa2057c7264d052fb4a62ba3476eeae70487acddfa8e779a53a00cbf44c',
    'model.bin':'ed1beaf75134de7505315a5223162f56acff397eff6b50638a500d3936fe707b',
    'shared_vocabulary.txt':'a132a83330f45514c2476eb81d1d69b3c41762264d16ce0a7ea982e5d6c728e5',
    'sentencepiece.bpe.model':'14bb8dfb35c0ffdea7bc01e56cea38b9e3d5efcdcb9c251d6b40538e1aab555a',
}


# Protect domain terms as stable named entities during translation. This avoids
# replacing rare anatomical characters with <unk>, or translating abduction as
# a kidnapping. The replacements are terminology, never new paper findings.
TERMS = [
 ('human pose estimation','人体姿态估计'),('ground reaction force','地面反作用力'),
 ('locomotion mode recognition','运动模式识别'),('locomotion mode prediction','运动模式预测'),
 ('dielectric elastomer actuator','介电弹性体驱动器'),('dielectric elastomer','介电弹性体'),
 ('whole-body control','全身控制'),('whole body control','全身控制'),
 ('human-exoskeleton','人体与外骨骼'),('humanoid robot','人形机器人'),
 ('reinforcement learning','强化学习'),('imitation learning','模仿学习'),
 ('visual perception','视觉感知'),('computer vision','计算机视觉'),
 ('vision-inertial','视觉与惯性'),('visuo-inertial','视觉与惯性'),
 ('motion tracking','运动跟踪'),('intention-driven','意图驱动'),
 ('joint-angle','关节角度'),('joint angle','关节角度'),('hip joint','髋关节'),
 ('upper-limb','上肢'),('upper limb','上肢'),('lower-limb','下肢'),('lower limb','下肢'),
 ('sit-to-stand','坐站转换'),('sim-to-real','仿真到现实迁移'),
 ('vision-based','基于视觉'),('proprioception','本体感觉'),('proprioceptive','本体感知'),
 ('exteroceptive','外部感知'),('exoskeleton','外骨骼'),('exosuit','外骨骼助力服'),
 ('humanoid','人形机器人'),('hip','髋关节'),('ankle','踝关节'),('knee','膝关节'),
 ('shoulder','肩关节'),('elbow','肘关节'),('abduction','外展'),('flexion','屈曲'),
 ('extension','伸展'),('gait','步态'),('locomotion','运动'),('inertial','惯性'),
 ('multimodal','多模态'),('robustness','鲁棒性'),('markerless','无标记'),('rebar','钢筋')]


def protect_terms(text):
    text=unicodedata.normalize('NFKC',text)
    for dash in ['–','—','−','‐','‑']:text=text.replace(dash,'-')
    for i,(term,_) in enumerate(TERMS):
        text=re.sub(r'\b'+re.escape(term)+r'(?:s)?\b',f'XAE{i:02}',text,flags=re.I)
    return text


def restore_terms(text):
    for i,(_,term) in enumerate(TERMS):
        token=f'XAE{i:02}'
        text=re.sub(r'\s*'.join(token),lambda _:term,text,flags=re.I)
    text=re.sub(r'(?<!\d),|,(?!\d)','，',text)
    return text.strip().rstrip('.')+'。' if text.rstrip().endswith('.') else text.strip()


def chinese(text):
    return len(re.findall(r'[\u3400-\u9fff]', text)) >= 8


def sentences(text):
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+(?=[A-Z(])', text) if s.strip()]


def source_brief(text):
    parts = sentences(text)
    method = next((s for s in parts if re.search(r'\b(?:we (?:propose|present|develop)|this (?:paper|study)|proposed|developed|investigates|introduces|presents)\b', s, re.I)), parts[0])
    result = next((s for s in parts if s != method and re.search(r'\b(?:results|achieved|demonstrat|showed|outperform|reduced|improved)\w*\b', s, re.I)), '')
    return method + (' ' + result if result else '')


def excerpt_zh(text, limit=125):
    if len(text) <= limit: return text
    cut = text[:limit]
    end = max(cut.rfind('。'), cut.rfind('；'))
    if end >= 55: return cut[:end+1]
    end = max(cut.rfind('，'), cut.rfind(','), cut.rfind(' '))
    return cut[:end if end >= 70 else limit].rstrip('，,;； ') + '…'


class OfflineTranslator:
    def __init__(self, cache=None):
        import ctranslate2
        import sentencepiece
        cache = Path(cache or Path.home()/'.cache/dpr-translation')
        folder = cache/'nllb-en-zh-v1'; folder.mkdir(parents=True,exist_ok=True)
        for name,digest in MODEL_FILES.items():
            path=folder/name
            if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=digest:
                staged=path.with_suffix('.download')
                with urllib.request.urlopen(MODEL_BASE+name,timeout=120) as response, staged.open('wb') as output:
                    while chunk:=response.read(1024*1024):output.write(chunk)
                if hashlib.sha256(staged.read_bytes()).hexdigest()!=digest:raise RuntimeError('离线模型校验失败')
                staged.replace(path)
        self.tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(folder/'sentencepiece.bpe.model'))
        self.model = ctranslate2.Translator(str(folder), device='cpu', compute_type='int8', inter_threads=1, intra_threads=4)
        self.memo={}

    def __call__(self, text, _protected=True):
        blocks=[]
        for sentence in sentences(protect_terms(text) if _protected else unicodedata.normalize('NFKC',text)):
            tokens=self.tokenizer.encode(sentence,out_type=str)
            # Bound model input while retaining all source chunks.
            blocks.extend(tokens[i:i+140] for i in range(0,len(tokens),140))
        missing=list(dict.fromkeys(tuple(tokens) for tokens in blocks if tuple(tokens) not in self.memo))
        if missing:
            sources=[['eng_Latn']+list(tokens)+['</s>'] for tokens in missing]
            outputs=self.model.translate_batch(sources,target_prefix=[['zho_Hans'] for _ in sources],beam_size=4,disable_unk=True,
                max_decoding_length=512,batch_type='tokens',max_batch_size=1024)
            for tokens,result in zip(missing,outputs):
                self.memo[tokens]=self.tokenizer.decode([v for v in result.hypotheses[0] if v not in ['zho_Hans','</s>']])
        value=''.join(self.memo[tuple(tokens)] for tokens in blocks)
        value=restore_terms(value)
        if re.search(r'XAE\s*\d|<unk>|⁇',value):
            if _protected:return self(text,_protected=False)
            raise ValueError('术语保护未能完整还原')
        return value


def source_digest(paper):
    source={'doi':paper['doi'].lower(),'title':paper['title'],'abstract':paper['abstract'],'style_version':2}
    return hashlib.sha256(json.dumps(source,sort_keys=True,ensure_ascii=False).encode()).hexdigest()


def load_editorial(folder, papers, encoded=''):
    path=folder/'_editorial.zh.json'
    values=json.loads(path.read_text()) if path.exists() else {}
    if encoded:
        if len(encoded)>60000:raise ValueError('中文概述输入过大')
        raw=gzip.GzipFile(fileobj=io.BytesIO(base64.b64decode(encoded,validate=True))).read(512001)
        if len(raw)>512000:raise ValueError('中文概述内容过大')
        incoming=json.loads(raw)
        if not isinstance(incoming,dict):raise ValueError('中文概述格式无效')
        by_id={p['paper_id']:p for p in papers}
        for pid,value in incoming.items():
            if pid not in by_id:continue  # Archived source records keep their old pages/notes.
            paper=by_id[pid]
            if (not isinstance(value,dict) or value.get('source_sha256')!=source_digest(paper)
                or value.get('doi')!=paper['doi'].lower() or not chinese(value.get('summary_zh',''))
                or not 2<=len(value.get('title_zh',''))<=160 or len(value['summary_zh'])>150):
                raise ValueError('中文概述与论文DOI或源摘要不一致')
            values[pid]=value
        path.write_text(json.dumps(values,ensure_ascii=False,indent=2)+'\n')
    return values


def patch_page(path, record):
    original=path.read_text()
    match=re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)',original,re.S)
    if not match: raise ValueError('期刊页面缺少前置信息')
    header=match.group(1)
    body=original[match.end():]
    # Only replace the generated translation block. Other text, including user
    # notes and the complete English abstract, is kept byte-for-byte.
    body=re.sub(r'<!-- dpr-offline-zh:start -->.*?<!-- dpr-offline-zh:end -->\n*','',body,flags=re.S)
    values={'title_zh':record['title_zh'],'tldr':record['summary_zh'],
            'translation_source':ENGINE,'translation_sha':record['source_sha256']}
    for key,value in values.items():
        line=key+': '+json.dumps(value,ensure_ascii=False)
        if re.search(r'^'+re.escape(key)+r':.*$',header,re.M):
            header=re.sub(r'^'+re.escape(key)+r':.*$',lambda _:line,header,flags=re.M)
        else:header+='\n'+line
    description=('中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，' if record.get('summary_reviewed') else ENGINE+'；中文概述为原摘要的方法和结果摘录，')
    block='<!-- dpr-offline-zh:start -->\n## 中文摘要\n\n'+record['abstract_zh']+'\n\n## 翻译说明\n\n'+description+'关键术语与数值请结合英文原文核对。\n<!-- dpr-offline-zh:end -->\n\n'
    result='---\n'+header+'\n---\n\n'+block+body.lstrip('\n')
    if result != original:path.write_text(result)


def refresh(root, *, translate=None, editorial_b64=''):
    root=Path(root);folder=root/'docs/journal-library'
    report_path=folder/'_daily_state.json';report=json.loads(report_path.read_text())
    cache_path=folder/'_translations.zh.json'
    cache=json.loads(cache_path.read_text()) if cache_path.exists() else {'engine':ENGINE,'papers':{}}
    editorial=load_editorial(folder,report['papers'],editorial_b64)
    failures=[]; translated=0
    for paper in report['papers']:
        pid=paper['paper_id'];digest=source_digest(paper)
        record=cache['papers'].get(pid,{})
        try:
            if record.get('source_sha256')!=digest or record.get('engine')!=ENGINE:
                if translate is None:translate=OfflineTranslator()
                edited=editorial.get(pid,{})
                abstract=translate(paper['abstract'])
                if edited.get('source_sha256')==digest:
                    brief=edited['summary_zh'];title=edited['title_zh']
                else:
                    parts=sentences(source_brief(paper['abstract']))
                    method=re.sub(r'\([^)]*\)','',parts[0]).split(',')[0].strip()
                    brief=excerpt_zh(translate(method),75)
                    if len(parts)>1:brief+=' '+excerpt_zh(translate(parts[-1]),48)
                    brief=brief.strip();title=translate(paper['title'])
                if not chinese(abstract) or not chinese(brief) or len(re.findall(r'[\u3400-\u9fff]',title))<2:raise ValueError('未得到有效中文译文')
                record={'doi':paper['doi'].lower(),'source_sha256':digest,'engine':ENGINE,'title_zh':title,'summary_zh':brief,
                        'abstract_zh':abstract,'translated_at':dt.datetime.now(dt.timezone.utc).isoformat()}
                cache['papers'][pid]=record;translated+=1
                if translated%10==0:print(f'Offline translated {translated} articles',flush=True)
            edited=editorial.get(pid,{})
            if edited.get('source_sha256')==digest:
                record.update(title_zh=edited['title_zh'],summary_zh=edited['summary_zh'],summary_reviewed=True)
                cache['papers'][pid]=record
            patch_page(root/'docs'/(paper['route']+'.md'),record)
            paper['evidence']=record['summary_zh']
            paper['title_zh']=record['title_zh']
        except Exception as error:
            print(f'Chinese translation failed: {pid}: {type(error).__name__}: {str(error)[:80]}',flush=True)
            failures.append(pid)  # Keep previous source/translation and never invent Chinese.
        # Keep completed public work on retry without retranslating the collection.
        cache_path.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
    report['chinese_translation']={'engine':ENGINE,'status':'partial' if failures else 'ready',
        'confirmed':len(report['papers'])-len(failures),'failed':failures}
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f'Offline Chinese introductions: {len(report["papers"])-len(failures)}/{len(report["papers"])}; new={translated}; failed={len(failures)}',flush=True)
    if failures:raise RuntimeError('部分中文简介生成失败；已保存成功结果，请重试')
    return report


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    refresh(parser.parse_args().root,editorial_b64=os.getenv('DPR_CHINESE_EDITORIAL_B64',''))
