import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='glx-boi-001',code='GLX-BOI-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['224112','224101','224105','224108','224049'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+to);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+to).ensureAlpha().raw().toBuffer()));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Luxo Boiadeiro',category:'Guia Luxo',categoryKey:'guias-luxo',line:'Guia Luxo',badge:'Guia Luxo',path:`/guias-luxo/${slug}/`,price:'R$ 199,00',cover:images[0],images,alt:'Guia Luxo Boiadeiro marrom e vermelha com sementes grandes, madeira e pingente de cabeça de boi',photoStatus:'Foto fornecida',inspiration:'Boiadeiro',highlights:'Cristais · Madeira e sementes naturais · Cabeça de boi',measure:'Confirme a medida no orçamento',structure:'Um fio principal com fio lateral de contas pequenas',materials:'Cristais, madeira e sementes naturais, conforme a apresentação enviada. Contas marrons, vermelhas e âmbar, elementos grandes arredondados e cilindros em tom natural.',finishes:'Pingente prateado de cabeça de boi com cordões marrons, ferradura e chapéu decorativos.',lead:'Guia Luxo Boiadeiro com cristais, madeira e sementes naturais, em tons terrosos e vermelho, com pingente de cabeça de boi. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['Contas marrons e sementes grandes compõem o fio principal, acompanhadas por detalhes vermelhos e âmbar. Um fio lateral de contas pequenas acrescenta textura.','A cabeça de boi prateada com cordões marrons finaliza o centro. Ferradura e chapéu decorativos completam a composição. A galeria inclui a apresentação enviada.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
