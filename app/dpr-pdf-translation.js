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
  function transform(a, b) {
    return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
  }
  function intersects(a, b) { return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y; }
  async function imageBounds(page, viewport, ops) {
    if (!ops || !page.getOperatorList) return [];
    const list = await page.getOperatorList(), stack = [], result = [];
    let matrix = [1,0,0,1,0,0];
    for (let i=0;i<list.fnArray.length;i++) {
      const fn=list.fnArray[i], args=list.argsArray[i];
      if (fn===ops.save) stack.push(matrix.slice());
      else if (fn===ops.restore) matrix=stack.pop() || [1,0,0,1,0,0];
      else if (fn===ops.transform) matrix=transform(matrix,args);
      else if ([ops.paintImageXObject,ops.paintInlineImageXObject,ops.paintImageMaskXObject].includes(fn)) {
        const m=transform(viewport.transform,matrix);
        const corners=[[0,0],[1,0],[0,1],[1,1]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
        const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
        result.push({x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});
      }
    }
    return result;
  }
  function layoutBlocks(content, viewport, images = [], fontName = () => '') {
    const lines=[], protectedAreas=[];
    const prose=(content.items||[]).filter(item=>(item.str?.match(/[a-z]/ig)||[]).length>=10 && item.transform)
      .map(item=>({x:transform(viewport.transform,item.transform)[4],y:transform(viewport.transform,item.transform)[5],width:item.width*viewport.scale}));
    let line=null;
    const flush=()=>{if(line) lines.push(line);line=null;};
    for (const item of content.items || []) {
      if (!item.str?.trim() || !item.transform) continue;
      const m=transform(viewport.transform,item.transform), size=Math.hypot(m[2],m[3]);
      const style=content.styles?.[item.fontName] || {}, ascent=style.ascent ?? .85, descent=style.descent ?? -.2;
      const box={x:m[4],y:m[5]-ascent*size,width:Math.abs(item.width*viewport.scale),height:(ascent-descent)*size};
      const name=fontName(item.fontName);
      const inlineUnit=/^[×±°]$/.test(item.str.trim()) && prose.some(p=>Math.abs(p.y-m[5])<size*.4 && p.x<box.x+size*2 && p.x+p.width>box.x-size*5);
      const math=!inlineUnit && ((/(?:CM(?:MI|SY|EX)|Math|Symbol|STIX.*(?:Math|Symbols))/i.test(name) && !/^[\[\](),.;:–—\-]+$/.test(item.str.trim())) || /[∑∫∏√≤≥≠∈∂∇∞α-ωΑ-Ω]/u.test(item.str));
      const rotated=Math.abs(m[1])>.2 || Math.abs(m[2])>.2;
      const inImage=images.some(image=>intersects(box,image));
      if (rotated || inImage || math) {if(math && !rotated && !inImage)protectedAreas.push({...box,baseline:m[5]});flush();continue;}
      if (!box.width || !size) continue;
      if (line && (Math.abs(line.baseline-m[5])>size*.3 || box.x-line.right>size*2 || box.x<line.right-size)) flush();
      if (!line) line={en:'',parts:[],x:box.x,y:box.y,right:box.x,bottom:box.y+box.height,baseline:m[5],fontSize:size,fontName:name};
      line.en+=(line.en && !/\s$/.test(line.en) && !/^[,.;:!?)]/.test(item.str)?' ':'')+item.str;
      line.parts.push(box);line.x=Math.min(line.x,box.x);line.y=Math.min(line.y,box.y);line.right=Math.max(line.right,box.x+box.width);line.bottom=Math.max(line.bottom,box.y+box.height);
      if (item.hasEOL) flush();
    }
    flush();
    const starts=new Map();
    for(const row of lines)if(row.fontSize>=7 && row.fontSize<=14 && row.right-row.x>viewport.width*.18){
      const key=Math.round(row.x/3)*3;starts.set(key,(starts.get(key)||0)+1);
    }
    const columnStarts=[...starts].filter(([,count])=>count>=2).map(([x])=>x);
    const blocks=[];
    for (const row of lines) {
      if ((row.en.match(/[a-z]/ig)||[]).length<8 || /@/.test(row.en) || /^https?:\/\/\S+$/i.test(row.en.trim())) continue;
      const isolated=protectedAreas.some(area=>Math.abs(area.baseline-row.baseline)<row.fontSize*.4 &&
        area.x<row.right+row.fontSize && area.x+area.width>row.x-row.fontSize);
      const last=blocks[blocks.length-1], gap=last ? row.y-last.bottom : Infinity;
      const title=row.fontSize>=18 && row.y<viewport.height*.23 && Math.abs((row.x+row.right)/2-viewport.width/2)<30;
      const combined=last ? {x:Math.min(last.box.x,row.x),y:last.box.y,width:Math.max(last.box.x+last.box.width,row.right)-Math.min(last.box.x,row.x),height:row.bottom-last.box.y} : null;
      const safeMerge=combined && !images.some(image=>intersects(combined,image));
      const firstIndentedLine=last && last.rows===1 && last.box.x>row.x && last.box.x-row.x<row.fontSize*1.6;
      if (last && safeMerge && !isolated && !last.isolated && (Math.abs(last.box.x-row.x)<5 || firstIndentedLine || (title && last.role==='title')) && gap>=-1 && gap<row.fontSize*.8 &&
          Math.abs(last.fontSize-row.fontSize)<1 && last.en.length<MAX_CHARS-200) {
        last.en=/[a-z]-$/i.test(last.en)&&/^[a-z]/.test(row.en)?last.en.slice(0,-1)+row.en:last.en+' '+row.en;
        last.box=combined;last.bottom=row.bottom;last.rows++;
        last.masks.push(...row.parts);
      } else blocks.push({en:row.en,zh:'',box:{x:row.x,y:row.y,width:row.right-row.x,height:row.bottom-row.y},bottom:row.bottom,
        masks:row.parts,fontSize:row.fontSize,fontName:row.fontName,role:title?'title':'body',isolated,rows:1,firstX:row.x});
    }
    // Restore small-cap words and the leading drop-cap before translation.
    for(const block of blocks)block.en=block.en.replace(/\b([A-Z])\s+([A-Z]{2,})\b/g,'$1$2');
    for(const cap of lines.filter(row=>/^[A-Z]$/.test(row.en.trim()) && row.fontSize>=18)) {
      const block=blocks.find(b=>b.role!=='title' && b.box.x>cap.x && b.box.x-cap.x<cap.fontSize*1.5 &&
        Math.abs(b.box.y-cap.y)<cap.fontSize && /^[A-Z]{3}/.test(b.en));
      if(block){block.en=cap.en.trim()+block.en;const right=block.box.x+block.box.width;block.box.x=cap.x;block.box.width=right-cap.x;block.masks.push(...cap.parts);block.dropCap=true;}
    }
    for(let index=0;index<blocks.length-1;index++) {
      const block=blocks[index],next=blocks[index+1];
      if(block.dropCap && /[a-z]-$/i.test(block.en) && /^[a-z]/.test(next.en) && Math.abs(block.box.x-next.box.x)<2 &&
        next.box.y-block.bottom<block.fontSize*.8 && Math.abs(block.fontSize-next.fontSize)<1) {
        block.en=block.en.slice(0,-1)+next.en;block.bottom=next.bottom;block.box.height=next.bottom-block.box.y;
        block.box.width=Math.max(block.box.width,next.box.width);block.rows+=next.rows;block.masks.push(...next.masks);blocks.splice(index+1,1);
      }
    }
    return blocks.filter(block=>!(block.box.y<viewport.height*.24 && block.fontSize>10 && block.fontSize<15 &&
      (block.en.match(/,/g)||[]).length>=2 && Math.abs(block.box.x+block.box.width/2-viewport.width/2)<30)).map(block=>{
        const expanded={...block.box,height:block.box.height+block.fontSize*.24};
        if(!images.some(image=>intersects(expanded,image)))block.box=expanded;
        block.family=/(?:Roman|Times|CMR)/i.test(block.fontName)?'"Songti SC", "Noto Serif CJK SC", serif':'"PingFang SC", "Noto Sans CJK SC", sans-serif';
        block.weight=/(?:Bold|Medi|CMBX)/i.test(block.fontName)?'600':'400';
        block.align=block.role==='title'?'center':'left';
        const indented=columnStarts.some(x=>block.firstX-x>block.fontSize*.6 && block.firstX-x<block.fontSize*1.6);
        block.indent=block.role!=='title' && !block.isolated && (indented || block.dropCap) ? 2 : 0;
        return block;
    });
  }
  function wrapLines(text, width, measure, indent=0) {
    const tokens=String(text).match(/\[\d+(?:[–,\-\s]\d+)*\]|\d+(?:\.\d+)?[%％]?|[\p{Script=Han}]|[A-Za-z0-9]+|\s+|./gu)||[], lines=[];
    let line='\u3000'.repeat(indent);
    for (let token of tokens) {
      if (!line) token=token.trimStart();
      if (measure(line+token)>width && line.trim()) {
        if(/^[，。！？；：、）】》」』”’.,!?;:%％)\]]$/.test(token)) {
          const last=Array.from(line).pop();lines.push(line.slice(0,-last.length).trimEnd());line=last;
        }else {lines.push(line.trimEnd());line='';token=token.trimStart();}
      }
      while (measure(token)>width && token.length>1) {
        let i=1;while(i<token.length && measure(token.slice(0,i+1))<=width)i++;
        if(line.trim()){lines.push(line.trimEnd());}line='';lines.push(token.slice(0,i));token=token.slice(i);
      }
      line+=token;
    }
    if(line.trim())lines.push(line.trimEnd());
    return lines;
  }
  function fitText(text, box, originalSize, context, family='"PingFang SC", "Noto Sans CJK SC", sans-serif', weight='400', options={}) {
    const leading=options.leading || 1.4;
    let low=.5,high=originalSize*.95,best;
    for(let i=0;i<16;i++) {
      const size=(low+high)/2; context.font=weight+' '+size+'px '+family;
      const lines=wrapLines(text,Math.max(1,box.width),value=>context.measureText(value).width,options.indent||0);
      if(lines.length*size*leading<=box.height+.3){best={size,lines,family,leading};low=size;}else high=size;
    }
    return best || {size:.5,lines:wrapLines(text,Math.max(1,box.width),value=>context.measureText(value).width),family,leading};
  }
  function sourceColors(canvas, box, viewport) {
    const scale=canvas.width/viewport.width;
    const x=Math.max(0,Math.floor(box.x*scale)),y=Math.max(0,Math.floor(box.y*scale));
    const width=Math.min(canvas.width-x,Math.max(1,Math.ceil(box.width*scale))),height=Math.min(canvas.height-y,Math.max(1,Math.ceil(box.height*scale)));
    const counts=new Map();
    try {
      const pixels=canvas.getContext('2d').getImageData(x,y,width,height).data;
      const step=Math.max(1,Math.floor(Math.sqrt(width*height/4000)));
      for(let row=0;row<height;row+=step)for(let col=0;col<width;col+=step){
        const i=(row*width+col)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        const key=(r>>2)+','+(g>>2)+','+(b>>2),value=counts.get(key)||{n:0,r,g,b,light:r*.299+g*.587+b*.114};
        value.n++;counts.set(key,value);
      }
      const colors=[...counts.values()].sort((a,b)=>b.n-a.n);
      const background=colors.find(color=>color.light>150)||{r:255,g:255,b:255,light:255};
      const foreground=colors.find(color=>color.light<background.light-50)||{r:20,g:20,b:20};
      const css=color=>'rgb('+color.r+','+color.g+','+color.b+')';
      return {background:css(background),foreground:css(foreground)};
    } catch(_){return {background:'#fff',foreground:'#111'};}
  }
  async function translateDocument({ pdf, translator, signal, cache = new Map(), preparePage, onPage = () => {}, onProgress = () => {} }) {
    let readablePages = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      checkAbort(signal);
      let result = cache.get(number);
      if (!result) {
        const page = await pdf.getPage(number);
        const text = await page.getTextContent();
        checkAbort(signal);
        const prepared = preparePage ? await preparePage(page,text) : {blocks:paragraphs(text).map(en => ({ en, zh: '' }))};
        checkAbort(signal);
        result = { number, ...prepared, complete: false };
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
          block.zh = String(translated).trim().replace(/([，。！？；：、])\s+/g,'$1')
            .replace(/([\p{Script=Han}])\s+(?=[\p{Script=Han}，。！？；：、])/gu,'$1');
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
      '<button type="button" data-mode="chinese" aria-pressed="false">中文原版式</button>' +
      '<button type="button" data-mode="bilingual" aria-pressed="false">中英对照</button></div>' +
      '<button type="button" class="dpr-pdf-translate-start">免费全文翻译</button></div>' +
      '<p class="dpr-pdf-translation-status" role="status" aria-live="polite"></p>' +
      '<details class="dpr-pdf-translation-help"><summary>免费翻译说明</summary>' +
      '<p>Chrome 在本机翻译，不使用付费 API。首次下载语言包；译文暂存在当前页面。中文覆盖在原 PDF 对应文字区域，页尺寸、分栏、图片与公式保持原位；中文长度不同，字号会自动适配原文字框。图中标签、公式及扫描图片保留原样，不做 OCR。中英对照按页上下展示。</p>' +
      '<a href="https://developer.chrome.com/docs/ai/translator-api" target="_blank" rel="noopener noreferrer">浏览器支持与官方说明</a></details>';
    panel.insertBefore(toolbar, stage);
    const status = toolbar.querySelector('[role="status"]');
    const start = toolbar.querySelector('.dpr-pdf-translate-start');
    const modeButtons = Array.from(toolbar.querySelectorAll('[data-mode]'));
    const cache = new Map(), observers = new Map();
    let mode = 'original', controller = null, translator = null, active = false, disposed = false, complete = false;
    function message(text, error = false) { status.textContent = text; status.classList.toggle('is-error', error); }
    function setMode(next) {
      const top = stage.getBoundingClientRect().top;
      let pageNumber = '1';
      for (const page of canvases.querySelectorAll('[data-page]')) {
        if (page.getBoundingClientRect().top <= top + 32) pageNumber = page.dataset.page;
      }
      mode = next;
      canvases.dataset.translationMode = next;
      for (const page of canvases.querySelectorAll('[data-page]')) syncOriginalCopy(page);
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === next)));
      const target = canvases.querySelector('[data-page="' + pageNumber + '"]');
      if (target) stage.scrollTop += target.getBoundingClientRect().top - top;
    }
    function syncOriginalCopy(page) {
      const surface=page.querySelector('.dpr-pdf-page-surface'), canvas=surface?.querySelector('canvas');
      let copy=page.querySelector('.dpr-pdf-source-copy');
      if(mode!=='bilingual'){copy?.remove();return;}
      if(!canvas || copy || page.dataset.canvasReady!=='true')return;
      copy=doc.createElement('div');copy.className='dpr-pdf-source-copy';
      const label=doc.createElement('div');label.className='dpr-pdf-compare-label';label.textContent='EN · 英文原 PDF';
      const clone=doc.createElement('canvas');clone.width=canvas.width;clone.height=canvas.height;
      clone.getContext('2d').drawImage(canvas,0,0);copy.append(label,clone);page.insertBefore(copy,surface);
    }
    function renderPage(page) {
      const wrap=canvases.querySelector('[data-page="'+page.number+'"]');
      const surface=wrap?.querySelector('.dpr-pdf-page-surface'), original=surface?.querySelector('canvas');
      if(!surface || !original || !page.viewport)return;
      let overlay=surface.querySelector('.dpr-pdf-layout-translation');
      if(!overlay) {
        overlay=doc.createElement('div');overlay.className='dpr-pdf-layout-translation';overlay.lang='zh-CN';surface.appendChild(overlay);
        const updateScale=()=>surface.style.setProperty('--dpr-pdf-scale',String(surface.clientWidth/page.viewport.width));
        updateScale();const observer=new win.ResizeObserver(updateScale);observer.observe(surface);observers.set(page.number,observer);
      }
      overlay.querySelectorAll('.dpr-pdf-positioned-zh').forEach(node=>node.remove());
      let mask=overlay.querySelector('.dpr-pdf-text-mask');
      if(!mask){mask=doc.createElement('canvas');mask.className='dpr-pdf-text-mask';mask.width=original.width;mask.height=original.height;overlay.appendChild(mask);}
      const context=mask.getContext('2d');context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,mask.width,mask.height);
      context.setTransform(mask.width/page.viewport.width,0,0,mask.height/page.viewport.height,0,0);
      for(const block of page.blocks) {
        if(!block.zh)continue;
        const colors=block.colors || (block.colors=sourceColors(original,block.box,page.viewport));
        context.fillStyle=colors.background;
        const padding=Math.max(.8,block.fontSize*.06);
        for(const rect of block.masks)context.fillRect(rect.x-padding,rect.y-padding,rect.width+padding*2,rect.height+padding*2);
        let fit=block.fit;
        if(!fit) {
          const options={indent:block.indent,leading:block.role==='title'?1.22:block.fontSize<9?1.32:1.42};
          fit=fitText(block.zh,block.box,block.fontSize,context,block.family,block.weight,options);
          if(fit.size<block.fontSize*.82 && options.leading>1.3)
            fit=fitText(block.zh,block.box,block.fontSize,context,block.family,block.weight,{...options,leading:1.3});
          if(block.role!=='title' && fit.lines.length>=3 && fit.size>=block.fontSize*.9) {
            const roomy=(block.box.height-fit.size*.2)/(fit.lines.length*fit.size);
            fit.leading=Math.min(1.6,Math.max(fit.leading,roomy));
          }
          block.fit=fit;
        }
        const text=doc.createElement('div');text.className='dpr-pdf-positioned-zh';text.textContent=fit.lines.join('\n');text.title=block.en;
        Object.assign(text.style,{left:block.box.x/page.viewport.width*100+'%',top:block.box.y/page.viewport.height*100+'%',
          width:block.box.width/page.viewport.width*100+'%',height:block.box.height/page.viewport.height*100+'%',
          fontSize:'calc('+fit.size+'px * var(--dpr-pdf-scale, 1))',lineHeight:String(fit.leading),fontFamily:fit.family,fontWeight:block.weight,color:colors.foreground,textAlign:block.align});
        overlay.appendChild(text);
      }
      syncOriginalCopy(wrap);
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
          async preparePage(page,text) {
            const viewport=page.getViewport({scale:1});
            const images=await imageBounds(page,viewport,win.pdfjsLib?.OPS);
            const name=id=>{try{return page.commonObjs.get(id)?.name || '';}catch(_){return '';}};
            const blocks=layoutBlocks(text,viewport,images,name);
            const normalize=value=>String(value||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
            const english=doc.querySelector('.paper-title-en')?.textContent,chinese=doc.querySelector('.paper-title-zh')?.textContent;
            for(const block of blocks)if(block.role==='title' && chinese && normalize(block.en)===normalize(english))block.zh=chinese.trim();
            return {viewport,blocks};
          },
          onPage: renderPage,
          onProgress(page, total, part, count) { message('本机翻译中 · 第 ' + page + ' / ' + total + ' 页 · 段落 ' + part + ' / ' + count); }
        });
        checkAbort(run.signal);
        complete = true;
        message(result.readablePages ? '原版式翻译完成 · ' + result.pages + ' 页 · 图片和公式保留原位' : '此 PDF 未提取到可翻译的英文正文，原 PDF 保持显示。', !result.readablePages);
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
    } else message('原版式本地翻译 · 首次下载语言包 · 不使用 API 额度');
    const api = { pause, pageRendered(number) { const page=cache.get(number);if(page)renderPage(page);const wrap=canvases.querySelector('[data-page="'+number+'"]');if(wrap)syncOriginalCopy(wrap); },
      dispose() { pause(); disposed = true; toolbar.remove();for(const observer of observers.values())observer.disconnect();
        canvases.querySelectorAll('.dpr-pdf-layout-translation,.dpr-pdf-source-copy').forEach(node=>node.remove());delete canvases.dataset.translationMode; } };
    panel.dprTranslation = api;
    return api;
  }
  return { chunks, paragraphs, layoutBlocks, imageBounds, wrapLines, fitText, translateDocument, attach };
});
