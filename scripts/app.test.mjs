import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {libraryMarkup,mountLibrary} from '../dist/library3d.js';
import {createGardenAudio} from '../dist/garden-audio.js';
import {readFile} from 'node:fs/promises';
const source=(await readFile(new URL('../dist/app.js',import.meta.url),'utf8')).replace(/^import .+;\n/gm,'');
const data=JSON.parse(await readFile(new URL('../dist/content.json',import.meta.url),'utf8'));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function setup(storage=new Map()){
 const {document,window}=parseHTML('<html><body><div id="app"></div><dialog id="modal"></dialog><div id="toast"></div></body></html>');
 window.scrollTo=()=>{};document.querySelector('#modal').showModal=function(){this.open=true;};document.querySelector('#modal').close=function(){this.open=false;};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 await new AsyncFunction('document','window','localStorage','fetch','setInterval','navigator','URL','Blob','libraryMarkup','mountLibrary','createGardenAudio',source)(document,window,localStorage,async()=>({ok:true,json:async()=>data}),()=>0,{clipboard:{writeText:async()=>{}}},URL,Blob,libraryMarkup,mountLibrary,createGardenAudio);
 return {document,window,storage};
}
test('library walking and list view lead directly into the selected shelf',async()=>{
 const {document:d}=await setup();assert.match(d.querySelector('h1').textContent,/one shelf/);
 const before=Number(d.querySelector('.library-room').dataset.z);d.querySelector('[data-move="forward"]').click();assert.ok(Number(d.querySelector('.library-room').dataset.z)<before);
 d.querySelector('[data-mode="list"]').click();assert.equal(d.querySelector('.library-room'),null);
 d.querySelector('.section-card[data-section="history"]').click();assert.match(d.querySelector('h1').textContent,/African History/);assert.equal(d.querySelectorAll('.read-card').length,3);
});
test('save and private-note edits persist after reloading the app',async()=>{
 const {document:d,storage}=await setup();d.querySelector('[data-section="history"]').click();const id=d.querySelector('[data-save]').dataset.save;
 d.querySelector('[data-save]').click();assert.equal(JSON.parse(storage.get('garden-v1')).saved[0],id);
 d.querySelector('[data-note]').click();d.querySelector('#note-text').value='My private connection <script>alert(1)</script>';
 d.querySelector('#note-form').dispatchEvent(new d.defaultView.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(d.querySelector('.attached-note script'),null);assert.match(d.querySelector('.attached-note').textContent,/My private connection/);
 const {document:next}=await setup(storage);next.querySelector('[data-view="notes"]').click();assert.equal(next.querySelectorAll('.read-card').length,1);assert.match(next.querySelector('.attached-note').textContent,/My private connection/);
 next.querySelector('[data-note]').click();next.querySelector('#note-text').value='A revised connection';next.querySelector('#note-form').dispatchEvent(new next.defaultView.Event('submit',{bubbles:true,cancelable:true}));assert.equal(JSON.parse(storage.get('garden-v1')).notes[id].text,'A revised connection');
 next.querySelector('[data-note]').click();next.querySelector('#delete-note').click();assert.equal(Object.keys(JSON.parse(storage.get('garden-v1')).notes).length,0);
});
test('a failed snapshot has a useful retry screen',async()=>{
 const {document:d,window}=parseHTML('<html><body><div id="app"></div></body></html>');
 await new AsyncFunction('document','window','localStorage','fetch','setInterval','createGardenAudio',source)(d,window,{getItem:()=>null},async()=>({ok:false}),()=>0,createGardenAudio);
 assert.match(d.querySelector('h1').textContent,/resting/);assert.match(d.querySelector('button').textContent,/Try again/);
});
test('garden navigation opens from corner hover or the icon and closes on Escape or outside click',async()=>{
 const {document:d,window:w}=await setup();const button=d.querySelector('.garden-menu-trigger'),sidebar=d.querySelector('.sidebar');
 assert.equal(button.getAttribute('aria-expanded'),'false');assert.equal(sidebar.getAttribute('aria-hidden'),'true');
 const hover=new w.Event('pointerenter');hover.pointerType='mouse';button.dispatchEvent(hover);
 assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(sidebar.inert,false);
 const escape=new w.Event('keydown');escape.key='Escape';d.dispatchEvent(escape);assert.equal(button.getAttribute('aria-expanded'),'false');
 button.click();assert.equal(button.getAttribute('aria-expanded'),'true');d.querySelector('.menu-scrim').click();assert.equal(button.getAttribute('aria-expanded'),'false');
});
