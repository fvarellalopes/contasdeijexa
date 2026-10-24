import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};
vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const products=c.window.CATALOG_PRODUCTS;
const code='GPC-BAI-001',slug=code.toLowerCase();
const sources=[
 '2C1DA0F1-D1DE-4F15-9BDD-1BF6F743BC61(1).jpeg',
 '3909E71C-9564-476A-BAA7-18393CD4F352(1).jpeg',
 '4186BBC0-CC0C-4F64-B63C-B42367796815(1).jpeg',
 '4241339C-F0E9-4785-A2F3-F9958598C8CE.jpeg',
 '038DB241-6509-42C7-9F0A-095F80F57121(1).jpeg',
 '50BF85E9-F403-46A7-9799-09B7484FE426(1).jpeg',
 '7FDF6D6A-A845-4DC0-81F0-09EFD3D68202(1).jpeg'
];
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const photos=sources.map((source,i)=>{
 const bytes=fs.readFileSync('/workspace/scratch/2f60f8e06fc6/upload/'+source);
 const name=i===0?'capa.jpeg':`foto-${i+1}.jpeg`;
 const image=`/assets/products/${slug}/${name}`;
 fs.writeFileSync('dist'+image,bytes);
 fs.writeFileSync(`data/original-photos/${slug}/${name}`,bytes);
 assert(fs.readFileSync('dist'+image).equals(bytes));
 return {source,image,originalSha256:createHash('sha256').update(bytes).digest('hex'),byteIdentical:true};
});
const product={
 code,slug,path:`/guias-cristal/${slug}/`,
 name:'Guia de Baiano — Linha Cristal',
 category:'Guias de Cristais',categoryKey:'cristais',line:'Cristal',badge:'Linha Cristal',inspiration:'Baiano',
 price:'R$ 99,90',cover:photos[0].image,images:photos.map(p=>p.image),photoStatus:'Foto fornecida',
 alt:'Guia de Baiano em cristais verdes, amarelos, vermelhos e pretos, madeira natural e pingente com semente olho de boi, chapéu e berimbau',
 highlights:'Cristais coloridos · Madeira natural · Olho de boi, chapéu e berimbau',
 measure:'120 cm aberta / 60 cm fechada',
 structure:'1 fio com contas de cristal e madeira natural.',
 materials:'Contas de cristal verde, amarelo, vermelho e preto, contas de madeira natural, semente olho de boi e elementos metálicos.',
 finishes:'Pingente composto por semente olho de boi, chapéu e berimbau, com acabamentos em tom dourado e firma decorada em vermelho, verde e preto.',
 lead:'Guia de Baiano da Linha Cristal, com contas de cristal verde, amarelo, vermelho e preto e contas de madeira natural. O pingente reúne semente olho de boi, chapéu e berimbau em uma composição central com detalhes dourados. Peça artesanal sob encomenda, enviada sem cruzamento e sem consagração.',
 storyTitle:'Cor, textura e detalhes na composição.',
 story:[
  'Cristais verdes, amarelos e vermelhos se alternam com pequenos detalhes pretos ao longo do fio. Contas facetadas transparentes e contas de madeira natural acrescentam contraste e textura à composição.',
  'No centro, a semente olho de boi acompanha os elementos de chapéu e berimbau, formando o pingente composto. Uma firma decorada em vermelho, verde e preto finaliza a peça.',
  'A galeria apresenta a guia inteira, os detalhes do pingente e os acabamentos em diferentes ângulos.'
 ],
 availability:'https://schema.org/OnlineOnly'
};
const index=products.findIndex(p=>p.code===code);
if(index<0)products.push(product);else products[index]=product;
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync('data/baiano-cristal-2026-10-22.json',JSON.stringify({code,path:product.path,price:product.price,photos},null,2)+'\n');
console.log(`${product.name}: ${product.price}; ${photos.length} fotos originais preservadas.`);
