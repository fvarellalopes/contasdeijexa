import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='gpr-cab-cobra-001',code='GPR-CAB-COBRA-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['223927','223920','223923','223931','223916'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:6}).toFile('dist'+to);
 const a=await sharp(original).ensureAlpha().raw().toBuffer(),b=await sharp('dist'+to).ensureAlpha().raw().toBuffer();assert(a.equals(b));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Caboclo Cobra Coral (Em Porcelana)',category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${slug}/`,price:'R$ 109,90',cover:images[0],images,alt:'Guia Premium Caboclo Cobra Coral vermelha, preta e branca com pingente dourado de serpente',photoStatus:'Foto fornecida',inspiration:'Caboclo Cobra Coral',highlights:'Porcelana · Cristais e Murano · Serpente',measure:'Confirme a medida no orçamento',structure:'Um fio de contas com pingente central',materials:'Porcelana, cristais e Murano, conforme a apresentação enviada. Contas vermelhas, pretas e brancas, com elementos facetados e decorados.',finishes:'Pingente dourado de serpente e firma preta.',lead:'Guia Premium Caboclo Cobra Coral em porcelana, cristais e Murano, com contas vermelhas, pretas e brancas e pingente dourado de serpente. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['O vermelho se alterna com grupos de contas pretas e brancas. Elementos decorados e contas facetadas marcam os detalhes da composição.','O pingente dourado de serpente finaliza o centro, com firma preta. A galeria inclui a arte de apresentação enviada.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
