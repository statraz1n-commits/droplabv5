(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const state={data:null,user:null,csrf:null,view:'home',caseId:null,profile:null,leaderboard:[],adminUsers:[],adminLogs:[],filter:'all',sort:'new',busy:false,latestDrop:null,feed:[],upgradeSource:null,upgradeTarget:null,upgradeMotion:'normal',upgradeRange:'all',upgradeSearch:'',upgradeSources:[],upgradeCredit:0,upgradeMin:'',upgradeMax:'',openQuantity:1,sound:true,lastSpin:null,contractIds:[],upgradeFast:false,caseSpinning:false,supportTicket:null,supportTickets:[]};
const fmt=n=>Number(n||0).toLocaleString('ru-RU');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>typeof s==='string'&&(/^https:\/\//i.test(s)||/^\/assets\/covers\/[a-z0-9-]+\.webp$/.test(s))?esc(s):'';
const skin=id=>state.data?.skins?.find(s=>s.id===id);
const rarity=id=>state.data?.rarities?.[id]||{color:'#90a6b6',name:'Предмет'};
const imageTag=(src,classname='item-image',fallback='weapon',alt='Скин CS2')=>`<img class="${classname}" src="${url(src)||'/assets/'+(fallback==='knife'?'knife':'weapon')+'.svg'}" alt="${esc(alt)}" loading="lazy"/>`;
const fallbackFor=s=>/knife|karambit|bayonet/i.test(s?.id||s?.name||'')?'knife':'weapon';
const skinArt=(s,cls)=>imageTag(s?.image,cls,fallbackFor(s),s?.name||'Скин CS2');
const getCase=id=>state.data?.cases?.find(c=>c.id===id);
const units=c=>c?.currency==='COIN'?'✦':'CR';
const balanceFor=c=>c?.currency==='COIN'?state.user?.coins||0:state.user?.balance||0;
const maxOpening=c=>Math.min(9,Math.floor(balanceFor(c)/c.price));
let audioCtx=null;
function unlockAudio(){if(!state.sound)return;try{audioCtx ||=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch{}}
function soundTone(freq=500,duration=.04,type='sine',volume=.025){
 if(!state.sound)return;
 try{audioCtx ||=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.75),t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.005);}catch{}
}
function soundFinish(win=true){if(!state.sound)return;[0,110,210].forEach((ms,i)=>setTimeout(()=>soundTone((win?523:320)*(i?Math.pow(1.26,i):1),.16,'triangle',.045),ms));}
function soundTicks(duration,step=100){const begun=performance.now();let last=-1;function frame(t){if(!state.busy&&!state.caseSpinning)return;const elapsed=t-begun;if(elapsed>duration)return;const progress=elapsed/duration;const speed=Math.sin(progress*Math.PI)**.7;const gap=205-speed*145;if(t-last>gap){soundTone(340+speed*190,.018,'square',.008);last=t;}requestAnimationFrame(frame);}requestAnimationFrame(frame);}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
// Animate only the compositor-friendly transform property. One continuous
// velocity curve prevents the backwards jumps caused by multi-keyframe spins.
const EASE_NORMAL='cubic-bezier(.64,.025,.18,1)';
const EASE_LONG='cubic-bezier(.5,.04,.1,1)';
async function tweenTransform(el,transform,duration,easing){
 if(!el)return;
 if(el.animate){
  const animation=el.animate([{transform:el.style.transform||'none'},{transform}],{duration,easing,fill:'forwards'});
  try{await animation.finished;}catch{}
  el.style.transform=transform;
  animation.cancel();
 }else{
  el.style.transition=`transform ${duration}ms ${easing}`;
  el.style.transform=el.style.transform||'none';
  void el.offsetWidth;
  el.style.transform=transform;
  await sleep(duration);
 }
}
function reelLine(ids,small=false){
 return ids.map((id,i)=>{
  const s=skin(id);
  // Rendering hundreds of full-size images at once can stall the GPU on mobile.
  // Show a real skin image every third item plus the final eight;
  // keep the other cards lightweight to avoid a nine-roulette GPU stall.
  if(small&&i<ids.length-8&&i%3!==0)return `<div class="mini-reel-card muted-reel" style="--tier:${esc(rarity(s?.rarity).color)}"><span>◈</span></div>`;
  return `<div class="${small?'mini-reel-card':'reel-card'}" style="--tier:${esc(rarity(s?.rarity).color)}">${skinArt(s)}<span title="${esc(s?.name||'')}">${esc(s?.name||'Скин')}</span></div>`;
 }).join('');
}
async function rollTrack(track,shell,index,duration,mini=false,delay=0){
 if(delay)await sleep(delay);
 if(!track||!shell)return;
 const sample=track.firstElementChild;
 const gap=Number.parseFloat(getComputedStyle(track).columnGap)||0;
 const step=(sample?.getBoundingClientRect().width||(mini?114:154))+gap;
 const cardW=sample?.getBoundingClientRect().width||(mini?114:154);
 const jitter=(Math.random()-.5)*(mini?12:20);
 const destination=-(index*step+cardW/2-shell.getBoundingClientRect().width/2)+jitter;
 await tweenTransform(track,`translate3d(${destination}px,0,0)`,duration,EASE_NORMAL);
}

const caseCover=c=>c.coverImage?imageTag(c.coverImage,'case-art case-crate-art','weapon',c.name):skinArt(skin('ak-neon'),'case-art');
async function api(path,method='GET',body=null){
 const opts={method,credentials:'same-origin',headers:{}};
 if(method!=='GET'){opts.headers['Content-Type']='application/json';if(state.csrf)opts.headers['x-csrf-token']=state.csrf;opts.body=JSON.stringify(body||{});}
 let r;try{r=await fetch(path,opts);}catch{throw new Error('Нет соединения с сервером');}
 let j;try{j=await r.json();}catch{throw new Error('Сервер вернул неверный ответ');}
 if(!r.ok)throw new Error(j.error||`Ошибка ${r.status}`);
 return j;
}
function toast(message,error=false){
 const root=$('#toast-root'),node=document.createElement('div');node.className='toast'+(error?' error':'');node.textContent=message;root.appendChild(node);setTimeout(()=>node.remove(),4400);
}
function renderAccount(){
 const user=state.user;
 $('#wallet-value').textContent=fmt(user?.balance||0);const coin=$('#coin-value');if(coin)coin.textContent=fmt(user?.coins||0);
 $('#header-username').textContent=user?.name||'Войти';
 const sound=$('#global-sound');if(sound){sound.textContent=state.sound?'♪ Звук':'♪ Выкл';sound.setAttribute('aria-label',state.sound?'Выключить звуки':'Включить звуки');}
 $('#header-avatar').innerHTML=user?.avatar?`<img src="${url(user.avatar)}" alt="">`:esc((user?.name||'?')[0]?.toUpperCase());
 if(user){
  $('#side-account').innerHTML=`<div class="side-account-card"><span class="user-avatar">${user.avatar?`<img src="${url(user.avatar)}" alt="">`:esc(user.name[0])}</span><div class="side-account-info"><b title="${esc(user.name)}">${esc(user.name)}</b><small>${user.role==='admin'?'АДМИНИСТРАТОР':user.steamId?'STEAM ПОДКЛЮЧЁН':user.id?.startsWith('local:')?'ПОЧТА / ПАРОЛЬ':'ГОСТЕВОЙ АККАУНТ'}</small></div></div>`;
 }else $('#side-account').innerHTML='<div class="account-placeholder">Войди, чтобы сохранять<br>свои дропы и баланс</div>';
 $('#admin-nav').classList.toggle('hidden',user?.role!=='admin');
 const count=$('#case-count');if(count&&state.data)count.textContent=state.data.cases.length;
 const ready=!user||Date.now()-(user.lastBonus||0)>86400000;
 $('#bonus-box .bonus-btn').textContent=ready?'Забрать +200 CR ↗':'Бонус получен ✓';
 $('#bonus-box .bonus-btn').disabled=!!user&&!ready;
}
function demoFeed(){
 const names=['★ghost.67','blackmamba','s1mply_luck','donk.exe','aimlock','M1racle','peeka','vortex_gg','flickshot','not_a_bot','k1ng','smoke.mid','NAVI_fan','crybaby','frost','eco_master'];
 const choices=state.data?.skins||[];
 const picked=['karambit-doppler','awp-asiimov','ak-neon','ak-slate','deag-print','glock-neo','m4a-print','m4-neo','ak-redline','butterfly-fade','awp-dragon','usp-kill','m4a-lotus','ak-empress','sport-vice'];
 return Array.from({length:25},(_,i)=>{
  const id=picked[(i*7+5)%picked.length],s=skin(id)||choices[(i*9)%choices.length];
  return {name:names[(i*5+3)%names.length],skinName:s?.name||'AK-47 | Redline',skinId:s?.id,rarity:s?.rarity||'blue',image:s?.image||'',demo:true};
 });
}
function tickerPill(d){
 const color=rarity(d.rarity).color;
 return `<div class="drop-pill" style="--tier:${color}">${imageTag(d.image||skin(d.skinId)?.image,'','weapon',d.skinName)}<span class="drop-pill-info"><b>${esc(d.skinName)}</b><small>${esc(d.name||d.display_name)} ${d.demo?'· бот':'· игрок'}</small></span></div>`;
}
function renderFeed(){
 const real=(state.data?.recent||[]).slice(0,15).map(d=>({...d,name:d.display_name,demo:false}));
 const demo=demoFeed();
 const mixed=demo.slice();for(let i=0;i<Math.min(real.length,10);i++)mixed.splice(i*3,0,real[i]);
 const html=mixed.map(tickerPill).join('');
 $('#ticker-track').innerHTML=html+html;
}
function sectionHeading(title,subtitle='',link=null){return `<div class="section-heading"><div class="section-title-wrap"><span class="heading-stroke"></span><div><h2 class="section-title">${esc(title)}</h2>${subtitle?`<div class="section-caption">${esc(subtitle)}</div>`:''}</div></div>${link?`<button class="heading-link" data-action="navigate" data-view="${esc(link[1])}">${esc(link[0])} <span>→</span></button>`:''}</div>`;}
function caseCard(c,i){
 return `<button class="case-card" data-action="open-case-page" data-case="${esc(c.id)}" style="--glow:${esc(c.theme)}"><div class="case-card-top"><span class="case-overline">DROP #${String(i+1).padStart(3,'0')}</span>${c.tag?`<span class="case-tag">${esc(c.tag)}</span>`:''}${c.limitedUntil?`<span class="case-limited">${Date.now()<c.limitedUntil?'⏳ '+new Date(c.limitedUntil).toLocaleDateString('ru-RU'):'ЗАВЕРШЁН'}</span>`:''}</div><div class="case-visual"><span class="case-glyph">${esc(c.glyph)}</span>${caseCover(c)}${state.profile?.stats?.favoriteCase===c.id?'<span class="case-fave">★ ТВОЙ ФАВОРИТ</span>':''}</div><div class="case-bottom"><div class="case-name">${esc(c.name)}</div><div class="case-subtitle">${esc(c.subtitle)}</div><div class="case-footer"><span class="case-cost">${fmt(c.price)} <small>${units(c)}</small></span><span class="case-open">↗</span></div></div></button>`;
}
function hero(){const art=getCase('dragon')||getCase('knife');return `<section class="hero"><div class="hero-copy"><div class="eyebrow">СКИНЫ. КЕЙСЫ. АДРЕНАЛИН.</div><h1>ТВОЙ ДРОП.<br><em>ТВОИ ПРАВИЛА.</em></h1><p>Открывай культовые кейсы, выбивай легендарные скины CS2 и собирай свою коллекцию. Без вложений, но с настоящими шансами симулятора. Дорогие дропы редки.</p><div class="hero-actions"><button class="btn btn-primary" data-action="navigate" data-view="cases">◈ &nbsp; КРУТИТЬ КЕЙСЫ <span>↗</span></button><button class="btn btn-ghost" data-action="navigate" data-view="faq">Как это работает <span>→</span></button></div></div><div class="hero-art"><div class="hero-orbit"></div><span class="hero-spark hero-spark-a">✦</span><span class="hero-spark hero-spark-b">✧</span>${caseCover(art).replace('case-art case-crate-art','hero-weapon hero-case-cover')}<span class="hero-index">001 / DROPLAB</span><span class="hero-label">★ RARE DROP ZONE</span></div></section>`;}
function stats(){const d=state.data;return `<div class="stats-strip"><div class="stat"><span class="stat-icon">◈</span><div><div class="stat-num">${fmt(d.cases.length)}</div><div class="stat-label">Авторских кейсов</div></div></div><div class="stat"><span class="stat-icon">✧</span><div><div class="stat-num">${fmt(d.skins.length)}</div><div class="stat-label">Скинов CS2 в пуле</div></div></div><div class="stat"><span class="stat-icon">↗</span><div><div class="stat-num">${fmt(d.totals?.opens||0)}</div><div class="stat-label">Реальных открытий на сайте</div></div></div><div class="stat"><span class="stat-icon">◎</span><div><div class="stat-num">100%</div><div class="stat-label">Бесплатная симуляция</div></div></div></div>`;}
function renderHome(){const cases=state.data.cases.filter(c=>c.currency!=='COIN');return `${hero()}${sectionHeading('Горячие кейсы','Авторские кейсы с редкими выпадениями',['ПОКАЗАТЬ ВСЕ','cases'])}<div class="cases-grid">${[cases[0],cases[1],cases[12],cases[13],cases[14],cases[15],cases[16],cases[2],cases[4],cases[6]].filter(Boolean).map((c,i)=>caseCard(c,i)).join('')}</div><div class="promo-row"><div class="promo"><div class="promo-text"><span class="promo-kicker">FREE TO PLAY</span><div class="promo-title">+200 CR КАЖДЫЙ ДЕНЬ</div><div class="promo-desc">Никаких депозитов. Заходи, получай, крути.</div></div><span class="promo-symbol">✦</span><button class="btn btn-primary" data-action="bonus">ЗАБРАТЬ ↗</button></div><div class="promo"><div class="promo-text"><span class="promo-kicker">YOUR LOADOUT</span><div class="promo-title">ТВОЯ КОЛЛЕКЦИЯ</div><div class="promo-desc">Сохраняй выпавшее или продавай за CR.</div></div><span class="promo-symbol">◈</span><button class="btn btn-ghost" data-action="navigate" data-view="inventory">ИНВЕНТАРЬ ↗</button></div></div>${sectionHeading('ЕЩЁ БОЛЬШЕ КЕЙСОВ','Любимые мемы и неоновые коллекции',['СМОТРЕТЬ ВСЕ','cases'])}<div class="cases-grid">${cases.slice(35,45).map((c,i)=>caseCard(c,i+35)).join('')}</div>${stats()}`;}
function renderCases(){return `<div class="page-header"><div class="eyebrow">COLLECTION / V5.0</div><h1>КОЛЛЕКЦИЯ <em>КЕЙСОВ</em></h1><p>Авторские, мемные, стримерские и особые кейсы за монеты. Каждый дроп виртуальный, а шансы доступны для просмотра.</p></div><div class="section-category-tabs" id="case-filter"><button class="filter-tab active" data-action="filter-cases" data-filter="all">Все <span>(${state.data.cases.length})</span></button><button class="filter-tab" data-action="filter-cases" data-filter="budget">До 200 CR</button><button class="filter-tab" data-action="filter-cases" data-filter="premium">Премиум</button><button class="filter-tab" data-action="filter-cases" data-filter="meme">Мемы / фанаты</button><button class="filter-tab" data-action="filter-cases" data-filter="coins">✦ За монеты</button></div><div class="cases-grid" id="case-list">${state.data.cases.map(caseCard).join('')}</div>`;}
function applyCaseFilter(filter){
 const cases=state.data.cases;
 const result=cases.filter(c=>filter==='all'||filter==='coins'&&c.currency==='COIN'||c.currency!=='COIN'&&(filter==='budget'&&c.price<=200||filter==='premium'&&c.price>=690||filter==='meme'&&(['67','chatgpt','godmode','matrix','hacker','chucky','lacra','ksante'].includes(c.id)||['MEME','FAN','STREAM'].includes(c.tag))));
 $('#case-list').innerHTML=result.map(caseCard).join('');
 $$('#case-filter .filter-tab').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
}
function renderCoins(){const cs=state.data.cases.filter(c=>c.currency==='COIN');return `<div class="coin-hero"><span class="coin-hero-icon">✦</span><div><div class="eyebrow">TOKENS / REWARD SHOP</div><h1>КЕЙСЫ <em>ЗА МОНЕТЫ</em></h1><p>Зарабатывай ✦ за открытия обычных кейсов и удачные апгрейды. Монеты нельзя купить за деньги — они существуют только внутри симулятора.</p><div class="coin-balance-large">${fmt(state.user?.coins||0)} <small>✦ У ТЕБЯ</small></div></div></div>${sectionHeading('МОНЕТНЫЕ КЕЙСЫ','8 специальных кейсов, покупаются только за заработанные ✦')}<div class="cases-grid">${cs.map(caseCard).join('')}</div><div class="coin-note">✧ Скины, полученные из кейсов за монеты, можно продать за CR или использовать в апгрейдере.</div>`;}

function lootCard(s){return `<div class="loot-item" style="--tier:${esc(rarity(s.rarity).color)}"><div class="loot-item-img">${skinArt(s)}</div><div class="loot-name" title="${esc(s.name)}">${esc(s.name)}</div><div class="loot-rarity">${esc(rarity(s.rarity).name)}</div><div class="loot-bottom"><span class="loot-price">${fmt(s.price)} CR</span><span class="loot-chance">${(s.probability<.001?s.probability.toFixed(5):s.probability<.01?s.probability.toFixed(3):s.probability.toFixed(2))}%</span></div></div>`;}
async function renderCaseDetail(id){
 const c=getCase(id);if(!c){navigate('cases');return;}
 $('#view').innerHTML='<div class="loading-wrap"><span class="load-spinner"></span><p>Загружаем предметы...</p></div>';
 let details;try{details=await api('/api/cases/'+encodeURIComponent(id));}catch(e){toast(e.message,true);navigate('cases');return;}
 if(state.view!=='case'||state.caseId!==id)return;
 const pic=caseCover(c).replace('case-art case-crate-art','stage-art');
 const allowed=maxOpening(c);if(state.openQuantity!=='max'&&Number(state.openQuantity)>allowed&&allowed>0)state.openQuantity=allowed;
 const count=state.openQuantity==='max'?Math.max(1,allowed):Math.min(Number(state.openQuantity)||1,9);
 const total=count*c.price;
 $('#view').innerHTML=`<div class="case-detail-top"><button class="back-btn" data-action="navigate" data-view="cases">← НАЗАД К КЕЙСАМ</button><span class="case-overline">CASE / ${esc(c.id.toUpperCase())}</span></div><div class="case-stage" style="--accent:${esc(c.theme)}"><div class="eyebrow">MULTI CASE OPENING</div><h1>${esc(c.name)}</h1><div class="case-stage-sub">${esc(c.subtitle)} · ${details.items.length} ПРЕДМЕТОВ</div><div id="opening-zone">${pic}</div><div class="stage-cost">${fmt(c.price)} <small>${units(c)} ЗА КЕЙС</small></div><div class="multi-title">СКОЛЬКО КЕЙСОВ ОТКРЫТЬ?</div><div class="quantity-choices" id="quantity-choices">${[1,2,3,5,7,9,'max'].map(n=>`<button class="qty-btn ${String(state.openQuantity)===String(n)?'active':''}" data-action="set-quantity" data-qty="${n}" ${n!=='max'&&Number(n)>maxOpening(c)?'disabled':''}>${n==='max'?'МАКС':`×${n}`}</button>`).join('')}</div><div class="stage-actions" id="stage-actions"><button class="btn btn-primary" data-action="spin" data-case="${esc(c.id)}" id="open-case-btn" ${maxOpening(c)<1||!details.active?'disabled':''}>◈ ОТКРЫТЬ ×${count} · ${fmt(total)} ${units(c)} ↗</button><button class="btn btn-ghost" data-action="navigate" data-view="inventory">МОИ СКИНЫ</button></div><div class="stage-note">Минимальная цена дропа: <b>${fmt(details.minDrop)} CR</b> · Средний дроп: <b>${fmt(details.expectedReturn)} CR</b> ${details.breakEvenPct===null?'':`· Окупиться или выйти в плюс: <b>${details.breakEvenPct.toFixed(1)}%</b>`} · Личный коэффициент шансов: <b>${details.playerLuck}%</b> · Шансы указаны ниже и не зависят от анимации</div></div>${sectionHeading('СОДЕРЖИМОЕ КЕЙСА','Все вероятности и игровые цены указаны в карточках')}<div class="loot-grid">${details.items.slice().sort((a,b)=>b.price-a.price).map(lootCard).join('')}</div>`;
}

function reelItem(s){return `<div class="reel-card" style="--tier:${esc(rarity(s?.rarity).color)}">${skinArt(s)}<span title="${esc(s?.name||'')}">${esc(s?.name||'Скин')}</span></div>`;}
async function spinCase(id){
 if(state.busy||state.caseSpinning)return;
 if(!state.user){loginModal();return;}
 const c=getCase(id);if(!c)return;unlockAudio();
 const count=state.openQuantity==='max'?'max':Number(state.openQuantity)||1;
 const proposed=count==='max'?maxOpening(c):count;
 if(proposed<1||balanceFor(c)<proposed*c.price){toast('Недостаточно '+units(c)+'. Забери бонус, пополни CR бесплатно или продай предметы.',true);return;}
 state.busy=true;
 const btn=$('#open-case-btn');if(btn)btn.disabled=true;
 let result;
 try{result=await api('/api/cases/open','POST',{caseId:id,count});}
 catch(e){state.busy=false;if(btn)btn.disabled=false;toast(e.message,true);return;}
 state.user.balance=result.balance;state.user.coins=result.coins;renderAccount();
 state.busy=false;state.caseSpinning=true;
 toast(result.items.length+' шт. уже сохранены в инвентаре — можешь переходить по сайту.');
 const zone=$('#opening-zone'); if(!zone){state.caseSpinning=false;showResult(result);return;}
 const duration=6300;
 if(result.items.length>1){
  const items=result.items;
  zone.innerHTML=`<div class="multi-reels" id="multi-reels">${items.map((item,i)=>`<div class="mini-reel-unit" style="--tier:${esc(rarity(item.rarity).color)}"><div class="mini-reel-heading"><b>КЕЙС #${i+1}</b><span class="mini-reel-status">КРУТИТСЯ</span></div><div class="mini-reel-shell" id="mini-shell-${i}"><div class="mini-reel-marker"></div><div class="mini-reel-track" id="mini-track-${i}">${reelLine(result.reels?.[i]||result.reel,true)}</div></div><div class="mini-reel-prize">${skinArt(item)}<div><b>${esc(item.name)}</b><span>${fmt(item.price)} CR</span></div></div></div>`).join('')}</div><p class="spin-status active">ОТКРЫТИЕ ${items.length} КЕЙСОВ · КАЖДАЯ РУЛЕТКА КРУТИТСЯ ОТДЕЛЬНО</p>`;
  soundTicks(duration+items.length*115);
  await Promise.all(items.map(async(_,i)=>{
   const track=$('#mini-track-'+i),shell=$('#mini-shell-'+i);
   await rollTrack(track,shell,result.hitIndex,duration+i*65,true,i*85);
   const unit=shell?.closest('.mini-reel-unit');unit?.classList.add('finished');
   soundTone(440+i*38,.08,'sine',.016);
  }));
  soundFinish(true);
 }else{
  zone.innerHTML=`<div class="reel-shell" id="reel-shell"><span class="reel-pointer"></span><div class="reel-track" id="reel-track">${reelLine(result.reel)}</div></div><div class="spin-status active">✦ &nbsp; РУЛЕТКА ВРАЩАЕТСЯ...</div>`;
  soundTicks(duration);
  await rollTrack($('#reel-track'),$('#reel-shell'),result.hitIndex,duration);
  soundFinish(true);
 }

 state.caseSpinning=false;state.latestDrop=result.item;if(btn)btn.disabled=false;
 if(result.coinsEarned)toast('За открытия начислено +'+result.coinsEarned+' ✦');
 if(zone.isConnected&&state.view==='case'&&state.caseId===id)showResult(result);else toast('Открытие завершено · все скины в инвентаре');
 try{const response=await api('/api/feed');state.data.recent=response.recent;renderFeed();}catch{}
}

function modal(html,extra=''){$('#modal-root').innerHTML=`<div class="modal-overlay" data-action="modal-overlay"><div class="modal ${extra}" role="dialog" aria-modal="true">${html}</div></div>`;document.body.style.overflow='hidden';}
function closeModal(){if(state.busy)return;$('#modal-root').innerHTML='';document.body.style.overflow='';}
function hideAccountPopover(){$('#account-popover')?.remove();}
function toggleAccountPopover(){const present=$('#account-popover');if(present){present.remove();return;}
 if(!state.user){loginModal();return;}
 const p=document.createElement('div');p.id='account-popover';p.className='account-popover';p.innerHTML=`<div class="account-popover-head"><span class="user-avatar">${esc((state.user.name||'D')[0])}</span><div><b>${esc(state.user.name)}</b><small>ID: ${esc(state.user.publicId||state.user.id)}</small></div></div><div class="account-popover-money">${fmt(state.user.balance)} CR <span>✦ ${fmt(state.user.coins)}</span></div><div class="account-popover-luck">Кейсы ${state.user.caseLuck}% · Апгрейд ${state.user.upgradeLuck}%</div><button data-action="navigate" data-view="inventory">▤ Мой профиль и промокоды</button><button data-action="navigate" data-view="support">✉ Поддержка</button>${state.user.role==='admin'?'<button data-action="navigate" data-view="admin">⚙ Админ-панель</button>':''}<button data-action="logout">↪ Выйти</button>`;
 document.body.appendChild(p);
}
function loginModal(admin=false){
 if(admin){modal(`<button class="modal-close" data-action="close-modal" aria-label="Закрыть">×</button><div class="modal-eyebrow">SECURE AREA / ACCESS</div><h2>АДМИН-ПАНЕЛЬ</h2><p>Администратор управляет балансом, поддержкой и открытыми коэффициентами шансов. При публичном запуске сразу смени стартовый пароль в настройках сервера.</p><form id="admin-login" class="login-fields"><div class="field"><label>Логин</label><input class="input" name="username" autocomplete="username" required /></div><div class="field"><label>Пароль</label><input class="input" name="password" type="password" autocomplete="current-password" required /></div><button class="btn btn-primary" type="submit">ВОЙТИ КАК АДМИН ↗</button></form><button class="text-link" data-action="show-login">Назад к обычному входу</button>`);return;}
 modal(`<button class="modal-close" data-action="close-modal" aria-label="Закрыть">×</button><div class="modal-eyebrow">WELCOME TO DROPLAB</div><h2>ЗАЛЕТАЙ В ИГРУ.</h2><p>Войди через официальный Steam или попробуй симулятор гостем. Стартовый баланс — <b style="color:#f7c2ff">1 500 CR</b>.</p><div class="modal-choices"><a class="steam-btn" href="/auth/steam"><span class="steam-icon">◉</span> ВОЙТИ ЧЕРЕЗ STEAM <span>↗</span></a><div class="modal-separator">ИЛИ</div><button class="btn btn-primary" data-action="guest-login">ГОСТЬ (ОДИН НА IP) ↗</button><div class="auth-split"><button class="btn btn-dark" data-action="show-email-login">ВОЙТИ ПО EMAIL</button><button class="btn btn-dark" data-action="show-email-register">РЕГИСТРАЦИЯ</button></div></div><p class="modal-footnote">Пароль Steam вводится только на сайте Steam. Скины нельзя перевести в Steam или вывести за деньги.</p><button class="text-link" data-action="show-admin-login">Вход для администратора</button>`);
}
function showResult(result){
 const items=result.items||[result.item],total=items.reduce((n,x)=>n+x.price,0);
 const promoMarkup=(result.promos||[]).length?`<div class="promo-wins"><b>🎟 БОНУСНЫЕ ПРОМОКОДЫ</b>${result.promos.map(p=>`<div><code>${esc(p.code)}</code> · +${fmt(p.amount)} CR <button class="mini-btn" data-action="copy-code" data-code="${esc(p.code)}">КОПИРОВАТЬ</button></div>`).join('')}<small>Введи в профиле · код действует только для твоего аккаунта</small></div>`:'';
 if(items.length===1){const item=items[0],r=rarity(item.rarity);
  modal(`<button class="modal-close" data-action="close-modal" aria-label="Закрыть">×</button><div class="modal-eyebrow">CASE OPENED / NEW DROP</div><h2>ТВОЙ ДРОП!</h2>${skinArt(item,'result-image')}<div class="rarity-label" style="--drop-color:${esc(r.color)}">${esc(r.name)}</div><div class="result-name">${esc(item.name)}</div><div class="result-subtitle">Состояние: ${esc(item.wear)}</div><div class="result-price">${fmt(item.price)} <small>CR</small></div><div class="result-buttons"><button class="btn btn-primary" data-action="result-sell" data-item="${item.inventoryId}">ПРОДАТЬ ЗА ${fmt(item.price)} CR</button><button class="btn btn-ghost" data-action="close-modal">ОСТАВИТЬ</button></div>${result.coinsEarned?`<div class="coin-result">+${fmt(result.coinsEarned)} ✦ за открытие</div>`:''}${promoMarkup}`, 'result-modal');
  $('.result-modal').style.setProperty('--drop-color',r.color);return;
 }
 modal(`<button class="modal-close" data-action="close-modal" aria-label="Закрыть">×</button><div class="modal-eyebrow">MULTI OPEN / ${items.length} CASES</div><h2>ТВОИ ${items.length} ДРОПОВ</h2><div class="result-multi-grid">${items.map(item=>`<div class="result-multi" style="--tier:${esc(rarity(item.rarity).color)}">${skinArt(item)}<b>${esc(item.name)}</b><span>${fmt(item.price)} CR</span></div>`).join('')}</div><div class="result-price">${fmt(total)} <small>CR ОБЩАЯ СТОИМОСТЬ</small></div>${result.coinsEarned?`<div class="coin-result">+${fmt(result.coinsEarned)} ✦ за открытие</div>`:''}${promoMarkup}<div class="result-buttons"><button class="btn btn-primary" data-action="close-modal">ЗАБРАТЬ ВСЁ</button><button class="btn btn-ghost" data-action="navigate-after-upgrade" data-view="inventory">ОТКРЫТЬ ИНВЕНТАРЬ</button></div>`, 'result-modal result-multi-modal');
}

function emailModal(register=false){
 modal(`<button class="modal-close" data-action="close-modal">×</button><div class="modal-eyebrow">DROPLAB / ACCOUNT</div><h2>${register?'РЕГИСТРАЦИЯ':'ВХОД В АККАУНТ'}</h2><p>Один аккаунт — постоянный баланс, скины и ID игрока. Пароль хранится как защищённый хеш.</p><form id="email-${register?'register':'login'}" class="login-fields">${register?'<div class="field"><label>Никнейм</label><input class="input" name="username" required minlength="3" maxlength="24" autocomplete="username"/></div>':''}<div class="field"><label>${register?'Email':'Email или никнейм'}</label><input class="input" name="${register?'email':'login'}" required ${register?'type="email"':''} autocomplete="${register?'email':'username'}"/></div><div class="field"><label>Пароль</label><input class="input" name="password" required type="password" minlength="${register?10:1}" autocomplete="${register?'new-password':'current-password'}"/></div><button class="btn btn-primary" type="submit">${register?'СОЗДАТЬ АККАУНТ':'ВОЙТИ'} ↗</button></form><p class="modal-footnote">Почта пока не подтверждается письмом; для восстановления пароля понадобится поддержка.</p><button class="text-link" data-action="show-login">← Другие способы входа</button>`);
}
async function emailAuth(event,register){
 event.preventDefault();const f=new FormData(event.target),payload=register?{username:f.get('username'),email:f.get('email'),password:f.get('password')}:{login:f.get('login'),password:f.get('password')};
 try{const r=await api('/api/auth/'+(register?'register':'login'),'POST',payload);state.user=r.user;closeModal();await bootstrap(false);toast(register?'Аккаунт создан — 1 500 CR начислено':'Добро пожаловать!');}
 catch(e){toast(e.message,true);}
}
async function guestLogin(){try{const r=await api('/api/auth/guest','POST');state.user=r.user;await bootstrap(false);closeModal();toast('Аккаунт создан! +1 500 CR на балансе.');}catch(e){toast(e.message,true);}}
async function adminLogin(event){event.preventDefault();const f=new FormData(event.target);try{const r=await api('/api/auth/admin','POST',{username:f.get('username'),password:f.get('password')});state.user=r.user;await bootstrap(false);closeModal();navigate('admin');toast('Вход администратора выполнен.');}catch(e){toast(e.message,true);}}
async function doLogout(){try{await api('/api/auth/logout','POST');state.user=null;state.csrf=null;await bootstrap(false);navigate('home');toast('Вы вышли из аккаунта.');}catch(e){toast(e.message,true);}}
async function bonus(){if(!state.user){loginModal();return;}try{const r=await api('/api/bonus/claim','POST');state.user.balance=r.balance;state.user.lastBonus=Date.now();renderAccount();closeModal();toast('+200 CR! Ежедневный бонус получен.');}catch(e){toast(e.message,true);}}
async function renderInventory(){
 if(!state.user){$('#view').innerHTML=`<div class="page-header"><div class="eyebrow">MY PROFILE</div><h1>ПРОФИЛЬ ИГРОКА</h1></div>${emptyState('▤','Войди, чтобы собирать скины','Инвентарь сохраняется на сервере после входа в аккаунт.','ВОЙТИ','account')}`;return;}
 $('#view').innerHTML='<div class="loading-wrap"><span class="load-spinner"></span></div>';
 try{state.profile=await api('/api/profile');}catch(e){toast(e.message,true);return;}
 if(state.view!=='inventory')return;
 const p=state.profile,st=p.stats,avatar=state.user.avatar?`<img src="${url(state.user.avatar)}" alt="">`:esc(state.user.name[0]);
 const fave=getCase(st.favoriteCase),best=st.bestDrop;
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">PERSONAL STATS / LOADOUT</div><h1>ПРОФИЛЬ <em>ИГРОКА</em></h1><p>Статистика обновляется после каждого открытия, апгрейда и продажи.</p></div>
 <div class="profile-v3-layout"><div class="pv3-card pv3-left"><div class="pv3-head">◈ &nbsp; СТАТИСТИКА АККАУНТА</div><div class="pv3-metrics"><div><small>КЕЙСОВ ОТКРЫТО</small><strong>${fmt(st.openings)}</strong></div><div><small>АПГРЕЙДОВ</small><strong>${fmt(st.upgrades)}</strong></div><div><small>УДАЧНЫХ АПГРЕЙДОВ</small><strong>${fmt(st.upgradeWins)}</strong></div><div><small>ВСЕГО ПОЛУЧЕНО ПРЕДМЕТОВ</small><strong>${fmt(st.totalItems)}</strong></div></div><div class="pv3-total"><small>НА КАКУЮ СУММУ ВСЕГО ВЫПАЛО</small><b>${fmt(st.totalWon)} CR</b><p>Стоимость всех полученных предметов, включая проданные и улучшенные</p></div><div class="pv3-total"><small>СТОИМОСТЬ ИНВЕНТАРЯ СЕЙЧАС</small><b>${fmt(st.inventoryValue)} CR</b><p>Продано предметов: ${fmt(st.sold)}</p></div></div>
 <div class="pv3-column"><div class="pv3-card pv3-user"><span class="pv3-settings">✦ CS2 SIMULATOR</span><div class="pv3-avatar">${avatar}</div><h2>${esc(state.user.name)}</h2><p>ID: ${esc(state.user.publicId||state.user.id)} · ${state.user.steamId?'STEAM':state.user.role==='admin'?'АДМИН':state.user.id.startsWith('local:')?'EMAIL':'ГОСТЬ'}</p><div class="pv3-luck">Шансы: кейсы <b>${state.user.caseLuck}%</b> · апгрейд <b>${state.user.upgradeLuck}%</b> <small>Открытые личные коэффициенты (100% — стандарт)</small></div><div class="pv3-wallets"><span><small>БАЛАНС</small><b>${fmt(state.user.balance)} CR</b></span><span><small>МОНЕТЫ</small><b>${fmt(state.user.coins)} ✦</b></span></div><button class="btn btn-primary" data-action="wallet">+ ПОПОЛНИТЬ CR</button></div><div class="pv3-card pv3-best"><div class="pv3-head">✧ ЛУЧШИЙ ДРОП</div>${best?`<div class="profile-best">${skinArt(skin(best.skin_id))}<div><b>${esc(best.skin_name)}</b><small>${fmt(best.price)} CR</small></div></div>`:'<p class="profile-empty-best">Твой будущий рекорд ждёт тебя в кейсах.</p>'}</div></div>
 <div class="pv3-column"><div class="pv3-card pv3-fave"><div class="pv3-head">★ САМЫЙ ОТКРЫВАЕМЫЙ КЕЙС</div>${fave?`<div class="pv3-case-art">${caseCover(fave)}</div><h3>${esc(fave.name)}</h3><p>Открыт ${fmt(st.favoriteOpens)} раз · определяется автоматически</p><button class="btn btn-ghost" data-action="open-case-page" data-case="${esc(fave.id)}">ОТКРЫТЬ СНОВА ↗</button>`:'<p>Открой свой первый кейс, чтобы он появился здесь.</p>'}</div><div class="pv3-card pv3-history"><div class="pv3-head">◈ ТВОЙ РЕКОРД</div><div class="pv3-history-numbers"><span><small>ПРЕДМЕТОВ В КОЛЛЕКЦИИ</small><b>${fmt(st.items)}</b></span><span><small>ЗАРАБОТАНО МОНЕТ</small><b>${fmt(st.coinsEarned)} ✦</b></span></div><button class="btn btn-ghost" data-action="navigate" data-view="coins">МОНЕТНЫЕ КЕЙСЫ ↗</button><button class="btn btn-dark" data-action="navigate" data-view="contracts">КОНТРАКТЫ (${fmt(st.contracts||0)}) ↗</button></div></div></div>
 ${promoProfileMarkup(p.promos)}${sectionHeading('ТВОИ ПРЕДМЕТЫ',st.items+' предметов в инвентаре')}<div class="inventory-actions"><div class="section-category-tabs" id="inventory-filters" style="margin:0"><button class="filter-tab active" data-action="inv-filter" data-filter="all">Все</button><button class="filter-tab" data-action="inv-filter" data-filter="gold">Особые</button><button class="filter-tab" data-action="inv-filter" data-filter="red">Тайные</button><button class="filter-tab" data-action="inv-filter" data-filter="pink">Засекреченные</button></div><div style="display:flex;gap:8px"><select class="input" id="inventory-sort" aria-label="Сортировка"><option value="new">Сначала новые</option><option value="price">Самые дорогие</option></select>${p.inventory.length?'<button class="btn btn-dark" data-action="sell-all">ПРОДАТЬ ВСЁ ↗</button>':''}</div></div><div id="inventory-list"></div>`;
 $('#inventory-sort').value=state.sort;renderInventoryGrid();
}

function promoProfileMarkup(promos){return `<div class="promo-redeem"><h3>🎟 ПРОМОКОДЫ</h3><form id="promo-redeem-form" class="promo-form"><input class="input" name="code" placeholder="DROP-XXXXXXXX" required maxlength="13"/><button class="btn btn-primary" type="submit">ПРИМЕНИТЬ</button></form><small>Промокоды иногда выдаются вместе со скинами. Действуют только для владельца.</small>${(promos||[]).length?`<div class="promo-list">${promos.slice(0,8).map(p=>`<span class="promo-chip">${esc(p.code)} · +${fmt(p.amount)} CR ${p.redeemed_at?'✓ использован':'· не использован'}</span>`).join('')}</div>`:''}</div>`;}
async function redeemPromo(e){e.preventDefault();const f=new FormData(e.target);try{const r=await api('/api/promo/redeem','POST',{code:f.get('code')});state.user.balance=r.balance;renderAccount();await renderInventory();toast('Промокод: +'+fmt(r.amount)+' CR');}catch(error){toast(error.message,true);}}
function emptyState(icon,title,sub,button,action){return `<div class="empty-state"><div class="empty-icon">${esc(icon)}</div><h3>${esc(title)}</h3><p>${esc(sub)}</p><button class="btn btn-primary" data-action="${esc(action)}">${esc(button)} ↗</button></div>`;}
function renderInventoryGrid(){
 const list=$('#inventory-list');if(!list)return;
 let items=(state.profile?.inventory||[]).filter(i=>state.filter==='all'||i.rarity===state.filter);
 if(state.sort==='price')items=items.slice().sort((a,b)=>b.price-a.price);
 if(!items.length){list.innerHTML=emptyState('◇','Тут пока пусто','Открой первый кейс и начинай собирать коллекцию.','КРУТИТЬ КЕЙСЫ','go-cases');return;}
 list.innerHTML=`<div class="inventory-grid">${items.map(i=>`<div class="inventory-card" style="--tier:${esc(rarity(i.rarity).color)}"><div class="loot-item-img">${skinArt({id:i.skinId,name:i.skinName,image:i.image})}</div><div class="inv-meta"><h3 title="${esc(i.skinName)}">${esc(i.skinName)}</h3><p>${esc(rarity(i.rarity).name)} · ${esc(i.wear)}</p><div class="inv-footer"><span class="inv-price">${fmt(i.price)} CR</span><button class="sell-btn" data-action="sell-item" data-item="${i.id}">ПРОДАТЬ</button></div><button class="to-upgrade" data-action="use-upgrade" data-item="${i.id}">⚡ УЛУЧШИТЬ В АПГРЕЙДЕРЕ</button></div></div>`).join('')}</div>`;
}
async function sellItem(id,fromResult=false){try{const r=await api('/api/inventory/'+encodeURIComponent(id)+'/sell','POST');state.user.balance=r.balance;renderAccount();if(fromResult){closeModal();if(state.view==='case'&&state.caseId)renderCaseDetail(state.caseId);}if(state.view==='inventory')await renderInventory();toast('Предмет продан. +'+fmt(r.earned)+' CR');}catch(e){toast(e.message,true);}}
async function sellAll(){if(!state.profile?.inventory?.length)return;if(!confirm('Продать все скины за виртуальные кредиты? Это действие нельзя отменить.'))return;try{const r=await api('/api/inventory/sell-all','POST');state.user.balance=r.balance;renderAccount();await renderInventory();toast('Продано '+r.count+' предметов. +'+fmt(r.earned)+' CR');}catch(e){toast(e.message,true);}}
const chanceFor=(value,target)=>value&&target&&target.price>value?Math.max(.001,Math.min(75,Math.round(value/target.price*85*((state.user?.upgradeLuck||100)/100)*1000)/1000)):0;
const displayChance=ch=>ch<1?ch.toFixed(3).replace(/0+$/,'').replace(/\.$/,''):ch.toFixed(2);
function selectedSkins(){const inv=state.profile?.inventory||[];return inv.filter(i=>state.upgradeSources.includes(i.id));}
function upgradeValue(){return selectedSkins().reduce((sum,i)=>sum+i.price,0)+(state.upgradeCredit||0);}
async function renderContracts(){
 if(!state.user){$('#view').innerHTML=`<div class="page-header"><div class="eyebrow">CONTRACTS / EXCHANGE</div><h1>КОНТРАКТЫ</h1></div>${emptyState('◆','Сначала войди в аккаунт','Контракты используют твои виртуальные предметы.','ВОЙТИ','account')}`;return;}
 $('#view').innerHTML='<div class="loading-wrap"><span class="load-spinner"></span></div>';
 try{state.profile=await api('/api/profile');}catch(e){toast(e.message,true);return;}
 if(state.view!=='contracts')return;
 state.contractIds=state.contractIds.filter(id=>state.profile.inventory.some(it=>it.id===id)).slice(0,10);
 renderContractsUI();
}
function renderContractsUI(){
 const inv=state.profile?.inventory||[], selected=inv.filter(it=>state.contractIds.includes(it.id));
 const total=selected.reduce((acc,it)=>acc+it.price,0);
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">CS2 / ITEM EXCHANGE</div><h1>КОНТРАКТЫ <em>СКИНОВ</em></h1><p>Обменяй от 3 до 10 своих скинов на один случайный. Вероятность получить предмет дороже суммы контракта — около 20% при наличии подходящих предметов. Все цены игровые.</p></div><div class="contract-stage"><div class="contract-seal">◆</div><div class="contract-info"><span class="eyebrow">ТВОЙ КОНТРАКТ</span><h2>${selected.length} / 10 ПРЕДМЕТОВ</h2><div class="contract-summary">Сумма предметов: <strong>${fmt(total)} CR</strong></div><div class="contract-range">Диапазон результата: от ~${fmt(Math.ceil(total*.45))} до ~${fmt(total*1.6)} CR</div><div class="contract-chips">${selected.map(it=>`<button class="contract-chip" data-action="contract-toggle" data-item="${it.id}">${skinArt({id:it.skinId,name:it.skinName,image:it.image})}<span>${fmt(it.price)} CR ×</span></button>`).join('')}</div><button class="btn btn-primary" data-action="contract-create" ${selected.length<3?'disabled':''}>◆ ПОДПИСАТЬ КОНТРАКТ</button><p>Исходные скины расходуются сразу после подтверждения. Результат определяется сервером.</p></div></div><div class="section-heading"><div class="section-title-wrap"><span class="heading-stroke"></span><h2 class="section-title">ВЫБЕРИ ПРЕДМЕТЫ</h2></div></div><div class="upgrade-items contract-inventory">${inv.length?inv.map(it=>`<button class="upgrade-mini ${state.contractIds.includes(it.id)?'selected':''}" style="--tier:${esc(rarity(it.rarity).color)}" data-action="contract-toggle" data-item="${it.id}">${skinArt({id:it.skinId,name:it.skinName,image:it.image})}<span title="${esc(it.skinName)}">${esc(it.skinName)}</span><b>${fmt(it.price)} CR</b>${state.contractIds.includes(it.id)?'<i class="upgrade-selected-check">✓</i>':''}</button>`).join(''):'<div class="upgrade-nothing">Нет скинов. Открой несколько кейсов.</div>'}</div>`;
}
async function createContract(){
 if(state.busy||state.contractIds.length<3)return;
 state.busy=true;unlockAudio();
 try{
  const response=await api('/api/contracts/create','POST',{inventoryIds:state.contractIds.slice()});
  soundFinish(true);state.contractIds=[];state.busy=false;
  modal(`<button class="modal-close" data-action="close-modal">×</button><div class="modal-eyebrow">CONTRACT / COMPLETE</div><h2>КОНТРАКТ ВЫПОЛНЕН</h2>${skinArt(response.item,'result-image')}<div class="result-name">${esc(response.item.name)}</div><div class="result-price">${fmt(response.item.price)} CR</div><p>Обменено ${response.sourceCount} предметов на сумму ${fmt(response.sourceValue)} CR.</p><div class="result-buttons"><button class="btn btn-primary" data-action="navigate-after-upgrade" data-view="contracts">НОВЫЙ КОНТРАКТ</button><button class="btn btn-ghost" data-action="navigate-after-upgrade" data-view="inventory">В ИНВЕНТАРЬ</button></div>`,'result-modal');
 }catch(e){state.busy=false;toast(e.message,true);}
}
async function renderUpgrade(){
 if(!state.user){$('#view').innerHTML=`<div class="page-header"><div class="eyebrow">WEAPON UPGRADE 2.0</div><h1>АПГРЕЙДЕР</h1></div>${emptyState('⚡','Сначала зайди в аккаунт','Чтобы прокачать предметы, нужно иметь скины в инвентаре.','ВОЙТИ','account')}`;return;}
 $('#view').innerHTML='<div class="loading-wrap"><span class="load-spinner"></span><p>Загружаем твой инвентарь...</p></div>';
 try{state.profile=await api('/api/profile');}catch(e){toast(e.message,true);return;}
 if(state.view!=='upgrade')return;
 const inv=state.profile.inventory;
 state.upgradeSources=state.upgradeSources.filter(id=>inv.some(i=>i.id===id)).slice(0,6);
 if(state.upgradeSource&&inv.some(i=>i.id===state.upgradeSource)&&!state.upgradeSources.includes(state.upgradeSource))state.upgradeSources=[state.upgradeSource];
 if(!state.upgradeSources.length&&inv.length)state.upgradeSources=[inv[0].id];
 state.upgradeCredit=Math.max(0,Math.min(state.upgradeCredit||0,state.user.balance));
 const value=upgradeValue();
 if(!skin(state.upgradeTarget)||skin(state.upgradeTarget).price<=value)state.upgradeTarget=state.data.skins.filter(s=>s.price>value).sort((a,b)=>Math.abs(a.price-value*2.6)-Math.abs(b.price-value*2.6))[0]?.id||null;
 renderUpgradeUI();
}
function upgradeItemCard(s,kind){
 const isSource=kind==='source';const chosen=isSource?state.upgradeSources.includes(s.id):state.upgradeTarget===s.id;
 return `<button class="upgrade-mini ${chosen?'selected':''}" style="--tier:${esc(rarity(s.rarity).color)}" data-action="upgrade-${kind}" data-${isSource?'item':'skin'}="${esc(s.id)}">${skinArt({id:s.skinId||s.id,name:s.skinName||s.name,image:s.image})}<span title="${esc(s.skinName||s.name)}">${esc(s.skinName||s.name)}</span><b>${fmt(s.price)} CR</b>${chosen?'<i class="upgrade-selected-check">✓</i>':''}</button>`;
}
function renderUpgradeUI(){
 const inv=state.profile?.inventory||[], selected=selectedSkins(),sourceSum=selected.reduce((s,i)=>s+i.price,0),value=sourceSum+(state.upgradeCredit||0);
 const target=skin(state.upgradeTarget),eligible=state.data.skins.filter(s=>value>0&&s.price>value);
 const filtered=eligible.filter(s=>{
  const k=s.price/value,range=state.upgradeRange;
  if(range==='2x'&&k>2.5||range==='5x'&&(k<2.5||k>5)||range==='10x'&&(k<5||k>10)||range==='max'&&k<10)return false;
  if(state.upgradeMin&&s.price<Number(state.upgradeMin)||state.upgradeMax&&s.price>Number(state.upgradeMax))return false;
  return !state.upgradeSearch||s.name.toLowerCase().includes(state.upgradeSearch.toLowerCase());
 }).sort((a,b)=>a.price-b.price);
 const ch=chanceFor(value,target),winAngle=(ch/100*360).toFixed(5);
 const slots=Array.from({length:6},(_,i)=>{const it=selected[i];return it?`<div class="source-slot" style="--tier:${esc(rarity(it.rarity).color)}">${skinArt({id:it.skinId,name:it.skinName,image:it.image})}<span>${fmt(it.price)} CR</span><button data-action="upgrade-source" data-item="${it.id}" aria-label="Убрать предмет">×</button></div>`:'<div class="source-slot empty"><span>+</span></div>';}).join('');
 const targetMarkup=target?`<div class="upgrade-selected-skin">${skinArt(target)}<div><span>ЦЕЛЕВОЙ ПРЕДМЕТ</span><b>${esc(target.name)}</b><strong>${fmt(target.price)} CR</strong></div></div>`:'<div class="upgrade-placeholder">Выбери целевой скин из каталога ↓</div>';
 $('#view').innerHTML=`<div class="page-header upgrade-heading"><div class="eyebrow">WEAPON UPGRADE / 5.0</div><h1>МОДЕРНИЗАЦИЯ <em>ОРУЖИЯ</em></h1><p>Выбирай до шести предметов и добавляй CR для прокачки. Результат выбирает сервер; стрелка только отображает его.</p></div>
 <div class="upgrade-console v3-upgrade"><div class="upgrade-display"><div class="upgrade-side source-board"><div class="upgrade-small-label">МОЖНО ДОБАВИТЬ ЕЩЁ ${6-selected.length} ПРЕДМ.</div><div class="upgrade-source-slots">${slots}</div><div class="source-total">ОБЩАЯ СУММА <b>${fmt(value)} CR</b></div></div>
 <div class="upgrade-center"><div class="upgrade-wheel" id="upgrade-wheel" style="--win-angle:${winAngle}deg"><div class="upgrade-ticks"></div><div class="upgrade-needle" id="upgrade-needle"><div class="upgrade-needle-tip"></div></div><div class="upgrade-wheel-center"><small>ШАНС УСПЕХА</small><strong id="upgrade-chance">${ch?displayChance(ch)+'%':'—'}</strong><span>✦ UPGRADE ✦</span></div></div><div class="upgrade-legend"><span><i class="legend-win"></i> УСПЕХ</span><span><i class="legend-lose"></i> НЕУДАЧА</span></div></div>
 <div class="upgrade-side target-board"><div class="upgrade-small-label">ВЫБЕРИ ОРУЖИЕ, КОТОРОЕ ХОЧЕШЬ ПОЛУЧИТЬ</div>${targetMarkup}<div class="quick-choices">${[['2x','×2'],['5x','×5'],['10x','×10'],['p5','5%'],['p50','50%'],['p75','75%'],['random','⤨']].map(([id,label])=>`<button data-action="upgrade-quick" data-quick="${id}" title="Выбрать цель ${label}">${label}</button>`).join('')}</div></div></div>
 <div class="upgrade-console-bottom"><div class="credit-control"><label for="upgrade-credit">✦ ДОБАВИТЬ БАЛАНС К ПОПЫТКЕ</label><div class="credit-row"><input id="upgrade-credit" type="number" min="0" max="${Math.max(0,state.user.balance)}" step="1" value="${state.upgradeCredit||0}" class="input"/><span>CR</span><small>Макс. ${fmt(state.user.balance)} CR</small></div><input id="credit-slider" type="range" min="0" max="${Math.min(Math.max(0,state.user.balance),1000000)}" step="1" value="${state.upgradeCredit||0}"/></div>
 <div class="motion-control"><span>РЕЖИМ ВРАЩЕНИЯ</span><div class="motion-tabs"><button class="${state.upgradeMotion==='normal'?'active':''}" data-action="upgrade-motion" data-motion="normal">◉ ПЛАВНЫЙ <small>6 сек</small></button><button class="${state.upgradeMotion==='thrill'?'active':''}" data-action="upgrade-motion" data-motion="thrill">⚡ ДОЛГОЕ ЗАМЕДЛЕНИЕ <small>9,5 сек</small></button></div><button class="sound-control" data-action="sound-toggle">${state.sound?'♪ ЗВУК ВКЛ':'♪ ЗВУК ВЫКЛ'}</button><button class="fast-mode ${state.upgradeFast?'active':''}" data-action="upgrade-fast">⚡ ФАСТ-РЕЖИМ ${state.upgradeFast?'ВКЛ':'ВЫКЛ'}</button></div>
 <div class="upgrade-action"><div class="upgrade-ev">Сумма: <b>${fmt(value)} CR</b> · Шанс: <b>${ch?displayChance(ch)+'%':'—'}</b></div><button id="upgrade-start-btn" class="btn btn-primary" data-action="upgrade-start" ${ch?'':'disabled'}>⚡ ПРОКАЧАТЬ ПРЕДМЕТЫ</button><small>Коэффициент шанса: ${state.user.upgradeLuck}% · результат определяет сервер до начала вращения.</small></div></div></div>
 <div class="upgrade-picker-grid"><div class="upgrade-pick"><div class="upgrade-pick-title"><div><span>MY INVENTORY / 01</span><h2>МОИ ПРЕДМЕТЫ <small>${inv.length}</small></h2></div><button class="text-link" data-action="navigate" data-view="inventory">ПРОФИЛЬ ↗</button></div><p class="picker-sub">Выбрано: ${selected.length} из 6 · нажми на предмет, чтобы добавить или убрать</p>${inv.length?`<div class="upgrade-items">${inv.map(i=>upgradeItemCard(i,'source')).join('')}</div>`:emptyState('▤','Нет скинов','Открой кейс и вернись в апгрейдер','К КЕЙСАМ','go-cases')}</div>
 <div class="upgrade-pick"><div class="upgrade-pick-title"><div><span>CHOOSE TARGET / 02</span><h2>ВЫБЕРИ ПРЕДМЕТ <small>${filtered.length}</small></h2></div></div><div class="upgrade-picker-tools"><select class="input" id="upgrade-range"><option value="all">Любая цена</option><option value="2x">До ×2,5</option><option value="5x">×2,5 – ×5</option><option value="10x">×5 – ×10</option><option value="max">×10 и выше</option></select><input class="input" id="upgrade-search" value="${esc(state.upgradeSearch)}" placeholder="Поиск по названию..."/></div><div class="upgrade-picker-tools minmax"><input class="input" id="upgrade-min" type="number" min="0" value="${esc(state.upgradeMin)}" placeholder="Цена от"/><input class="input" id="upgrade-max" type="number" min="0" value="${esc(state.upgradeMax)}" placeholder="Цена до"/></div><div class="upgrade-items" id="upgrade-target-list">${value?(filtered.length?filtered.slice(0,96).map(i=>upgradeItemCard(i,'target')).join(''):'<div class="upgrade-nothing">Нет предметов в этом диапазоне</div>'):'<div class="upgrade-nothing">Выбери скин из инвентаря</div>'}</div><small class="upgrade-target-note">Показаны первые 96 предметов · предметы и цены виртуальные</small></div></div>`;
 const sel=$('#upgrade-range');if(sel)sel.value=state.upgradeRange;
}
function chooseUpgradeQuick(id){
 const value=upgradeValue();if(!value){toast('Сначала добавь скин или CR',true);return;}
 let price;
 if(id==='random'){const list=state.data.skins.filter(s=>s.price>value);if(!list.length)return;state.upgradeTarget=list[Math.floor(Math.random()*list.length)].id;renderUpgradeUI();return;}
 if(id.startsWith('p')){price=value*85/Number(id.slice(1));}else price=value*Number(id.slice(0,-1));
 const options=state.data.skins.filter(s=>s.price>value);if(!options.length)return;
 const candidate=options.reduce((a,b)=>Math.abs(a.price-price)<Math.abs(b.price-price)?a:b);
 state.upgradeTarget=candidate.id;state.upgradeRange='all';state.upgradeSearch='';state.upgradeMin='';state.upgradeMax='';renderUpgradeUI();
}
async function performUpgrade(){
 if(state.busy)return;
 const chosen=selectedSkins(),target=skin(state.upgradeTarget),credit=state.upgradeCredit||0;
 if(!chosen.length||!target||target.price<=upgradeValue()){toast('Выбери свои скины и более дорогую цель',true);return;}
 unlockAudio();state.busy=true;const btn=$('#upgrade-start-btn');if(btn){btn.disabled=true;btn.textContent='СТРЕЛКА ВРАЩАЕТСЯ...';}
 let result;
 try{result=await api('/api/upgrade/attempt','POST',{inventoryIds:chosen.map(i=>i.id),targetSkinId:target.id,addBalance:credit});}
 catch(e){state.busy=false;if(btn){btn.disabled=false;btn.textContent='⚡ ПРОКАЧАТЬ ПРЕДМЕТЫ';}toast(e.message,true);return;}
 state.user.balance=result.balance;state.user.coins=result.coins;renderAccount();
 const wheel=$('#upgrade-wheel'),needle=$('#upgrade-needle'),boundary=result.chance*3.6;
 const angle=result.success?boundary*(.18+Math.random()*.66):boundary+(360-boundary)*(.08+Math.random()*.83);
 const thrill=state.upgradeMotion==='thrill',duration=state.upgradeFast?0:(thrill?9500:6000);
 const end=(thrill?9:5)*360+180+angle;
 if(!state.upgradeFast)soundTicks(duration);
 // The needle never reverses, skips, or overshoots its predetermined sector.
 if(!state.upgradeFast)await tweenTransform(needle,`rotate(${end}deg)`,duration,thrill?EASE_LONG:EASE_NORMAL);
 else if(needle)needle.style.transform=`rotate(${180+angle}deg)`;

 wheel?.classList.add(result.success?'upgrade-win':'upgrade-lose');soundFinish(result.success);if(!state.upgradeFast)await sleep(350);
 state.busy=false;state.upgradeSources=[];state.upgradeSource=null;state.upgradeCredit=0;
 modal(`<button class="modal-close" data-action="close-modal" aria-label="Закрыть">×</button><div class="modal-eyebrow">UPGRADE / ${result.success?'SUCCESS':'FAILED'}</div><div class="upgrade-result-symbol">${result.success?'✦':'✕'}</div><h2>${result.success?'УСПЕШНАЯ ПРОКАЧКА!':'ПРОКАЧКА НЕ УДАЛАСЬ'}</h2>${result.success?skinArt(result.item,'result-image'):''}<p>${result.success?`Получен <b>${esc(result.target.name)}</b> за ${fmt(result.target.price)} CR.`:`Использовано предметов: ${chosen.length}. Цель не получена.`}</p><div class="rarity-label">Вероятность: ${displayChance(result.chance)}%</div>${result.coinsEarned?`<div class="coin-result">+${fmt(result.coinsEarned)} ✦ за успешный апгрейд</div>`:''}<div class="result-buttons"><button class="btn btn-primary" data-action="navigate-after-upgrade" data-view="upgrade">НОВАЯ ПОПЫТКА</button><button class="btn btn-ghost" data-action="close-modal">ЗАКРЫТЬ</button></div>`,result.success?'result-modal upgrade-result-success':'result-modal');
 try{const response=await api('/api/feed');state.data.recent=response.recent;renderFeed();}catch{}
}
async function openWallet(){if(!state.user){loginModal();return;}const can=Date.now()-(state.user.lastRefill||0)>=43200000&&state.user.balance<=1500;
 modal(`<button class="modal-close" data-action="close-modal">×</button><div class="modal-eyebrow">VIRTUAL WALLET</div><h2>ТВОЙ БАЛАНС</h2><div class="wallet-modal-balance">${fmt(state.user.balance)} <small>CR</small></div><div class="wallet-modal-coins">✦ ${fmt(state.user.coins)} МОНЕТ</div><p>Получай игровые кредиты бесплатно, без оплаты и привязки банковской карты. Дополнительные +1 000 CR доступны раз в 12 часов при балансе не более 1 500 CR.</p><button class="btn btn-primary" data-action="refill" ${can?'':'disabled'}>${can?'+1 000 CR · БЕСПЛАТНО':'ПОПОЛНЕНИЕ ПОКА НЕДОСТУПНО'}</button><div class="result-buttons"><button class="btn btn-ghost" data-action="bonus">ЕЖЕДНЕВНЫЙ +200 CR</button><button class="btn btn-ghost" data-action="navigate-after-upgrade" data-view="coins">✦ МОНЕТНЫЕ КЕЙСЫ</button></div>`);
}
async function refill(){try{const r=await api('/api/wallet/refill','POST');state.user.balance=r.balance;state.user.lastRefill=r.lastRefill;renderAccount();closeModal();toast('Бесплатное пополнение: +1 000 CR');}catch(e){toast(e.message,true);}}

async function renderLeaders(){
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">HALL OF FAME</div><h1>ТОП ИГРОКОВ</h1><p>Рейтинг настоящих аккаунтов симулятора по количеству виртуальных кредитов. Демо-боты в рейтинг не попадают.</p></div><div class="loading-wrap"><span class="load-spinner"></span></div>`;
 try{state.leaderboard=(await api('/api/leaderboard')).players;}catch(e){toast(e.message,true);return;}
 if(state.view!=='leaders')return;
 const players=state.leaderboard;
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">HALL OF FAME</div><h1>ТОП ИГРОКОВ</h1><p>Рейтинг настоящих аккаунтов симулятора по количеству виртуальных кредитов. Демо-боты в рейтинг не попадают.</p></div>${players.length?`<div class="leader-grid">${players.slice(0,3).map((p,i)=>`<div class="leader-card"><div class="leader-rank">#0${i+1}</div><h3>${esc(p.name)}</h3><p>${fmt(p.balance)} CR</p><small>Баланс игрока</small></div>`).join('')}</div><div class="leader-table">${players.slice(3).map((p,i)=>`<div class="leader-row"><b>#${i+4}</b><span>${esc(p.name)}</span><strong>${fmt(p.balance)} CR</strong></div>`).join('')}</div>`:emptyState('♛','Стань первым','Сейчас в таблице нет игроков. Открывай кейсы и попади в рейтинг.','ОТКРЫТЬ КЕЙСЫ','go-cases')}`;
}
function renderFaq(){return `<div class="page-header"><div class="eyebrow">HOW IT WORKS</div><h1>КАК ИГРАТЬ?</h1><p>Мы сделали коллекционный CS2-симулятор без реальных ставок, платежей и выводов.</p></div><div class="faq-grid"><div class="faq-card"><h3>01 / СОЗДАЙ АККАУНТ</h3><p>Войди через официальный Steam OpenID или выбери гостевой режим. На старте ты получишь 1 500 виртуальных кредитов (CR). Крути от 1 до 9 кейсов за раз или выбирай «МАКС».</p></div><div class="faq-card"><h3>02 / ОТКРЫВАЙ КЕЙСЫ</h3><p>Выбери понравившийся кейс. За каждое открытие списывается игровая цена, а награда выбирается на сервере по указанным вероятностям.</p></div><div class="faq-card"><h3>03 / СОБИРАЙ И ПРОДАВАЙ</h3><p>Скин появляется в твоём инвентаре. Его можно оставить в коллекции или продать за игровые CR, чтобы открыть новые кейсы.</p></div><div class="faq-card"><h3>04 / ПОЛУЧАЙ БОНУС</h3><p>Раз в 24 часа забирай бесплатные +200 CR. В кошельке есть бесплатное пополнение +1 000 CR раз в 12 часов, когда баланс не превышает 1 500 CR. Никаких платежей нет.</p></div><div class="faq-card"><h3>МОНЕТЫ И АПГРЕЙД</h3><p>За обычные открытия и успешные апгрейды начисляются ✦. Ими можно открывать монетные кейсы. Апгрейдер позволяет тратить до 6 скинов и добавить CR к попытке; режим анимации не влияет на успех.</p></div><div class="faq-card"><h3>ЭТО НАСТОЯЩИЕ СКИНЫ?</h3><p>Названия и картинки взяты из CS2, но выигранные вещи существуют только в DROPLAB. Они не поступают в Steam и не имеют денежной стоимости.</p></div><div class="faq-card"><h3>ЧТО ЗА ЛЕНТА LIVE DROPS?</h3><p>Лента показывает сгенерированные выпадения ботов (помечены «бот») и реальные открытия зарегистрированных пользователей. Счётчик показывает зарегистрированные аккаунты, а не количество людей в сети.</p></div><div class="faq-card"><h3>БЕЗОПАСЕН ЛИ ВХОД ЧЕРЕЗ STEAM?</h3><p>Кнопка отправляет тебя на steamcommunity.com по официальному OpenID. Мы не запрашиваем и не сохраняем пароль Steam. Чтобы работали профили и аватары Steam, администратор может настроить ключ Steam Web API.</p></div><div class="faq-card"><h3>САЙТ ОФИЦИАЛЬНЫЙ?</h3><p>Нет. DROPLAB — независимый фанатский проект-симулятор, не связанный с Valve или Steam. Скины, названия и изображения принадлежат владельцам прав.</p></div></div>`;}
async function loadAdmin(q=''){
 try{const [users,logs]=await Promise.all([api('/api/admin/users?q='+encodeURIComponent(q)),api('/api/admin/logs')]);state.adminUsers=users.users;state.adminLogs=logs.logs;}catch(e){toast(e.message,true);}
 if(state.view==='admin')updateAdminTable();
}
function renderAdmin(){
 if(state.user?.role!=='admin'){navigate('home');return;}
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">SERVER CONTROL / ADMIN ONLY</div><h1>АДМИН-ПАНЕЛЬ</h1><p>Баланс игроков изменяется в серверной базе данных. Выдача предметов и изменение кредитов доступно только подтверждённому администратору.</p></div><div class="admin-info">⚙ &nbsp; Админ-панель: управление балансом, поиск по имени / ID / SteamID, журнал начислений. Данные не хранятся в браузере.</div>${sectionHeading('Изменить баланс игроку')}<form id="admin-balance-form" class="admin-controls"><div class="field"><label>ID ИГРОКА</label><input class="input" id="admin-target" name="userId" required placeholder="guest:... или steam:7656..." /></div><div class="field"><label>КОЛИЧЕСТВО</label><input class="input" name="amount" type="number" step="1" required value="1000" /></div><div class="field"><label>ВАЛЮТА</label><select class="input" name="currency"><option value="CR">CR</option><option value="COIN">✦ МОНЕТЫ</option></select></div><div class="field"><label>ТИП ДЕЙСТВИЯ</label><select class="input" name="mode"><option value="add">Добавить</option><option value="set">Установить</option></select></div><button class="btn btn-primary" type="submit" style="align-self:end">СОХРАНИТЬ ↗</button></form>${sectionHeading('Настройки шансов игрока')}<div class="admin-info">Коэффициенты видны игроку в профиле и применяются только к будущим действиям. Нельзя изменить уже определённый результат. 100% — обычные шансы.</div><form id="admin-luck-form" class="admin-controls"><div class="field"><label>ID игрока</label><input class="input" id="admin-luck-target" name="userId" required placeholder="DL-XXXXXXXXXX"/></div><div class="field"><label>Кейсы (50–150%)</label><input class="input" name="caseLuck" type="number" min="50" max="150" value="100"/></div><div class="field"><label>Апгрейд (50–150%)</label><input class="input" name="upgradeLuck" type="number" min="50" max="150" value="100"/></div><button class="btn btn-primary" type="submit">ОБНОВИТЬ ШАНСЫ</button></form><p><button class="btn btn-ghost" data-action="navigate" data-view="support">✉ ОТКРЫТЬ ТИКЕТЫ ПОДДЕРЖКИ ↗</button></p>${sectionHeading('Игроки')}<div class="field" style="max-width:460px;margin-bottom:12px"><label>ПОИСК</label><input class="input" id="admin-search" placeholder="Имя, SteamID, ID аккаунта" /></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>ИГРОК</th><th>ПУБЛИЧНЫЙ ID</th><th>ТИП</th><th>CR / ✦</th><th>ДЕЙСТВИЕ</th></tr></thead><tbody id="admin-users"><tr><td colspan="5">Загрузка...</td></tr></tbody></table></div>${sectionHeading('История начислений')}<div id="admin-logs"></div>`;
 loadAdmin();
}
function updateAdminTable(){
 const body=$('#admin-users');if(!body)return;
 body.innerHTML=state.adminUsers.length?state.adminUsers.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td title="${esc(u.id)}"><b>${esc(u.publicId||u.id)}</b><small class="admin-under">${esc(u.id.slice(0,28))}</small></td><td>${esc(u.role==='admin'?'Админ':u.steamId?'Steam':u.id.startsWith('local:')?'Email':'Гость')}</td><td><b>${fmt(u.balance)} CR · ${fmt(u.coins)} ✦</b></td><td><button class="mini-btn" data-action="admin-select" data-user="${esc(u.id)}">CR / ✦</button><button class="mini-btn" data-action="admin-luck-select" data-user="${esc(u.id)}" data-case-luck="${u.caseLuck}" data-upgrade-luck="${u.upgradeLuck}">ШАНСЫ ${u.caseLuck}/${u.upgradeLuck}%</button></td></tr>`).join(''):'<tr><td colspan="5">Игроки не найдены</td></tr>';
 const logs=$('#admin-logs');if(logs)logs.innerHTML=state.adminLogs.length?state.adminLogs.slice(0,15).map(l=>`<div class="admin-log">${new Date(l.created_at).toLocaleString('ru-RU')} · <b>${esc(l.target_id)}</b> · ${l.amount>=0?'+':''}${fmt(l.amount)} ${l.currency==='COIN'?'✦':'CR'} (${fmt(l.before_balance)} → ${fmt(l.after_balance)})</div>`).join(''):'<div class="admin-log">Начислений ещё не было</div>';
}
async function changeBalance(e){e.preventDefault();const f=new FormData(e.target);try{const r=await api('/api/admin/balance','POST',{userId:f.get('userId'),amount:Number(f.get('amount')),mode:f.get('mode'),currency:f.get('currency')});toast('Баланс обновлён: '+fmt(r.balance)+' '+(r.currency==='COIN'?'✦':'CR'));await loadAdmin($('#admin-search')?.value||'');if(state.user.id===r.userId){if(r.currency==='COIN')state.user.coins=r.balance;else state.user.balance=r.balance;renderAccount();}}catch(e){toast(e.message,true);}}
async function renderSupport(){
 if(!state.user){$('#view').innerHTML=`<div class="page-header"><h1>ПОДДЕРЖКА</h1></div>${emptyState('✉','Войди, чтобы обратиться','Ответ будет доступен в твоём аккаунте.','ВОЙТИ','account')}`;return;}
 try{const res=await api('/api/support/tickets');state.supportTickets=res.tickets;}catch(e){toast(e.message,true);return;}
 if(state.view!=='support')return;
 const ticket=state.supportTickets.find(x=>x.id===state.supportTicket);
 $('#view').innerHTML=`<div class="page-header"><div class="eyebrow">HELP DESK / ACCOUNT</div><h1>ПОДДЕРЖКА <em>DROPLAB</em></h1><p>Задай вопрос администратору. Сообщения хранятся на сервере и доступны только тебе и поддержке.</p></div><div class="support-layout"><div class="support-panel"><h2>НОВОЕ ОБРАЩЕНИЕ</h2><form id="support-create-form" class="login-fields"><div class="field"><label>Тема</label><input class="input" name="subject" required minlength="5" maxlength="100" placeholder="Не начислился бонус"/></div><div class="field"><label>Описание</label><textarea name="message" class="input" minlength="10" maxlength="2000" required rows="5" placeholder="Расскажи подробно, что случилось..."></textarea></div><button class="btn btn-primary" type="submit">ОТПРАВИТЬ</button></form><h2>ОБРАЩЕНИЯ</h2><div class="ticket-list">${state.supportTickets.length?state.supportTickets.map(t=>`<button class="ticket-row ${t.id===state.supportTicket?'active':''}" data-action="support-open" data-ticket="${t.id}"><b>#${t.id} · ${esc(t.subject)}</b><small>${esc(t.status)} · ${new Date(t.updated_at).toLocaleDateString('ru-RU')}${t.public_id?' · '+esc(t.public_id):''}</small></button>`).join(''):'Обращений пока нет'}</div></div><div class="support-panel" id="ticket-detail">${ticket?'<div class="loading-wrap">Загружаем переписку...</div>':'<div class="support-empty">Выбери обращение, чтобы посмотреть переписку</div>'}</div></div>`;
 if(ticket)await openSupportTicket(ticket.id);
}
async function openSupportTicket(id){state.supportTicket=Number(id);let data;try{data=await api('/api/support/tickets/'+id);}catch(e){toast(e.message,true);return;}
 const box=$('#ticket-detail');if(!box||state.view!=='support')return;box.innerHTML=`<h2>#${id} · ${esc(data.ticket.subject)}</h2><p>Статус: <b>${esc(data.ticket.status)}</b></p><div class="ticket-messages">${data.messages.map(m=>`<div class="ticket-message ${m.sender_id===state.user.id?'own':''}"><small>${m.sender_id===data.ticket.user_id?'Игрок':'Поддержка'} · ${new Date(m.created_at).toLocaleString('ru-RU')}</small><p>${esc(m.body)}</p></div>`).join('')}</div><form id="support-reply-form" class="login-fields" data-ticket="${id}"><div class="field"><label>Ответить</label><textarea class="input" name="message" required maxlength="2000" rows="3"></textarea></div><button class="btn btn-primary" type="submit">ОТПРАВИТЬ ОТВЕТ</button></form>${state.user.role==='admin'?`<div class="ticket-actions"><button class="btn btn-dark" data-action="ticket-close" data-ticket="${id}">ЗАКРЫТЬ ОБРАЩЕНИЕ</button></div>`:''}`;
}
async function createTicket(e){e.preventDefault();const f=new FormData(e.target);try{const r=await api('/api/support/tickets','POST',{subject:f.get('subject'),message:f.get('message')});state.supportTicket=r.id;await renderSupport();toast('Обращение создано');}catch(error){toast(error.message,true);}}
async function replyTicket(e){e.preventDefault();const f=new FormData(e.target),id=e.target.dataset.ticket;try{await api('/api/support/tickets/'+id+'/reply','POST',{message:f.get('message')});await renderSupport();toast('Сообщение отправлено');}catch(error){toast(error.message,true);}}
async function closeTicket(id){try{await api('/api/admin/support/status','POST',{ticketId:Number(id),status:'closed'});await renderSupport();toast('Обращение закрыто');}catch(e){toast(e.message,true);}}
async function changeLuck(e){e.preventDefault();const f=new FormData(e.target);try{const r=await api('/api/admin/luck','POST',{userId:f.get('userId'),caseLuck:Number(f.get('caseLuck')),upgradeLuck:Number(f.get('upgradeLuck'))});toast('Коэффициенты обновлены · игрок увидит их в профиле');await loadAdmin($('#admin-search')?.value||'');if(state.user.id===r.userId){state.user.caseLuck=r.caseLuck;state.user.upgradeLuck=r.upgradeLuck;}}catch(error){toast(error.message,true);}}
async function bootstrap(withNav=true){
 const data=await api('/api/bootstrap');state.data=data;state.user=data.user;state.csrf=data.csrf;renderAccount();renderFeed();const activity=$('#online-count');if(activity)activity.textContent=fmt(data.totals?.players||0);
 if(withNav){let hash=location.hash.slice(1);let parts=hash.split('/');if(parts[0]==='case'&&getCase(parts[1]))navigate('case',parts[1],false);else navigate(['home','cases','coins','inventory','upgrade','contracts','leaders','support','faq','admin'].includes(hash)?hash:'home',null,false);}
 else {const v=state.view; if(v==='inventory')await renderInventory();else if(v==='admin')renderAdmin();else if(v==='case')renderCaseDetail(state.caseId);else if(v==='upgrade')await renderUpgrade();else renderCurrent();}
}
function navigate(view,id=null,changeHash=true){
 if(state.busy)return;
 if(view==='admin'&&state.user?.role!=='admin'){loginModal(true);return;}
 hideAccountPopover();state.view=view;state.caseId=id;state.filter='all';state.busy=false;
 if(changeHash)location.hash=view==='case'?'case/'+id:view;
 const names={home:'ГЛАВНАЯ',cases:'ВСЕ КЕЙСЫ',coins:'МОНЕТНЫЕ КЕЙСЫ',case:'ОТКРЫТИЕ КЕЙСА',inventory:'ИНВЕНТАРЬ',upgrade:'АПГРЕЙДЕР',contracts:'КОНТРАКТЫ',leaders:'РЕЙТИНГ',support:'ПОДДЕРЖКА',faq:'КАК ИГРАТЬ',admin:'ПАНЕЛЬ АДМИНА'};
 $('#page-crumb').textContent=names[view]||'ГЛАВНАЯ';
 $$('#side-nav .nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===(view==='case'?'cases':view)));
 renderCurrent();window.scrollTo({top:0,behavior:'instant'});
}
function renderCurrent(){if(!state.data)return;
 if(state.view==='home')$('#view').innerHTML=renderHome();
 if(state.view==='cases')$('#view').innerHTML=renderCases();
 if(state.view==='coins')$('#view').innerHTML=renderCoins();
 if(state.view==='case')renderCaseDetail(state.caseId);
 if(state.view==='inventory')renderInventory();
 if(state.view==='upgrade')renderUpgrade();
 if(state.view==='contracts')renderContracts();
 if(state.view==='leaders')renderLeaders();
 if(state.view==='support')renderSupport();
 if(state.view==='faq')$('#view').innerHTML=renderFaq();
 if(state.view==='admin')renderAdmin();
}
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-action]');if(!t){if(e.target.matches('.modal-overlay'))closeModal();return;}
 const a=t.dataset.action;
 if(t.matches('a')&&a==='navigate')e.preventDefault();
 if(a==='navigate')navigate(t.dataset.view);
 if(a==='open-case-page')navigate('case',t.dataset.case);
 if(a==='filter-cases')applyCaseFilter(t.dataset.filter);
 if(a==='spin')spinCase(t.dataset.case);
 if(a==='set-quantity'){state.openQuantity=t.dataset.qty==='max'?'max':Number(t.dataset.qty);renderCaseDetail(state.caseId);}
 if(a==='contract-toggle'){const id=Number(t.dataset.item);if(state.contractIds.includes(id))state.contractIds=state.contractIds.filter(x=>x!==id);else if(state.contractIds.length<10)state.contractIds.push(id);else{toast('До 10 предметов',true);return;}renderContractsUI();}
 if(a==='contract-create')createContract();
 if(a==='upgrade-source'){const id=Number(t.dataset.item);if(state.upgradeSources.includes(id))state.upgradeSources=state.upgradeSources.filter(x=>x!==id);else if(state.upgradeSources.length<6)state.upgradeSources.push(id);else{toast('Максимум 6 исходных предметов',true);return;}if(skin(state.upgradeTarget)?.price<=upgradeValue())state.upgradeTarget=null;renderUpgradeUI();}
 if(a==='upgrade-target'){state.upgradeTarget=t.dataset.skin;renderUpgradeUI();}
 if(a==='upgrade-quick')chooseUpgradeQuick(t.dataset.quick);
 if(a==='sound-toggle'||a==='sound-global'){state.sound=!state.sound;renderAccount();if(a==='sound-toggle'&&state.view==='upgrade')renderUpgradeUI();else toast(state.sound?'Звуки включены':'Звуки выключены');}
 if(a==='upgrade-motion'){state.upgradeMotion=t.dataset.motion;renderUpgradeUI();}
 if(a==='upgrade-fast'){state.upgradeFast=!state.upgradeFast;renderUpgradeUI();}
 if(a==='upgrade-start')performUpgrade();
 
 if(a==='use-upgrade'){state.upgradeSources=[Number(t.dataset.item)];state.upgradeSource=null;navigate('upgrade');}
 if(a==='navigate-after-upgrade'){closeModal();navigate(t.dataset.view);}
 if(a==='close-modal'){closeModal();if(state.view==='case'&&state.caseId)renderCaseDetail(state.caseId);}
 if(a==='modal-overlay'&&t===e.target)closeModal();
 if(a==='wallet')openWallet();
 if(a==='refill')refill();
 if(a==='account'){toggleAccountPopover();}
 if(a==='view-inventory'){closeModal();navigate('inventory');}
 if(a==='guest-login')guestLogin();
 if(a==='show-login')loginModal();
 if(a==='show-email-register')emailModal(true);
 if(a==='show-email-login')emailModal(false);
 if(a==='show-admin-login')loginModal(true);
 if(a==='logout'){hideAccountPopover();closeModal();doLogout();}
 if(a==='bonus')bonus();
 if(a==='go-cases'){closeModal();navigate('cases');}
 if(a==='inv-filter'){state.filter=t.dataset.filter;$$('#inventory-filters .filter-tab').forEach(x=>x.classList.toggle('active',x.dataset.filter===state.filter));renderInventoryGrid();}
 if(a==='sell-item')sellItem(t.dataset.item);
 if(a==='sell-all')sellAll();
 if(a==='result-sell')sellItem(t.dataset.item,true);
 if(a==='support-open')openSupportTicket(t.dataset.ticket);
 if(a==='ticket-close')closeTicket(t.dataset.ticket);
 if(a==='copy-code'){navigator.clipboard?.writeText(t.dataset.code).then(()=>toast('Код скопирован')).catch(()=>toast('Код: '+t.dataset.code));}
 if(a==='admin-luck-select'){const form=$('#admin-luck-form');if(form){form.elements.userId.value=t.dataset.user;form.elements.caseLuck.value=t.dataset.caseLuck;form.elements.upgradeLuck.value=t.dataset.upgradeLuck;form.scrollIntoView({behavior:'smooth',block:'center'});}}
 if(a==='admin-select'){const el=$('#admin-target');if(el){el.value=t.dataset.user;el.scrollIntoView({behavior:'smooth',block:'center'});el.focus();}}
});
document.addEventListener('submit',e=>{if(e.target.id==='admin-login')adminLogin(e);if(e.target.id==='admin-balance-form')changeBalance(e);if(e.target.id==='admin-luck-form')changeLuck(e);if(e.target.id==='email-register')emailAuth(e,true);if(e.target.id==='email-login')emailAuth(e,false);if(e.target.id==='promo-redeem-form')redeemPromo(e);if(e.target.id==='support-create-form')createTicket(e);if(e.target.id==='support-reply-form')replyTicket(e);});
document.addEventListener('change',e=>{
 if(e.target.id==='inventory-sort'){state.sort=e.target.value;renderInventoryGrid();}
 if(e.target.id==='upgrade-range'){state.upgradeRange=e.target.value;renderUpgradeUI();}
 if(e.target.id==='upgrade-min'){state.upgradeMin=e.target.value;renderUpgradeUI();}
 if(e.target.id==='upgrade-max'){state.upgradeMax=e.target.value;renderUpgradeUI();}
 if(e.target.id==='upgrade-credit'||e.target.id==='credit-slider'){const v=Math.max(0,Math.min(state.user?.balance||0,Math.floor(Number(e.target.value)||0)));state.upgradeCredit=v;if(skin(state.upgradeTarget)?.price<=upgradeValue())state.upgradeTarget=null;renderUpgradeUI();}
});
let searchTimer;document.addEventListener('input',e=>{
 if(e.target.id==='admin-search'){clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadAdmin(e.target.value),250);}
 if(e.target.id==='upgrade-search'){state.upgradeSearch=e.target.value;const pos=e.target.selectionStart;renderUpgradeUI();$('#upgrade-search')?.focus();$('#upgrade-search')?.setSelectionRange(pos,pos);}
 if(e.target.id==='credit-slider'){const credit=$('#upgrade-credit');if(credit)credit.value=e.target.value;}
 if(e.target.id==='upgrade-credit'){const slider=$('#credit-slider');if(slider)slider.value=e.target.value;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!state.busy){hideAccountPopover();closeModal();}});
