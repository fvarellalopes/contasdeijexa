import fs from 'node:fs';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const slug='gpr-mpa-001',code='GPR-MPA-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const images=[];
for(const [i,t] of ['224156','224210','224217'].entries()){
 const original=fs.readFileSync(`/workspace/scratch/2f60f8e06fc6/upload/image(20261021-${t}).png`),name=i?'foto-'+(i+1):'capa',to=`/assets/products/${slug}/${name}.webp`;
 fs.writeFileSync(`data/original-photos/${slug}/${name}.png`,original);await sharp(original).webp({lossless:true,effort:4}).toFile('dist'+to);
 assert((await sharp(original).ensureAlpha().raw().toBuffer()).equals(await sharp('dist'+to).ensureAlpha().raw().toBuffer()));images.push(to);
}
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Maria Padilha',category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${slug}/`,price:'R$ 149,90',cover:images[0],images,alt:'Guia Premium Maria Padilha vermelha, preta e dourada com rosas, cruz e leque',photoStatus:'Foto fornecida',inspiration:'Maria Padilha',highlights:'Vermelho, preto e dourado · Rosas · Cruz e leque',measure:'Confirme a medida no orçamento',structure:'Um fio de contas com elementos decorativos e pingentes',materials:'Contas vermelhas, pretas e douradas, rosas vermelhas, entremeios trabalhados e elementos com brilho.',finishes:'Cruz dourada com rosa vermelha, pingentes de leque e tridente com rosa, firma vermelha com símbolo preto.',lead:'Guia Premium Maria Padilha em vermelho, preto e dourado, com rosas, detalhes com brilho e pingentes de cruz, leque e tridente. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',story:['Contas vermelhas e pretas se alternam com elementos dourados, rosas e detalhes com brilho. Uma sequência de elementos vermelhos em molduras douradas destaca uma das laterais.','A cruz dourada com rosa vermelha acompanha os pingentes de leque e tridente com rosa. A firma vermelha traz um símbolo preto.'],availability:'https://schema.org/OnlineOnly'});
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
