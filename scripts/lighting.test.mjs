import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gardenLighting,litColour} from '../dist/garden-lighting.js';
const at=hour=>new Date(2026,10,10,hour,0);
test('optional lighting follows the visitor local clock and is daylight when switched off',()=>{
 assert.equal(gardenLighting({enabled:false,date:at(23)}).phase,'day');
 assert.equal(gardenLighting({enabled:true,date:at(12)}).phase,'day');
 assert.equal(gardenLighting({enabled:true,date:at(19)}).phase,'dusk');
 assert.equal(gardenLighting({enabled:true,date:at(23)}).phase,'night');
 assert.equal(gardenLighting({enabled:true,date:at(3)}).phase,'night');
});
test('manual modes override local time and lamps remain bright while the world darkens',()=>{
 const night=gardenLighting({enabled:true,mode:'evening',date:at(12)});
 assert.equal(night.phase,'night');assert.equal(gardenLighting({enabled:true,mode:'day',date:at(23)}).phase,'day');
 assert.notEqual(litColour('#ffffff',night),'#ffffff');assert.equal(litColour('#f5cd78',night,true),'#ffe1a0');
 assert.ok(night.glow>gardenLighting().glow);
});
