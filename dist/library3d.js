import {palette,shelves,startPose,move,nearestShelf,viewPoint,project,walkToward} from './library-world.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function libraryMarkup(sections){return `<section class="library-room" aria-label="Interactive library"><div class="room-heading"><span class="room-tag">A PLACE TO GET A LITTLE LOST</span><span class="room-live"><i></i> You’re here. Take your time.</span></div><div class="room-viewport" tabindex="0" role="region" aria-label="Walkable library. W A S D to move, left and right arrow keys to turn. Drag to look around. Enter opens the nearby shelf." aria-describedby="room-instructions"><canvas class="room-canvas" aria-hidden="true"></canvas><div class="room-fallback" hidden><h2>A shelf for every kind of curiosity.</h2><p>Your browser doesn’t support this interactive view. Choose a shelf below.</p>${sections.map(s=>`<button class="button outline" data-room-open="${s.id}">${esc(s.name)} →</button>`).join('')}</div><div class="room-title"><span>THE GARDEN · READING ROOM</span><h2>Follow your curiosity.</h2><p>Walk a little. Turn a corner. Find a new idea.</p></div><div class="room-hotspots">${shelves.map(s=>{const section=sections.find(t=>t.id===s.id);return `<button class="shelf-hotspot" data-room-open="${s.id}" hidden style="--shelf-accent:${s.color}"><small>${esc(section.zone)}</small><strong>${esc(section.name)}</strong><span>Open shelf <b>↗</b></span></button>`;}).join('')}</div><span class="room-crosshair" aria-hidden="true">+</span><button class="room-expand" aria-label="Expand library" title="Expand library">⛶</button><div class="room-compass" aria-hidden="true"><span>N</span><i>↑</i></div><div class="room-map"><span>YOUR LITTLE WORLD</span><svg viewBox="0 0 100 165" role="img" aria-label="Library map with your position"><rect x="8" y="5" width="84" height="155" rx="14" fill="#fffaf1"/><path d="M50 20v125" stroke="#dbd0b8" stroke-dasharray="3 5"/>${shelves.map(s=>`<rect x="${s.x<0?14:69}" y="${20+(s.z+12)*6}" width="17" height="22" rx="3" fill="${s.color}" opacity=".85"/>`).join('')}<g class="map-player"><circle r="8" fill="#fffaf1" opacity=".7"/><path d="m0-7 5 11-5-2-5 2Z" fill="#355569" stroke="#fffaf1" stroke-width="1.5"/></g></svg><small>Every shelf is a new beginning.</small></div><div class="nearby-shelf"><span>Wander toward a shelf to discover it.</span><button class="button primary" data-enter-nearby hidden>Open shelf →</button></div><div class="room-movement" aria-label="Movement controls"><span>MOVE</span><div class="direction-pad"><button data-move="forward" aria-label="Move forward">↑</button><button data-move="left" aria-label="Move left">←</button><button data-move="back" aria-label="Move backward">↓</button><button data-move="right" aria-label="Move right">→</button></div><div class="turn-pad"><button data-move="turnLeft" aria-label="Turn left">↶</button><button data-move="turnRight" aria-label="Turn right">↷</button></div></div></div><div class="room-bottom"><p id="room-instructions"><kbd>W A S D</kbd> to move <span>·</span> Drag to look <span>·</span> Tap a shelf to read</p><button class="room-reset">↺ Back to the entrance</button></div><div class="room-destinations"><span>TAKE ME TO</span>${sections.map(s=>`<button data-destination="${s.id}"><i style="background:${s.color}"></i>${esc(s.name)}</button>`).join('')}</div><p class="room-status sr-only" aria-live="polite"></p></section>`;}

