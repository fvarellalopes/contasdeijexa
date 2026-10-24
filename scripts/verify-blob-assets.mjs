import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const manifest = JSON.parse(readFileSync('data/blob-assets.json', 'utf8'));
const walk = root => readdirSync(root).flatMap(name => {
  const file = path.join(root, name);
  return statSync(file).isDirectory() ? walk(file) : [file];
});
const urls = new Set(Object.values(manifest.assets).map(asset => asset.url));
if (existsSync('data/responsive-images.json')) {
  const responsive=JSON.parse(readFileSync('data/responsive-images.json','utf8'));
  for (const entry of Object.values(responsive.images)) for (const variant of entry.variants) urls.add(variant.url);
}
assert(urls.size > 0, 'Manifesto vazio');
for (const asset of Object.values(manifest.assets)) {
  assert(asset.url.startsWith(manifest.origin + '/site/'));
  assert.match(asset.sha256, /^[a-f0-9]{64}$/);
  assert(asset.bytes > 0);
}
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const references = new RegExp(Object.keys(manifest.assets).map(escape).join('|'));
let pages = 0;
for (const file of walk('dist').filter(file => /\.(?:html|css|js|xml|json|txt)$/i.test(file))) {
  const text = readFileSync(file, 'utf8');
  assert(!text.includes('vercel_blob_rw_'), `${file}: credencial publicada`);
  assert(!text.includes('contasdeijexa.com.brhttps:'), `${file}: URL inválida`);
  assert(!text.includes('..https:'), `${file}: URL relativa inválida`);
  const withoutBlobUrls = text.replace(new RegExp(escape(manifest.origin) + String.raw`/[^\s"'<>)]*`, 'g'), url => {
    assert(urls.has(url), `${file}: URL Blob fora do manifesto: ${url}`);
    return '';
  });
  assert(!references.test(withoutBlobUrls), `${file}: referência local a imagem migrada`);
  for (const match of withoutBlobUrls.matchAll(/(?:src|href|poster)=["']([^"']+\.(?:png|jpe?g|webp|svg|ico|avif|gif)(?:\?[^"']*)?)["']/gi)) {
    assert(/^https?:\/\//.test(match[1]), `${file}: imagem local fora do manifesto: ${match[1]}`);
  }
  assert(!/https:\/\/lh3\.googleusercontent\.com\/d\/[\w-]{20,}/.test(withoutBlobUrls), `${file}: imagem Google ainda não migrada`);
  if (file.endsWith('.html')) pages++;
}
const context = { window: {} };
vm.runInNewContext(readFileSync('dist/assets/products.js', 'utf8'), context);
for (const product of context.window.CATALOG_PRODUCTS) {
  for (const image of [product.cover, ...(product.images || [])].filter(Boolean)) {
    assert(urls.has(image), `${product.code}: imagem do catálogo fora do Blob`);
  }
}
console.log(`${pages} páginas e ${context.window.CATALOG_PRODUCTS.length} produtos com referências Blob válidas; ${urls.size} URLs de imagem reconhecidas.`);
