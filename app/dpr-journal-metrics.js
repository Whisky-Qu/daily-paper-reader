(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root || !root.document) return;
  var promise;
  function load() {
    if (!promise) promise = root.fetch(new URL('docs/assets/journal-metrics.json', root.document.baseURI), { credentials: 'omit', cache: 'no-cache' })
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
    if (!panel) { panel = root.document.createElement('section'); panel.id = 'dpr-journal-metrics'; anchor.insertAdjacentElement('afterend', panel); }
    panel.setAttribute('aria-label', '期刊、影响因子与分区');
    panel.innerHTML = api.render(data, key);
  }
  var style = root.document.createElement('style');
  style.textContent = '#dpr-journal-metrics{margin:1.2rem 0;padding:1rem 1.1rem;border:1px solid var(--border-color,#ddd);border-radius:12px;background:var(--sidebar-background,rgba(128,128,128,.035));font-size:.88rem;line-height:1.6}#dpr-journal-metrics h3{margin:0 0 .6rem;font-size:1rem}#dpr-journal-metrics .dpr-journal-venue{font-weight:600;overflow-wrap:anywhere}#dpr-journal-metrics .dpr-journal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin:.8rem 0}#dpr-journal-metrics .dpr-journal-tile{border:1px solid rgba(128,128,128,.2);border-radius:8px;padding:.7rem;min-width:0}#dpr-journal-metrics .dpr-journal-value{font-size:1.1rem;font-weight:650;margin:.3rem 0}#dpr-journal-metrics .dpr-journal-detail{font-size:.82rem;overflow-wrap:anywhere}#dpr-journal-metrics .dpr-journal-links{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:.7rem}#dpr-journal-metrics p{margin:.35rem 0}@media(max-width:600px){#dpr-journal-metrics .dpr-journal-grid{grid-template-columns:1fr}#dpr-journal-metrics{padding:.85rem}}';
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
    var name = paper?.venue || (paper?.kind === 'preprint' ? 'arXiv 预印本记录 · 期刊待确认' : '期刊信息待核实');
    var tiles = [['中科院升级版', '中科院升级版'], ['JIF', '影响因子 JIF'], ['JCR', 'JCR 分区']].map(function (pair) {
      var found = metrics.filter(function (m) { return m.kind === pair[0]; });
      return '<div class="dpr-journal-tile"><span>' + escape(pair[1]) + '</span>' + (found.length ? found.map(function (m) {
        return '<div class="dpr-journal-value">' + escape(m.value) + '</div><div class="dpr-journal-detail">' + escape(m.category || '') + ' · ' + escape(m.year ? m.year + ' 年数据' : '接口未提供数据年份') + '</div>';
      }).join('') : '<div class="dpr-journal-value">待核实</div><div class="dpr-journal-detail">' + (paper?.kind === 'journal' ? '接口暂无对应数据' : '待确认正式期刊') + '</div>') + '</div>';
    }).join('');
    var base = metrics.filter(function (m) { return m.kind === '中科院基础版'; }).map(function (m) { return '<p class="dpr-journal-detail">中科院基础版：' + escape(m.category) + ' ' + escape(m.value) + '（接口未提供数据年份）</p>'; }).join('');
    var state = data.status === 'not_configured' ? 'EasyScholar 尚未配置。' : data.status === 'partial' ? '部分查询暂不可用，以下保留缓存。' : '来源：EasyScholar 开放接口';
    return '<h3>期刊与分区 · EasyScholar</h3><div class="dpr-journal-venue">' + escape(name) + '</div><div class="dpr-journal-grid">' + tiles + '</div>' + base + '<p class="dpr-journal-detail">' + escape(state) + (data.generated_at ? ' · 同步于 ' + escape(data.generated_at.slice(0, 10)) : '') + '</p>' +
      (paper?.kind !== 'journal' ? '<p class="dpr-journal-detail">尚未确认正式期刊，不将预印本套用期刊影响因子或分区。</p>' : '') +
      '<div class="dpr-journal-links"><a href="https://www.easyscholar.cc/console/user/open" target="_blank" rel="noopener noreferrer">EasyScholar 数据来源</a><a href="https://www.fenqubiao.com/" target="_blank" rel="noopener noreferrer">中科院分区</a><a href="https://jcr.clarivate.com/" target="_blank" rel="noopener noreferrer">JCR</a></div>';
  }
  return { paperID: paperID, applicable: applicable, render: render };
});
