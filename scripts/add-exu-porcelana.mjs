import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GPR-EXU-POR-001',slug='gpr-exu-por-001';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['220527','220537','220543','220559'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Exu (Em Porcelana)',category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${slug}/`,price:'R$ 149,90',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia Premium Exu em porcelana preta, com caveiras, búzios decorativos e pingentes prateados',photoStatus:'Foto fornecida',inspiration:'Exu',highlights:'Porcelana preta · Caveiras · Pingentes prateados',measure:'Confirme a medida no orçamento',structure:'Um fio com contas redondas e elementos decorativos',materials:'Contas de porcelana preta, contas facetadas, elementos decorativos em formato de caveira e búzio, entremeios e pingentes.',finishes:'Pingente central de tridente, acompanhado de chapéu e caixão com acabamento prateado; firma preta.',lead:'Guia Premium de Exu em porcelana preta, com caveiras, búzios decorativos e pingentes prateados. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Porcelana preta e detalhes em prata.',story:['Contas redondas de porcelana preta compõem a base da guia, com pequenos detalhes facetados e entremeios prateados.','Caveiras e elementos em formato de búzio destacam as laterais. Os pingentes de tridente, chapéu e caixão e a firma preta finalizam o conjunto.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-exu-porcelana.json',JSON.stringify({sku:code,photos},null,2)+'\n');
