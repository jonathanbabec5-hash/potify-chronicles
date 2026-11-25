import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const html=readFileSync('public/index.html','utf8');
test('check the published edition and its primary assets',()=>{
assert.ok(html.includes('Cultivator’s Note'));
assert.ok(html.includes('Introduction'));
assert.ok(html.includes('https://potifywebsite.com/#chronicle'));

});
