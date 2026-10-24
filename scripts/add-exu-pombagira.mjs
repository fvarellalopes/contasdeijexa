import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='gpc-exu-pom-002',code='GPC-EXU-POM-002';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['224614','224627'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+to);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+to).ensureAlpha().raw().toBuffer()));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia de Cristais Exu/Pombagira',category:'Guia de Cristais',categoryKey:'cristais',line:'Guia de Cristais',badge:'Cristais',path:`/guias-cristal/${slug}/`,price:'R$ 99,90',cover:images[0],images,alt:'Guia de Cristais Exu e Pombagira vermelha e preta com medalhão dourado de tridentes',photoStatus:'Foto fornecida',inspiration:'Exu/Pombagira',highlights:'Preto e vermelho · Cristais facetados · Medalhão dourado',measure:'Confirme a medida no orçamento',structure:'Um fio de cristais com pingente central',materials:'Cristais facetados vermelhos e pretos e firma preta.',finishes:'Medalhão dourado com dois tridentes cruzados.',lead:'Guia de Cristais Exu/Pombagira com sequências vermelhas e pretas, cristais facetados e medalhão dourado de tridentes. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['Sequências de cristais vermelhos e pretos se alternam ao longo do fio. As facetas refletem a luz e destacam o contraste das cores.','Um medalhão dourado de tridentes cruzados marca o centro, com firma preta no fechamento.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
