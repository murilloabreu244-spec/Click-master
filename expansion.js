/* Click Master v1.4.0: pets, gemas, sorte temporária e elo. */
(function(){
'use strict';
const KEY='clickMaster.expansion.v1', $=id=>document.getElementById(id);
const pets=[
 {name:'Pip',icon:'🐣',rarity:'Comum',mult:1.05,weight:50},
 {name:'Foxbit',icon:'🦊',rarity:'Raro',mult:1.2,weight:27},
 {name:'Dragão Pixel',icon:'🐉',rarity:'Épico',mult:1.5,weight:14},
 {name:'Fênix Dourada',icon:'🔥',rarity:'Lendário',mult:2,weight:6},
 {name:'Guardião Celeste',icon:'🌌',rarity:'Divino',mult:3,weight:2.5},
 {name:'???',icon:'👁️',rarity:'Secreto',mult:5,weight:.5}
];
let data={gems:0,collection:[],equipped:[],clicksAtGem:0,luckUntil:0,permanent:1};
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
 if(saved&&typeof saved==='object'&&!Array.isArray(saved)) data={...data,...saved};
}catch{}
if(!Number.isFinite(data.gems)||data.gems<0)data.gems=0;
if(!Array.isArray(data.collection))data.collection=[];
if(!Array.isArray(data.equipped))data.equipped=[];
data.equipped=data.equipped.filter(id=>data.collection.some(p=>p&&p.id===id)).slice(0,3);
if(!Number.isFinite(data.clicksAtGem)||data.clicksAtGem<0)data.clicksAtGem=0;
if(!Number.isFinite(data.luckUntil))data.luckUntil=0;
if(!Number.isFinite(data.permanent)||data.permanent<1)data.permanent=1;
const fmt=n=>window.GameStats?GameStats.format(n):Math.floor(n).toLocaleString('pt-BR');
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}
 render();
 if(window.GameCore&&typeof window.GameCore.render==='function'){
   window.GameCore.render();
 }
}
function multiplier(){let m=Number.isFinite(data.permanent)&&data.permanent>=1?data.permanent:1;for(const id of data.equipped){const p=data.collection.find(x=>x&&x.id===id);if(p&&Number.isFinite(p.mult)&&p.mult>0)m*=p.mult}if(Date.now()<data.luckUntil)m*=2;return Number.isFinite(m)&&m>0?m:1}
function elo(){const s=window.GameCore?.getPublicState()?.score||0;return s>=1e7?'Supremo':s>=1e6?'Diamante':s>=1e5?'Ouro':s>=1e4?'Prata':'Bronze'}
function eloDescription(){const s=window.GameCore?.getPublicState()?.score||0;const tiers=[{name:'Bronze',min:0,next:1e4},{name:'Prata',min:1e4,next:1e5},{name:'Ouro',min:1e5,next:1e6},{name:'Diamante',min:1e6,next:1e7},{name:'Supremo',min:1e7,next:Infinity}];const i=tiers.findIndex(t=>s>=t.min&&s<t.next);const t=tiers[Math.max(0,i)];return t.next===Infinity?'Elo máximo · '+fmt(s)+' pontos':'Próximo elo: '+tiers[i+1].name+' · faltam '+fmt(t.next-s)+' pontos'}
function render(){
 const g=$('gems-display');if(g)g.textContent=fmt(data.gems);
 const e=$('pets-equipped');if(e)e.textContent=data.equipped.length+'/3';
 const m=$('pet-multiplier');if(m)m.textContent='×'+multiplier().toFixed(2).replace('.',',');
 const rank=$('elo-name');if(rank)rank.textContent=elo();
 const desc=$('elo-description');if(desc)desc.textContent=eloDescription();
 const host=$('pet-collection');if(host){host.replaceChildren();if(!data.collection.length){const p=document.createElement('p');p.className='muted small';p.textContent='Choque um ovo para encontrar pets.';host.append(p)}data.collection.forEach(pet=>{const row=document.createElement('div');row.className='pet-row';const info=document.createElement('span');info.textContent=pet.icon+' '+pet.name+' · '+pet.rarity+' · ×'+pet.mult;const b=document.createElement('button');b.textContent=data.equipped.includes(pet.id)?'Desequipar':'Equipar';b.disabled=!data.equipped.includes(pet.id)&&data.equipped.length>=3;b.addEventListener('click',()=>{if(data.equipped.includes(pet.id))data.equipped=data.equipped.filter(x=>x!==pet.id);else data.equipped.push(pet.id);save()});row.append(info,b);host.append(row)})}
}
function hatch(premium){const cost=premium?0:500;if(premium){if(data.gems<10){$('egg-result').textContent='Você precisa de 10 gemas.';return}data.gems-=10}else if(!window.GameCore?.spendPoints(cost)){$('egg-result').textContent='Pontos insuficientes para chocar este ovo.';return}
 let pool=pets;if(premium)pool=pets.filter(p=>['Raro','Épico','Lendário','Divino','Secreto'].includes(p.rarity));
 if(Date.now()<data.luckUntil)pool=pool.filter(p=>p.rarity!=='Comum');
 let total=pool.reduce((a,p)=>a+p.weight,0),r=Math.random()*total,pick=pool[0];for(const p of pool){r-=p.weight;if(r<=0){pick=p;break}}
 const pet={...pick,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};data.collection.push(pet);
 const out=$('egg-result');if(out)out.textContent='Encontrado: '+pet.icon+' '+pet.name+' ('+pet.rarity+') · multiplicador ×'+pet.mult;
 save();
}
function init(){
 $('open-egg')?.addEventListener('click',()=>hatch(false));$('open-gem-egg')?.addEventListener('click',()=>hatch(true));
 $('buy-luck')?.addEventListener('click',()=>{if(data.gems<5){$('gem-message').textContent='Você precisa de 5 gemas.';return}data.gems-=5;data.luckUntil=Date.now()+60000;$('gem-message').textContent='Sorte ×2 ativada por 60 segundos!';save()});
 $('buy-permanent')?.addEventListener('click',()=>{if(data.gems<25){$('gem-message').textContent='Você precisa de 25 gemas.';return}data.gems-=25;data.permanent=(data.permanent||1)+.1;$('gem-message').textContent='Multiplicador permanente aumentado!';save()});
 setInterval(()=>{const s=window.GameCore?.getPublicState();if(!s)return;const milestone=Math.floor(s.clicks/100);if(milestone>data.clicksAtGem){data.gems+=(milestone-data.clicksAtGem)*5;data.clicksAtGem=milestone;save()}render()},2000);
 render();
}
function getSaveData(){return JSON.parse(JSON.stringify(data))}
function loadSaveData(saved){if(!saved||typeof saved!=='object'||Array.isArray(saved))throw new Error('Dados de gemas/pets inválidos');data={...data,...saved};data.gems=Number.isFinite(data.gems)&&data.gems>=0?data.gems:0;data.collection=Array.isArray(data.collection)?data.collection.filter(p=>p&&typeof p.id==='string'&&Number.isFinite(p.mult)&&p.mult>0):[];data.equipped=Array.isArray(data.equipped)?data.equipped.filter(id=>data.collection.some(p=>p.id===id)).slice(0,3):[];data.clicksAtGem=Number.isFinite(data.clicksAtGem)&&data.clicksAtGem>=0?data.clicksAtGem:0;data.luckUntil=Number.isFinite(data.luckUntil)?data.luckUntil:0;data.permanent=Number.isFinite(data.permanent)&&data.permanent>=1?data.permanent:1;save()}
window.GameExpansion={multiplier,render,getSaveData,loadSaveData};document.addEventListener('DOMContentLoaded',init);
})();
