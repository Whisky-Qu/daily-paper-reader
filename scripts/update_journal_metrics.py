"""Resolve explicit publications and cache EasyScholar metrics without publishing secrets."""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

PROVIDER = 'https://www.easyscholar.cc/open/getPublicationRank'
SOURCE = 'https://www.easyscholar.cc/console/user/open'
FIELDS = {'sciUp': '中科院升级版', 'sciBase': '中科院基础版', 'sciif': 'JIF', 'sci': 'JCR', 'ssci': 'JCR'}

def now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')

def fresh(stamp, days=7):
    try:
        return dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(stamp.replace('Z', '+00:00')) < dt.timedelta(days=days)
    except (ValueError, TypeError, AttributeError):
        return False

def canonical(value):
    return re.sub(r'v\d+$', '', value.rsplit('/abs/', 1)[-1])

class Client:
    def __init__(self, key, opener=urllib.request.urlopen, clock=time.monotonic, sleep=time.sleep):
        self.key, self.opener, self.clock, self.sleep = key, opener, clock, sleep
        self.last = None
    def get(self, url, *, provider=False):
        if provider and self.last is not None:
            self.sleep(max(0, .6 - (self.clock() - self.last)))
        if provider:
            self.last = self.clock()
        req = urllib.request.Request(url, headers={'User-Agent': 'DailyPaperReader-JournalMetadata/1.0'})
        try:
            with self.opener(req, timeout=25) as response:
                return response.read()
        except Exception:
            # Never surface request URLs: the provider requires its key in the query string.
            raise RuntimeError('元数据服务请求失败；保留已有缓存') from None
    def rank(self, journal):
        if not self.key:
            raise RuntimeError('未配置 EASYSCHOLAR_SECRET_KEY')
        url = PROVIDER + '?' + urllib.parse.urlencode({'secretKey': self.key, 'publicationName': journal})
        payload = json.loads(self.get(url, provider=True))
        return normalize_rank(payload, journal)

def normalize_rank(payload, journal, issns=None):
    if payload.get('code') != 200:
        raise RuntimeError('EasyScholar 未接受请求；请检查密钥或稍后重试')
    rank = ((payload.get('data') or {}).get('officialRank') or {}).get('all') or {}
    if not isinstance(rank, dict):
        raise RuntimeError('EasyScholar 数据结构不兼容')
    metrics = []
    for field, kind in FIELDS.items():
        raw = rank.get(field)
        if not isinstance(raw, (str, int, float)) or isinstance(raw, bool):
            continue
        value = str(raw).strip()
        if not value or value in ('-', '无', 'null', 'None'):
            continue
        if field == 'sciif' and (not re.fullmatch(r'\d+(?:\.\d+)?', value) or float(value) <= 0):
            continue
        if field in ('sci', 'ssci') and not re.search(r'Q[1-4]', value, re.I):
            continue
        category = 'SCI' if field == 'sci' else 'SSCI' if field == 'ssci' else ''
        if field in ('sciUp', 'sciBase'):
            match = re.fullmatch(r'(.*?)([1-4一二三四]区)(.*)', value)
            if match:
                category, value = match[1].strip(), match[2] + match[3]
        metrics.append({'journal': journal, 'issn': (issns or [''])[0], 'kind': kind,
                        'value': value[:160], 'year': None, 'category': category[:160],
                        'source': SOURCE, 'origin': 'EasyScholar 开放接口',
                        'yearLabel': '接口未提供数据年份', 'provider_field': field})
    return metrics

def collect_papers(root, limit=200):
    sidebar = root / 'docs/_sidebar.md'
    paths = list(dict.fromkeys(re.findall(r'<!--dpr-date:(\d{8}(?:-\d{8})?)-->', sidebar.read_text() if sidebar.exists() else '')))[:4]
    papers = {}
    for token in paths:
        path = token if '-' in token else token[:6] + '/' + token[6:]
        source = root / 'docs' / path / '_daily_state.json'
        if not source.exists():
            continue
        for p in json.loads(source.read_text()).get('papers', []):
            if p.get('paper_id') and p.get('route'):
                papers.setdefault(canonical(str(p['paper_id'])), p)
    return dict(list(papers.items())[:limit])