document.addEventListener('pointerdown',e=>{if($('#account-popover')&&!e.target.closest('#account-popover')&&!e.target.closest('#user-pill'))hideAccountPopover();});
document.addEventListener('error',e=>{const img=e.target;if(img.tagName==='IMG'&&!img.dataset.fallback){img.dataset.fallback='1';img.src=/knife|bayonet|karambit/i.test(img.alt)?'/assets/knife.svg':'/assets/weapon.svg';}},true);
window.addEventListener('hashchange',()=>{const p=location.hash.slice(1).split('/');if(p[0]==='case'&&getCase(p[1])){if(state.view!=='case'||state.caseId!==p[1])navigate('case',p[1],false);}else if(['home','cases','coins','inventory','upgrade','contracts','leaders','support','faq','admin'].includes(p[0])&&state.view!==p[0])navigate(p[0],null,false);});
const auth=new URL(location.href).searchParams.get('auth');if(auth){setTimeout(()=>toast('Steam не подтвердил вход. Попробуйте ещё раз.',true),900);history.replaceState(null,'',location.pathname+location.hash);}
bootstrap().then(()=>{
 let tries=0;const refresher=setInterval(async()=>{
  tries++;
  if(tries>4){clearInterval(refresher);return;}
  if(state.data?.skins?.filter(x=>x.image).length>40){clearInterval(refresher);return;}
  try{const fresh=await api('/api/bootstrap');const was=state.data.skins.filter(x=>x.image).length;const current=fresh.skins.filter(x=>x.image).length;
   if(current>was){state.data=fresh;renderFeed();if(['home','cases','case'].includes(state.view)&&!state.busy)renderCurrent();if(current>45)clearInterval(refresher);}}
  catch{}
 },7000);
}).catch(e=>{$('#view').innerHTML=`<div class="empty-state"><div class="empty-icon">⚠</div><h3>НЕТ СВЯЗИ С СЕРВЕРОМ</h3><p>${esc(e.message)}. Проверь, что сервер запущен командой npm start, и открой сайт через localhost.</p></div>`;});
// The count shown is the server's registered account count, not fabricated concurrent users.
})();
