import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GLX-POM-001',slug='glx-pom-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['215817','215825','215829','215833','215837','215841','215848','215853'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Luxo Pombagira',category:'Guia Luxo',categoryKey:'guias-luxo',line:'Guia Luxo',badge:'Guia Luxo',path:`/guias-luxo/${slug}/`,price:'R$ 199,00',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia Luxo Pombagira com contas vermelhas e pretas, rosas vermelhas, coroas e tridente dourado',photoStatus:'Foto fornecida',inspiration:'Pombagira',highlights:'Rosas vermelhas · Coroas · Tridente dourado',measure:'Confirme a medida no orçamento',structure:'Um fio com contas facetadas e elementos decorativos',materials:'Contas facetadas vermelhas, pretas e douradas, rosas vermelhas, entremeios dourados e detalhes com strass.',finishes:'Rosa vermelha central com pingente de tridente dourado; rosas laterais, coroas e firma decorativa em vermelho e cristal.',lead:'Guia Luxo de Pombagira em vermelho, preto e dourado, com rosas, coroas e pingente de tridente. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Rosas vermelhas e acabamentos em dourado.',story:['Contas vermelhas facetadas predominam na composição, intercaladas a contas pretas e detalhes dourados. Rosas vermelhas e entremeios com brilho criam os pontos de destaque.','No centro, uma rosa vermelha conduz ao tridente dourado. Coroas, detalhes com strass e uma firma decorativa em vermelho e cristal completam a peça.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-pombagira-luxo.json',JSON.stringify({sku:code,photos},null,2)+'\n');
