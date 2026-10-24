import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),ctx);
const products=ctx.window.CATALOG_PRODUCTS;
const rows=[
 ['171014','CAT-EXU-POM-ESS-001','Essencial','Linha da Esquerda — Exu e Pombagira','Miçangas vermelhas e pretas em sequências alternadas, com firma preta.','Sem pingente no modelo fotografado; acabamento com firma preta.'],
 ['171046','CAT-7LU-ESS-001','Essencial','7 Linhas da Umbanda','Miçangas em várias cores, organizadas em grupos ao longo do fio, com firma branca.','Sem pingente no modelo fotografado; acabamento com firma branca.'],
 ['171056','CAT-CIG-RUB-DES-001','Destaque','Cigana Rubi','Miçangas e contas facetadas em vermelho e tons de âmbar, com detalhes dourados e pingente central.','Pingente com rosa vermelha e detalhe dourado; firma dourada.'],
 ['171106','CAT-BOI-DES-001','Destaque','Boiadeiro','Miçangas e contas em vermelho, amarelo e preto, com detalhes facetados e medalha central.','Medalha central prateada e firma vermelha.'],
 ['171112','CAT-OXA-DES-001','Destaque','Oxalá','Miçangas brancas e contas transparentes, com contas brancas maiores e medalha central.','Medalha central prateada e firma branca.'],
 ['171120','CAT-BAI-DES-001','Destaque','Baiano','Miçangas e contas verdes, amarelas, vermelhas e pretas, com detalhes facetados e pingente central.','Pingente central dourado e firma preta.']
];
const mapping=[];
for(const [time,code,line,label,description,finishes] of rows){
 const template=products.find(p=>p.code===(line==='Essencial'?'CAT-NAN-ESS-001':'CAT-OXU-DES-001'));
 let p=products.find(p=>p.code===code);
 if(!p){p={...structuredClone(template),code,slug:code.toLowerCase(),path:`/guias-micangas/${code.toLowerCase()}/`};delete p.source;products.push(p);}
 const source=`image(20261022-${time}).png`;
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/${source}`);
 fs.mkdirSync(`data/original-photos/${p.slug}`,{recursive:true});fs.writeFileSync(`data/original-photos/${p.slug}/capa.png`,original);
 const cover=`/assets/products/${p.slug}/capa.webp`;
 fs.mkdirSync(`dist/assets/products/${p.slug}`,{recursive:true});await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+cover);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+cover).ensureAlpha().raw().toBuffer()));
 const name=`Guia de Proteção — ${label} — ${line}`;
 Object.assign(p,{name,inspiration:label,line,badge:`Linha ${line}`,price:template.price,cover,images:[cover],photoStatus:'Foto fornecida',alt:`${name}. ${description}`,highlights:description,materials:description,finishes,lead:`${name}. ${description} Peça artesanal sob encomenda, enviada sem cruzamento e sem consagração.`,storyTitle:'Composição e acabamento em cada detalhe.',story:[description,finishes]});
 mapping.push({code,name,line,price:p.price,path:p.path,source,cover,originalSha256:createHash('sha256').update(original).digest('hex'),losslessPixelEquality:true});
}
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync('data/essencial-destaque-lote2-2026-10-22.json',JSON.stringify({products:mapping,resolvedPending:'Oxalá — Destaque: foto recebida em image(20261022-171112).png.'},null,2)+'\n');
const prior='data/destaque-update-2026-10-22.json';const previous=JSON.parse(fs.readFileSync(prior));previous.pending=[];previous.resolvedPending={name:'Oxalá — Destaque',code:'CAT-OXA-DES-001',source:'image(20261022-171112).png'};fs.writeFileSync(prior,JSON.stringify(previous,null,2)+'\n');
console.log(mapping.map(p=>`${p.code}: ${p.name} — ${p.price}`).join('\n'));
