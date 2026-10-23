(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root || !root.document) return;
  var promise;
  function load() {
    var url = new URL('docs/assets/journal-metrics.json', root.document.baseURI);
    url.searchParams.set('v', String(Date.now()));
    if (!promise) promise = root.fetch(url, { credentials: 'omit', cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('unavailable'); return r.json(); })
      .catch(function () { return { status: 'not_configured', papers: {}, metrics: [], message: 'EasyScholar 指标暂未同步。' }; });
    return promise;
  }
  async function render() {
    var route = root.location.hash;
    var anchor = root.document.querySelector('.paper-meta-row');
    if (!anchor) return;
    var key = api.paperID(route, anchor.querySelector('[data-pdf-url]')?.getAttribute('data-pdf-url'));
    var data = await load();
    if (route !== root.location.hash || !anchor.isConnected) return;
    var panel = root.document.getElementById('dpr-journal-metrics');
    if (!panel) { panel = root.document.createElement('section'); panel.id = 'dpr-journal-metrics'; anchor.insertAdjacentElement('beforebegin', panel); }
    panel.setAttribute('aria-label', '期刊、分区、影响因子与被引次数');
    panel.innerHTML = api.render(data, key);
  }
  var style = root.document.createElement('style');
  style.textContent = `
#dpr-journal-metrics{margin:1.1rem 0 1.5rem;padding:1rem 1.1rem;border:1px solid var(--border-color,#e1e6ef);border-radius:14px;background:var(--sidebar-background,#fafbfe);font-size:.88rem;line-height:1.6}
#dpr-journal-metrics h3{margin:0 0 .7rem;font-size:.94rem;font-weight:650}
#dpr-journal-metrics .dpr-journal-badges{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;margin:.6rem 0}
#dpr-journal-metrics .dpr-metric-chip{display:inline-flex;align-items:center;gap:5px;max-width:100%;box-sizing:border-box;padding:4px 11px;border-radius:999px;font-size:.85rem;font-weight:600;line-height:1.55;text-decoration:none;white-space:nowrap;background:#e4edff;color:#244c89;border:1px solid transparent}
#dpr-journal-metrics .dpr-chip-venue{white-space:normal;overflow-wrap:anywhere;border-radius:12px}
#dpr-journal-metrics .dpr-chip-cas{background:#ffe3ed;color:#9b2853}
#dpr-journal-metrics .dpr-chip-base,#dpr-journal-metrics .dpr-chip-jcr{background:#fff0ad;color:#70500a}
#dpr-journal-metrics .dpr-chip-if{background:#d9f0f9;color:#155775}
#dpr-journal-metrics .dpr-chip-cited{background:#ede5ff;color:#6642a0}
#dpr-journal-metrics .dpr-chip-unknown{background:#edf0f4;color:#536071;font-weight:500}
#dpr-journal-metrics a.dpr-metric-chip:hover,#dpr-journal-metrics a.dpr-metric-chip:focus-visible{border-color:currentColor}
#dpr-journal-metrics .dpr-journal-detail{font-size:.78rem;color:var(--text-color,#536071);opacity:.85;overflow-wrap:anywhere}
#dpr-journal-metrics .dpr-journal-links{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:.7rem}
#dpr-journal-metrics p{margin:.4rem 0}#dpr-journal-metrics details{margin-top:.55rem}
body.dpr-dark #dpr-journal-metrics .dpr-metric-chip{filter:brightness(.93)}
@media(max-width:600px){#dpr-journal-metrics{padding:.85rem}#dpr-journal-metrics .dpr-metric-chip{font-size:.8rem;padding:4px 9px}}
`;
  root.document.head.appendChild(style);
  root.document.addEventListener('dpr-docsify-ready', function () { root.requestAnimationFrame(render); });
  root.addEventListener('hashchange', function () { root.requestAnimationFrame(render); });
  render();
})(typeof window !== 'undefined' ? window : null, function () {
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function paperID(route, pdf) { var match = String(pdf || route || '').match(/(?:^|[^\d])(\d{4}\.\d{4,5})(?:v\d+)?/); return match ? match[1] : ''; }
  function applicable(data, id) {
    var publication = (data.papers || {})[id];
    if (!publication || publication.kind !== 'journal' || !publication.venue) return [];
    function normal(value) { return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); }
    return (data.metrics || []).filter(function (metric) {
      if (metric.issn && (publication.issns || []).length) return publication.issns.some(function (issn) { return issn.toUpperCase() === metric.issn.toUpperCase(); });
      return normal(metric.journal) === normal(publication.venue);
    });
  }
  function render(data, id) {
    var paper = (data.papers || {})[id];
    var metrics = applicable(data, id);
    var citation = (data.citations || {})[id];
    var name = paper?.venue || (paper?.kind === 'preprint' ? 'arXiv 预印本' : '出版信息尚未确认');
    var isJournal = paper?.kind === 'journal';
    function chip(label, type, url) {
      var safe = /^https:\/\//i.test(url || '') && !/[\s"<>]/.test(url);
      var tag = safe ? 'a' : 'span';
      return '<' + tag + ' class="dpr-metric-chip dpr-chip-' + type + '"' + (safe ? ' href="' + escape(url) + '" target="_blank" rel="noopener noreferrer"' : '') + '>' + escape(label) + '</' + tag + '>';
    }
    var pills = chip(name, 'venue', paper?.source);
    if (isJournal) {
      [['中科院升级版', '中科院升级版', 'cas'], ['中科院基础版', '中科院基础版', 'base'], ['JIF', 'IF', 'if'], ['JCR', 'JCR', 'jcr']].forEach(function (pair) {
        var found = metrics.filter(function (m) { return m.kind === pair[0]; });
        if (found.length) found.forEach(function (m) { pills += chip(pair[1] + ' ' + (m.category && pair[0] !== 'JIF' ? m.category + ' ' : '') + m.value, pair[2], m.source); });
        else pills += chip(pair[1] + ' 暂无数据', 'unknown');
      });
    }
    var hasCount = Number.isInteger(citation?.count) && citation.count >= 0;
    pills += chip(hasCount ? '被引 ' + citation.count + (citation.status !== 'confirmed' ? ' · 缓存' : '') : '被引 ' + (citation?.status === 'unindexed' ? '尚未收录' : citation?.status === 'unavailable' ? '查询暂不可用' : '尚未同步'), hasCount ? 'cited' : 'unknown', citation?.source);
    var reason = paper?.kind === 'conference' ? '会议论文：期刊影响因子和中科院 / JCR 分区不适用。' :
      paper?.lookupStatus === 'unavailable' ? '出版记录查询暂不可用，尚未确认期刊归属。' :
      paper?.kind === 'preprint' ? '尚未匹配正式发表期刊，暂不显示期刊 IF 和分区。' : '尚未确认正式发表期刊。';
    var years = metrics.length ? '<p class="dpr-journal-detail">期刊指标：EasyScholar · ' + escape(Array.from(new Set(metrics.map(function (m) { return m.year ? m.year + ' 年数据' : '接口未提供数据年份'; }))).join('；')) + '</p>' : '';
    var counts = citation ? '<p class="dpr-journal-detail">被引来源：' + escape(citation.provider || 'OpenAlex') + (citation.scope ? ' · ' + escape(citation.scope) : '') + (citation.checkedAt ? ' · 查询于 ' + escape(citation.checkedAt.slice(0, 10)) : '') + (hasCount && citation.status !== 'confirmed' ? ' · 本次未取得新值，保留上次查询结果' : '') + '；不同数据库计数可能不同。</p>' : '';
    var coverage = data.coverage ? '<p class="dpr-journal-detail">本批 ' + escape(data.coverage.total) + ' 篇 · 已确认期刊 ' + escape(data.coverage.journal) + ' 篇 · 会议 ' + escape(data.coverage.conference) + ' 篇</p>' : '';
    return '<h3>期刊与论文指标</h3><div class="dpr-journal-badges">' + pills + '</div>' +
      (!isJournal ? '<p class="dpr-journal-detail">' + escape(reason) + '</p>' : '') + years + counts +
      '<details><summary>来源与出版核对</summary><p class="dpr-journal-detail">' + escape(paper?.note || '此论文尚未进入出版记录缓存。') + '</p>' + coverage +
      '<p class="dpr-journal-detail">元数据同步：' + escape(data.generated_at || '尚未同步') + '</p>' +
      '<div class="dpr-journal-links"><a href="https://www.easyscholar.cc/console/user/open" target="_blank" rel="noopener noreferrer">EasyScholar</a><a href="https://www.fenqubiao.com/" target="_blank" rel="noopener noreferrer">中科院分区</a><a href="https://jcr.clarivate.com/" target="_blank" rel="noopener noreferrer">JCR</a></div></details>';
  }

  return { paperID: paperID, applicable: applicable, render: render };
});
