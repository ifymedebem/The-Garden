import {palette,shelves,startPose,move,nearestShelf,viewPoint,project,walkToward,shelfBounds} from './library-world.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function libraryMarkup(sections){return `<section class="library-room" aria-label="Interactive garden library"><div class="room-heading"><span class="room-tag">A GARDEN OF SMALL DISCOVERIES</span><span class="room-live"><i></i> You’re here. Take your time.</span></div><div class="room-viewport" tabindex="0" role="region" aria-label="Walkable garden. W A S D to move, left and right arrow keys to turn. Drag to look around. Enter opens the nearby shelf." aria-describedby="room-instructions"><canvas class="room-canvas" aria-hidden="true"></canvas><div class="room-fallback" hidden><h2>A shelf for every kind of curiosity.</h2><p>Your browser doesn’t support this interactive view. Choose a shelf below.</p>${sections.map(s=>`<button class="button outline" data-room-open="${s.id}">${esc(s.name)} →</button>`).join('')}</div><div class="room-title"><span>THE GARDEN · AN OPEN-AIR LIBRARY</span><h2>Let your curiosity bloom.</h2><p>Winding shelves. Fluttering wings. A little wonder.</p></div><div class="room-hotspots">${shelves.map(s=>{const section=sections.find(t=>t.id===s.id);return `<button class="shelf-hotspot" data-room-open="${s.id}" aria-label="Explore ${esc(section.name)}" aria-describedby="shelf-preview" hidden style="--shelf-accent:${s.color}"><span class="shelf-pin" aria-hidden="true">▤</span></button>`;}).join('')}</div><div id="shelf-preview" class="shelf-preview" hidden><small></small><h3></h3><p></p><span class="preview-count"></span><button class="button primary">Explore this shelf →</button></div><span class="room-crosshair" aria-hidden="true">+</span><button class="room-expand" aria-label="Expand library" title="Expand library">⛶</button><div class="garden-sound-controls"><button class="garden-sound" aria-pressed="false">♫ Garden sounds</button><label><span class="sr-only">Garden sound volume</span><input class="garden-volume" type="range" min="0" max="0.5" step="0.01" value="0.22" aria-label="Garden sound volume"></label></div><button class="central-shelf-sign" data-room-open="history"><small>THE WINDING SHELF</small><span aria-hidden="true">▤</span></button><div class="room-compass" aria-hidden="true"><span>N</span><i>↑</i></div><div class="room-map"><span>YOUR LITTLE WORLD</span><svg viewBox="0 0 100 165" role="img" aria-label="Library map with your position"><rect x="8" y="5" width="84" height="155" rx="14" fill="#fffaf1"/><path d="M30 20v125M70 20v125" stroke="#dbd0b8" stroke-dasharray="3 5"/><path d="M50 29Q62 44 50 61T50 93T50 116" fill="none" stroke="#b69a6d" stroke-width="8" stroke-linecap="round"/>${shelves.map(s=>`<rect x="${s.x<0?14:69}" y="${20+(s.z+12)*6}" width="17" height="22" rx="3" fill="${s.color}" opacity=".85"/>`).join('')}<g class="map-player"><circle r="8" fill="#fffaf1" opacity=".7"/><path d="m0-7 5 11-5-2-5 2Z" fill="#355569" stroke="#fffaf1" stroke-width="1.5"/></g></svg><small>Every shelf is a new beginning.</small></div><div class="nearby-shelf"><span>Wander toward a shelf to discover it.</span><button class="button primary" data-enter-nearby hidden>Open shelf →</button></div><div class="room-movement" aria-label="Movement controls"><span>MOVE</span><div class="direction-pad"><button data-move="forward" aria-label="Move forward">↑</button><button data-move="left" aria-label="Move left">←</button><button data-move="back" aria-label="Move backward">↓</button><button data-move="right" aria-label="Move right">→</button></div><div class="turn-pad"><button data-move="turnLeft" aria-label="Turn left">↶</button><button data-move="turnRight" aria-label="Turn right">↷</button></div></div></div><div class="room-bottom"><p id="room-instructions"><kbd>W A S D</kbd> to move <span>·</span> Drag to look <span>·</span> Tap a shelf to read</p><button class="room-reset">↺ Back to the entrance</button></div><div class="room-destinations"><span>TAKE ME TO</span>${sections.map(s=>`<button data-destination="${s.id}"><i style="background:${s.color}"></i>${esc(s.name)}</button>`).join('')}</div><p class="room-status sr-only" aria-live="polite"></p></section>`;}

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
 // Lawn, warm stepping stones, a timber garden boundary, and an open sky.
 for(let z=-19;z<9;z+=1.25)for(let x=-6;x<6;x+=1.25){const i=Math.abs(Math.round(x*7+z*3));face([[x,0,z],[x+1.26,0,z],[x+1.26,0,z+1.26],[x,0,z+1.26]],['#7d9560','#849e68','#8ca46d','#78905b'][i%4]);}
 for(let z=-16;z<7;z+=1.15)for(const side of [-1,1]){const x=side*(2.4+Math.sin(z*.45)*.22);face([[x-.7,.018,z],[x+.65,.018,z+.08],[x+.7,.018,z+.95],[x-.6,.018,z+.88]],Math.round(z)%2?'#d9c5a1':'#e5d1ad');}
 for(let z=-18;z<8;z+=.55)for(const x of [-5.25,5.25])box(x,0,z,.12,2.7,.5,'#9d7953');
 for(const z of [-18,7.8])for(let x=-5.2;x<5.2;x+=.55)box(x,0,z,.5,2.7,.12,'#a18158');
 // Trees, flower borders, climbing leaves, and warm suspended garden bulbs.
 for(let z=-16;z<7;z+=3.2)for(const side of [-1,1]){
  const x=side*4.8;box(x-.1,0,z-.1,.2,5,.2,'#85704e');
  for(let i=0;i<16;i++){const angle=i*2.4,r=.5+(i%4)*.3,cx=x+Math.cos(angle)*r,cz=z+Math.sin(angle)*r,cy=3.6+(i%5)*.3;
   polygons.push({v:[[cx-.8,cy,cz],[cx,cy+.5,cz-.6],[cx+.8,cy+.1,cz],[cx,cy-.1,cz+.6]],c:['#6f8d56','#819c62','#9aaa6b','#68834f'][i%4],sway:.08,phase:i+z});}
  for(let i=0;i<9;i++){const fx=side*(3.8+(i%3)*.4),fz=z-1+i*.27,y=.25+(i%3)*.11;box(fx,.01,fz,.035,y,.035,'#6f8b55');
   for(let p=0;p<4;p++){const a=p*Math.PI/2;face([[fx,y+.06,fz],[fx+Math.cos(a)*.16,y+.14,fz+Math.sin(a)*.16],[fx,y+.22,fz],[fx-Math.sin(a)*.13,y+.12,fz+Math.cos(a)*.13]],['#e6acaa','#e9ce86','#d9d2e7'][i%3]);}
  }
 }
 for(const z of [3,-3,-9,-15]){
  for(let i=0;i<7;i++){const x=-4.4+i*1.45,y=4.2-Math.sin(i/6*Math.PI)*.6;box(x,y,z,.025,.22,.025,'#846e43');
   face([[x-.11,y-.22,z],[x,y-.37,z],[x+.11,y-.22,z],[x,y-.06,z]],'#f5cd78');
   face([[x-.045,y-.22,z+.01],[x,y-.31,z+.01],[x+.045,y-.22,z+.01],[x,y-.14,z+.01]],'#fff0b1');
  }
 }
 // A continuous, serpentine bookcase through the centre of the garden.
 const cx=z=>Math.sin((z+1)*.55)*.85;
 for(let z=-12;z<1.2;z+=.55){const a=cx(z),b=cx(z+.55);
  for(const side of [-1,1]){const x=a+side*.37,nx=b+side*.37;
   face([[x,.12,z],[nx,.12,z+.55],[nx,1.85,z+.55],[x,1.85,z]],'#8c7150');
   for(const y of [.12,.68,1.24,1.85]){face([[a-.43,y,z],[b-.43,y,z+.55],[b+.43,y,z+.55],[a+.43,y,z]],'#d4ae7a');}
   for(let row=0;row<3;row++)for(let j=0;j<3;j++){const t=j/3,zz=z+t*.55,xx=cx(zz)+side*.385,y=.18+row*.56,h=.33+(j%2)*.09;face([[xx,y,zz],[xx,y+h,zz],[xx,y+h,zz+.13],[xx,y,zz+.13]],[palette.blue,palette.peach,palette.gold,palette.green][(row+j+Math.abs(Math.round(z)))%4]);}
  }
  // Trailing plants spill over the top of the curved bookcase.
  if(Math.round(z*2)%3===0)for(let j=0;j<3;j++){const y=1.95-j*.2,x=a+.4+j*.06;polygons.push({v:[[x-.13,y,z],[x,y+.15,z+.1],[x+.13,y,z+.12],[x,y-.17,z+.08]],c:j%2?'#799367':'#9bad78',sway:.055,phase:z+j});}
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
 // A quiet garden seat at the end of the path.
 box(-1.5,.4,-17.2,3,.25,.65,'#ba815c');box(-1.5,.65,-17.4,3,.6,.12,'#d6c19a');
 return polygons;
}

