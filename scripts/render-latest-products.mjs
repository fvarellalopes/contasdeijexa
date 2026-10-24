import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {escapeHtml as esc} from './page-layout.mjs';
const files=['dist/assets/products.js','dist/assets/adornments.js'];
const parse=s=>JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;$/,''));
const key=p=>p.code||p.path||p.slug;
const snapshot=(revision,file)=>{try{return parse(execFileSync('git',['show',`${revision}:${file}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{return [];}};
const live=files.flatMap(file=>parse(fs.readFileSync(file,'utf8'))),byKey=new Map(live.map(p=>[key(p),p]));
const found=[];
const add=(p,commit)=>{if(byKey.has(key(p))&&!found.some(x=>x.key===key(p)))found.push({key:key(p),commit});};
// Inclui novas peças ainda não commitadas; uma alteração de foto ou preço não muda sua posição.
for(const file of files){const previous=new Set(snapshot('HEAD',file).map(key));parse(fs.readFileSync(file,'utf8')).filter(p=>!previous.has(key(p))).reverse().forEach(p=>add(p,'working-tree'));}
const commits=execFileSync('git',['log','--format=%H','--',...files],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const commit of commits){
 for(const file of files){const previous=new Set(snapshot(commit+'^',file).map(key));snapshot(commit,file).filter(p=>!previous.has(key(p))).reverse().forEach(p=>add(p,commit));}
 if(found.length>=10)break;
}
const latest=found.slice(0,10).map(item=>({...item,product:byKey.get(item.key)}));
if(latest.length!==10)throw new Error('Não foi possível identificar as dez inclusões mais recentes.');
fs.writeFileSync('data/latest-product-additions.json',JSON.stringify({method:'Primeira inclusão nos registros de produtos do Git, commits mais recentes primeiro. No mesmo lote, ordem inversa de inclusão no catálogo. Alterações de fotos e preços não contam como novas inclusões.',products:latest.map(({key,commit,product:p})=>({code:key,addedInCommit:commit,name:p.name,path:p.path||`/${p.slug}/`}))},null,2)+'\n');
const image=p=>{const value=p.cover||(p.file?'/assets/adornments/'+p.file:'');return /^(https?:\/\/|\/)/.test(value)?value:`https://lh3.googleusercontent.com/d/${value}=w1600`;};
const route=p=>p.path||(p.slug.startsWith('gpc-')?`/guias-cristal/${p.slug}/`:`/${p.slug}/`);
const arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const cards=latest.map(({product:p})=>`<article class="product-card launch-card"><a class="product-image" href="${route(p)}" aria-label="Ver ${esc(p.name)}"><img src="${esc(image(p))}" alt="${esc(p.alt||p.name)}" loading="lazy" width="600" height="750"></a><div class="card-copy"><span class="badge">${esc(p.line||p.category||'Peça artesanal')}</span><h3 title="${esc(p.name)}">${esc(p.name)}</h3><p>${esc(p.highlights||p.description||'Artesanal · Sob encomenda')}</p><div class="card-bottom"><strong>${esc(p.price||'Sob consulta')}</strong><a class="launch-product-link" href="${route(p)}" aria-label="Ver modelo: ${esc(p.name)}">Ver modelo ${arrow}</a></div></div></article>`).join('');
const section=`<!-- latest-products:start --><section class="launches" id="lancamentos" aria-labelledby="launch-title"><div class="section-heading"><div><p class="eyebrow">Acabaram de chegar ao catálogo</p><h2 id="launch-title">Lançamentos</h2></div><div class="launch-heading-side"><p>As dez peças adicionadas mais recentemente.<br>Novas composições para conhecer de perto.</p><div class="launch-controls" role="group" aria-label="Navegar pelos lançamentos"><button type="button" data-launch-scroll="previous" aria-label="Ver lançamentos anteriores" aria-controls="launch-track" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" data-launch-scroll="next" aria-label="Ver próximos lançamentos" aria-controls="launch-track"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div></div></div><div class="launch-track" id="launch-track" tabindex="0" role="region" aria-label="Dez lançamentos, em ordem de inclusão mais recente">${cards}</div></section><!-- latest-products:end -->`;
let home=fs.readFileSync('dist/index.html','utf8');
if(home.includes('<!-- latest-products:start -->'))home=home.replace(/<!-- latest-products:start -->[\s\S]*?<!-- latest-products:end -->/,section);
else home=home.replace(/(<section class="catalog highlights")/,section+'$1');
if(!home.includes('id="launch-track"'))throw new Error('Área de inserção dos lançamentos não encontrada.');
if(!home.includes('src="/assets/home-latest.js"'))home=home.replace('</body>','<script src="/assets/home-latest.js" defer></script></body>');
fs.writeFileSync('dist/index.html',home);
console.log('Lançamentos: dez últimas inclusões reais, com carrossel de cinco cards no desktop.');
