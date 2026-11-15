import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root=process.cwd();
const tmp=mkdtempSync(path.join(os.tmpdir(),'droplab-v5-integr-'));
const port=33000+Math.floor(Math.random()*10000),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),BASE_URL:base,DB_PATH:path.join(tmp,'demo.sqlite'),ADMIN_USERNAME:'xtc',ADMIN_PASSWORD:'Skeleton',SESSION_SECRET:'very-long-testing-only-v5-secret-777777777777777'},stdio:['ignore','pipe','pipe']});
let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',b=>logs+=b.toString());
const cookies=r=>r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
async function request(uri,{method='GET',payload,cookie,csrf}={}){
 const r=await fetch(base+uri,{method,headers:{...(payload?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...(csrf?{'x-csrf-token':csrf}:{})},body:payload?JSON.stringify(payload):undefined});
 return {r,j:await r.json(),cookie:cookies(r)};
}
async function ready(){for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error(logs);try{if((await fetch(base+'/api/bootstrap')).ok)return;}catch{}await new Promise(r=>setTimeout(r,50));}throw Error(logs);}
test('V5: seeded admin, unique ID, guest IP lock/recovery, email auth, support, transparent luck, immediate cases',{timeout:30000},async()=>{
 try{
  await ready();
  let a=await request('/api/auth/admin',{method:'POST',payload:{username:'xtc',password:'Skeleton'}});
  assert.equal(a.r.status,200,JSON.stringify(a.j));
  const adminCookie=a.cookie,admin=(await request('/api/bootstrap',{cookie:adminCookie})).j;
  assert.equal(admin.user.role,'admin');assert.match(admin.user.publicId,/^DL-[0-9A-F]{10}$/);
  assert.equal((await request('/api/auth/admin',{method:'POST',payload:{username:'xtc',password:'wrong'}})).r.status,401);
  let guest=await request('/api/auth/guest',{method:'POST',payload:{}});
  assert.equal(guest.r.status,200,JSON.stringify(guest.j));
  const guestCookie=guest.cookie,guestBoot=(await request('/api/bootstrap',{cookie:guestCookie})).j;
  assert.equal(guestBoot.user.balance,1500);assert.match(guestBoot.user.publicId,/^DL-/);
  assert.equal((await request('/api/auth/guest',{method:'POST',payload:{}})).r.status,409);
  // Cookie may survive session logout, allowing secure guest recovery.
  const guestToken=guestCookie.split('; ').find(x=>x.startsWith('dl_guest='));
  const restored=await request('/api/auth/guest',{method:'POST',payload:{},cookie:guestToken});
  assert.equal(restored.r.status,200);assert.equal(restored.j.user.id,guestBoot.user.id);
  let lucky=await request('/api/admin/luck',{method:'POST',payload:{userId:guestBoot.user.publicId,caseLuck:120,upgradeLuck:110},cookie:adminCookie,csrf:admin.csrf});
  assert.equal(lucky.r.status,200,JSON.stringify(lucky.j));
  const quoted=await request('/api/cases/bronze',{cookie:guestCookie});assert.equal(quoted.j.playerLuck,120);
  const opened=await request('/api/cases/open',{method:'POST',payload:{caseId:'bronze',count:9},cookie:guestCookie,csrf:guestBoot.csrf});
  assert.equal(opened.r.status,200,JSON.stringify(opened.j));assert.equal(opened.j.items.length,9);
  const inventory=await request('/api/profile',{cookie:guestCookie});assert.equal(inventory.j.inventory.length,9);
  let acc=await request('/api/auth/register',{method:'POST',payload:{username:'Timothy_2026',email:'timothy2026@example.com',password:'strong-enough-password-123'}});
  assert.equal(acc.r.status,200,JSON.stringify(acc.j));
  const localCookie=acc.cookie,localBoot=(await request('/api/bootstrap',{cookie:localCookie})).j;
  assert.notEqual(localBoot.user.publicId,guestBoot.user.publicId);
  assert.equal((await request('/api/auth/register',{method:'POST',payload:{username:'Timothy_2026',email:'timothy2026@example.com',password:'strong-enough-password-123'}})).r.status,409);
  assert.equal((await request('/api/auth/login',{method:'POST',payload:{login:'Timothy_2026',password:'strong-enough-password-123'}})).r.status,200);
  const ticket=await request('/api/support/tickets',{method:'POST',payload:{subject:'Проверка начисления CR',message:'Прошу проверить тестовое открытие кейсов'},cookie:localCookie,csrf:localBoot.csrf});
  assert.equal(ticket.r.status,200,JSON.stringify(ticket.j));
  assert.equal((await request('/api/support/tickets',{cookie:guestCookie})).j.tickets.length,0);
  const all=await request('/api/support/tickets',{cookie:adminCookie});assert.equal(all.j.tickets.length,1);
  const response=await request(`/api/support/tickets/${ticket.j.id}/reply`,{method:'POST',payload:{message:'Баланс уже сохранён, спасибо'},cookie:adminCookie,csrf:admin.csrf});
  assert.equal(response.r.status,200,JSON.stringify(response.j));
  assert.equal((await request(`/api/support/tickets/${ticket.j.id}`,{cookie:localCookie})).j.messages.length,2);
  assert.equal((await request(`/api/support/tickets/${ticket.j.id}`,{cookie:guestCookie})).r.status,404);
  assert.equal((await request('/api/admin/balance',{method:'POST',payload:{userId:localBoot.user.publicId,amount:123,mode:'add',currency:'CR'},cookie:adminCookie,csrf:admin.csrf})).r.status,200);
  assert.equal((await request('/api/bootstrap',{cookie:localCookie})).j.user.balance,1623);
  assert.equal((await request('/api/cases/thanksgiving26')).j.active,true);
  assert.equal((await request('/api/cases/winter26')).j.active,true);
  assert.ok((await request('/api/bootstrap')).j.skins.some(x=>x.id==='ak-bluegem-661'));
 }finally{child.kill('SIGTERM');rmSync(tmp,{recursive:true,force:true});}
});
