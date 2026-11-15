import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {SKINS,CASES,RARITIES,getCaseStats}=require('../catalog.js');
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const boot=source.lastIndexOf('\nbootstrap().then(');
assert.ok(boot>=0);
const scripted=source.slice(0,boot)+`\nglobalThis.__app={state,renderHome,renderCases,renderCoins,renderUpgradeUI,renderInventory,renderCaseDetail,renderContractsUI};\n})();`;
function makeFakeDom(){const elements=new Map();const document={querySelector:sel=>{
 if(!elements.has(sel))elements.set(sel,{innerHTML:'',textContent:'',style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},disabled:false,addEventListener(){},value:'',focus(){}});
 return elements.get(sel);
},querySelectorAll:()=>[],addEventListener(){},body:{style:{}}};return {document,elements};}
test('all main views render their HTML templates without frontend runtime errors',async()=>{
 const {document,elements}=makeFakeDom();const context=vm.createContext({document,window:{addEventListener(){},scrollTo(){}},location:{hash:'#home',href:'http://localhost:3000',pathname:'/'},history:{replaceState(){}},console,setTimeout(){},setInterval(){},performance:{now(){return 0;}},requestAnimationFrame(){},URL,crypto});
 vm.runInContext(scripted,context,{timeout:2000});
 const {state,renderHome,renderCases,renderCoins,renderUpgradeUI}=context.__app;
 state.data={skins:SKINS,cases:CASES.map(c=>({...c,coverImage:c.image,...getCaseStats(c)})),rarities:RARITIES,totals:{opens:0,players:1}};
 state.user={id:'guest:test',name:'Player',coins:40,balance:1500,caseLuck:100,upgradeLuck:100};
 state.csrf='test';
 assert.match(renderHome(),/ТВОЙ ДРОП/);assert.match(renderCases(),/КОЛЛЕКЦИЯ/);
 const coinHtml=renderCoins();assert.match(coinHtml,/ЗА МОНЕТЫ/);assert.equal((coinHtml.match(/class="case-card"/g)||[]).length,8);
 state.profile={inventory:[{id:1,skinId:'ak-slate',skinName:'AK-47 | Slate',rarity:'blue',price:58,wear:'Factory new'},{id:2,skinId:'ak-redline',skinName:'AK-47 | Redline',rarity:'pink',price:185,wear:'Factory new'}]};
 state.upgradeSources=[1,2];state.upgradeCredit=30;state.upgradeTarget='awp-asiimov';
 renderUpgradeUI();
 const markup=elements.get('#view').innerHTML;
 assert.match(markup,/source-slot/);assert.match(markup,/МОЖНО ДОБАВИТЬ ЕЩЁ 4/);assert.match(markup,/ПЛАВНЫЙ/);
 assert.match(markup,/ПРОКАЧАТЬ ПРЕДМЕТЫ/);assert.match(markup,/6 сек/);assert.match(markup,/ДОБАВИТЬ БАЛАНС/);
});
