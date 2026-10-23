import importlib.util
import json
from pathlib import Path
import urllib.parse
import yaml


def module(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).parents[1] / 'scripts' / (name + '.py'))
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


library = module('update_journal_library')
metrics = module('update_journal_metrics')


def work():
    return {'DOI': '10.3390/bioengineering11070683', 'type': 'journal-article',
        'title': ['Hip Exoskeleton for Cycling Assistance'], 'ISSN': ['2306-5354'],
        'container-title': ['Bioengineering'], 'author': [{'given': 'First', 'family': 'Author'}],
        'published': {'date-parts': [[2024, 7, 5]]},
        'abstract': '<jats:p>A hip exoskeleton provides cycling assistance. The study evaluates assistance control.</jats:p>'}


def test_selection_requires_real_journal_abstract_and_doi_identity(tmp_path, monkeypatch):
    monkeypatch.setattr(library.time, 'sleep', lambda _: None)
    (tmp_path / 'config.yaml').write_text(yaml.safe_dump({'subscriptions': {'intent_profiles': [
        {'tag': 'hip-exo', 'keywords': [{'keyword': 'hip exoskeleton'}]},
        {'tag': 'vision', 'enabled': False, 'keywords': ['vision']}]}}))
    # Preserve an existing arXiv page and saved reading content.
    original = tmp_path / 'docs/202610/20/paper.md'; original.parent.mkdir(parents=True)
    original.write_text('existing arxiv reading and notes')
    item = work()
    registration = dict(item, DOI='10.31525/ct1-example', ISSN=[])
    future = dict(item, published={'date-parts': [[2099]]})
    conference = dict(item, type='proceedings-article')
    unrelated = dict(item, title=['Humanoid vision'], abstract='')
    assert not library.accepted(dict(item, ISSN=['2405-8963']), 'hip exoskeleton', '2026-10-23')
    assert not library.accepted(dict(item, **{'container-title': ['Journal of Physics: Conference Series']}), 'hip exoskeleton', '2026-10-23')
    def fetch(url):
        if '?' in url:
            return {'message': {'items': [registration, future, conference, unrelated, item]}}
        if 'crossref' in url:
            return {'message': item}
        return {'doi': 'https://doi.org/' + item['DOI'], 'best_oa_location': {}}
    report = library.refresh(tmp_path, fetch=fetch)
    assert len(report['papers']) == 1
    paper = report['papers'][0]
    assert paper['doi'] == item['DOI'] and paper['evidence'].startswith('原摘要摘录：')
    assert '<jats' not in paper['abstract']
    page = tmp_path / 'docs' / (paper['route'] + '.md')
    assert '## Abstract' in page.read_text() and item['DOI'] in page.read_text()
    page.write_text(page.read_text() + '\nUSER NOTES\n')
    library.refresh(tmp_path, fetch=fetch)
    assert 'USER NOTES' in page.read_text()
    assert original.read_text() == 'existing arxiv reading and notes'
    # Exercise the actual updater entry point, not only its DOI resolver.
    class Client:
        sleep = staticmethod(lambda _: None)
        def get(self, url):
            if 'crossref' in url:
                return json.dumps({'message': item}).encode()
            return json.dumps({'results': [{'id':'https://openalex.org/W123',
                'doi':'https://doi.org/' + item['DOI'], 'cited_by_count':17}]}).encode()
        def rank(self, journal):
            return metrics.normalize_rank({'code':200, 'data':{'officialRank':{'all':{
                'sciif':'3.7', 'sciUp':'工程技术3区', 'sciBase':'工程技术3区', 'sci':'Q2'}}}}, journal)
    result = metrics.refresh(tmp_path, key='test-only', client=Client())
    key = paper['paper_id']
    assert result['papers'][key]['kind'] == 'journal'
    assert result['citations'][key]['count'] == 17
    assert result['coverage']['journal'] == 1
    assert any(m['kind'] == 'JIF' for m in result['metrics'])
    assert 'test-only' not in (tmp_path / 'docs/assets/journal-metrics.json').read_text()
    (tmp_path / 'docs/_sidebar.md').write_text('<!--dpr-date:20261020-->')
    (original.parent / '_daily_state.json').write_text(json.dumps({'papers':[
        {'paper_id':'2610.12345','route':'202610/20/paper'}]}))
    class ArxivUnavailable(Client):
        def get(self, url):
            if 'arxiv.org' in url:
                raise RuntimeError('arXiv unavailable')
            return super().get(url)
    independent = metrics.refresh(tmp_path, key='test-only', force=True, client=ArxivUnavailable())
    assert independent['papers'][key]['kind'] == 'journal'


