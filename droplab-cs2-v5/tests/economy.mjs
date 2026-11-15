import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {CASES,chooseDrop,getCaseStats,getCaseOdds}=require('../catalog.js');
test('published odds sum to 100%, and every case has a value-balanced pool',()=>{
 for(const c of CASES){
  const odds=getCaseOdds(c);const stats=getCaseStats(c);
  assert.ok(odds.length>=3,`too few items for ${c.id}`);
  assert.ok(Math.abs(odds.reduce((s,r)=>s+r.probability,0)-100)<0.0000001,c.id);
  assert.ok(odds.every(s=>s.price>=stats.minDrop),c.id);
  if(c.currency==='CR'){
   assert.ok(stats.returnPct<100,`${c.id} expected value is profitable`);
   if(c.price>=650){assert.ok(stats.minDrop>=c.price*.4,`${c.id} premium floor`);assert.ok(stats.breakEvenPct>=0.1,`${c.id} profitable frequency`);}
   if(c.price<=150)assert.ok(stats.breakEvenPct<40,`${c.id} cheap profit odds`);
  }
 }
 const premium=CASES.find(c=>c.id==='gloves');
 for(let i=0;i<1000;i++)assert.ok(chooseDrop(premium).price>=premium.price*.4);
});
