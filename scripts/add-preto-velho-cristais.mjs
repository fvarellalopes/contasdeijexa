import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GPC-PV-CR-002',slug='gpc-pv-cr-002';assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['220342','220348','220359','220404','220408'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia de Cristais Preto Velho',category:'Guias de Cristais',categoryKey:'cristais',line:'Cristal',badge:'Guia de Cristais',path:`/guias-cristal/${slug}/`,price:'R$ 89,90',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia de Cristais Preto Velho em preto e branco com detalhes marrons e pingente de cachimbo',photoStatus:'Foto fornecida',inspiration:'Preto Velho',highlights:'Preto e branco · Detalhes marrons · Cachimbo',measure:'Confirme a medida no orçamento',structure:'Um fio com contas facetadas e elementos decorativos',materials:'Cristais facetados pretos e brancos, pequenas contas marrons, firma decorativa e pingente.',finishes:'Pingente claro em formato de cachimbo com desenhos marrons; firma branca com detalhe marrom.',lead:'Guia de cristais de Preto Velho em preto e branco, com detalhes marrons e pingente de cachimbo. Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Preto e branco com detalhes em tons terrosos.',story:['Cristais facetados pretos e brancos se alternam em seções, separados por pequenas contas marrons. Contas de maior tamanho destacam pontos da composição.','O pingente claro em formato de cachimbo e a firma branca com detalhe marrom completam o acabamento.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-preto-velho-cristais.json',JSON.stringify({sku:code,photos},null,2)+'\n');
