import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const products=c.window.CATALOG_PRODUCTS,code='GPC-LGN-001',slug=code.toLowerCase();
const sources=[
 'B74D3E95-4138-43A0-AA8E-9F72E87BA260.jpeg',
 '4B722F00-56CD-4E4E-B4C1-0D7B32CE49C2.jpeg',
 '4A40FC1F-B0F3-49A5-9A06-AA93091F1BE5.jpeg',
 '32C81FA2-0816-4029-AB6E-86FD82837C86.jpeg',
 '38E55F68-7ECA-4DC2-9E84-80C1600D5F07.jpeg',
 '997A96B7-9578-481E-B250-3B79EFB2B45C.jpeg',
 'AA09AE7C-EBD2-45CB-91D3-53287957887F.jpeg'
];
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const photos=sources.map((source,i)=>{
 const bytes=fs.readFileSync('/workspace/scratch/2f60f8e06fc6/upload/'+source),name=i===0?'capa.jpeg':`foto-${i+1}.jpeg`,image=`/assets/products/${slug}/${name}`;
 fs.writeFileSync('dist'+image,bytes);fs.writeFileSync(`data/original-photos/${slug}/${name}`,bytes);assert(fs.readFileSync('dist'+image).equals(bytes));
 return {source,image,originalSha256:createHash('sha256').update(bytes).digest('hex'),byteIdentical:true};
});
const product={
 code,slug,path:`/guias-cristal/${slug}/`,name:'Guia de Logunan — Linha Cristal',category:'Guias de Cristais',categoryKey:'cristais',line:'Cristal',badge:'Linha Cristal',inspiration:'Logunan',price:'R$ 99,90',
 cover:photos[0].image,images:photos.map(p=>p.image),photoStatus:'Foto fornecida',
 alt:'Guia de Logunan com cristais azuis, transparentes e prateados, detalhes de strass e pingente composto por rosa branca, espada e ampulheta',
 highlights:'Cristais azuis e prateados · Strass · Rosa branca, espada e ampulheta',
 measure:'120 cm aberta / 60 cm fechada',structure:'1 fio com cristais facetados e composições metálicas com strass.',
 materials:'Cristais facetados azuis em efeitos leitoso e translúcido, cristais transparentes e prateados, entremeios em discos de metal, contas de metal com strass e rondelles de strass.',
 finishes:'Pingente composto por rosa branca, espada e ampulheta em tom prateado; firma azul com detalhes prateados.',
 lead:'Guia de Logunan da Linha Cristal, com cristais facetados azuis, transparentes e prateados, entremeios de metal e detalhes em strass. O pingente reúne rosa branca, espada e ampulheta, evocando Mãe Logunan, o tempo divino e a firmeza da fé. Ao longo do fio, composições de contas metálicas, rondelles e cristais menores retomam a forma da ampulheta. Peça artesanal sob encomenda, enviada sem cruzamento e sem consagração.',
 storyTitle:'O tempo divino nos detalhes da composição.',
 story:[
  'Cristais azuis alternam efeitos leitosos e translúcidos em uma sequência iluminada por cristais transparentes e prateados. Os discos de metal e os pequenos entremeios marcam as passagens entre as contas, dando ritmo e acabamento ao fio.',
  'Em pontos da peça, contas de metal com strass são combinadas com rondelles de strass e cristais prateados menores. A alternância entre volumes mais largos e centros estreitos sugere pequenas ampulhetas, repetindo ao longo da guia a referência ao tempo divino.',
  'No centro, a rosa branca se une à espada e à ampulheta. Na proposta devocional desta criação, a flor traz delicadeza à composição, a espada evoca firmeza nas batalhas da fé e a ampulheta homenageia Mãe Logunan no cuidado com o tempo divino e no Trono da Fé.',
  'O acabamento prateado conecta os elementos do pingente aos detalhes distribuídos pelo fio. A firma azul com detalhes prateados completa a composição.'
 ],availability:'https://schema.org/OnlineOnly'
};
const index=products.findIndex(p=>p.code===code);if(index<0)products.push(product);else products[index]=product;
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync('data/logunan-cristal-2026-10-22.json',JSON.stringify({code,path:product.path,price:product.price,photos,designReference:'Descrição devocional e leitura das ampulhetas fornecidas pelo artesão.'},null,2)+'\n');
console.log(`${product.name}: ${product.price}; ${photos.length} fotos originais preservadas.`);
