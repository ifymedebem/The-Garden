import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validate,excerpt,plain} from './ingest.mjs';
const data=JSON.parse(await readFile(new URL('../dist/content.json',import.meta.url),'utf8'));
test('all six launch shelves have source-matched, attributed content',()=>{
 assert.equal(data.sections.length,6);assert.equal(new Set(data.cards.map(c=>c.id)).size,data.cards.length);
 for(const s of data.sections)assert.ok(data.cards.some(c=>c.section===s.id),s.name);
 for(const c of data.cards){assert.equal(validate(c),true);assert.ok(c.license);assert.ok(!/<\/?[a-z][^>]*>/i.test(c.text));assert.ok(c.text.split(/\s+/).length<=60);}
});
test('unapproved sources and unmatched summaries are rejected',()=>{
 const c=data.cards[0];assert.throws(()=>validate({...c,url:'https://malicious.example/story'}),/Unapproved/);
 assert.throws(()=>validate({...c,text:'invented summary not in the source'}),/match/);
 assert.throws(()=>validate({...c,asOf:'invalid'}),/Invalid/);
});
test('RSS markup is decoded safely and excerpts start at the beginning',()=>{
 assert.equal(plain('&lt;p&gt;A &amp; B&lt;/p&gt;'),'A & B');
 const raw='The first sentence is important. '+('More background words. '.repeat(40));
 assert.ok(raw.startsWith(excerpt(raw)));assert.ok(excerpt(raw).length<=410);
});
