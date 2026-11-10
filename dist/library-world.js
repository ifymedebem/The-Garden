// Small, deterministic movement model shared by the renderer and tests.
export const palette={ivory:'#fffaf1',peach:'#edb3a2',blue:'#82bdcf',green:'#76917a',terracotta:'#b9764f',gold:'#d6b568',ink:'#344b4b'};
export const shelves=[
 {id:'history',x:-4.35,z:0,color:palette.terracotta},
 {id:'conflict',x:4.35,z:0,color:palette.peach},
 {id:'geopolitics',x:-4.35,z:-6,color:palette.blue},
 {id:'news',x:4.35,z:-6,color:palette.gold},
 {id:'economics',x:-4.35,z:-12,color:palette.green},
 {id:'finance',x:4.35,z:-12,color:palette.gold}
];
export const startPose=()=>({x:0,z:6.2,yaw:0});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const windingShelfX=z=>Math.sin((z+1)*.55)*.85;
export const collidesWithShelf=(x,z)=>z>-12.7&&z<1.85&&Math.abs(x-windingShelfX(z))<.85;
export function move(pose,{forward=0,strafe=0,turn=0},dt){
 dt=clamp(dt,0,.05);pose.yaw+=turn*dt*1.65;
 const length=Math.max(1,Math.hypot(forward,strafe));const speed=2.6*dt/length;
 const nextX=clamp(pose.x+(Math.sin(pose.yaw)*forward+Math.cos(pose.yaw)*strafe)*speed,-3.45,3.45);
 const nextZ=clamp(pose.z+(-Math.cos(pose.yaw)*forward+Math.sin(pose.yaw)*strafe)*speed,-15.6,6.6);
 if(!collidesWithShelf(nextX,pose.z))pose.x=nextX;if(!collidesWithShelf(pose.x,nextZ))pose.z=nextZ;
 return pose;
}
export function nearestShelf(pose,maxDistance=3.4){return shelves.map(s=>({...s,distance:Math.hypot(s.x-pose.x,s.z-pose.z)})).sort((a,b)=>a.distance-b.distance).find(s=>s.distance<maxDistance);}
export function viewPoint(point,pose){const dx=point[0]-pose.x,dz=point[2]-pose.z;return [dx*Math.cos(pose.yaw)+dz*Math.sin(pose.yaw),point[1]-1.65,dx*Math.sin(pose.yaw)-dz*Math.cos(pose.yaw)];}
export function project(point,pose,width,height){const [x,y,z]=viewPoint(point,pose);if(z<.12)return null;const focal=width/(2*Math.tan(Math.PI*72/360));return {x:width/2+x*focal/z,y:height*.46-y*focal/z,depth:z};}
export function walkToward(pose,target,dt){
 const goal=shelves.find(s=>s.id===target);if(!goal)return true;
 const x=goal.x<0?-2.6:2.6,z=goal.z+1.3;
 let targetX=x,targetZ=z;if(pose.x*x<0&&pose.z<3){targetX=pose.x;targetZ=3;}else if(Math.abs(pose.x-x)>.12){targetX=x;targetZ=Math.max(3,pose.z);}
 const dx=targetX-pose.x,dz=targetZ-pose.z,d=Math.hypot(dx,dz);
 if(d<.1&&(Math.abs(pose.x-x)>.12||Math.abs(pose.z-z)>.12))return false;
 if(d<.1){const yaw=goal.x<0?-Math.PI/2:Math.PI/2;const diff=Math.atan2(Math.sin(yaw-pose.yaw),Math.cos(yaw-pose.yaw));if(Math.abs(diff)<.03){pose.yaw=yaw;return true;}pose.yaw+=diff*Math.min(1,dt*5);return false;}
 const step=Math.min(d,2.8*Math.min(dt,.05));pose.x+=dx/d*step;pose.z+=dz/d*step;
 const yaw=Math.atan2(dx,-dz);const diff=Math.atan2(Math.sin(yaw-pose.yaw),Math.cos(yaw-pose.yaw));pose.yaw+=diff*Math.min(1,dt*5);
 return false;
}
