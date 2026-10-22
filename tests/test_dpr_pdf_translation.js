const assert = require('node:assert/strict');
const { chunks, paragraphs, layoutBlocks, imageBounds, fitText, wrapLines, translateDocument } = require('../app/dpr-pdf-translation.js');

async function test() {
  const text = 'Sentence for a wearable robot. '.repeat(300).trim();
  const parts = chunks(text);
  assert.ok(parts.every(part => part.length <= 1400));
  assert.equal(parts.join(' '), text);
  assert.equal(chunks('a'.repeat(3001)).join('').length, 3001);
  const items = [
    {str:'Wearable exo-', hasEOL:true, transform:[1,0,0,12,20,600]},
    {str:'skeleton control.', hasEOL:true, transform:[1,0,0,12,20,586]},
    {str:'New section', hasEOL:true, transform:[1,0,0,12,20,540]}
  ];
  assert.deepEqual(paragraphs({items}), ['Wearable exoskeleton control.', 'New section']);
  const viewport={width:600,height:800,scale:1,transform:[1,0,0,-1,0,800]};
  const positioned=(str,x,y,width,fontName='body')=>({str,fontName,width,height:10,hasEOL:true,transform:[10,0,0,10,x,y]});
  const blocks=layoutBlocks({items:[positioned('First English paragraph line',30,700,130),positioned('Second English paragraph line',30,688,130),
    positioned('Figure English label',220,650,110),positioned('An equation word',30,600,100,'math')],styles:{}},viewport,
    [{x:200,y:130,width:150,height:100}],id=>id==='math'?'ABCDEF+CMMI10':'TimesRoman');
  assert.equal(blocks.length,1);assert.ok(blocks[0].en.includes('Second'));
  assert.equal(blocks[0].box.x,30);assert.equal(blocks[0].box.width,130);assert.equal(blocks[0].masks.length,2);
  const floatingImage={x:200,y:90,width:150,height:20};
  const wrapped=layoutBlocks({items:[positioned('English left of the figure',30,700,130),positioned('English left of the figure again',30,688,130),
    positioned('The full width text below the figure',30,676,320)],styles:{}},viewport,[floatingImage]);
  assert.equal(wrapped.length,2); // do not merge wrapping text into a rectangle crossing the image
  assert.ok(wrapped.every(block=>!(block.box.x<floatingImage.x+floatingImage.width && block.box.x+block.box.width>floatingImage.x &&
    block.box.y<floatingImage.y+floatingImage.height && block.box.y+block.box.height>floatingImage.y)));
  const fit=fitText('这是需要适应原来文字框的较长中文翻译。'.repeat(8),{width:130,height:22},10,
    {font:'',measureText(value){const size=parseFloat(this.font.match(/([\d.]+)px/)[1]);return {width:value.length*size};}});
  assert.ok(fit.lines.length*fit.size*fit.leading<=22.3);assert.ok(fit.size<=10);
  const indented=layoutBlocks({items:[positioned('An indented paragraph starts here',40,700,120),positioned('The same paragraph continues here',30,688,130),
    positioned('Another body paragraph for column detection',30,650,130)],styles:{}},viewport);
  assert.equal(indented[0].rows,2);assert.equal(indented[0].indent,2);assert.equal(indented[0].box.x,30);
  const chinese=wrapLines('正文第一句。正文第二句。',6,value=>Array.from(value).length,2);
  assert.ok(chinese[0].startsWith('\u3000\u3000'));assert.ok(chinese.every(line=>!/^\s*[。，]/.test(line)));
  const images=await imageBounds({async getOperatorList(){return {fnArray:[1,2,3,4],argsArray:[[],[100,0,0,50,200,600],[],[]]};}},viewport,
    {save:1,transform:2,paintImageXObject:3,restore:4,paintInlineImageXObject:5,paintImageMaskXObject:6});
  assert.deepEqual(images,[{x:200,y:150,width:100,height:50}]);
  const pdf = {numPages:3, async getPage(n) { return { async getTextContent() {return {items:n === 2 ? [] : [{str:'English paper page ' + n,hasEOL:true}]};} }; }};
  const cache = new Map(), seen = [], calls = [];
  const controller = new AbortController();
  // Explicit fake translator tests lifecycle, not live translation quality.
  const translator = { async translate(en) { calls.push(en); if (en.endsWith('3')) controller.abort(); return '测试译文 ' + en; } };
  await assert.rejects(translateDocument({pdf,translator,cache,signal:controller.signal,onPage:p=>seen.push(p.number)}), {name:'AbortError'});
  assert.equal(cache.get(1).complete, true);
  assert.equal(cache.get(2).blocks.length,0);
  assert.equal(cache.get(3).blocks[0].zh,''); // late results must not leak after close/navigation
  const result = await translateDocument({pdf,cache,translator:{async translate(en){calls.push(en);return '译文';}}});
  assert.equal(result.pages,3); assert.equal(result.readablePages,2);
  assert.equal(calls.filter(value => value.endsWith('1')).length,1); // resume reuses completed pages
  assert.equal(cache.get(3).complete,true);
  await assert.rejects(translateDocument({pdf,translator:{async translate(){return '';}}}), /Empty translation/);
  console.log('PASS: positioned text, protected images/formulas, fitted Chinese, all pages, cancellation/resume, empty/error handling');
}
test().catch(error => { console.error(error); process.exitCode=1; });
