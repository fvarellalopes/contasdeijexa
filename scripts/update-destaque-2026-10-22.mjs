import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const products=c.window.CATALOG_PRODUCTS;
const template=products.find(p=>p.code==='CAT-OXU-DES-001');
const rows=[
 ['165822','GP-XAN-MIX-60-SH2','Xangô','Miçangas em tons de vermelho e marrom, contas facetadas em tons de âmbar e pingente dourado.','Pingente dourado central e firma marrom.'],
 ['165838','CAT-7LU-DES-001','7 Linhas da Umbanda','Miçangas brancas com detalhes em várias cores, contas maiores brancas e medalhão multicolorido.','Medalhão central das 7 Linhas e firma branca.'],
 ['165851','CAT-OXO-DES-001','Oxóssi (Verde e Branco)','Miçangas verdes e brancas com detalhes transparentes e pingente de arco e flecha.','Pingente prateado de arco e flecha e firma verde.'],
 ['165904','CAT-LGN-DES-001','Logunan','Miçangas azuis e brancas, contas cinzentas e transparentes, com pingente central em tom escuro.','Pingente central em tom escuro e firma azul.'],
 ['165912','CAT-ZEP-DES-001','Zé Pilintra','Miçangas vermelhas e brancas com pequenos detalhes pretos e medalha central de Zé Pilintra.','Medalha de Zé Pilintra e firma vermelha.'],
 ['165922','CAT-POM-DES-001','Pombagira','Miçangas pretas e vermelhas com detalhes brancos, contas facetadas e pingente central.','Pingente central prateado e firma preta.'],
 ['165931','CAT-CAB-DES-001','Caboclo','Miçangas verdes, vermelhas e brancas, contas facetadas e pingente de arco e flecha.','Pingente prateado de arco e flecha e firma verde.'],
 ['165940','CAT-7LU-CR-DES-001','7 Linhas da Umbanda (Miçanga Cristal)','Miçangas em cristal com detalhes coloridos, contas brancas e medalhão multicolorido.','Medalhão central das 7 Linhas e firma branca.'],
 ['170024','CAT-ZEP-3P-DES-001','Zé Pilintra — 3 Pingentes','Miçangas vermelhas, brancas e pretas, contas facetadas e três pingentes no centro da peça.','Três pingentes centrais e firma vermelha.']
];
const mapping=[];
for(const [time,code,label,description,finishes] of rows){
 let p=products.find(p=>p.code===code);
 if(!p){p={...structuredClone(template),code,slug:code.toLowerCase(),name:`Guia de Proteção de ${label} — Destaque`,inspiration:label,images:[]};delete p.source;p.path=`/guias-micangas/${p.slug}/`;products.push(p);}
 const source=`image(20261022-${time}).png`;
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/${source}`);
 fs.mkdirSync(`data/original-photos/${p.slug}`,{recursive:true});fs.writeFileSync(`data/original-photos/${p.slug}/capa-20261022.png`,original);
 const cover=`/assets/products/${p.slug}/capa-20261022.webp`;
 fs.mkdirSync(`dist/assets/products/${p.slug}`,{recursive:true});
 await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+cover);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+cover).ensureAlpha().raw().toBuffer()));
 Object.assign(p,{line:'Destaque',badge:'Linha Destaque',cover,images:[cover],photoStatus:'Foto fornecida',alt:`${p.name}. ${description}`,highlights:description,materials:description,finishes,lead:`${p.name}. ${description} Peça artesanal sob encomenda, enviada sem cruzamento e sem consagração.`,storyTitle:'Composição e acabamento em cada detalhe.',story:[description,finishes]});
 if(code==='CAT-ZEP-3P-DES-001')p.price='R$ 59,90';
 mapping.push({code,name:p.name,price:p.price,path:p.path,source,cover,originalSha256:createHash('sha256').update(original).digest('hex'),losslessPixelEquality:true});
}
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync('data/destaque-update-2026-10-22.json',JSON.stringify({products:mapping,pending:[{name:'Oxalá — Destaque',reason:'Foto não recebida; usuário confirmou que a última é Zé Pilintra — 3 Pingentes.'}]},null,2)+'\n');
console.log(mapping.map(p=>`${p.code}: ${p.name} — ${p.price}`).join('\n'));
