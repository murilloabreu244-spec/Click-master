/* Atualização centralizada dos elementos de estatísticas com multiplicador. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const fmt=n=>{
  if(!Number.isFinite(n))return '0';
  if(n<1000)return Math.floor(n).toLocaleString('pt-BR');
  const u=['K','M','B','T','QA','QI','SX','SP','OC','NO','DC'];
  let i=-1;
  while(n>=1000&&i<u.length-1){n/=1000;i++}
  return (n>=100? n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace('.',',')+u[i]
};

window.GameStats={
  format:fmt,
  render(s){
    if(!$('score-display'))return;
    const petMult = (window.GameExpansion && typeof window.GameExpansion.multiplier==='function') 
      ? window.GameExpansion.multiplier() 
      : 1;
    const totalMult = petMult * (s.eventActive ? 1.5 : 1);

    $('score-display').textContent=fmt(s.score);
    $('cpc-display').textContent=fmt(s.cpc * totalMult);
    $('cps-display').textContent=fmt(s.cps * totalMult);
    $('stat-total-clicks').textContent=fmt(s.clicks);
    $('stat-eggs-common').textContent=fmt(s.eggs.common);
    $('stat-eggs-rare').textContent=fmt(s.eggs.rare);
    $('stat-eggs-legendary').textContent=fmt(s.eggs.legendary);
    $('stat-stacks').textContent=fmt(s.stackCount);
    $('stat-playtime').textContent=Math.floor(s.playSeconds)+'s';
    $('stat-best-click').textContent=fmt(s.bestClick);
    $('egg-progress-label').textContent=s.eggProgress+' / 25';
    $('egg-progress').style.width=(s.eggProgress/25*100)+'%';
    if($('multiplier-label')) $('multiplier-label').textContent='MULTIPLICADOR ×'+totalMult.toFixed(2).replace('.',',');
  }
};
})();
