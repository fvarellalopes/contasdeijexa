/* Busca local: palavras em qualquer ordem, flexões e relações de descoberta. */
(() => {
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/pomba\s+gira/g,'pombagira').replace(/(\d+)\s*mm\b/g,'$1mm').replace(/[^a-z0-9]+/g,' ').trim();
 const stop=new Set(['de','da','do','das','dos','e','em','para','com','a','o','as','os']);
 const singular={guias:'guia',fios:'fio',contas:'conta',colares:'colar',cordoes:'cordao',brajas:'braja',joias:'joia',patuas:'patua',cristais:'cristal',micangas:'micanga',orixas:'orixa',ileques:'ileque',ilekes:'ileke',deloguns:'delogun',diloguns:'dilogun',laguidibas:'laguidiba'};
 const words=value=>normalize(value).split(/\s+/).filter(w=>w&&!stop.has(w)).map(w=>singular[w]||w);
 // Estas relações ampliam resultados; não definem equivalências de culto.
 const groups=[['oxala','oxaguia','osaguia','osaguian','oxaguian','oxaguiao','oxalufa','oxalufan','oxalufon'],['oxossi','ode'],['ossain','ossaim','osain'],['omolu','omulu','obaluaie','obaluae','obaluaye','obaluaiye','obaluaio'],['iemanja','yemanja','yemoja'],['iansa','oya'],['xango','sango'],['logunede','logun','logumede'],['ileke','ileque','guia','fio','colar','cordao']];
 const expand=word=>groups.find(g=>g.includes(word))||[word];
 const route=p=>p.path||(p.slug.startsWith('gpc-')?`/guias-cristal/${p.slug}/`:`/${p.slug}/`);
 const index=p=>{
  const name=new Set(words(p.name));
  const isNecklace=name.has('guia')||name.has('braja');
  const generic=isNecklace?'fio conta colar cordao guia ileque ileke':'';
  return {product:p,name,terms:new Set(words([p.name,p.code,p.category,p.line,p.categoryKey,p.inspiration,p.highlights,p.materials,generic].filter(Boolean).join(' ')))};
 };
 function search(products,query){
  const tokens=[...new Set(words(query))];
  if(!tokens.length)return [];
  return products.map(index).map(entry=>{
   let score=0,related=false;
   for(const token of tokens){
    if(entry.name.has(token)){score+=100;continue;}
    if(entry.terms.has(token)){score+=20;continue;}
    if(expand(token).some(t=>entry.terms.has(t))){score+=15;related=true;continue;}
    if(['ossain','ossaim','osain'].includes(token)&&['oxossi','ode'].some(t=>entry.terms.has(t))){score+=5;related=true;continue;}
    return null;
   }
   if(normalize(entry.product.name).includes(normalize(query)))score+=30;
   return {...entry.product,score,related};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||Number(!!b.cover)-Number(!!a.cover)||a.name.localeCompare(b.name,'pt-BR'));
 }
 window.CATALOG_SEARCH={normalize,words,search,route};
})();
