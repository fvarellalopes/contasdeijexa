import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import {personalizationText,shippingBanner,shippingText} from './commercial-content.mjs';
import {adornmentCollections as collections} from './adornment-catalog.mjs';
import {page,escapeHtml as esc} from './page-layout.mjs';
import {renderProduct} from './product-template.mjs';
import {productionInfo} from './production-terms.mjs';
const walk=d=>readdirSync(d).flatMap(n=>statSync(d+'/'+n).isDirectory()?walk(d+'/'+n):[d+'/'+n]);
const selectorProducts=collections.flatMap(c=>c.products.map(p=>({...p,path:c.path+p.slug+'/',categoryKey:c.key,cover:'/assets/adornments/'+p.file,price:'',highlights:'Artesanal · Sob consulta'})));
writeFileSync('dist/assets/adornments.js','window.ADORNMENT_PRODUCTS = '+JSON.stringify(selectorProducts,null,2)+';\n');
const arrow='<svg class="icon-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M7 6h11v11"/></svg>';
const productRoute=(c,p)=>c.path+p.slug+'/';
const card=(c,p)=>`<article class="product-card"><a class="product-image" href="${productRoute(c,p)}" aria-label="Ver ${esc(p.name)}"><img src="/assets/adornments/${p.file}" alt="${esc(p.alt)}" loading="lazy" width="1000" height="1250"></a><div class="card-copy"><span class="badge">${c.label}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-bottom"><strong>Sob consulta</strong><a href="${productRoute(c,p)}">Ver modelo ${arrow}</a></div></div></article>`;
for(const c of collections){
 mkdirSync('dist'+c.path,{recursive:true});
 writeFileSync('dist'+c.path+'index.html',page({title:c.label,description:c.description,route:c.path,content:`<section class="collection-intro"><p class="eyebrow">Feito à mão · Contas de Ijexá</p><h1>${c.label}</h1><p>${c.description}</p><p class="adornment-note">${c.note}</p></section><section class="catalog"><div class="product-grid catalog-full-grid adornment-grid">${c.products.map(p=>card(c,p)).join('')}</div></section>`}));
 for(const p of c.products){
  const route=productRoute(c,p),message=`Olá! Gostaria de um orçamento para ${p.name}. https://contasdeijexa.com.br${route}`,whatsapp='https://wa.me/5546920002084?text='+encodeURIComponent(message);
  const data={...p,cover:'/assets/adornments/'+p.file,images:['/assets/adornments/'+p.file],category:c.label,badge:c.label,price:'Sob consulta',highlights:'Produção artesanal · Personalização no atendimento',lead:p.description+' '+(c.key==='quartinhas'?'Venda da joia avulsa. Quartinha não inclusa. ':'')+'Peça artesanal sob encomenda, enviada sem consagração.',measure:c.key==='quartinhas'?'Sob medida para a sua quartinha':'Medidas definidas no atendimento',structure:'Composição definida conforme o modelo ou sua personalização',materials:'Materiais e cores confirmados no orçamento',finishes:'Pingentes e acabamentos definidos no atendimento',storyTitle:'Feita para os seus detalhes.',story:[c.note]};
  const rendered=renderProduct(data,whatsapp);
  let html=rendered.html.replace('<h2>','<h1>').replace('</h2>','</h1>');
  html=html.replace('<aside class="notice" id="fundamento">',productionInfo(data)+'<aside class="notice" id="fundamento">');
  html+='<dialog id="lightbox"><button type="button" aria-label="Fechar imagem">×</button><img alt="Imagem ampliada da peça"></dialog>';
  mkdirSync('dist'+route,{recursive:true});
  writeFileSync('dist'+route+'index.html',page({title:p.name,description:data.lead,route,content:`<div class="crumb"><a href="/">Catálogo</a><span>›</span><a href="${c.path}">${c.label}</a><span>›</span>${p.name}</div>${html}`,scripts:['/assets/gallery.js']}));
 }
}
let home=readFileSync('dist/index.html','utf8');
const sections=collections.map(c=>`<section class="adornment-section" aria-labelledby="${c.key}-title"><div class="section-heading"><div><p class="eyebrow">Adornos artesanais</p><h2 id="${c.key}-title">${c.label}</h2></div><div class="section-heading-side"><p>${c.description}</p><a class="view-more" href="${c.path}">Explorar ${c.label.toLowerCase()} ${arrow}</a></div></div><div class="product-grid category-grid adornment-grid">${c.products.slice(0,3).map(p=>card(c,p)).join('')}</div></section>`).join('');
if(home.includes('<!-- adornments:start -->'))home=home.replace(/<!-- adornments:start -->[\s\S]*?<!-- adornments:end -->/,`<!-- adornments:start -->${sections}<!-- adornments:end -->`);
else home=home.replace('<section class="foundation"',`<!-- adornments:start -->${sections}<!-- adornments:end --><section class="foundation"`);
writeFileSync('dist/index.html',home);
for(const file of walk('dist').filter(f=>f.endsWith('.html'))){
 let html=readFileSync(file,'utf8');
 if(!html.includes('class="shipping-banner"'))html=html.replace('</header>','</header>'+shippingBanner);
 html=html.replace(/(<h2>Posso personalizar uma peça\?<\/h2><p>)[\s\S]*?(<\/p>)/,(_,a,b)=>a+personalizationText+b);
 html=html.replace('Informe seu CEP pelo WhatsApp para consultar o frete e a previsão de entrega.',shippingText+' Para pedidos de até R$ 300, consulte o frete informando seu CEP pelo WhatsApp. A previsão de entrega é confirmada no atendimento.');
 html=html.replace('O transporte é adicional. Informe seu CEP para consultar frete e previsão de entrega.','O prazo de transporte é adicional. '+shippingText+' Informe seu CEP para consultar a previsão de entrega e, em pedidos de até R$ 300, o valor do frete.');
 html=html.replaceAll('Alterações no projeto podem mudar o prazo; confirme as condições antes de fechar uma personalização.','Personalizações podem alterar o valor e o prazo de produção, confirmados no orçamento antes de fechar o pedido.');
 html=html.replace(/(<aside class="notice" id="purchase-info">[\s\S]*?)(<\/aside>)/,(_,a,b)=>a+(a.includes('Frete grátis')?'':'<p>'+shippingText+'</p>')+b);
 html=html.replace(/(<nav[^>]*class="[^"]*category-nav[^"]*"[^>]*>)([\s\S]*?)(<\/nav>)/g,(_,a,b,z)=>{for(const c of collections)if(!b.includes(`href="${c.path}"`))b+=`<a href="${c.path}">${c.label}</a>`;return a+b+z;});
 html=html.replace('<a href="/brajas-premium/">Brajás premium</a></section>','<a href="/brajas-premium/">Brajás premium</a>'+collections.map(c=>`<a href="${c.path}">${c.label}</a>`).join('')+'</section>');
 writeFileSync(file,html);
}
console.log('Personalização, frete grátis e duas categorias atualizados; 11 modelos com fotos.');
// Restaura os preços e a hierarquia dos patuás após a geração comercial geral.
await import('./render-patuas-retrovisor.mjs');
await import('./render-quartinhas.mjs');
