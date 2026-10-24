import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GPR-EXU-TRA-001',slug='gpr-exu-tra-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['215947','215952','215954','215958','220001','220004','220009'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Exu Tranca Ruas',category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${slug}/`,price:'R$ 149,90',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia Premium Exu Tranca Ruas em preto, vermelho e dourado, com medalhas e pingentes',photoStatus:'Foto fornecida',inspiration:'Exu Tranca Ruas',highlights:'Preto e vermelho · Medalhas · Pingentes dourados',measure:'Confirme a medida no orçamento',structure:'Um fio com contas facetadas e elementos decorativos',materials:'Contas facetadas pretas, vermelhas e douradas, medalhas, firma decorativa e pingentes com acabamento dourado.',finishes:'Pingentes de tridente, cadeado e Exu; medalhas com representação de Exu e firma preta com detalhe vermelho.',lead:'Guia Premium Exu Tranca Ruas com contas pretas facetadas, pontos em vermelho e dourado, medalhas e pingentes. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Contraste em preto, vermelho e dourado.',story:['Contas pretas facetadas formam a base da composição, intercaladas a contas vermelhas e douradas que destacam o ritmo da peça.','Medalhas com representação de Exu e uma firma preta com detalhe vermelho complementam a guia. Os pingentes de tridente, cadeado e Exu finalizam a composição em dourado.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-tranca-ruas-premium.json',JSON.stringify({sku:code,photos},null,2)+'\n');
