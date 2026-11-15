import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(os.tmpdir(),'droplab-v3-test-'));
const port=32000+Math.floor(Math.random()*20000);
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),BASE_URL:base,DB_PATH:path.join(dir,'test.db'),ADMIN_USERNAME:'admin',ADMIN_PASSWORD:'Testing#StrongPassword2026'},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',d=>{logs+=d.toString()});child.stderr.on('data',d=>{logs+=d.toString()});
async function get(endpoint,cookie){const r=await fetch(base+endpoint,{headers:cookie?{cookie}:{}});return [r,await r.json()];}
async function post(endpoint,data={},cookie='',csrf=''){
 const r=await fetch(base+endpoint,{method:'POST',headers:{'content-type':'application/json',...(cookie?{cookie}:{}),...(csrf?{'x-csrf-token':csrf}:{})},body:JSON.stringify(data)});
 return [r,await r.json()];
}
async function ready(){for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error(logs);try{const r=await fetch(base+'/api/bootstrap');if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,75));}throw Error('Server did not start: '+logs);}
test('DROPLAB v5: wallet, nine openings, coin cases, multi-source upgrader, statistics and admin',{timeout:25000},async()=>{
 try{
  await ready();
  let [r,data]=await get('/api/bootstrap');assert.equal(r.status,200);assert.equal(data.cases.length,83);assert.equal(data.skins.length,288);
  assert.equal(data.cases.filter(x=>x.currency==='COIN').length,8);
  assert.ok(data.cases.filter(c=>c.currency==='CR').every(c=>c.returnPct<100));
  for(const c of data.cases.filter(c=>c.currency==='CR'&&c.price>=650)){assert.ok(c.minDrop>=Math.floor(c.price*.4),c.name+' floor too low');assert.ok(c.breakEvenPct>=0.1,c.name+' profit chance too low');}
  for(const c of data.cases.filter(c=>c.currency==='CR'&&c.price<=150))assert.ok(c.breakEvenPct<=40,c.name+' cheap case unexpectedly generous');
  [r]=await post('/api/auth/guest');assert.equal(r.status,200);const cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
  [r,data]=await get('/api/bootstrap',cookie);const csrf=data.csrf,user=data.user;assert.equal(user.balance,1500);assert.equal(user.coins,0);
  // Refill is free, but can only happen once per 12h when under 1500CR.
  let refill;[r,refill]=await post('/api/wallet/refill',{},cookie,csrf);assert.equal(r.status,200);assert.equal(refill.balance,2500);
  [r]=await post('/api/wallet/refill',{},cookie,csrf);assert.equal(r.status,400);
  // Atomic 9x opening; rewards and earned coins must all be committed.
  let batch;[r,batch]=await post('/api/cases/open',{caseId:'bronze',count:9},cookie,csrf);
  assert.equal(r.status,200);assert.equal(batch.items.length,9);assert.equal(batch.reels.length,9);for(let k=0;k<9;k++)assert.equal(batch.reels[k][batch.hitIndex],batch.items[k].id);assert.equal(batch.spent,261);assert.equal(batch.balance,2239);assert.equal(batch.coins,9);
  [r]=await post('/api/cases/open',{caseId:'bronze',count:10},cookie,csrf);assert.equal(r.status,400);
  [r]=await post('/api/cases/open',{caseId:'godmode',count:9},cookie,csrf);assert.equal(r.status,400);
  let profile;[r,profile]=await get('/api/profile',cookie);assert.equal(r.status,200);assert.equal(profile.inventory.length,9);
  assert.equal(profile.stats.totalItems,9);assert.equal(profile.stats.openings,9);assert.equal(profile.stats.favoriteCase,'bronze');
  assert.equal(profile.stats.favoriteOpens,9);assert.equal(profile.stats.totalWon,batch.items.reduce((sum,x)=>sum+x.price,0));
  // Multi-skin upgrading must debit all selected items and may add virtual CR.
  const ids=batch.items.slice(0,2).map(x=>x.inventoryId);
  const sourceTotal=batch.items.slice(0,2).reduce((sum,x)=>sum+x.price,0)+10;
  const target=data.skins.find(s=>s.price>sourceTotal);
  assert.ok(target);
  let upgraded;[r,upgraded]=await post('/api/upgrade/attempt',{inventoryIds:ids,targetSkinId:target.id,addBalance:10},cookie,csrf);
  assert.equal(r.status,200);assert.ok(upgraded.chance>0&&upgraded.chance<=75);assert.equal(upgraded.balance,2229);
  [r]=await post('/api/upgrade/attempt',{inventoryIds:ids,targetSkinId:target.id},cookie,csrf);assert.equal(r.status,404);
  [r,profile]=await get('/api/profile',cookie);assert.equal(profile.stats.upgrades,1);
  assert.equal(profile.stats.upgradeWins,upgraded.success?1:0);
  assert.equal(profile.inventory.length,7+(upgraded.success?1:0));
  [r]=await post('/api/inventory/sell-all',{},cookie,csrf);assert.equal(r.status,200);
  [r,profile]=await get('/api/profile',cookie);assert.equal(profile.inventory.length,0);
  // Bonus and CSRF protection.
  [r]=await post('/api/bonus/claim',{},cookie,'fake-token');assert.equal(r.status,403);
  [r]=await post('/api/bonus/claim',{},cookie,csrf);assert.equal(r.status,200);
  [r]=await post('/api/bonus/claim',{},cookie,csrf);assert.equal(r.status,400);
  [r]=await get('/api/admin/users',cookie);assert.equal(r.status,403);
  // Admin can issue either virtual currency with an audit trail.
  [r]=await post('/api/auth/admin',{username:'admin',password:'Testing#StrongPassword2026'});assert.equal(r.status,200);
  const adminCookie=r.headers.get('set-cookie').split(';')[0],adminCsrf=(await get('/api/bootstrap',adminCookie))[1].csrf;
  let adjusted;[r,adjusted]=await post('/api/admin/balance',{userId:user.id,amount:70,mode:'add',currency:'COIN'},adminCookie,adminCsrf);
  assert.equal(r.status,200);assert.equal(adjusted.currency,'COIN');
  const before=(await get('/api/bootstrap',cookie))[1].user;
  assert.equal(before.coins,9+(upgraded.success?upgraded.coinsEarned:0)+70);
  let coinOpened;[r,coinOpened]=await post('/api/cases/open',{caseId:'coin-spark',count:1},cookie,csrf);
  assert.equal(r.status,200);assert.equal(coinOpened.currency,'COIN');assert.equal(coinOpened.coins,before.coins-25);assert.equal(coinOpened.balance,before.balance);
  const newProfile=(await get('/api/profile',cookie))[1];assert.equal(newProfile.stats.openings,10);assert.equal(newProfile.stats.totalItems,9+(upgraded.success?1:0)+1);
  [r,adjusted]=await post('/api/admin/balance',{userId:user.id,amount:555,mode:'set',currency:'CR'},adminCookie,adminCsrf);
  assert.equal(r.status,200);assert.equal((await get('/api/bootstrap',cookie))[1].user.balance,555);
  assert.equal((await get('/api/admin/logs',adminCookie))[1].logs.length,2);
  // Maximum quantity is computed by the SERVER based on available funds.
  [r,batch]=await post('/api/cases/open',{caseId:'bronze',count:'max'},cookie,csrf);assert.equal(r.status,200);assert.equal(batch.count,9);
  assert.equal(batch.balance,555-9*29);
  const after9=(await get('/api/profile',cookie))[1];
  const contractSources=after9.inventory.slice(0,3);
  [r,data]=await post('/api/contracts/create',{inventoryIds:contractSources.map(x=>x.id)},cookie,csrf);assert.equal(r.status,200);assert.equal(data.sourceCount,3);
  const afterContract=(await get('/api/profile',cookie))[1];assert.equal(afterContract.stats.contracts,1);assert.equal(afterContract.stats.openings,19);
  [r]=await post('/api/contracts/create',{inventoryIds:contractSources.map(x=>x.id)},cookie,csrf);assert.equal(r.status,404);
 }finally{child.kill('SIGTERM');rmSync(dir,{recursive:true,force:true});}
});
