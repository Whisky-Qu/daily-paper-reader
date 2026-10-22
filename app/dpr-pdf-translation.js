// Browser-local translation only. This module has no network or credential client.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DPRPdfTranslation = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const MAX_CHARS = 1400;
  function chunks(text, limit = MAX_CHARS) {
    let remaining = String(text || '').trim();
    const result = [];
    while (remaining.length > limit) {
      const head = remaining.slice(0, limit);
      let split = Math.max(head.lastIndexOf('. '), head.lastIndexOf('; '), head.lastIndexOf('? '), head.lastIndexOf('! '));
      split = split >= limit / 3 ? split + 1 : head.lastIndexOf(' ');
      if (split < limit / 3) split = limit;
      result.push(remaining.slice(0, split).trim());
      remaining = remaining.slice(split).trim();
    }
    if (remaining) result.push(remaining);
    return result;
  }
  function paragraphs(content) {
    const lines = [];
    let line = '', y = null, height = 12, previousY = null;
    function flush() { if (line.trim()) lines.push({ text: line.trim(), y, height }); line = ''; }
    for (const item of content.items || []) {
      if (typeof item.str !== 'string') continue;
      const nextY = item.transform?.[5] ?? y;
      if (line && y != null && nextY != null && Math.abs(y - nextY) > Math.max(2, height * .45)) flush();
      if (!line) { y = nextY; height = Math.abs(item.height || item.transform?.[3] || 12); }
      line += (line && !/\s$/.test(line) && !/^[,.;:!?)]/.test(item.str) ? ' ' : '') + item.str;
      if (item.hasEOL) flush();
    }
    flush();
    const groups = []; let block = '';
    for (const row of lines) {
      const gap = previousY == null || row.y == null ? 0 : previousY - row.y;
      if (block && (gap < -row.height || gap > row.height * 1.8 || block.length > 1000)) {
        groups.push(block); block = '';
      }
      block = /[a-z]-$/i.test(block) && /^[a-z]/.test(row.text)
        ? block.slice(0, -1) + row.text : block + (block ? ' ' : '') + row.text;
      previousY = row.y;
    }
    if (block) groups.push(block);
    return groups.flatMap(text => chunks(text));
  }
  function checkAbort(signal) { if (signal?.aborted) throw new DOMException('Paused', 'AbortError'); }
  async function translateDocument({ pdf, translator, signal, cache = new Map(), onPage = () => {}, onProgress = () => {} }) {
    let readablePages = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      checkAbort(signal);
      let result = cache.get(number);
      if (!result) {
        const page = await pdf.getPage(number);
        const text = await page.getTextContent();
        checkAbort(signal);
        const blocks = paragraphs(text).map(en => ({ en, zh: '' }));
        result = { number, blocks, complete: false };
        cache.set(number, result);
      }
      if (result.blocks.some(block => /[a-z]{2}/i.test(block.en))) readablePages++;
      onPage(result);
      for (let index = 0; index < result.blocks.length; index++) {
        checkAbort(signal);
        const block = result.blocks[index];
        if (!block.zh) {
          onProgress(number, pdf.numPages, index + 1, result.blocks.length);
          const translated = /[a-z]{2}/i.test(block.en)
            ? await translator.translate(block.en, { signal }) : block.en;
          checkAbort(signal);
          if (!String(translated || '').trim()) throw new Error('Empty translation');
          block.zh = String(translated).trim();
          onPage(result);
        }
      }
      result.complete = true;
      onPage(result);
    }
    return { readablePages, pages: pdf.numPages };
  }

  function attach(panel, pdf) {
    panel.dprTranslation?.dispose();
    const doc = panel.ownerDocument, win = doc.defaultView;
    const stage = panel.querySelector('.dpr-pdf-preview-stage');
    const canvases = panel.querySelector('.dpr-pdf-preview-pages');
    const toolbar = doc.createElement('div'); toolbar.className = 'dpr-pdf-translation-toolbar';
    toolbar.innerHTML = '<div class="dpr-pdf-language-row"><div class="dpr-pdf-language-switch" role="group" aria-label="阅读语言">' +
      '<button type="button" data-mode="original" aria-pressed="true">英文原 PDF</button>' +
      '<button type="button" data-mode="chinese" aria-pressed="false">中文</button>' +
      '<button type="button" data-mode="bilingual" aria-pressed="false">中英对照</button></div>' +
      '<button type="button" class="dpr-pdf-translate-start">免费全文翻译</button></div>' +
      '<p class="dpr-pdf-translation-status" role="status" aria-live="polite"></p>' +
      '<details class="dpr-pdf-translation-help"><summary>免费翻译说明</summary>' +
      '<p>Chrome 在本机翻译，不使用 DeepSeek 或其他付费 API。首次需要下载语言包；译文暂存在当前页面，刷新后需重新翻译。中文按页展示提取的文字，图片、公式和原始排版请切回英文原 PDF。扫描图片暂不支持识别。</p>' +
      '<a href="https://developer.chrome.com/docs/ai/translator-api" target="_blank" rel="noopener noreferrer">浏览器支持与官方说明</a></details>';
    panel.insertBefore(toolbar, stage);
    const reading = doc.createElement('div'); reading.className = 'dpr-pdf-translated-pages'; reading.hidden = true;
    stage.appendChild(reading);
    const status = toolbar.querySelector('[role="status"]');
    const start = toolbar.querySelector('.dpr-pdf-translate-start');
    const modeButtons = Array.from(toolbar.querySelectorAll('[data-mode]'));
    const cache = new Map(), sections = new Map();
    let mode = 'original', controller = null, translator = null, active = false, disposed = false, complete = false;
    function message(text, error = false) { status.textContent = text; status.classList.toggle('is-error', error); }
    function setMode(next) {
      const current = mode === 'original' ? canvases : reading;
      const top = stage.getBoundingClientRect().top;
      let pageNumber = '1';
      for (const page of current.querySelectorAll('[data-page]')) {
        if (page.getBoundingClientRect().top <= top + 32) pageNumber = page.dataset.page;
      }
      mode = next;
      canvases.hidden = next !== 'original'; reading.hidden = next === 'original';
      reading.dataset.mode = next;
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === next)));
      const target = (next === 'original' ? canvases : reading).querySelector('[data-page="' + pageNumber + '"]');
      if (target) stage.scrollTop += target.getBoundingClientRect().top - top;
      else stage.scrollTop = 0;
    }
    function renderPage(page) {
      let section = sections.get(page.number);
      if (!section) { section = doc.createElement('section'); section.className = 'dpr-pdf-translated-page'; section.dataset.page = String(page.number); sections.set(page.number, section); reading.appendChild(section); }
      section.replaceChildren();
      const heading = doc.createElement('h3'); heading.textContent = '第 ' + page.number + ' / ' + pdf.numPages + ' 页'; section.appendChild(heading);
      if (!page.blocks.length) {
        const note = doc.createElement('p'); note.textContent = '此页没有可提取文字。图片或扫描页请查看英文原 PDF。'; section.appendChild(note);
      }
      page.blocks.forEach(block => {
        const pair = doc.createElement('div'); pair.className = 'dpr-pdf-text-pair';
        const en = doc.createElement('p'); en.className = 'dpr-pdf-text-en'; en.lang = 'en'; en.textContent = block.en;
        const zh = doc.createElement('p'); zh.className = 'dpr-pdf-text-zh'; zh.lang = 'zh-CN'; zh.textContent = block.zh || '此段正在等待翻译…';
        pair.append(en, zh); section.appendChild(pair);
      });
    }
    function pause() {
      if (!active) return;
      controller?.abort(); translator?.destroy(); translator = null; active = false;
      start.textContent = '继续全文翻译';
      message('翻译已暂停，已完成的文字保留。点击继续。');
    }
    async function begin() {
      if (disposed) return;
      if (active) { pause(); return; }
      if (complete) { setMode('chinese'); return; }
      if (!win.Translator) { setMode('original'); message('当前浏览器不支持本地翻译。请使用桌面版 Chrome 138 或更新版本打开本站。', true); return; }
      active = true; controller = new AbortController(); const run = controller;
      start.textContent = '暂停翻译'; message('正在准备本地翻译；首次使用可能需要下载语言包…');
      if (mode === 'original') setMode('chinese');
      try {
        // Call create directly in the user's click handler to preserve activation.
        const instance = await win.Translator.create({ sourceLanguage: 'en', targetLanguage: 'zh', signal: run.signal,
          monitor(monitor) { monitor.addEventListener('downloadprogress', event => {
            if (!run.signal.aborted && !disposed) message('正在下载浏览器语言包 ' + Math.round(event.loaded * 100) + '% · 不使用 API 额度');
          }); }
        });
        if (run.signal.aborted || disposed) { instance.destroy(); return; }
        translator = instance;
        const result = await translateDocument({ pdf, translator: instance, signal: run.signal, cache,
          onPage: renderPage,
          onProgress(page, total, part, count) { message('本机翻译中 · 第 ' + page + ' / ' + total + ' 页 · 段落 ' + part + ' / ' + count); }
        });
        checkAbort(run.signal);
        complete = true;
        message(result.readablePages ? '全文文字翻译完成 · ' + result.pages + ' 页 · 可随时切换中英文' : '此 PDF 未提取到英文正文，可能是扫描件。请查看原 PDF。', !result.readablePages);
        start.textContent = '翻译已完成';
      } catch (error) {
        if (run.signal.aborted || disposed) return;
        message(error.name === 'NotSupportedError' ? '此浏览器暂不支持英译中，请更新桌面版 Chrome 后重试。' :
          '本地翻译暂未完成。语言包下载可能受网络限制；已完成的文字保留，可点击重试。', true);
        start.textContent = '重试全文翻译';
      } finally {
        if (controller === run) { active = false; translator?.destroy(); translator = null; }
      }
    }
    start.addEventListener('click', begin);
    modeButtons.forEach(button => button.addEventListener('click', () => {
      setMode(button.dataset.mode);
      if (mode !== 'original' && !active && !complete && !cache.size) begin();
    }));
    if (!win.Translator) {
      message('当前浏览器不支持本地翻译，请使用桌面版 Chrome 138+。不调用付费 API。');
    } else message('浏览器本地英译中 · 首次下载语言包 · 不使用 API 额度');
    const api = { pause, dispose() { pause(); disposed = true; toolbar.remove(); reading.remove(); canvases.hidden = false; } };
    panel.dprTranslation = api;
    return api;
  }
  return { chunks, paragraphs, translateDocument, attach };
});