export function buildScene(){
 const polygons=[];
 const face=(v,c)=>polygons.push({v,c});
 function box(x,y,z,w,h,d,c){
  face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],c);
  face([[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]],c);
  face([[x,y,z],[x,y,z+d],[x,y+h,z+d],[x,y+h,z]],c);
  face([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],c);
  face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],c);
 }
 // Individual floor tiles and wall panels keep depth sorting correct while walking.
 for(let z=-18;z<8;z+=1.3)for(let x=-6;x<6;x+=1.3){const index=Math.round(x/1.3)+Math.round(z/1.3);face([[x,0,z],[x+1.28,0,z],[x+1.28,0,z+1.28],[x,0,z+1.28]],index%2?'#e7d8bc':'#f1e6d0');}
 for(let z=-18;z<8;z+=2){
  face([[-5.2,0,z],[-5.2,4.8,z],[-5.2,4.8,z+2],[-5.2,0,z+2]],'#eac5b1');
  face([[5.2,0,z],[5.2,4.8,z],[5.2,4.8,z+2],[5.2,0,z+2]],'#ecdbc4');
  face([[-5.2,4.8,z],[5.2,4.8,z],[5.2,4.8,z+2],[-5.2,4.8,z+2]],'#faf2de');
 }
 face([[-5.2,0,-18],[5.2,0,-18],[5.2,4.8,-18],[-5.2,4.8,-18]],'#e9cbb5');
 face([[-5.2,0,8],[5.2,0,8],[5.2,4.8,8],[-5.2,4.8,8]],'#e9cbb5');
 // Blue skylights and sunlight on the floor.
 for(const z of [-13,-7,-1,5]){
  box(-1.35,4.67,z-2,2.7,.08,3,'#a7cfdb');
  box(-1.46,4.60,z-2.1,.1,.12,3.2,'#d4ad70');box(1.36,4.6,z-2.1,.1,.12,3.2,'#d4ad70');
  box(-1.4,4.6,z-.55,2.8,.1,.08,'#f1e5cc');
  face([[-1.7,.012,z-1],[.1,.012,z-1],[2.4,.012,z+1.6],[.5,.012,z+1.6]],'#f7ebc7');
 }
 // Three deep bays, each with two real shelves on opposite walls.
 for(const [n,s] of shelves.entries()){
  const left=s.x<0,x=left?-5.12:4.15,front=left?-4.13:4.13,z=s.z-1.9;
  box(x,.08,z,.98,3.7,3.8,'#bd8965');
  // Darker recess under each shelf, then cream/gold uprights.
  face([[front,.25,z+.08],[front,3.7,z+.08],[front,3.7,z+3.72],[front,.25,z+3.72]],'#7e6952');
  for(const edge of [z,z+3.68])box(left?front-.04:front-.08,.06,edge,.13,3.78,.13,'#ddb58b');
  for(const y of [.2,1,1.8,2.6,3.4])box(left?front-.04:front-.12,y,z,.18,.12,3.8,'#e5bc91');
  const colours=[palette.peach,palette.blue,palette.green,palette.gold,palette.terracotta,'#f1e7cd','#699ca5','#c98c79'];
  for(let row=0;row<4;row++)for(let book=0;book<18;book++){
   const bz=z+.2+book*.19,y=.32+row*.8,h=.48+((book*13+row*7+n*11)%20)/100;
   const fx=left?front+.06:front-.06;
   face([[fx,y,bz],[fx,y+h,bz],[fx,y+h,bz+.14],[fx,y,bz+.14]],colours[(book*3+row+n)%colours.length]);
   face([[fx+(left?.004:-.004),y+h-.09,bz+.02],[fx+(left?.004:-.004),y+h-.065,bz+.02],[fx+(left?.004:-.004),y+h-.065,bz+.12],[fx+(left?.004:-.004),y+h-.09,bz+.12]],'#f9efcb');
  }
  box(left?-4.3:4.05,3.65,z+.02,.26,.19,3.76,s.color);
  // Green plants between bays, with clay pots and layered leaves.
  const pz=s.z-2.65,px=left?-4.5:4.5;
  box(px-.25,0,pz-.25,.5,.5,.5,palette.terracotta);
  box(px-.025,.5,pz-.025,.05,1.15,.05,'#788869');
  for(let i=0;i<7;i++){const angle=i*2.4,nx=Math.cos(angle),nz=Math.sin(angle),y=.7+i*.12;
   face([[px,y,pz],[px+nx*.3-nz*.15,y+.18,pz+nz*.3+nx*.15],[px+nx*.58,y+.42,pz+nz*.58],[px+nx*.3+nz*.15,y+.2,pz+nz*.3-nx*.15]],i%2?'#90a588':'#627f6c');
  }
 }
 // A window at the end of the room, with peach walls, cream mullions, and a bench.
 box(-2,1,-17.85,4,3.4,.1,'#a5ced7');
 for(const x of [-2,-.7,.7,2])box(x,1,-17.65,.08,3.45,.12,'#fff5e1');
 for(const y of [1,2.8,4.4])box(-2,y,-17.65,4.1,.09,.12,'#fff5e1');
 box(-1.8,.4,-16.9,3.6,.25,.65,'#ba815c');box(-1.6,0,-16.8,.15,.4,.4,'#9b7256');box(1.45,0,-16.8,.15,.4,.4,'#9b7256');
 // A soft golden hanging light in each bay.
 for(const z of [1,-5,-11]){box(-.03,3.8,z,.06,.9,.06,'#b79857');box(-.5,3.65,z-.25,1,.15,.5,'#dfb45f');box(-.4,3.62,z-.2,.8,.03,.4,'#fff3c6');}
 return polygons;
}

