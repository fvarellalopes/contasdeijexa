import fs from 'node:fs';
import {adornmentCollections} from './adornment-catalog.mjs';
import {page,escapeHtml as esc} from './page-layout.mjs';
import {renderProduct} from './product-template.mjs';
import {productionInfo} from './production-terms.mjs';
const c=adornmentCollections.find(c=>c.key==='quartinhas'),base='https://contasdeijexa.com.br';
const route=p=>c.path+p.slug+'/';
const card=p=>`<article class="product-card"><a class="product-image" href="${route(p)}" aria-label="Ver ${esc(p.name)}"><img src="/assets/adornments/${p.file}" alt="${esc(p.alt)}" loading="lazy" width="1122" height="1402"></a><div class="card-copy"><span class="badge">${p.model}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><p>20–22 cm no total · Personalizável</p><div class="card-bottom"><strong>${p.price}</strong><a href="${route(p)}">Ver modelo <span>→</span></a></div></div></article>`;
fs.writeFileSync('dist'+c.path+'index.html',page({title:c.label,description:c.description,route:c.path,content:`<section class="collection-intro"><p class="eyebrow">Feito à mão · Contas de Ijexá</p><h1>Joias de Quartinha</h1><p>${c.description}</p><p class="adornment-note">${c.note}</p></section><section class="catalog"><div class="product-grid catalog-full-grid adornment-grid">${c.products.map(card).join('')}</div></section>`}));
for(const p of c.products){
 const cover='/assets/adornments/'+p.file,url=route(p),wa='https://wa.me/5546920002084?text='+encodeURIComponent(`Olá! Gostaria de um orçamento para ${p.name} (${p.model}), referência de 20–22 cm no total, valor ${p.price}. ${base+url}`);
 const data={...p,cover,images:[cover],category:c.label,badge:p.model,highlights:p.model+' · '+p.structure,lead:p.description+' Tamanho de referência: 20–22 cm no total. Alterações de tamanho podem alterar o valor; consulte e solicite um orçamento. Peça personalizável, artesanal e enviada sem consagração. Quartinha não inclusa.',storyTitle:'Feita para a sua quartinha',story:[c.note]};
 let html=renderProduct(data,wa).html.replace('<h2>','<h1>').replace('</h2>','</h1>');
 html=html.replace('<aside class="notice" id="fundamento">',productionInfo(data)+'<aside class="notice" id="fundamento">');
 html=html.replace('◌ Solicitar este modelo','Solicitar orçamento');
 const schema={'@context':'https://schema.org','@type':'Product',name:p.name,description:data.lead,sku:p.code,category:c.label,image:[base+cover],brand:{'@type':'Brand',name:'Contas de Ijexá'},offers:{'@type':'Offer',price:p.price.replace(/[^\d,]/g,'').replace(',','.'),priceCurrency:'BRL',url:base+url,availability:'https://schema.org/OnlineOnly'}};
 html+=`<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script><dialog id="lightbox"><button type="button" aria-label="Fechar imagem">×</button><img alt="Imagem ampliada da joia"></dialog>`;
 let output=page({title:p.name+' — '+p.model,description:data.lead,route:url,content:`<div class="crumb"><a href="/">Catálogo</a><span>›</span><a href="${c.path}">${c.label}</a><span>›</span>${p.name}</div>${html}`,scripts:['/assets/gallery.js']});
 output=output.replace('</head>',`<meta property="og:image" content="${base+cover}"><meta property="og:image:alt" content="${esc(p.alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${base+cover}">\n</head>`).replace('property="og:type" content="website"','property="og:type" content="product"');
 fs.writeFileSync('dist'+url+'index.html',output);
}
const selector=adornmentCollections.flatMap(group=>group.products.map(p=>({...p,path:group.path+p.slug+'/',category:group.label,categoryKey:group.key,line:p.model||p.subcategory||group.label,cover:'/assets/adornments/'+p.file,price:p.price||'',highlights:p.model?p.model+' · 20–22 cm · Personalizável':p.subcategory?'Patuá de retrovisor · '+p.inspiration:'Artesanal · Sob consulta'})));
fs.writeFileSync('dist/assets/adornments.js','window.ADORNMENT_PRODUCTS = '+JSON.stringify(selector,null,2)+';\n');
let home=fs.readFileSync('dist/index.html','utf8');home=home.replace(/<section class="adornment-section" aria-labelledby="quartinhas-title">[\s\S]*?<\/section>/,`<section class="adornment-section" aria-labelledby="quartinhas-title"><div class="section-heading"><div><p class="eyebrow">Adornos artesanais</p><h2 id="quartinhas-title">Joias de Quartinha</h2></div><div class="section-heading-side"><p>Modelos Cristal e Premium. Referência de 20–22 cm no total, com personalização no atendimento.</p><a class="view-more" href="${c.path}">Explorar modelos →</a></div></div><div class="product-grid category-grid adornment-grid">${c.products.map(card).join('')}</div></section>`);fs.writeFileSync('dist/index.html',home);
console.log('Joias de quartinha: categoria, três páginas, preços, fotos, busca e vitrine atualizados.');

(await import('./blog-seo-map.mjs')).applyBlogSeo();