export function butterflies(time){const out=[];for(let i=0;i<7;i++){const x=Math.sin(time*.32+i*2)*2.7,z=-3-i*1.5+Math.cos(time*.24+i)*1.5,y=1.8+Math.sin(time*.7+i)*.65,wing=.12+Math.abs(Math.sin(time*8+i))*.17;for(const side of [-1,1])out.push({v:[[x,y,z],[x+side*wing,y+.13,z-.14],[x+side*wing*.8,y-.08,z+.15],[x,y-.04,z+.03]],c:['#85b9cb','#d9b46f','#e3b2a0'][i%3]});}return out;}

// Clip against the near plane before projecting: the camera may pass a shelf.
export function clipNear(vertices,near=.12){const out=[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length];const aIn=a[2]>=near,bIn=b[2]>=near;if(aIn)out.push(a);if(aIn!==bIn){const t=(near-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}}return out;}

export function mountLibrary(root,{sections,onSelect,pose=startPose()}){
 const doc=root.ownerDocument,win=doc.defaultView,viewport=root.querySelector('.room-viewport'),canvas=root.querySelector('canvas');
 const ctx=canvas.getContext?.('2d');const scene=ctx?buildScene():[];let width=800,height=560,frame=0,last=0,disposed=false,target=null,drag=null,lastDraw=0,lastNear='',expanded=false;
 const pressed=new Set(),held=new Set(),removers=[];let previewId='',previewTimer=null,touchId='';const preview=root.querySelector('.shelf-preview');
 function showPreview(id){clearTimeout(previewTimer);previewId=id;const section=sections.find(s=>s.id===id);if(!section)return;preview.hidden=false;preview.querySelector('small').textContent=section.zone;preview.querySelector('h3').textContent=section.name;preview.querySelector('p').textContent=section.description||'';const count=section.readCount??0;preview.querySelector('.preview-count').textContent=`${count} short ${count===1?'read':'reads'}`;preview.querySelector('button').onclick=()=>onSelect(id);}
 function hidePreview(){preview.hidden=true;previewId='';touchId='';}
 function deferHide(){clearTimeout(previewTimer);previewTimer=setTimeout(hidePreview,220);}
 const listen=(el,type,fn,opts)=>{el.addEventListener(type,fn,opts);removers.push(()=>el.removeEventListener(type,fn,opts));};
 function setStatus(text){root.querySelector('.room-status').textContent=text;}
 function updateHUD(){
  const near=nearestShelf(pose);const nearby=root.querySelector('.nearby-shelf');const name=near&&sections.find(s=>s.id===near.id)?.name;
  nearby.querySelector('span').textContent=name?'You’ve found '+name:'Wander toward a shelf to discover it.';
  const enter=nearby.querySelector('button');enter.hidden=!near;enter.textContent=name?'Explore '+name+' →':'Open shelf →';enter.onclick=()=>{if(near)onSelect(near.id);};
  const central=root.querySelector('.central-shelf-sign');const anchor=project([0,2.05,.8],pose,width,height);central.hidden=!anchor||anchor.depth<2||anchor.x<0||anchor.x>width||anchor.y>height-150;if(!central.hidden){central.style.left=anchor.x+'px';central.style.top=anchor.y+'px';}
  const player=root.querySelector('.map-player');const mx=50+pose.x*7,my=20+(pose.z+12)*6+11;player.setAttribute('transform',`translate(${mx} ${my}) rotate(${pose.yaw*180/Math.PI})`);
  root.dataset.x=pose.x.toFixed(2);root.dataset.z=pose.z.toFixed(2);root.dataset.yaw=pose.yaw.toFixed(2);
  const id=near?.id||'';if(lastNear!==id){lastNear=id;if(name)setStatus('Nearby shelf: '+name+'. Press Enter to open.');}
  root.querySelector('.room-compass i').style.transform=`rotate(${-pose.yaw}rad)`;
  for(const s of shelves){const button=root.querySelector(`.shelf-hotspot[data-room-open="${s.id}"]`);const bounds=shelfBounds(s,pose,width,height);button.hidden=!bounds;
   if(bounds){button.style.left=bounds.x+'px';button.style.top=bounds.y+'px';button.style.width=bounds.width+'px';button.style.height=bounds.height+'px';button.style.transform='none';button.style.zIndex=String(100-Math.round(bounds.depth));}
   if(previewId===s.id&&!bounds)hidePreview();
  }
 }
 function motionAllowed(){return !doc.documentElement.classList.contains('reduce-motion')&&!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
 function draw(){if(!ctx)return;const ratio=Math.min(win.devicePixelRatio||1,1.5);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#a9cdd3');sky.addColorStop(.5,'#efd5b4');sky.addColorStop(1,'#9baa71');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const focal=width/(2*Math.tan(Math.PI*72/360));const visible=[];
  const clock=motionAllowed()?(win.performance?.now?.()||Date.now())/1000:0;
  for(const poly of [...scene,...butterflies(clock)]){const v=clipNear(poly.v.map(p=>viewPoint(poly.sway?[p[0]+Math.sin(clock*.9+(poly.phase||0))*poly.sway,p[1],p[2]]:p,pose)));if(v.length<3)continue;const points=v.map(p=>[width/2+p[0]*focal/p[2],height*.46-p[1]*focal/p[2]]);if(points.every(p=>p[0]<0)||points.every(p=>p[0]>width)||points.every(p=>p[1]<0)||points.every(p=>p[1]>height))continue;
   visible.push({points,c:poly.c,depth:v.reduce((sum,p)=>sum+p[2],0)/v.length});}
  visible.sort((a,b)=>b.depth-a.depth);
  for(const p of visible){ctx.beginPath();ctx.moveTo(...p.points[0]);for(let i=1;i<p.points.length;i++)ctx.lineTo(...p.points[i]);ctx.closePath();ctx.fillStyle=p.c;ctx.fill();}
  // A gentle edge vignette makes the skylights feel luminous without hiding signs.
  const glow=ctx.createRadialGradient(width*.5,height*.3,width*.12,width*.5,height*.5,width*.8);glow.addColorStop(0,'#fff9ed00');glow.addColorStop(1,'#734d3229');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 }
 function resize(){const rect=viewport.getBoundingClientRect();width=rect.width||800;height=rect.height||560;const ratio=Math.min(win.devicePixelRatio||1,1.5);canvas.width=width*ratio;canvas.height=height*ratio;draw();updateHUD();}
 function input(){return {forward:Number(pressed.has('w')||pressed.has('arrowup')||held.has('forward'))-Number(pressed.has('s')||pressed.has('arrowdown')||held.has('back')),strafe:Number(pressed.has('d')||held.has('right'))-Number(pressed.has('a')||held.has('left')),turn:Number(pressed.has('arrowright')||pressed.has('e')||held.has('turnRight'))-Number(pressed.has('arrowleft')||pressed.has('q')||held.has('turnLeft'))};}
 function tick(time){if(disposed)return;const dt=Math.min((time-last)/1000,.05);last=time;
  if(!doc.hidden&&!doc.querySelector('dialog[open]')){const controls=doc.body.classList.contains('menu-open')?{forward:0,strafe:0,turn:0}:input(),moving=controls.forward||controls.strafe||controls.turn,changed=!!(moving||target);if(moving){target=null;move(pose,controls,dt);}else if(!doc.body.classList.contains('menu-open')&&target&&walkToward(pose,target,dt)){const destination=sections.find(s=>s.id===target);target=null;setStatus('Arrived at '+destination.name+'. Open the shelf to read.');}
   if((changed||motionAllowed())&&time-lastDraw>45){draw();updateHUD();lastDraw=time;}}
  frame=win.requestAnimationFrame(tick);
 }
 const clearInput=()=>{pressed.clear();held.clear();drag=null;};
 function enter(){const near=nearestShelf(pose);if(near)onSelect(near.id);}
 function goTo(id){if(doc.documentElement.classList.contains('reduce-motion')||win.matchMedia?.('(prefers-reduced-motion: reduce)').matches){onSelect(id);return;}target=id;pressed.clear();held.clear();setStatus('Walking to '+sections.find(s=>s.id===id).name+'. Use movement controls to stop.');viewport.focus({preventScroll:true});}
 listen(viewport,'keydown',e=>{if(e.target.closest('button,input,textarea'))return;const key=e.key.toLowerCase();if(['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();pressed.add(key);}if(key==='enter'){e.preventDefault();enter();}});
 listen(doc,'keyup',e=>pressed.delete(e.key.toLowerCase()));listen(win,'blur',clearInput);listen(viewport,'focusout',clearInput);listen(doc,'visibilitychange',clearInput);
 listen(viewport,'pointerdown',e=>{if(e.target.closest('button,.room-map'))return;viewport.focus({preventScroll:true});hidePreview();target=null;drag={id:e.pointerId,x:e.clientX};viewport.setPointerCapture?.(e.pointerId);viewport.classList.add('looking');});
 listen(viewport,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;pose.yaw+=(e.clientX-drag.x)*.006;drag.x=e.clientX;draw();updateHUD();});
 const release=e=>{if(drag?.id===e.pointerId){drag=null;viewport.classList.remove('looking');}};listen(viewport,'pointerup',release);listen(viewport,'pointercancel',release);listen(viewport,'lostpointercapture',release);
 for(const b of root.querySelectorAll('[data-move]')){
  let down=0;listen(b,'pointerdown',e=>{e.preventDefault();target=null;down=Date.now();held.add(b.dataset.move);b.setPointerCapture?.(e.pointerId);viewport.focus({preventScroll:true});});
  const end=()=>{held.delete(b.dataset.move);};listen(b,'pointerup',end);listen(b,'pointercancel',end);listen(b,'lostpointercapture',end);
  listen(b,'click',e=>{if(e.detail>0&&Date.now()-down>180)return;held.add(b.dataset.move);for(let i=0;i<6;i++)move(pose,input(),.05);held.delete(b.dataset.move);target=null;draw();updateHUD();});
 }
 for(const b of root.querySelectorAll('[data-room-open]')){
  listen(b,'pointerenter',e=>{if(e.pointerType!=='touch')showPreview(b.dataset.roomOpen);});listen(b,'pointerleave',deferHide);listen(b,'focus',()=>showPreview(b.dataset.roomOpen));listen(b,'blur',deferHide);
  let touch=false;listen(b,'pointerdown',e=>{touch=e.pointerType==='touch';});listen(b,'click',e=>{if(touch||e.pointerType==='touch'){touch=false;if(touchId===b.dataset.roomOpen)onSelect(b.dataset.roomOpen);else{showPreview(b.dataset.roomOpen);touchId=b.dataset.roomOpen;}}else onSelect(b.dataset.roomOpen);});
 }
 listen(preview,'pointerenter',()=>clearTimeout(previewTimer));listen(preview,'pointerleave',deferHide);listen(preview,'focusin',()=>clearTimeout(previewTimer));listen(preview,'focusout',e=>{if(!preview.contains(e.relatedTarget))deferHide();});listen(viewport,'keydown',e=>{if(e.key==='Escape')hidePreview();});

 for(const b of root.querySelectorAll('[data-destination]'))listen(b,'click',()=>{goTo(b.dataset.destination);});
 listen(root.querySelector('.room-reset'),'click',()=>{Object.assign(pose,startPose());target=null;clearInput();draw();updateHUD();setStatus('You are back at the library entrance.');viewport.focus({preventScroll:true});});
 function expand(value){expanded=value;root.classList.toggle('is-expanded',value);doc.body.classList.toggle('room-is-expanded',value);root.querySelector('.room-expand').setAttribute('aria-label',value?'Close expanded library':'Expand library');resize();viewport.focus({preventScroll:true});}
 listen(root.querySelector('.room-expand'),'click',()=>expand(!expanded));listen(doc,'keydown',e=>{if(e.key==='Escape'&&expanded)expand(false);});
 listen(win,'resize',resize);const observer=win.ResizeObserver?new win.ResizeObserver(resize):null;observer?.observe(viewport);
 if(!ctx){root.classList.add('canvas-unavailable');root.querySelector('.room-fallback').hidden=false;root.querySelector('.room-hotspots').hidden=true;}
 resize();if(ctx&&win.requestAnimationFrame)frame=win.requestAnimationFrame(tick);
 return {pose,walkTo:goTo,dispose(){disposed=true;clearTimeout(previewTimer);clearInput();for(const remove of removers)remove();observer?.disconnect();if(frame)win.cancelAnimationFrame?.(frame);doc.body.classList.remove('room-is-expanded');}};
}
