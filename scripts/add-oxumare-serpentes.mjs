import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GPC-OXM-SER-002',slug='gpc-oxm-ser-002';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['215543','215601','215606','215619','215623'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia de Cristais de Oxumaré',category:'Guias de Cristais',categoryKey:'cristais',line:'Cristal',badge:'Guia de Cristais',path:`/guias-cristal/${slug}/`,price:'R$ 99,90',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia de Cristais de Oxumaré nas cores do arco-íris, preto e amarelo, com serpentes douradas',photoStatus:'Foto fornecida',inspiration:'Oxumaré',highlights:'Arco-íris · Preto e amarelo · Serpentes douradas',measure:'Confirme a medida no orçamento',structure:'Um fio com seções multicoloridas e pingentes',materials:'Cristais facetados coloridos, pretos e amarelos, entremeios dourados e detalhes com brilho.',finishes:'Pingente central e pingentes laterais em formato de serpente, com acabamento dourado; firma amarela e preta.',lead:'Guia de cristais de Oxumaré com as cores do arco-íris, seções em preto e amarelo e serpentes douradas. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'As cores do arco-íris em uma composição de cristais.',story:['Cristais facetados em cores variadas formam sequências multicoloridas, intercaladas com seções em preto e amarelo. Entremeios dourados valorizam as transições.','Uma serpente dourada finaliza o centro da guia. Dois pingentes laterais de serpente e uma firma em amarelo e preto completam o acabamento.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-oxumare-serpentes.json',JSON.stringify({sku:code,photos},null,2)+'\n');