def test_exact_lookup_mismatch_cannot_publish(tmp_path):
    (tmp_path / 'config.yaml').write_text('subscriptions:\n  intent_profiles:\n    - tag: hip\n      keywords: [hip exoskeleton]\n')
    item = work()
    def fetch(url):
        return {'message': {'items': [item]}} if '?' in url else {'message': dict(item, DOI='10.1000/wrong')}
    import pytest
    with pytest.raises(RuntimeError, match='未找到'):
        library.refresh(tmp_path, fetch=fetch)
    assert not (tmp_path / 'docs/journal-library/_daily_state.json').exists()


def test_bulk_target_bypasses_same_day_cache_preserves_notes_and_stops_at_target(tmp_path, monkeypatch):
    monkeypatch.setattr(library.time, 'sleep', lambda _: None)
    config='daily_update:\n  mode: manual\nsubscriptions:\n  intent_profiles:\n    - tag: hip\n      keywords: [hip exoskeleton]\n'
    (tmp_path/'config.yaml').write_text(config)
    items=[dict(work(),DOI=f'10.3390/example{i}',**{'container-title':[f'Journal {i % 3}']}) for i in range(12)]
    def fetch(url):
        if '?' in url: return {'message':{'items':items}}
        if 'crossref' in url:
            doi=urllib.parse.unquote(url.split('/works/')[1])
            return {'message':next(w for w in items if w['DOI']==doi)}
        return {}
    first=library.refresh(tmp_path,fetch=fetch)
    assert len(first['papers'])==3
    page=tmp_path/'docs'/(first['papers'][0]['route']+'.md')
    page.write_text(page.read_text()+'\nMY NOTES\n')
    expanded=library.refresh(tmp_path,fetch=fetch,target_per_topic=9)
    assert len(expanded['papers'])==9 and expanded['topic_counts']=={'hip':9}
    assert expanded['journal_count']==3
    assert 'MY NOTES' in page.read_text()
    assert (tmp_path/'config.yaml').read_text()==config
    def no_network(url):raise AssertionError('fulfilled target should reuse today cache')
    assert library.refresh(tmp_path,fetch=no_network,target_per_topic=9)['papers']==expanded['papers']
    # Crossref labels some conference series as journal-article. Repair a
    # previously imported one without deleting its page or the reader's notes.
    expanded['papers'][0]['venue']='Journal of Physics: Conference Series'
    (tmp_path/'docs/journal-library/_daily_state.json').write_text(json.dumps(expanded))
    corrected=library.refresh(tmp_path,fetch=fetch,target_per_topic=9)
    assert len(corrected['papers'])==9
    assert all('Conference Series' not in p['venue'] for p in corrected['papers'])
    assert 'MY NOTES' in page.read_text()


def test_bulk_per_venue_cap_broadens_coverage_without_inventing_extra_papers(tmp_path, monkeypatch):
    monkeypatch.setattr(library.time, 'sleep', lambda _: None)
    (tmp_path/'config.yaml').write_text('subscriptions:\n  intent_profiles:\n    - tag: hip\n      keywords: [hip exoskeleton]\n')
    items=[dict(work(), DOI=f'10.3390/example{i}') for i in range(12)]
    def fetch(url):
        if '?' in url:return {'message':{'items':items}}
        if 'crossref' in url:
            doi=urllib.parse.unquote(url.split('/works/')[1])
            return {'message':next(w for w in items if w['DOI']==doi)}
        return {}
    result=library.refresh(tmp_path,fetch=fetch,target_per_topic=10)
    assert len(result['papers'])==5 and result['topic_counts']['hip']==5
