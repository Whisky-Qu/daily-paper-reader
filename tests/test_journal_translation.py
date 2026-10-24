import importlib.util,json
from pathlib import Path
import pytest
spec=importlib.util.spec_from_file_location('offline_zh',Path(__file__).parents[1]/'scripts/translate_journal_library.py')
translation=importlib.util.module_from_spec(spec);spec.loader.exec_module(translation)


def fixture(tmp_path):
    folder=tmp_path/'docs/journal-library';folder.mkdir(parents=True)
    paper={'paper_id':'journal-example','route':'journal-library/journal-example','doi':'10.1000/example',
           'title':'Vision-Based Exoskeleton Control','abstract':'This study proposes a vision-based control method. Results show improved accuracy.', 'evidence':'English excerpt'}
    (folder/'_daily_state.json').write_text(json.dumps({'papers':[paper]}))
    page=folder/'journal-example.md'
    page.write_text('---\ntitle: "Vision-Based Exoskeleton Control"\ndoi: "10.1000/example"\ntldr: "English excerpt"\n---\n\n## Abstract\n\n'+paper['abstract']+'\n\n## My notes\n\nUSER NOTES: keep this exact line.\n')
    return folder,page,paper


def test_chinese_intro_full_abstract_cache_and_notes(tmp_path):
    folder,page,paper=fixture(tmp_path)
    calls=[]
    def translate(text):
        calls.append(text)
        return '本文提出基于视觉的外骨骼控制方法。实验结果显示识别准确率有所提高。'
    report=translation.refresh(tmp_path,translate=translate)
    text=page.read_text()
    assert 'title_zh:' in text and '## 中文摘要' in text and translation.ENGINE in text
    assert paper['abstract'] in text and 'USER NOTES: keep this exact line.' in text
    assert report['papers'][0]['evidence'].startswith('本文提出')
    assert report['chinese_translation']['confirmed']==1
    previous=text
    translation.refresh(tmp_path,translate=lambda _:pytest.fail('same source must reuse offline translation cache'))
    assert page.read_text()==previous
    # A changed source fingerprint must regenerate, without multiplying sections.
    report['papers'][0]['abstract']+=' This method is validated experimentally.'
    (folder/'_daily_state.json').write_text(json.dumps(report))
    translation.refresh(tmp_path,translate=translate)
    assert len(calls)>3 and page.read_text().count('## 中文摘要')==1
    assert 'USER NOTES: keep this exact line.' in page.read_text()


def test_failed_translation_cannot_publish_english_as_chinese(tmp_path):
    folder,page,paper=fixture(tmp_path);before=page.read_text()
    with pytest.raises(RuntimeError,match='部分中文'):
        translation.refresh(tmp_path,translate=lambda _: 'English output only')
    assert page.read_text()==before
    assert json.loads((folder/'_daily_state.json').read_text())['chinese_translation']['confirmed']==0


def test_excerpt_selects_source_method_result_without_inventing_claims():
    source='An opening sentence. This study proposes a robot controller. Results show a 20% reduction. Further details.'
    assert translation.source_brief(source)=='This study proposes a robot controller. Results show a 20% reduction.'
    assert len(translation.excerpt_zh('这是一段经过离线翻译的论文摘要。'*40))<=126


def test_protected_anatomical_terms_roundtrip_with_numbers():
    source='Hip exoskeletons use upper-limb human pose estimation; PCK = 0.947.'
    text=translation.restore_terms(translation.protect_terms(source))
    assert '髋关节' in text and '外骨骼' in text and '上肢' in text and '人体姿态估计' in text
    assert '0.947' in text and 'XAE' not in text


def test_reviewed_chinese_requires_exact_doi_and_source_fingerprint(tmp_path):
    import base64,gzip
    folder,page,paper=fixture(tmp_path)
    edits={paper['paper_id']:{'doi':paper['doi'],'source_sha256':translation.source_digest(paper),
        'title_zh':'视觉辅助的外骨骼控制研究','summary_zh':'研究提出视觉控制方法，并通过实验检验识别准确率。'}}
    encoded=lambda data:base64.b64encode(gzip.compress(json.dumps(data).encode())).decode()
    translation.refresh(tmp_path,translate=lambda _: '本文提出视觉辅助控制方法，并且验证了该方法的识别效果。',editorial_b64=encoded(edits))
    text=page.read_text();assert edits[paper['paper_id']]['summary_zh'] in text
    assert '依据原摘要核对整理' in text and 'USER NOTES: keep this exact line.' in text
    edits[paper['paper_id']]['doi']='10.1000/wrong'
    with pytest.raises(ValueError,match='DOI'):
        translation.refresh(tmp_path,translate=lambda _:pytest.fail('must reject before translation'),editorial_b64=encoded(edits))
