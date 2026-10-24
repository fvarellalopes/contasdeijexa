import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='gpc-xan-mur-002',code='GPC-XAN-MUR-002';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['224029','224018','224022','224025','224015'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+to);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+to).ensureAlpha().raw().toBuffer()));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia em Cristais Xangô — Murano e Porcelana',category:'Guia de Cristais',categoryKey:'cristais',line:'Guia de Cristais',badge:'Cristais',path:`/guias-cristal/${slug}/`,price:'R$ 99,90',cover:images[0],images,alt:'Guia em Cristais Xangô marrom, branca e âmbar com pingente de machado duplo',photoStatus:'Foto fornecida',inspiration:'Xangô',highlights:'Cristais · Murano e porcelana · Machado duplo',measure:'Confirme a medida no orçamento',structure:'Um fio de contas com pingente central',materials:'Cristais, Murano e porcelana, conforme a apresentação enviada. Contas marrons, brancas e âmbar, com elementos facetados e decorados.',finishes:'Pingente de machado duplo em tom cobre com cabo claro e firma marrom.',lead:'Guia em Cristais Xangô com Murano e porcelana, em marrom, branco e âmbar, com pingente de machado duplo. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['Contas marrons facetadas se alternam com grupos de contas brancas e detalhes âmbar. Elementos maiores decorados pontuam as laterais.','O machado duplo em tom cobre destaca o centro, com firma marrom. A galeria inclui a apresentação enviada.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
