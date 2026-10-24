(() => {
 const status=document.querySelector('#tracking-status');
 const key='ijexa-disable-tracking';
 const refresh=()=>{try{status.textContent=localStorage.getItem(key)==='true'?'Medição desativada neste navegador.':'Medição permitida neste navegador.';}catch{status.textContent='O navegador não permite salvar esta preferência.';}};
 document.querySelector('#tracking-disable').addEventListener('click',()=>{
  try{localStorage.setItem(key,'true');}catch{refresh();return;}
  const names=document.cookie.split(';').map(v=>v.trim().split('=')[0]).filter(v=>/^_ga($|_)|^_gcl_/.test(v));
  const hosts=[location.hostname,'.'+location.hostname];
  if(location.hostname.endsWith('.contasdeijexa.com.br'))hosts.push('.contasdeijexa.com.br');
  for(const name of names){document.cookie=`${name}=; Max-Age=0; Path=/`;for(const host of hosts)document.cookie=`${name}=; Max-Age=0; Path=/; Domain=${host}`;}
  location.reload();
 });
 document.querySelector('#tracking-enable').addEventListener('click',()=>{try{localStorage.removeItem(key);location.reload();}catch{refresh();}});
 refresh();
})();
