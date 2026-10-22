const assert = require('node:assert/strict');
const api = require('../app/dpr-journal-metrics.js');
const data = {status:'ready', generated_at:'2026-10-22T00:00:00Z', papers:{'2610.25628':{kind:'preprint',venue:'Journal'}, j:{kind:'journal',venue:'Journal',issns:['1234-567X']}}, metrics:[{journal:'Journal',issn:'1234-567X',kind:'中科院升级版',value:'1区',category:'计算机科学',year:null},{journal:'Journal',kind:'JIF',value:'11.1',year:null}]};
assert.equal(api.paperID('#/a/2610.25628v1-paper'), '2610.25628');
assert.equal(api.applicable(data, '2610.25628').length, 0);
assert.equal(api.applicable(data, 'j').length, 2);
assert.ok(api.render(data,'j').includes('接口未提供数据年份'));
assert.ok(!api.render(data,'2610.25628').includes('11.1'));
const evil = JSON.parse(JSON.stringify(data)); evil.papers.j.venue = '<img onerror=alert(1)>';
assert.ok(!api.render(evil,'j').includes('<img'));
evil.papers.j.venue='Journal'; evil.papers.j.issns=['9999-9999'];
assert.equal(api.applicable(evil,'j').length,1); // only title-only record can match
console.log('PASS: correct paper identity, preprint/ISSN boundaries, unknown years, escaped provider text');