// Clip against the near plane before projecting: the camera may pass a shelf.
export function clipNear(vertices,near=.12){const out=[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length];const aIn=a[2]>=near,bIn=b[2]>=near;if(aIn)out.push(a);if(aIn!==bIn){const t=(near-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}}return out;}

export function mountLibrary(root,{sections,onSelect,pose=startPose()}){
 const doc=root.ownerDocument,win=doc.defaultView,viewport=root.querySelector('.room-viewport'),canvas=root.querySelector('canvas');
 const ctx=canvas.getContext?.('2d');const scene=ctx?buildScene():[];let width=800,height=560,frame=0,last=0,disposed=false,target=null,drag=null,lastDraw=0,lastNear='',expanded=false;
 const pressed=new Set(),held=new Set(),removers=[];
 const listen=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);removers.push(()=>el.removeEventListener(type,fn,opts));};
 function setStatus(text){root.querySelector('.room-status').textContent=text;}
 function updateHUD(){
  const near=nearestShelf(pose);const nearby=root.querySelector('.nearby-shelf');const name=near&&sections.find(s=>s.id===near.id)?.name;
  nearby.querySelector('span').textContent=name?'You’ve found '+name:'Wander toward a shelf to discover it.';
  const enter=nearby.querySelector('button');enter.hidden=!near;enter.textContent=name?'Explore '+name+' →':'Open shelf →';enter.onclick=()=>{if(near)onSelect(near.id);};
  const player=root.querySelector('.map-player');const mx=50+pose.x*7,my=20+(pose.z+12)*6+11;player.setAttribute('transform',`translate(${mx} ${my}) rotate(${pose.yaw*180/Math.PI})`);
  root.dataset.x=pose.x.toFixed(2);root.dataset.z=pose.z.toFixed(2);root.dataset.yaw=pose.yaw.toFixed(2);
  const id=near?.id||'';if(lastNear!==id){lastNear=id;if(name)setStatus('Nearby shelf: '+name+'. Press Enter to open.');}
  root.querySelector('.room-compass i').style.transform=`rotate(${-pose.yaw}rad)`;
  for(const s of shelves){const button=root.querySelector(`.shelf-hotspot[data-room-open="${s.id}"]`);const p=project([s.x<0?-3.95:3.95,2.15,s.z],pose,width,height);const visible=!!p&&p.depth<19&&p.x>-60&&p.x<width+60&&p.y>45&&p.y<height-100;
   button.hidden=!visible;if(visible){button.style.left=Math.max(78,Math.min(width-78,p.x))+'px';button.style.top=p.y+'px';button.style.transform=`translate(-50%,-50%) scale(${Math.max(.55,Math.min(1,4.5/p.depth))})`;button.style.zIndex=String(100-Math.round(p.depth));}
  }
 }
 function draw(){if(!ctx)return;const ratio=Math.min(win.devicePixelRatio||1,1.5);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#c7e0e5');sky.addColorStop(.5,'#fff5df');sky.addColorStop(1,'#dabf9e');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const focal=width/(2*Math.tan(Math.PI*72/360));const visible=[];
  for(const poly of scene){const v=clipNear(poly.v.map(p=>viewPoint(p,pose)));if(v.length<3)continue;const points=v.map(p=>[width/2+p[0]*focal/p[2],height*.46-p[1]*focal/p[2]]);if(points.every(p=>p[0]<0)||points.every(p=>p[0]>width)||points.every(p=>p[1]<0)||points.every(p=>p[1]>height))continue;
   visible.push({points,c:poly.c,depth:v.reduce((sum,p)=>sum+p[2],0)/v.length});}
  visible.sort((a,b)=>b.depth-a.depth);
  for(const p of visible){ctx.beginPath();ctx.moveTo(...p.points[0]);for(let i=1;i<p.points.length;i++)ctx.lineTo(...p.points[i]);ctx.closePath();ctx.fillStyle=p.c;ctx.fill();}
  // A gentle edge vignette makes the skylights feel luminous without hiding signs.
  const glow=ctx.createRadialGradient(width*.5,height*.3,width*.12,width*.5,height*.5,width*.8);glow.addColorStop(0,'#fff9ed00');glow.addColorStop(1,'#734d3229');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 }
 function resize(){const rect=viewport.getBoundingClientRect();width=rect.width||800;height=rect.height||560;const ratio=Math.min(win.devicePixelRatio||1,1.5);canvas.width=width*ratio;canvas.height=height*ratio;draw();updateHUD();}
 function input(){return {forward:Number(pressed.has('w')||pressed.has('arrowup')||held.has('forward'))-Number(pressed.has('s')||pressed.has('arrowdown')||held.has('back')),strafe:Number(pressed.has('d')||held.has('right'))-Number(pressed.has('a')||held.has('left')),turn:Number(pressed.has('arrowright')||pressed.has('e')||held.has('turnRight'))-Number(pressed.has('arrowleft')||pressed.has('q')||held.has('turnLeft'))};}
 function tick(time){if(disposed)return;const dt=Math.min((time-last)/1000,.05);last=time;
  if(!doc.hidden&&!doc.querySelector('dialog[open]')){const controls=input(),moving=controls.forward||controls.strafe||controls.turn,changed=!!(moving||target);if(moving){target=null;move(pose,controls,dt);}else if(target&&walkToward(pose,target,dt)){const destination=sections.find(s=>s.id===target);target=null;setStatus('Arrived at '+destination.name+'. Open the shelf to read.');}
   if(changed&&time-lastDraw>30){draw();updateHUD();lastDraw=time;}}
  frame=win.requestAnimationFrame(tick);
 }
 const clearInput=()=>{pressed.clear();held.clear();drag=null;};
 function enter(){const near=nearestShelf(pose);if(near)onSelect(near.id);}
 function goTo(id){if(doc.documentElement.classList.contains('reduce-motion')||win.matchMedia?.('(prefers-reduced-motion: reduce)').matches){onSelect(id);return;}target=id;pressed.clear();held.clear();setStatus('Walking to '+sections.find(s=>s.id===id).name+'. Use movement controls to stop.');viewport.focus({preventScroll:true});}
 listen(viewport,'keydown',e=>{if(e.target.closest('button,input,textarea'))return;const key=e.key.toLowerCase();if(['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();pressed.add(key);}if(key==='enter'){e.preventDefault();enter();}});
 listen(doc,'keyup',e=>pressed.delete(e.key.toLowerCase()));listen(win,'blur',clearInput);listen(viewport,'focusout',clearInput);listen(doc,'visibilitychange',clearInput);
 listen(viewport,'pointerdown',e=>{if(e.target.closest('button,.room-map'))return;viewport.focus({preventScroll:true});target=null;drag={id:e.pointerId,x:e.clientX};viewport.setPointerCapture?.(e.pointerId);viewport.classList.add('looking');});
 listen(viewport,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;pose.yaw+=(e.clientX-drag.x)*.006;drag.x=e.clientX;draw();updateHUD();});
 const release=e=>{if(drag?.id===e.pointerId){drag=null;viewport.classList.remove('looking');}};listen(viewport,'pointerup',release);listen(viewport,'pointercancel',release);listen(viewport,'lostpointercapture',release);
 for(const b of root.querySelectorAll('[data-move]')){
  let down=0;listen(b,'pointerdown',e=>{e.preventDefault();target=null;down=Date.now();held.add(b.dataset.move);b.setPointerCapture?.(e.pointerId);viewport.focus({preventScroll:true});});
  const end=()=>{held.delete(b.dataset.move);};listen(b,'pointerup',end);listen(b,'pointercancel',end);listen(b,'lostpointercapture',end);
  listen(b,'click',e=>{if(e.detail>0&&Date.now()-down>180)return;held.add(b.dataset.move);for(let i=0;i<6;i++)move(pose,input(),.05);held.delete(b.dataset.move);target=null;draw();updateHUD();});
 }
 for(const b of root.querySelectorAll('[data-room-open]'))listen(b,'click',()=>onSelect(b.dataset.roomOpen));
 for(const b of root.querySelectorAll('[data-destination]'))listen(b,'click',()=>{goTo(b.dataset.destination);});
 listen(root.querySelector('.room-reset'),'click',()=>{Object.assign(pose,startPose());target=null;clearInput();draw();updateHUD();setStatus('You are back at the library entrance.');viewport.focus({preventScroll:true});});
 function expand(value){expanded=value;root.classList.toggle('is-expanded',value);doc.body.classList.toggle('room-is-expanded',value);root.querySelector('.room-expand').setAttribute('aria-label',value?'Close expanded library':'Expand library');resize();viewport.focus({preventScroll:true});}
 listen(root.querySelector('.room-expand'),'click',()=>expand(!expanded));listen(doc,'keydown',e=>{if(e.key==='Escape'&&expanded)expand(false);});
 listen(win,'resize',resize);const observer=win.ResizeObserver?new win.ResizeObserver(resize):null;observer?.observe(viewport);
 if(!ctx){root.classList.add('canvas-unavailable');root.querySelector('.room-fallback').hidden=false;root.querySelector('.room-hotspots').hidden=true;}
 resize();if(ctx&&win.requestAnimationFrame)frame=win.requestAnimationFrame(tick);
 return {pose,walkTo:goTo,dispose(){disposed=true;clearInput();for(const remove of removers)remove();observer?.disconnect();if(frame)win.cancelAnimationFrame?.(frame);doc.body.classList.remove('room-is-expanded');}};
}
