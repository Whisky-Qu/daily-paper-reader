"""Add DOI-verified journal articles alongside, never instead of, the arXiv feed.

Uses public metadata only. Abstract excerpts are labelled as such, not AI reviews.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import html
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request
import yaml


def get(url):
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'DailyPaperReader-JournalLibrary/1.0'})
            with urllib.request.urlopen(request, timeout=25) as response:
                return json.load(response)
        except Exception:
            if attempt == 2:
                raise RuntimeError('期刊元数据请求失败；保留已发布内容') from None
            time.sleep(2 * (attempt + 1))


def plain(value):
    return ' '.join(html.unescape(re.sub(r'<[^>]*>', ' ', str(value or ''))).split())


def doi_id(doi):
    return 'journal-' + hashlib.sha256(doi.lower().encode()).hexdigest()[:20]


def date_of(work):
    for name in ('published-online', 'published-print', 'published', 'issued'):
        parts = (work.get(name) or {}).get('date-parts') or []
        if parts and parts[0]:
            try:
                return dt.date(*(parts[0] + [1, 1])[:3]).isoformat(), len(parts[0])
            except (ValueError, TypeError):
                continue
    return '', 0


def relevant(work, keyword):
    # Search is a candidate generator, not proof of relevance. Require every
    # keyword in the title/abstract; reject adjacent but unrelated title hits.
    text = (plain(' '.join(work.get('title') or [])) + ' ' + plain(work.get('abstract'))).casefold()
    terms = re.findall(r'[a-z0-9]+', keyword.casefold())
    return bool(terms) and all(re.search(r'\b' + re.escape(t) + r'(?:s)?\b', text) for t in terms)


def accepted(work, keyword, today):
    date, _ = date_of(work)
    return (work.get('type') == 'journal-article' and bool(work.get('container-title')) and bool(work.get('ISSN'))
            and bool(re.fullmatch(r'10\.\d{4,9}/\S+', str(work.get('DOI', '')), re.I))
            and not str(work.get('DOI', '')).lower().startswith(('10.48550/', '10.6084/'))
            and bool(work.get('author')) and bool(date) and date <= today
            # IFAC identifies this ISSN as its conference proceedings series:
            # https://ifac-control.org/publications/what-is-ifac-papersonline/
            and '2405-8963' not in (work.get('ISSN') or []) and not work.get('event')
            and not work.get('update-to') and relevant(work, keyword))


def abstract_from_openalex(work):
    inverted = work.get('abstract_inverted_index') or {}
    words = sorted((position, word) for word, positions in inverted.items() for position in positions)
    return ' '.join(word for _, word in words)


def excerpt(text, limit=340):
    if len(text) <= limit:
        return text
    short = text[:limit + 1]
    end = max(short.rfind('. '), short.rfind('; '), short.rfind('。'))
    return short[:end + 1] if end >= limit // 2 else short.rsplit(' ', 1)[0] + '…'


def safe_url(value):
    parsed = urllib.parse.urlsplit(str(value or ''))
    return value if parsed.scheme == 'https' and parsed.hostname and not parsed.username else ''


def write(root, report):
    folder = root / 'docs/journal-library'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / '_daily_state.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    lines = ['# 已发表期刊论文', '',
             '按已保存研究方向检索，并通过 DOI 核对正式期刊记录。保留原有 arXiv 日报；以下为公开元数据与原摘要摘录，不代表全文精读或完整相关文献检索。', '',
             '<div id="dpr-journal-catalog">', '']
    for paper in report['papers']:
        lines += [f'<p><a href="#/{paper["route"]}">{html.escape(paper["title"])}</a> · {html.escape(paper["venue"])} · {paper["publication_date"]}</p>', '']
        path = root / 'docs' / (paper['route'] + '.md')
        # Existing notes and previously published reading content are immutable.
        if path.exists():
            continue
        fields = {'title': paper['title'], 'authors': paper['authors'], 'date': paper['publication_date'],
                  'doi': paper['doi'], 'paper_id': paper['paper_id'], 'source': paper['venue'],
                  'tags': ['query:' + t['label'] for t in paper['tags']], 'tldr': paper['evidence'],
                  'evidence': '正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。'}
        if paper.get('pdf'):
            fields['pdf'] = paper['pdf']
        content = '---\n' + '\n'.join(k + ': ' + json.dumps(v, ensure_ascii=False) for k, v in fields.items()) + '\n---\n\n'
        content += '## Abstract\n\n' + (html.escape(paper['abstract']) if paper['abstract'] else '公开元数据未提供摘要，请通过下方 DOI 阅读原文。') + '\n\n'
        content += '## 正式发表与阅读来源\n\n'
        content += f'- 期刊：{html.escape(paper["venue"])}\n- DOI：[正式出版页面](https://doi.org/{urllib.parse.quote(paper["doi"], safe="/")})\n'
        content += '- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。\n'
        path.write_text(content)
    (folder / 'README.md').write_text('\n'.join(lines) + '\n</div>\n')


def refresh(root, *, per_topic=3, fetch=get):
    root = Path(root)
    target = root / 'docs/journal-library/_daily_state.json'
    previous = json.loads(target.read_text()) if target.exists() else {}
    papers = {p['doi'].lower(): p for p in previous.get('papers', [])}
    profiles = (yaml.safe_load((root / 'config.yaml').read_text()).get('subscriptions') or {}).get('intent_profiles') or []
    stamp = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    today = stamp[:10]
    query_signature = hashlib.sha256(json.dumps([
        [p.get('tag'), p.get('enabled', True), [v if isinstance(v, str) else
          [v.get('keyword'), v.get('enabled', True)] for v in p.get('keywords', [])]]
        for p in profiles], sort_keys=True).encode()).hexdigest()
    if (papers and previous.get('status') == 'ready' and previous.get('generated_at', '')[:10] == today
            and previous.get('query_signature') == query_signature):
        print(f'Journal library: reuse {len(papers)} verified articles from today')
        return previous
    failures = []
    for profile in profiles:
        if profile.get('enabled') is False:
            continue
        tag = str(profile.get('tag', ''))
        if not tag:
            continue
        added = 0
        for entry in (profile.get('keywords') or [])[:3]:
            keyword = entry if isinstance(entry, str) else entry.get('keyword', '')
            if not keyword or (isinstance(entry, dict) and entry.get('enabled') is False):
                continue
            url = 'https://api.crossref.org/works?' + urllib.parse.urlencode({
                'query.title': keyword, 'rows': 18,
                'filter': 'type:journal-article,from-pub-date:2018-01-01,until-pub-date:' + today})
            try:
                candidates = fetch(url)['message']['items']
            except Exception:
                failures.append(tag)
                continue
            for candidate in candidates:
                if added >= per_topic or len(papers) >= 60:
                    break
                if not accepted(candidate, keyword, today):
                    continue
                doi = candidate['DOI'].lower()
                if doi in papers:
                    if not any(t['label'] == tag for t in papers[doi]['tags']):
                        papers[doi]['tags'].append({'kind': 'query', 'label': tag})
                    continue
                # An exact DOI lookup verifies that search hits are real records.
                try:
                    work = fetch('https://api.crossref.org/works/' + urllib.parse.quote(doi, safe=''))['message']
                    if str(work.get('DOI', '')).lower() != doi or not accepted(work, keyword, today):
                        continue
                except Exception:
                    failures.append(tag)
                    continue
                date, precision = date_of(work)
                abstract = plain(work.get('abstract'))
                pdf = ''
                try:
                    oa = fetch('https://api.openalex.org/works/https://doi.org/' + urllib.parse.quote(doi, safe=''))
                    if str(oa.get('doi', '')).lower() == 'https://doi.org/' + doi:
                        abstract = abstract or abstract_from_openalex(oa)
                        pdf = safe_url((oa.get('best_oa_location') or {}).get('pdf_url'))
                except Exception:
                    pass  # Missing OA content does not invalidate a verified journal DOI.
                if not abstract:
                    continue  # A reading card needs an actual source abstract, not a title paraphrase.
                pid = doi_id(doi)
                papers[doi] = {'paper_id': pid, 'route': 'journal-library/' + pid,
                    'title': plain(' '.join(work['title'])), 'doi': doi,
                    'venue': plain(work['container-title'][0]), 'issns': work.get('ISSN') or [],
                    'authors': ', '.join(plain(a.get('given', '') + ' ' + a.get('family', '')) for a in work['author']),
                    'publication_date': date[:4] if precision == 1 else date[:7] if precision == 2 else date,
                    'date_precision': precision, 'abstract': abstract,
                    'pdf': pdf, 'evidence': ('原摘要摘录：' + excerpt(abstract)) if abstract else '公开元数据未提供摘要，请通过 DOI 阅读原文。',
                    'tags': [{'kind': 'query', 'label': tag}], 'section': 'journal', 'added_at': stamp}
                added += 1
                time.sleep(.25)
            if added >= per_topic:
                break
    if not papers:
        raise RuntimeError('未找到可核实的期刊论文；不发布空列表覆盖已有内容')
    report = {'schema_version': 1, 'date': 'journal-library', 'date_label': '已发表期刊',
              'generated_at': stamp, 'status': 'partial' if failures else 'ready',
              'query_signature': query_signature,
              'papers': sorted(papers.values(), key=lambda p: (p['publication_date'], p['title']), reverse=True),
              'query_failures': sorted(set(failures)),
              'method': 'Crossref DOI 核验；关键词在标题/摘要中同时命中；每方向每次最多新增 ' + str(per_topic) + ' 篇，总计最多 60 篇。'}
    write(root, report)
    print(f'Journal library: {len(papers)} verified DOI articles; status={report["status"]}')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--per-topic', type=int, default=3, choices=range(1, 6))
    args = parser.parse_args()
    refresh(args.root, per_topic=args.per_topic)
