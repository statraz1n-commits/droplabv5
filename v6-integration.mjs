import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(os.tmpdir(),'droplab-v6-'));
const port=35000+Math.floor(Math.random()*20000),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['server.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),BASE_URL:base,DB_PATH:path.join(dir,'db.sqlite'),ADMIN_USERNAME:'xtc',ADMIN_PASSWORD:'TestAdministrator#V6Protected',SESSION_SECRET:'v6-test-012345678901234567890123456789abcdef'},stdio:['ignore','pipe','pipe']});
let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',x=>logs+=x.toString());
const cookie=r=>r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
async function req(uri,{method='GET',payload,auth='',csrf=''}={}){
 const r=await fetch(base+uri,{method,headers:{...(payload?{'content-type':'application/json'}:{}),...(auth?{'cookie':auth}:{}),...(csrf?{'x-csrf-token':csrf}:{})},body:payload?JSON.stringify(payload):undefined});
 return {status:r.status,j:await r.json(),cookie:cookie(r)};
}
async function boot(){for(let i=0;i<80;i++){try{const x=await req('/api/bootstrap');if(x.status===200)return x.j;}catch{}await new Promise(r=>setTimeout(r,75));}throw new Error(logs);}
test('V6: 32 time-limited cases, real feed, profiles, moderated user, admin inventory, support close, visible odds overrides',{timeout:30000},async()=>{
 try{
  const first=await boot();
  assert.equal(first.cases.length,120);assert.equal(first.skins.length,304);
  const event=first.cases.filter(c=>c.eventLimited);assert.equal(event.length,32);
  assert.ok(event.every(c=>c.limitedUntil>Date.now()&&c.limitedUntil<Date.now()+7*86400000+60000));
  assert.equal(first.recent.length,0);
  assert.equal(first.cases.find(c=>c.id==='sabya-12').coverImage,'/assets/covers/sabya-12.webp');
  assert.equal(first.cases.find(c=>c.id==='mukha-case').coverImage,'/assets/covers/mukha-case.webp');
  const admin=await req('/api/auth/admin',{method:'POST',payload:{username:'xtc',password:'TestAdministrator#V6Protected'}});
  assert.equal(admin.status,200,JSON.stringify(admin.j));const adminCookie=admin.cookie;
  const admBoot=(await req('/api/bootstrap',{auth:adminCookie})).j;
  const reg=await req('/api/auth/register',{method:'POST',payload:{username:'v6_player',email:'v6_player@example.com',password:'VeryStrongUserPassword#2026'}});
  assert.equal(reg.status,200,JSON.stringify(reg.j));const userCookie=reg.cookie;
  const userBoot=(await req('/api/bootstrap',{auth:userCookie})).j;
  const userId=userBoot.user.publicId;assert.match(userId,/^DL-[0-9A-F]{10}$/);
  assert.equal((await req('/api/users/'+userId)).j.user.name,'v6_player');
  assert.ok(!(JSON.stringify((await req('/api/users/'+userId)).j).includes('v6_player@example.com')));
  assert.equal((await req('/api/players/search?q=v6_player')).j.players[0].publicId,userId);
  const high=await req('/api/admin/game-mode',{method:'POST',payload:{userId,caseMode:'highest',upgradeOverride:100},auth:adminCookie,csrf:admBoot.csrf});
  assert.equal(high.status,200,JSON.stringify(high.j));
  const details=await req('/api/cases/eco',{auth:userCookie});
  assert.equal(details.j.items.length,1);assert.equal(details.j.items[0].probability,100);
  const dropped=await req('/api/cases/open',{method:'POST',payload:{caseId:'eco',count:1},auth:userCookie,csrf:userBoot.csrf});
  assert.equal(dropped.status,200,JSON.stringify(dropped.j));assert.equal(dropped.j.item.id,details.j.items[0].id);
  const feed=(await req('/api/feed')).j.recent;
  assert.equal(feed.length,1);assert.equal(feed[0].player_id,userId);assert.equal(feed[0].display_name,'v6_player');
  const leaderboard=(await req('/api/leaderboard')).j.players;assert.ok(leaderboard.some(p=>p.id===userId));
  const publicInfo=(await req('/api/users/'+userId)).j;assert.equal(publicInfo.inventory.length,1);
  const inventory=await req('/api/admin/users/'+encodeURIComponent(userId)+'/inventory',{auth:adminCookie});
  assert.equal(inventory.status,200);assert.equal(inventory.j.profile.inventory.length,1);
  const removed=await req('/api/admin/inventory/remove',{method:'POST',payload:{userId,inventoryId:dropped.j.item.inventoryId},auth:adminCookie,csrf:admBoot.csrf});
  assert.equal(removed.status,200,JSON.stringify(removed.j));assert.equal((await req('/api/profile',{auth:userCookie})).j.inventory.length,0);
  const ticket=await req('/api/support/tickets',{method:'POST',payload:{subject:'Жалоба после удаления скина',message:'У меня исчез предмет после действия администратора.'},auth:userCookie,csrf:userBoot.csrf});
  assert.equal(ticket.status,200,JSON.stringify(ticket.j));
  const tickets=(await req('/api/support/tickets',{auth:adminCookie})).j.tickets;
  assert.equal(tickets[0].id,ticket.j.id);assert.equal(tickets[0].public_id,userId);
  const close=await req('/api/admin/support/status',{method:'POST',payload:{ticketId:ticket.j.id,status:'closed'},auth:adminCookie,csrf:admBoot.csrf});
  assert.equal(close.status,200);
  for(const auth of [{auth:adminCookie,csrf:admBoot.csrf},{auth:userCookie,csrf:userBoot.csrf}]){
   const late=await req(`/api/support/tickets/${ticket.j.id}/reply`,{method:'POST',payload:{message:'Нельзя отправить'},...auth});assert.equal(late.status,403);
  }
  assert.equal((await req('/api/admin/support/status',{method:'POST',payload:{ticketId:ticket.j.id,status:'open'},auth:adminCookie,csrf:admBoot.csrf})).status,409);
  const ban=await req('/api/admin/moderate',{method:'POST',payload:{userId,action:'ban',minutes:0,reason:'Проверка блокировки'},auth:adminCookie,csrf:admBoot.csrf});
  assert.equal(ban.status,200);assert.equal(ban.j.user.banUntil,-1);
  assert.equal((await req('/api/cases/open',{method:'POST',payload:{caseId:'eco',count:1},auth:userCookie,csrf:userBoot.csrf})).status,403);
  assert.equal((await req('/api/support/tickets',{auth:userCookie})).status,200);
  assert.equal((await req('/api/admin/moderate',{method:'POST',payload:{userId,action:'unban'},auth:adminCookie,csrf:admBoot.csrf})).status,200);
  assert.equal((await req('/api/admin/moderate',{method:'POST',payload:{userId,action:'timeout',minutes:15},auth:adminCookie,csrf:admBoot.csrf})).status,200);
  assert.equal((await req('/api/cases/open',{method:'POST',payload:{caseId:'eco',count:1},auth:userCookie,csrf:userBoot.csrf})).status,403);
  assert.equal((await req('/api/admin/moderate',{method:'POST',payload:{userId,action:'untimeout'},auth:adminCookie,csrf:admBoot.csrf})).status,200);
  const normal=await req('/api/admin/game-mode',{method:'POST',payload:{userId,caseMode:'normal',upgradeOverride:-1},auth:adminCookie,csrf:admBoot.csrf});assert.equal(normal.status,200);
  assert.ok((await req('/api/admin/moderation-logs',{auth:adminCookie})).j.logs.length>=5);
 }finally{child.kill('SIGTERM');rmSync(dir,{recursive:true,force:true});}
});
