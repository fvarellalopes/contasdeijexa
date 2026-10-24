import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const products=c.window.CATALOG_PRODUCTS,code='GPC-BAIANA-001',slug=code.toLowerCase();
const sources=[
 '483D0903-9D46-446D-9B21-36F7E4A00A4A.jpeg',
 'FBC5004F-FF8E-4097-BB0F-52D1EAF00899.jpeg',
 '530BF976-EAE5-4669-A301-D055D4A8C6BE.jpeg',
 '23EDA7ED-4004-4752-8CEA-3FE6D609E2D8.jpeg',
 'B0CBD97F-A55F-49D6-8198-BB4991AEE8B6.jpeg',
 '0E49EE44-2D01-45E7-8B16-D0527117E73D.jpeg',
 'B4D1A40E-491B-4C94-9138-2E72878FEA49.jpeg',
 '18560F5E-D53B-4A18-AF52-A2B8DDCB8517.jpeg',
 '0AEFD0D9-C010-425E-94FC-FB130A9EAE25.jpeg'
];
fs.mkdirSync(`dist/assets/products/${slug}`,{recursive:true});fs.mkdirSync(`data/original-photos/${slug}`,{recursive:true});
const photos=sources.map((source,i)=>{
 const bytes=fs.readFileSync('/workspace/scratch/2f60f8e06fc6/upload/'+source),name=i===0?'capa.jpeg':`foto-${i+1}.jpeg`,image=`/assets/products/${slug}/${name}`;
 fs.writeFileSync('dist'+image,bytes);fs.writeFileSync(`data/original-photos/${slug}/${name}`,bytes);assert(fs.readFileSync('dist'+image).equals(bytes));
 return {source,image,originalSha256:createHash('sha256').update(bytes).digest('hex'),byteIdentical:true};
});
const product={
 code,slug,path:`/guias-cristal/${slug}/`,name:'Guia Baiana — Linha Cristal',category:'Guias de Cristais',categoryKey:'cristais',line:'Cristal',badge:'Linha Cristal',inspiration:'Baiana',price:'R$ 99,90',
 cover:photos[0].image,images:photos.map(p=>p.image),photoStatus:'Foto fornecida',
 alt:'Guia Baiana com cristais amarelos, laranjas e pretos, discos de madeira natural, contas de mogno, firma amarela de Murano e pingente de rosa amarela com berimbau',
 highlights:'Cristais · Madeira natural e mogno · Rosa amarela e berimbau',
 measure:'120 cm aberta / 60 cm fechada',structure:'1 fio com sequência de cristais e entremeios em discos de madeira natural.',
 materials:'Contas de cristal amarelo, laranja e preto, entremeios em discos de madeira natural, contas de madeira mogno natural, firma de Murano e elementos metálicos.',
 finishes:'Firma amarela de Murano e pingente composto por rosa amarela e berimbau com acabamento em tom dourado.',
 lead:'Guia Baiana da Linha Cristal, com cristais amarelos, laranjas e pretos, discos de madeira natural e contas de mogno natural. A sequência das contas evoca pequenas margaridas ao longo do fio, em uma homenagem floral à alegria das Baianas. Firma de Murano e pingente de rosa amarela com berimbau completam a peça artesanal, produzida sob encomenda e enviada sem cruzamento e sem consagração.',
 storyTitle:'Margaridas sugeridas no ritmo das contas.',
 story:[
  'A ideia floral aparece na própria sequência dos cristais: grupos de amarelo se repetem entre pontos de laranja e preto, criando pequenos motivos que lembram margaridas espalhadas ao longo do fio. A flor é sugerida pela cor, pelo contraste e pelo ritmo das contas, sem depender de um desenho literal de pétalas.',
  'Nesta criação, a referência às flores do campo é uma homenagem à alegria, à simplicidade e à força das Baianas. O amarelo e o laranja trazem vivacidade à composição, enquanto os pontos pretos marcam as passagens e destacam os grupos coloridos. Essa é uma leitura artística da Contas de Ijexá; cores e fundamentos para o uso ritual seguem a orientação de cada casa.',
  'Os discos de madeira natural criam pausas entre os cristais, e as contas de mogno natural acrescentam textura e um tom terroso ao centro e ao fechamento. A firma amarela de Murano finaliza o fio com presença.',
  'No pingente, a rosa amarela torna explícita a inspiração floral, acompanhada pelo berimbau em tom dourado. Juntos, flor e instrumento aproximam a delicadeza das flores da musicalidade presente na proposta da peça.'
 ],availability:'https://schema.org/OnlineOnly'
};
const index=products.findIndex(p=>p.code===code);if(index<0)products.push(product);else products[index]=product;
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
fs.writeFileSync('data/baiana-cristal-2026-10-22.json',JSON.stringify({code,path:product.path,price:product.price,photos,designReference:'Referência floral interpretativa informada pelo artesão. Relação com alegria e simplicidade da linha contextualizada em https://nuao.com.br/umbanda/guias/guia-de-direita/baianos/; fundamentos variam por casa.'},null,2)+'\n');
console.log(`${product.name}: ${product.price}; ${photos.length} fotos originais preservadas.`);
