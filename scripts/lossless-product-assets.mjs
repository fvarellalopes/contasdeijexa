import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/assets/products.js','utf8'),c);
const replacements=new Map();
for(const p of c.window.CATALOG_PRODUCTS)for(const image of [p.cover,...(p.images||[])])if(image?.startsWith('/assets/products/')&&image.endsWith('.png'))replacements.set(image,image.replace(/\.png$/,'.webp'));
for(const [from,to] of replacements){
 const original=fs.readFileSync('dist'+from),backup='data/original-photos'+from.slice('/assets/products'.length);
 fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,original);
 await sharp(original).webp({lossless:true,effort:6}).toFile('dist'+to);
 const [a,b]=await Promise.all([sharp(original).ensureAlpha().raw().toBuffer(),sharp('dist'+to).ensureAlpha().raw().toBuffer()]);assert(a.equals(b),from+' pixels alterados');
}
for(const p of c.window.CATALOG_PRODUCTS){p.cover=replacements.get(p.cover)||p.cover;if(p.images)p.images=p.images.map(i=>replacements.get(i)||i);}
fs.writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
// Apenas cópias de distribuição são retiradas; originais preservados no código-fonte.
for(const [from] of replacements)fs.unlinkSync('dist'+from);
const unused='dist/assets/products/blx-iem-001';
if(fs.existsSync(unused))fs.renameSync(unused,'data/original-photos/restored-iemanja-obsolete-distribution');
console.log(replacements.size+' imagens convertidas sem perda, com igualdade de pixels verificada.');
