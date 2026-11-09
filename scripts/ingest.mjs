import {writeFile, mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const config = [
 {id:'history', name:'African History', icon:'landmark', zone:'History & humanity', color:'#9a6349', description:'The stories that shaped a continent.', pages:['Kingdom of Kush','Mansa Musa','Great Zimbabwe']},
 {id:'geopolitics', name:'Geopolitics', icon:'globe', zone:'Our changing world', color:'#5e7766', description:'Understand the world behind the headlines.', pages:['Strait of Hormuz','African Union','Non-Aligned Movement']},
 {id:'economics', name:'Economics for Beginners', icon:'chart', zone:'Money & meaning', color:'#a5874b', description:'Big ideas, in everyday language.', pages:['Opportunity cost','Inflation','Comparative advantage']},
 {id:'news', name:'World News', icon:'sun', zone:'Our changing world', color:'#6e7f91', description:'A little context for a world in motion.', live:true, pages:[]},
 {id:'finance', name:'Finance & Investment', icon:'sprout', zone:'Money & meaning', color:'#61785b', description:'Make sense of money, one idea at a time.', live:true, pages:['Diversification (finance)','Compound interest']},
 {id:'conflict', name:'Wars & Famines', icon:'heart', zone:'History & humanity', color:'#957378', description:'Human stories. Essential context.', pages:['Food security','Famine','Humanitarian aid']}
];
export function validate(card) {
 const url = new URL(card.url);
 const hosts = {'Wikipedia':['en.wikipedia.org'],'The Guardian':['www.theguardian.com'],'FRED':['fred.stlouisfed.org']};
 if(url.protocol!=='https:' || !hosts[card.source]?.includes(url.hostname)) throw new Error('Unapproved source');
 if(!card.id || !card.title || !card.text || !Number.isFinite(Date.parse(card.asOf)) || Date.parse(card.asOf)>Date.now()+60000) throw new Error('Invalid card');
 if(!card.raw || !card.raw.includes(card.text)) throw new Error('Summary must match the source');
 return true;
}
const headers={'User-Agent':'TheGarden/0.1 (educational library prototype; source attribution provided)'};
async function get(url){const r=await fetch(url,{headers,signal:AbortSignal.timeout(20000)});if(!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);return r;}
export function excerpt(text){const clipped=text.split(/\s+/).slice(0,60).join(' ').slice(0,410);const end=[...clipped.matchAll(/[.!?](?=\s|$)/g)].at(-1)?.index;return (end!==undefined?clipped.slice(0,end+1):clipped.slice(0,clipped.lastIndexOf(' '))).trim() || clipped;}
export function plain(text){return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();}
async function run(){
 const cards=[];const health=[];
 for(const section of config)for(const page of section.pages){
   try{const d=await(await get('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(page))).json();
   const raw=plain(d.extract);const card={id:section.id+'-'+d.pageid,section:section.id,title:d.title,text:excerpt(raw),raw,url:d.content_urls.desktop.page,source:'Wikipedia',asOf:new Date().toISOString(),publishedAt:d.timestamp,license:'CC BY-SA 4.0',image:d.thumbnail?.source};validate(card);cards.push(card);
   }catch(e){health.push({source:page,status:'unavailable',message:e.message});}
 }
 try{const xml=await(await get('https://www.theguardian.com/world/rss')).text();
 for(const item of [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,6)){
 const field=name=>plain(item[1].match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)<\\/'+name+'>'))?.[1]||'');
 const text=field('description').replace(/Continue reading\.\.\.$/,'').trim();const date=field('pubDate');if(Date.now()-Date.parse(date)>172800000)continue;
 const url=field('link');const card={id:'news-'+url.split('/').slice(-2).join('-'),section:'news',title:field('title'),text:excerpt(text),raw:text,url,source:'The Guardian',asOf:new Date().toISOString(),publishedAt:date,license:'Headline and short RSS excerpt; full story at source',image:item[1].match(/<media:content[^>]+url="([^"]+)"/)?.[1]};validate(card);cards.push(card);
 }
 }catch(e){health.push({source:'The Guardian',status:'unavailable',message:e.message});}
 try{const raw=await(await get('https://fred.stlouisfed.org/graph.csv?id=FEDFUNDS')).text();
 const rows=raw.trim().split('\n');const row=rows.reverse().find(r=>/^\d{4}-\d{2}-\d{2},[\d.]+$/.test(r.trim()));
 if(!row)throw new Error('No valid FRED observation');
 const [period,value]=row.trim().split(',');const card={id:'finance-fedfunds',section:'finance',title:'The effective federal funds rate',text:row.trim(),raw,url:'https://fred.stlouisfed.org/series/FEDFUNDS',source:'FRED',asOf:new Date().toISOString(),publishedAt:period,period,value,license:'Board of Governors of the Federal Reserve System (US), via FRED'};validate(card);cards.push(card);
 }catch(e){health.push({source:'FRED',status:'unavailable',message:e.message});}
 if(!cards.length)throw new Error('No valid source content; preserving last successful snapshot');
 const output={generatedAt:new Date().toISOString(),sections:config.map(({pages,...s})=>s),cards,health};await mkdir('dist',{recursive:true});await writeFile('dist/content.json',JSON.stringify(output,null,2)+'\n');console.log(`Stored ${cards.length} source-matched cards; ${health.length} source failures.`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))await run();
