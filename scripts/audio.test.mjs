import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGardenAudio} from '../dist/garden-audio.js';
test('audio is opt-in, volume is bounded, and unsupported browsers receive a useful error',async()=>{
 const audio=createGardenAudio({});assert.equal(audio.enabled,false);audio.setVolume(10);assert.equal(audio.volume,.5);audio.setVolume(-5);assert.equal(audio.volume,0);await assert.rejects(audio.start(),/not supported/);assert.equal(audio.enabled,false);
});
test('garden audio can start, change volume, stop, restart, and release its context',async()=>{
 let created=0,closed=0,intervals=0,resumed=0;
 const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},exponentialRampToValueAtTime(){}});
 class Context{constructor(){created++;this.sampleRate=16;this.currentTime=0;this.destination={};}createGain(){return {gain:param(),connect(){}};}createBuffer(){return {getChannelData:()=>new Float32Array(64)};}createBufferSource(){return {connect(){},start(){}};}createBiquadFilter(){return {frequency:param(),connect(){}};}async resume(){resumed++;}async suspend(){}async close(){closed++;}}
 const audio=createGardenAudio({AudioContext:Context,setInterval(){intervals++;return 1;},clearInterval(){intervals--;}});
 assert.equal(created,0);await audio.start();assert.equal(created,1);assert.equal(audio.enabled,true);assert.equal(intervals,1);audio.setVolume(.12);assert.equal(audio.volume,.12);
 await audio.stop();assert.equal(audio.enabled,false);assert.equal(intervals,0);await audio.start();assert.equal(created,1);assert.equal(resumed,2);await audio.dispose();assert.equal(closed,1);assert.equal(intervals,0);
});
