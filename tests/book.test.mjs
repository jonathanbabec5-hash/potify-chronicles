import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHRONICLE_SECTIONS } from '../src/chronicle.ts';
const page=readFileSync('public/book.html','utf8');
test('every canonical section has a corresponding anchor and content',()=>{
  assert.ok(CHRONICLE_SECTIONS.length >= 5);
  for(const section of CHRONICLE_SECTIONS){
    assert.ok(page.includes('id="'+section.id+'"'));
    assert.ok(section.paragraphs.length>0);
  }
});
