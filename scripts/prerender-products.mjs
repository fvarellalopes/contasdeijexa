import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';
import { renderProduct } from './product-template.mjs';
import { page } from './page-layout.mjs';
import { productionDays, productionInfo } from './production-terms.mjs';
const context = { window: {} };
vm.runInNewContext(readFileSync('dist/assets/products.js', 'utf8'), context);
const base = 'https://contasdeijexa.com.br';
const serialize = object => JSON.stringify(object).replace(/</g, '\\u003c');
let rendered = 0;
const selectedCodes = new Set(process.argv.slice(2));
for (const product of context.window.CATALOG_PRODUCTS) {
  if (selectedCodes.size && !selectedCodes.has(product.code)) continue;
  const route = product.path || (product.slug.startsWith('gpc-') ? `/guias-cristal/${product.slug}/` : `/${product.slug}/`);
  const path = `dist${route}index.html`;
  const imageUrl = product.cover ? (/^(?:https?:\/\/|\/)/.test(product.cover) ? new URL(product.cover,base).href : `https://lh3.googleusercontent.com/d/${product.cover}=w1600`) : null;
  if (!existsSync(path)) {
    mkdirSync(`dist${route}`,{recursive:true});
    writeFileSync(path,page({title:product.name,description:product.lead,route,content:'<div class="crumb" id="breadcrumb"></div><div class="detail" id="product-detail"></div>'}));
  }
  let html = readFileSync(path, 'utf8').replace(/^\+(?=<!doctype)/i, '');
  const message = `Olá! Vi ${product.name}${product.code ? ` (${product.code})` : ''} no site e gostaria de um orçamento. ${base}${route}`;
  const whatsapp = `https://wa.me/5546920002084?text=${encodeURIComponent(message)}`;
  if (html.includes('id="product-detail"')) {
    const result = renderProduct(product, whatsapp);
    // Marcadores tornam a geração repetível sem depender do HTML interno da galeria.
    const begin = '<!-- product:start -->', end = '<!-- product:end -->';
    if (html.includes(begin)) {
      html = html.replace(/<!-- product:start -->[\s\S]*?<!-- product:end -->/, `${begin}${result.html}${end}`);
    } else {
      html = html.replace(/<(div|main) class="detail" id="product-detail"><\/\1>/, (_, tag) => `<${tag} class="detail" id="product-detail">${begin}${result.html}${end}</${tag}>`);
      html = html.replace('<div class="crumb" id="breadcrumb"></div>', `<div class="crumb" id="breadcrumb">${result.breadcrumb}</div>`);
    }
    html = html.replace(/<script src="[^\"]*assets\/(?:products|product-detail)\.js"><\/script>/g, '');
    if (html.includes(begin)) rendered++;
  }
  // Reusar os valores já publicados de disponibilidade; não inferir estoque.
  let previous;
  html = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>\n?/g, (tag, raw) => {
    const data = JSON.parse(raw);
    if (data['@type'] !== 'Product') return tag;
    previous = data;
    return '';
  });
  const price = product.price.replace(/[^\d,]/g, '').replace(',', '.');
  if (!/^\d+\.\d{2}$/.test(price)) throw Error(`Preço inválido: ${product.slug}`);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.lead || html.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, ''),
    ...(imageUrl ? {image: [imageUrl]} : {}),
    ...(product.code ? { sku: product.code } : {}),
    brand: { '@type': 'Brand', name: 'Contas de Ijexá' },
    offers: { '@type': 'Offer', priceCurrency: 'BRL', price, url: base + route,
      ...(product.availability ? { availability: product.availability } : previous?.offers?.availability ? {availability:previous.offers.availability} : {}),
      seller: { '@type': 'Organization', name: 'Contas de Ijexá' }
    }
  };
  html = html.replace('</head>', `<script id="product-schema" type="application/ld+json">${serialize(schema)}</script>\n</head>`);
  if (imageUrl) {
    const metas=[['property','og:image',imageUrl],['property','og:image:alt',product.alt],['name','twitter:image',imageUrl],['name','twitter:card','summary_large_image'],['property','og:type','product']];
    for (const [attribute,key,value] of metas) {
      const tag=`<meta ${attribute}="${key}" content="${value.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`;
      const pattern=new RegExp(`<meta[^>]*${attribute}="${key}"[^>]*>`);
      html=pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',tag+'\n</head>');
    }
    if (!html.includes('id="lightbox"')) html=html.replace('</body>','<dialog id="lightbox"><button type="button" aria-label="Fechar imagem">×</button><img alt="Imagem ampliada da peça"></dialog>\n</body>');
    if (!/src="[^"]*assets\/gallery\.js"/.test(html)) html=html.replace('</body>','<script src="/assets/gallery.js"></script>\n</body>');
  }
  // Contexto do produto em todos os botões WhatsApp da página, inclusive sem JS.
  html = html.replace(/href="https:\/\/wa\.me\/[^"]*"/g, `href="${whatsapp}"`);
  const info = productionInfo(product);
  if (html.includes('id="purchase-info"')) html = html.replace(/<aside class="notice" id="purchase-info">[\s\S]*?<\/aside>/, info);
  else html = html.replace('<aside class="notice" id="fundamento">', info + '<aside class="notice" id="fundamento">');
  html = html.replace(/https:\/\/drive\.google\.com\/thumbnail\?id=([^&"]+)&(?:amp;)?sz=w(\d+)/g, 'https://lh3.googleusercontent.com/d/$1=w$2');
  const availabilityText = `Disponível sob encomenda · Produção em até ${productionDays(product)} dias úteis`;
  if (html.includes('id="product-availability"')) html = html.replace(/(<p id="product-availability"[^>]*>)[\s\S]*?<\/p>/, `$1${availabilityText}</p>`);
  else html=html.replace('<p class="price">', `<p id="product-availability" class="eyebrow">${availabilityText}</p><p class="price">`);
  writeFileSync(path, html);
}
console.log(`${context.window.CATALOG_PRODUCTS.length} produtos com schema estático; ${rendered} páginas pré-renderizadas.`);

(await import('./blog-seo-map.mjs')).applyBlogSeo();
