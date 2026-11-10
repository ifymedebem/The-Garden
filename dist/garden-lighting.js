// Local atmosphere only: no location permission or weather service is needed.
export function gardenLighting({enabled=false,mode='auto',date=new Date()}={}){
 if(!enabled||mode==='day')return {phase:'day',sky:['#b8dce4','#f5e4bf','#a9b880'],shade:[1,1,1],glow:.14,label:'Daylight'};
 const hour=date.getHours()+date.getMinutes()/60;
 const phase=mode==='evening'?'night':hour>=7&&hour<18?'day':hour>=6&&hour<7||hour>=18&&hour<20?'dusk':'night';
 if(phase==='day')return gardenLighting();
 if(phase==='dusk')return {phase,sky:['#718ba8','#e6ad91','#8d946e'],shade:[.91,.81,.8],glow:.65,label:'Golden hour'};
 return {phase,sky:['#182d46','#51526c','#435948'],shade:[.48,.53,.67],glow:1,label:'Evening garden'};
}
export function litColour(hex,lighting,emissive=false){
 if(emissive)return lighting.phase==='day'?'#f5d28b':'#ffe1a0';
 if(lighting.phase==='day')return hex;
 const rgb=hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);if(!rgb)return hex;
 return '#'+rgb.slice(1).map((v,i)=>Math.round(parseInt(v,16)*lighting.shade[i]).toString(16).padStart(2,'0')).join('');
}
