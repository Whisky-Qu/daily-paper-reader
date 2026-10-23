import importlib.util
import json
from io import BytesIO
from pathlib import Path
import pytest

spec = importlib.util.spec_from_file_location('journal_metrics', Path(__file__).parents[1] / 'scripts/update_journal_metrics.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
PAYLOAD = {'code': 200, 'data': {'officialRank': {'all': {'sciUp': '计算机科学1区', 'sciBase': '工程技术2区', 'sciif': '11.1', 'sci': 'Q1', 'unrelated': 'private-custom-data'}}, 'customRank': {'private': 'not-for-publication'}}}

def test_provider_contract_keeps_source_and_unknown_year():
    metrics = m.normalize_rank(PAYLOAD, 'IEEE Transactions on Robotics')
    assert len(metrics) == 4
    upgrade = next(v for v in metrics if v['kind'] == '中科院升级版')
    assert upgrade['value'] == '1区' and upgrade['category'] == '计算机科学'
    assert all(v['year'] is None and v['yearLabel'] == '接口未提供数据年份' for v in metrics)
    assert 'private' not in json.dumps(metrics)
    with pytest.raises(RuntimeError):
        m.normalize_rank({'code': 403, 'msg': 'secret URL'}, 'Journal')

def test_rate_limit_encoding_and_error_redaction():
    calls, sleeps = [], []
    def opener(request, **kwargs):
        calls.append(request)
        return BytesIO(json.dumps(PAYLOAD).encode())
    client = m.Client('test-key-not-real', opener=opener, clock=lambda: 0, sleep=sleeps.append)
    client.rank('A & B'); client.rank('A & B')
    assert 'publicationName=A+%26+B' in calls[0].full_url
    assert sleeps == [.6]
    assert all(not r.has_header('Authorization') for r in calls)
    def failed(request, **kwargs):
        raise ValueError(request.full_url)
    client = m.Client('test-key-not-real', opener=failed)
    with pytest.raises(RuntimeError) as exc:
        client.rank('Journal')
    assert 'test-key' not in str(exc.value) and 'https' not in str(exc.value)

def test_preprint_never_queried_as_journal_and_cache_survives_failure(tmp_path):
    docs = tmp_path / 'docs'; docs.mkdir()
    (docs / '_sidebar.md').write_text('<!--dpr-date:20261022-->')
    report = docs / '202610/22'; report.mkdir(parents=True)
    (report / '_daily_state.json').write_text(json.dumps({'papers': [{'paper_id': '2610.25628v1', 'route': '202610/22/paper', 'title': 'This is a paper title'}]}))
    class Stub:
        def get(self, url):
            return b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>http://arxiv.org/abs/2610.25628v1</id></entry></feed>'
        def rank(self, journal):
            raise AssertionError('must not query a paper title or unconfirmed journal')
        def sleep(self, value):
            pass
    result = m.refresh(tmp_path, key='test-key', client=Stub())
    assert result['papers']['2610.25628']['kind'] == 'preprint'
    assert not result['metrics']
    payload = json.loads((docs / 'assets/journal-metrics.json').read_text())
    assert 'test-key' not in json.dumps(payload)
    payload['journals']['Known Journal'] = {'queried_at': m.now(), 'metrics': m.normalize_rank(PAYLOAD, 'Known Journal')}
    (docs / 'assets/journal-metrics.json').write_text(json.dumps(payload))
    class Failed(Stub):
        def get(self, url):
            raise RuntimeError('unavailable')
    result = m.refresh(tmp_path, key='test-key', force=True, client=Failed())
    assert result['status'] == 'partial' and len(result['metrics']) == 4


def test_explicit_doi_must_match():
    class Stub:
        def get(self, url):
            return json.dumps({'message': {'DOI': '10.1000/wrong', 'type': 'journal-article', 'container-title': ['Journal']}}).encode()
    with pytest.raises(RuntimeError):
        m.resolve_doi(Stub(), {'doi': '10.1000/right'})

def test_accepted_conference_is_not_an_unresolved_preprint():
    assert m.conference_from_comment('Accepted to NeurIPS 2026') == 'NeurIPS 2026'
    assert m.conference_from_comment('Accepted at CoRL 2026 (Oral). Project website: example.org') == 'CoRL 2026'
    assert m.conference_from_comment('6 pages. Presented at IEEE ISAIA 2026') == 'IEEE ISAIA 2026'
    assert m.conference_from_comment('Submitted to IEEE Robotics and Automation Letters (RA-L)') is None
    assert m.conference_from_comment('Submitted to NeurIPS 2026') is None

def test_crossref_discovery_requires_title_authors_and_unique_doi():
    record = {'kind': 'preprint', 'title': 'A robust wearable robot control framework for walking assistance',
              'authors': ['Jane Doe', 'John Smith'], 'source': 'https://arxiv.org/abs/2601.12345'}
    work = {'DOI': '10.1000/example', 'title': [record['title']], 'type': 'journal-article',
            'container-title': ['Verified Journal'], 'author': [{'given': 'Jane', 'family': 'Doe'}, {'given': 'John', 'family': 'Smith'}], 'ISSN': ['1234-5678']}
    class Stub:
        def __init__(self, items): self.items = items
        def get(self, url):
            return json.dumps({'message': {'items': self.items}}).encode()
    assert m.discover_publication(Stub([work]), record)['kind'] == 'journal'
    wrong = dict(work, author=[{'given': 'Other', 'family': 'Author'}])
    assert m.discover_publication(Stub([wrong]), record)['kind'] == 'preprint'
    ambiguous = dict(work, DOI='10.1000/another')
    assert m.discover_publication(Stub([work, ambiguous]), record)['kind'] == 'preprint'
    preprint = dict(work, type='posted-content')
    assert m.discover_publication(Stub([preprint]), record)['kind'] == 'preprint'

def test_citations_exact_doi_zero_unknown_and_published_version():
    class Stub:
        def get(self, url):
            return json.dumps({'results': [
                {'id': 'https://openalex.org/W123', 'doi': 'https://doi.org/10.48550/arxiv.2610.12345', 'cited_by_count': 0},
                {'id': 'https://openalex.org/W456', 'doi': 'https://doi.org/10.1000/published', 'cited_by_count': 8},
                {'id': 'https://openalex.org/W789', 'doi': 'https://doi.org/10.9999/unrelated', 'cited_by_count': 999}
            ]}).encode()
    papers = {'2610.12345': {}, '2610.11111': {}}
    result, failures = m.refresh_citations(Stub(), papers, {}, {})
    assert failures == 0 and result['2610.12345']['count'] == 0
    assert result['2610.11111']['count'] is None and result['2610.11111']['status'] == 'unindexed'
    assert result['2610.12345']['scope'] == 'arXiv 版本'
    result, _ = m.refresh_citations(Stub(), papers, {'2610.12345': {'doi': '10.1000/published'}}, {})
    assert result['2610.12345']['count'] == 8 and result['2610.12345']['scope'] == '正式出版版本'

def test_citation_failure_retains_successful_count_and_rejects_ambiguous_doi():
    class Failed:
        def get(self, url): raise RuntimeError('unavailable')
    old = {'2610.12345': {'count': 4, 'checkedAt': '2020-01-01T00:00:00Z', 'source': 'https://openalex.org/W1'}}
    result, failures = m.refresh_citations(Failed(), {'2610.12345': {}}, {}, old)
    assert failures == 1 and result['2610.12345']['count'] == 4
    assert result['2610.12345']['checkedAt'] == old['2610.12345']['checkedAt']
    assert result['2610.12345']['status'] == 'unavailable'
    class Ambiguous:
        def get(self, url):
            work = {'id': 'https://openalex.org/W1', 'doi': 'https://doi.org/10.48550/arxiv.2610.12345', 'cited_by_count': 1}
            return json.dumps({'results': [work, dict(work, id='https://openalex.org/W2')]}).encode()
    result, _ = m.refresh_citations(Ambiguous(), {'2610.12345': {}}, {}, {})
    assert result['2610.12345']['count'] is None
