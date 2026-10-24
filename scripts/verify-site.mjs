import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const walk = dir => readdirSync(dir).flatMap(name=>{const p=path.join(dir,name);return statSync(p).isDirectory()?walk(p):[p];});
const files = walk('dist'), pages = files.filter(p=>p.endsWith('.html'));
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
for(const product of c.window.CATALOG_PRODUCTS) {
  const route=product.path||(product.slug.startsWith('gpc-')?`/guias-cristal/${product.slug}/`:`/${product.slug}/`);
  const html=readFileSync(`dist${route}index.html`,'utf8');
  assert(html.includes(product.price),`Preço fora do HTML: ${product.slug}`);
  const lead = html.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1];
  assert(lead && lead.length > 30, `Descrição fora do HTML: ${product.slug}`);
  if (product.lead) assert.equal(lead,product.lead);
  const schemas=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(x=>JSON.parse(x[1])).filter(x=>x['@type']==='Product');
  assert.equal(schemas.length,1,`Schema duplicado/ausente: ${product.slug}`);
  assert.equal(schemas[0].name,product.name);
  assert.equal(schemas[0].sku,product.code);
  assert.equal(schemas[0].offers.availability,product.availability || 'https://schema.org/PreOrder');
  if (product.cover) { const image=html.match(/property="og:image" content="([^"]+)"/)?.[1]; assert.equal(schemas[0].image[0],image,product.slug); }
  assert.equal(schemas[0].description,lead);
  assert.equal(schemas[0].offers.price,product.price.replace(/[^\d,]/g,'').replace(',','.'));
  assert.equal(schemas[0].offers.url,'https://contasdeijexa.com.br'+route);
  const cta=html.match(/<a class="primary" href="([^"]+)"/);
  assert(cta,`CTA ausente: ${product.slug}`);
  const url=new URL(cta[1]);assert.equal(url.pathname,'/5546920002084');
  const message=url.searchParams.get('text');assert(message.includes(product.name));assert(message.includes(route));
  if(product.cover) assert(html.includes('id="main-image"')&&html.includes('id="lightbox"'),`Galeria: ${product.slug}`);
  else { assert(html.includes('Foto em preparação')); assert(!schemas[0].image); }
  assert.equal(html.split('id="purchase-info"').length-1,1,product.slug);
  assert(!/<script src="[^\"]*product-detail\.js"/.test(html));
}
for(const p of pages) {
  const html=readFileSync(p,'utf8');assert(html.startsWith('<!doctype html>'),p);
  assert.equal(html.split('/assets/analytics.js').length-1,1,p);
  const route='/'+path.relative('dist',path.dirname(p)).replaceAll(path.sep,'/')+'/';
  for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url=new URL(m[1],'https://contasdeijexa.com.br'+route.replace('//','/'));
    if(url.hostname!=='contasdeijexa.com.br')continue;
    const target=path.join('dist',decodeURIComponent(url.pathname));
    assert(existsSync(target),`${p}: recurso inexistente ${url.pathname}`);
    if(url.pathname.endsWith('/'))assert(existsSync(path.join(target,'index.html')),`${p}: página inexistente ${url.pathname}`);
  }
}
const sitemap=readFileSync('dist/sitemap.xml','utf8');
for(const name of ['duvidas','prazo-e-entrega'])assert(sitemap.includes(`/${name}/`));
for(const name of ['contato-recebido','solicitacao-recebida']){assert(!sitemap.includes(`/${name}/`));assert(readFileSync(`dist/${name}/index.html`,'utf8').includes('noindex'));}
assert.equal(c.window.CATALOG_PRODUCTS.filter(p=>p.line==='Brajá 7 Fios').every(p=>p.price==='R$ 199,00'),true);
console.log(`${pages.length} páginas, ${c.window.CATALOG_PRODUCTS.length} produtos: HTML, preços, schemas, CTA, galerias, links e sitemap OK.`);
