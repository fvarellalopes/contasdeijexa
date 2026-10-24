import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const entries=[
 {code:'GPR-VCA-001',slug:'gpr-vca-001',name:'Guia Premium Vovó Catarina',inspiration:'Vovó Catarina',files:['220132','220050','220118','220124','220128','220135'],alt:'Guia Premium Vovó Catarina branca com rosas, cruz e pingentes',highlights:'Rosas brancas · Cruz · Detalhes dourados',materials:'Contas brancas facetadas e irisadas, contas em tons de bege e mostarda, rosas brancas e pingentes.',finishes:'Rosa branca central com cruz em tom amadeirado; pingentes laterais de preta-velha e cachimbo com acabamento dourado.',lead:'Guia Premium Vovó Catarina com contas brancas, detalhes em bege e mostarda, rosas brancas e cruz central.',story:['Contas brancas facetadas e irisadas predominam na composição, intercaladas a detalhes em bege e mostarda e rosas brancas.','Uma rosa branca conduz à cruz central em tom amadeirado. Pingentes de preta-velha e cachimbo completam as laterais.']},
 {code:'GPR-CIG-001',slug:'gpr-cig-001',name:'Guia Premium Cigana',inspiration:'Cigana',files:['220214','220200','220205','220208'],alt:'Guia Premium Cigana multicolorida com moedas e pingentes dourados',highlights:'Multicolorida · Moedas · Roda, leque e lua',materials:'Contas facetadas multicoloridas, moedas decorativas, entremeios com brilho e pingentes com acabamento dourado.',finishes:'Pingente central de roda com detalhes coloridos, pingentes laterais de leque e lua, rosas e moedas distribuídas pela peça.',lead:'Guia Premium Cigana com contas multicoloridas, moedas douradas e pingentes de roda, leque e lua.',story:['Contas facetadas em diversas cores compõem a guia, com moedas decorativas douradas distribuídas ao longo da peça.','No centro, uma roda com detalhes coloridos é acompanhada por leque e lua, com pequenas rosas e entremeios com brilho.']}
];
for(const e of entries){
 assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===e.code));mkdirSync(`dist/assets/products/${e.slug}`,{recursive:true});
 const photos=e.files.map((time,i)=>{const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source,image=`/assets/products/${e.slug}/${i===0?'capa':'foto-'+(i+1)}.png`;copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));return {source,image,sha256:hash(from)}});
 const {files,...data}=e;
 c.window.CATALOG_PRODUCTS.push({...data,category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${e.slug}/`,price:'R$ 149,90',cover:photos[0].image,images:photos.map(p=>p.image),photoStatus:'Foto fornecida',measure:'Confirme a medida no orçamento',structure:'Um fio com contas e elementos decorativos',lead:e.lead+' Peça artesanal sob encomenda, enviada sem consagração.',storyTitle:'Composição e acabamento em cada detalhe.',availability:'https://schema.org/OnlineOnly'});
 writeFileSync(`data/photo-${e.slug}.json`,JSON.stringify({sku:e.code,photos},null,2)+'\n');
}
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