def arxiv_records(client, ids):
    records = {}
    ids = [i for i in ids if re.fullmatch(r'\d{4}\.\d{4,5}', i)]
    ns = {'a': 'http://www.w3.org/2005/Atom', 'ar': 'http://arxiv.org/schemas/atom'}
    for start in range(0, len(ids), 50):
        if start:
            client.sleep(3)
        url = 'https://export.arxiv.org/api/query?' + urllib.parse.urlencode({'id_list': ','.join(ids[start:start+50]), 'max_results': len(ids[start:start+50])}, safe=',')
        xml = client.get(url)
        if b'<!DOCTYPE' in xml or b'<!ENTITY' in xml:
            raise RuntimeError('拒绝带外部实体的出版元数据')
        for entry in ET.fromstring(xml).findall('a:entry', ns):
            source = entry.findtext('a:id', '', ns).replace('http:', 'https:')
            if not source.startswith('https://arxiv.org/abs/'):
                continue
            ref = entry.findtext('ar:journal_ref', '', ns).strip()
            doi = entry.findtext('ar:doi', '', ns).strip()
            records[canonical(source)] = {'kind': 'reference' if ref or doi else 'preprint', 'venue': ref or None,
                'doi': doi or None, 'issns': [], 'source': source, 'checkedAt': now(),
                'note': 'arXiv 作者提供的出版参考，按 DOI 核对正式记录。' if ref or doi else 'arXiv 记录暂无期刊参考或正式 DOI，不据此断言尚未发表。'}
    return records

def resolve_doi(client, record):
    doi = record.get('doi') or ''
    if not doi.startswith('10.') or doi.lower().startswith('10.48550/arxiv'):
        return record
    data = json.loads(client.get('https://api.crossref.org/works/' + urllib.parse.quote(doi, safe='')))['message']
    if str(data.get('DOI', '')).lower() != doi.lower():
        raise RuntimeError('Crossref DOI 不匹配')
    kind = {'journal-article': 'journal', 'proceedings-article': 'conference'}.get(data.get('type'))
    venue = (data.get('container-title') or [''])[0]
    if kind and venue:
        return {'kind': kind, 'venue': venue, 'doi': doi, 'issns': data.get('ISSN', []),
                'source': 'https://doi.org/' + doi, 'note': '通过明确 DOI 核对 Crossref 出版记录。', 'checkedAt': now()}
    return record

def refresh(root, *, key, force=False, probe='', client=None):
    output = root / 'docs/assets/journal-metrics.json'
    try:
        previous = json.loads(output.read_text())
    except (OSError, ValueError):
        previous = {}
    result = {'schema_version': 1, 'provider': 'EasyScholar', 'generated_at': now(), 'status': 'ready' if key else 'not_configured',
              'papers': dict(previous.get('papers') or {}), 'journals': dict(previous.get('journals') or {}), 'metrics': []}
    client = client or Client(key)
    errors = 0
    papers = collect_papers(root)
    missing = [i for i in papers if force or not fresh(result['papers'].get(i, {}).get('checkedAt'))]
    if missing:
        try:
            records = arxiv_records(client, missing)
            for ident, record in records.items():
                try:
                    result['papers'][ident] = resolve_doi(client, record)
                except Exception:
                    errors += 1
                    result['papers'][ident] = record
        except Exception:
            errors += 1
    journals = {}
    for publication in result['papers'].values():
        if publication.get('kind') == 'journal' and publication.get('venue'):
            journals[publication['venue']] = publication.get('issns') or []
    if probe:
        journals.setdefault(probe, [])
    if key:
        for journal, issns in list(journals.items())[:100]:
            cached = result['journals'].get(journal, {})
            if not force and fresh(cached.get('queried_at')):
                continue
            try:
                metrics = client.rank(journal)
                for metric in metrics:
                    metric['issn'] = issns[0] if issns else ''
                result['journals'][journal] = {'queried_at': now(), 'metrics': metrics}
            except Exception:
                errors += 1
    for journal in result['journals'].values():
        result['metrics'].extend(journal.get('metrics') or [])
    if key and errors:
        result['status'] = 'partial'
    result['message'] = 'EasyScholar 尚未配置，请在仓库 Secret 中添加密钥。' if not key else ('部分服务暂不可用，保留已有缓存。' if errors else 'EasyScholar 指标已同步；未确认期刊的论文不套用分区。')
    output.parent.mkdir(parents=True, exist_ok=True)
    staged = output.with_suffix('.tmp')
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if key and key in serialized:
        raise RuntimeError('拒绝发布包含密钥的元数据')
    staged.write_text(serialized)
    staged.replace(output)
    print(f"Publication metadata: {len(papers)} papers; EasyScholar: {len(result['journals'])} journals; status: {result['status']}")
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--probe-journal', default='')
    args = parser.parse_args()
    result = refresh(args.root, key=os.environ.get('EASYSCHOLAR_SECRET_KEY', '').strip(), force=args.force, probe=args.probe_journal)
    if result['status'] == 'partial' and not result['metrics']:
        raise SystemExit('Journal metadata incomplete; provider error details omitted to protect secrets.')

if __name__ == '__main__':
    main()
