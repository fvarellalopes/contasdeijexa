import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='gpc-exu-bel-001',code='GPC-EXU-BEL-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['224328','224338','224342'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+to);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+to).ensureAlpha().raw().toBuffer()));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia de Cristais Exu Belzebu',category:'Guia de Cristais',categoryKey:'cristais',line:'Guia de Cristais',badge:'Cristais',path:`/guias-cristal/${slug}/`,price:'R$ 99,90',cover:images[0],images,alt:'Guia de Cristais Exu Belzebu preta e vermelha com pingente de caveira com chifres',photoStatus:'Foto fornecida',inspiration:'Exu Belzebu',highlights:'Preto e vermelho · Cristais facetados · Caveira com chifres',measure:'Confirme a medida no orçamento',structure:'Um fio de cristais com pingente central',materials:'Cristais facetados pretos e vermelhos e firma preta.',finishes:'Pingente de caveira com chifres em tom prateado escuro e olhos vermelhos.',lead:'Guia de Cristais Exu Belzebu em preto e vermelho, com cristais facetados e pingente de caveira com chifres. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['Cristais pretos facetados compõem o fio, intercalados com detalhes vermelhos.','O pingente de caveira com chifres tem olhos vermelhos e acabamento em tom prateado escuro. A firma preta completa a peça.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
