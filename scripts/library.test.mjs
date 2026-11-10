import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {readFile} from 'node:fs/promises';
import {shelves,startPose,move,nearestShelf,project,walkToward,collidesWithShelf} from '../dist/library-world.js';
import {buildScene,clipNear,libraryMarkup,mountLibrary,butterflies} from '../dist/library3d.js';
const data=JSON.parse(await readFile(new URL('../dist/content.json',import.meta.url),'utf8'));

test('movement changes world position and turning changes the direction of travel',()=>{
 const p=startPose(),initialZ=p.z;for(let i=0;i<20;i++)move(p,{forward:1},.05);
 assert.ok(p.z<initialZ-2);assert.equal(p.x,0);
 p.yaw=Math.PI/2;const z=p.z;for(let i=0;i<10;i++)move(p,{forward:1},.05);
 assert.ok(p.x>1);assert.ok(Math.abs(p.z-z)<.00001);
});
test('room boundaries stop the camera from passing through shelves and walls',()=>{
 const p=startPose();for(let i=0;i<1000;i++)move(p,{forward:1,strafe:1},.05);
 assert.equal(p.x,3.45);assert.equal(p.z,-15.6);
 for(let i=0;i<1000;i++)move(p,{forward:-1,strafe:-1},.05);
 assert.equal(p.x,-3.45);assert.equal(p.z,6.6);
 const a=startPose(),b=startPose();move(a,{forward:1},.05);move(b,{forward:1,strafe:1},.05);
 assert.ok(Math.abs(Math.hypot(a.x,a.z-6.2)-Math.hypot(b.x,b.z-6.2))<.00001);
});
test('every mini-map destination walks to the correct nearby shelf and faces it',()=>{
 for(const s of shelves){const pose=startPose();let done=false;for(let i=0;i<400&&!done;i++)done=walkToward(pose,s.id,.05);
  assert.ok(done,s.id);assert.equal(nearestShelf(pose).id,s.id);assert.ok(Math.abs(pose.x)<=3.45);assert.ok(pose.z>=-15.6);
  assert.equal(pose.yaw,s.x<0?-Math.PI/2:Math.PI/2);
 }
});
test('projection clips geometry at the near plane without non-finite coordinates',()=>{
 const clipped=clipNear([[-1,-1,-2],[1,-1,2],[1,1,2],[-1,1,-2]]);
 assert.equal(clipped.length,4);assert.ok(clipped.every(p=>p.every(Number.isFinite)&&p[2]>=.12));
 assert.equal(project([0,1.6,8],startPose(),900,560),null);
 const centre=project([0,1.65,0],startPose(),900,560);assert.equal(centre.x,450);
 assert.ok(buildScene().length>1000);
});
test('canvas renderer, movement controls, map, nearby shelf, and expand/reset work together',()=>{
 const {document:d,window:w}=parseHTML('<html><body>'+libraryMarkup(data.sections)+'</body></html>');
 const room=d.querySelector('.library-room'),viewport=d.querySelector('.room-viewport');
 viewport.getBoundingClientRect=()=>({width:900,height:560});let draws=0;
 const gradient={addColorStop(){}};
 d.querySelector('canvas').getContext=()=>({setTransform(){},clearRect(){},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,fillRect(){draws++;},beginPath(){},moveTo(...v){assert.ok(v.every(Number.isFinite));},lineTo(...v){assert.ok(v.every(Number.isFinite));},closePath(){},fill(){draws++;}});
 let callback;w.requestAnimationFrame=fn=>{callback=fn;return 1;};w.cancelAnimationFrame=()=>{};
 const selected=[],controller=mountLibrary(room,{sections:data.sections,onSelect:id=>selected.push(id)});
 assert.ok(draws>100);assert.equal(d.querySelector('.room-fallback').hidden,true);
 const originalMap=d.querySelector('.map-player').getAttribute('transform');
 d.querySelector('[data-move="forward"]').click();assert.ok(Number(room.dataset.z)<6.2);assert.notEqual(d.querySelector('.map-player').getAttribute('transform'),originalMap);
 const pointer=(type,x)=>{const event=new w.Event(type,{bubbles:true});Object.assign(event,{pointerId:1,clientX:x});viewport.dispatchEvent(event);};pointer('pointerdown',100);pointer('pointermove',130);pointer('pointerup',130);assert.ok(Number(room.dataset.yaw)>.1);
 const key=new w.Event('keydown',{bubbles:true,cancelable:true});key.key='w';viewport.dispatchEvent(key);const z=Number(room.dataset.z);callback(1000);callback(1050);assert.ok(Number(room.dataset.z)<z);
 const up=new w.Event('keyup');up.key='w';d.dispatchEvent(up);
 d.querySelector('[data-destination="history"]').click();for(let t=1100;t<6500;t+=50)callback(t);
 assert.match(d.querySelector('[data-enter-nearby]').textContent,/African History/);d.querySelector('[data-enter-nearby]').click();assert.deepEqual(selected,['history']);
 d.querySelector('.room-expand').click();assert.ok(room.classList.contains('is-expanded'));assert.ok(d.body.classList.contains('room-is-expanded'));
 d.querySelector('.room-reset').click();assert.equal(Number(room.dataset.z),6.2);assert.equal(Number(room.dataset.x),0);
 controller.dispose();assert.equal(d.body.classList.contains('room-is-expanded'),false);
});
test('reduced-motion destination shortcuts open the shelf without automatic camera travel',()=>{
 const {document:d}=parseHTML('<html class="reduce-motion"><body>'+libraryMarkup(data.sections)+'</body></html>');
 const room=d.querySelector('.library-room'),selected=[];const controller=mountLibrary(room,{sections:data.sections,onSelect:id=>selected.push(id)});
 controller.walkTo('finance');assert.deepEqual(selected,['finance']);assert.equal(controller.pose.z,6.2);controller.dispose();
});
test('the central winding shelf blocks walking through it and butterflies animate in world space',()=>{
 const pose=startPose();for(let i=0;i<150;i++){move(pose,{forward:1},.05);assert.equal(collidesWithShelf(pose.x,pose.z),false);}
 assert.ok(pose.z>1.8);assert.notDeepEqual(butterflies(0),butterflies(1));
 const scene=buildScene();assert.ok(scene.some(p=>p.sway));
});
