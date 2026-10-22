const assert = require('node:assert/strict');
const { chunks, paragraphs, translateDocument } = require('../app/dpr-pdf-translation.js');

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
  console.log('PASS: PDF text extraction, bounded chunks, all pages, cancellation, resume, empty-page/error handling');
}
test().catch(error => { console.error(error); process.exitCode=1; });
