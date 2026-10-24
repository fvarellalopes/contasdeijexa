import {readFileSync, writeFileSync} from 'node:fs';
import vm from 'node:vm';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const products=c.window.CATALOG_PRODUCTS;
const source=JSON.parse(readFileSync('data/catalog-import.json','utf8'));
const currency=value=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}).replaceAll('\u00a0',' ');
const originalCount=products.length;
for(const row of source.products){
 const code=row.SKU, slug=code.toLowerCase();
 if(products.some(p=>p.code===code))continue;
 if(products.some(p=>p.slug===slug))throw Error('Slug duplicado: '+slug);
 const isThree=row.Categoria==='Brajá 3 Fios';
 const path=`/${isThree?'brajas-3-fios':'guias-micangas'}/${slug}/`;
 products.push({slug,path,code,name:row['Nome do item *'],price:currency(row['Preço (R$) *']),
  categoryKey:isThree?'3-fios':'micangas',category:isThree?'Brajás 3 Fios':'Guias de Miçangas',
  line:row.Categoria,badge:isThree?'Brajá 3 Fios':`Linha ${row.Categoria}`,inspiration:row['Linha / Entidade'],
  highlights:row['Materiais / composição']||'',cover:null,images:[],alt:'',
  measure:[row['Medida aberta']&&`${row['Medida aberta']} aberta`,row['Medida fechada']&&`${row['Medida fechada']} fechada`].filter(Boolean).join(' / '),
  structure:row['Nº de fios']||'',materials:row['Materiais / composição']||'',finishes:row['Pingente / firma / acabamento']||'',
  lead:row['Descrição para WhatsApp *']||'',storyTitle:'Informações da peça',story:[],
  availability:'https://schema.org/OnlineOnly',photoStatus:'Foto em preparação',
  source:{file:source.source,sheet:source.sheet,row:Number(row.Ordem)+5,sku:code}
 });
}
const premiumCodes={oxum:'BRA-OXU-PRM-001',omolu:'BRA-OMO-PRM-001',exu:'BRA-EXU-PRM-001',pombagira:'BRA-POM-PRM-001',iemanja:'BRA-IEM-PRM-001',ogum:'BRA-OGU-PRM-001',oxala:'BRA-OXA-PRM-001',oxossi:'BRA-OXO-PRM-001'};
const mapping=[];
for(const p of products){
 if(premiumCodes[p.slug]){
  if(!p.code)p.code=premiumCodes[p.slug];
  mapping.push({sku:p.code,url:`https://contasdeijexa.com.br/${p.slug}/`,name:p.name,origin:'Código atribuído ao produto existente por autorização do prompt-agente-site.md. Não é uma correspondência inferida com SKU da planilha.'});
 }
 p.availability='https://schema.org/OnlineOnly';
}
if(new Set(products.map(p=>p.code).filter(Boolean)).size!==products.length)throw Error('SKUs ausentes ou duplicados');
writeFileSync('data/premium-sku-map.json',JSON.stringify(mapping,null,2)+'\n');
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(products,null,2)+';\n');
console.log(`${products.length-originalCount} produtos adicionados; ${products.length} produtos no catálogo.`);
