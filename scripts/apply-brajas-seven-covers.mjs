import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const pairs=[
 ['BR3-OBA-60','7CF1D9F4-7ADF-498E-8DDE-FA39BCE41A8C.jpeg'],
 ['BR3-OML-60-SH1','5913FE45-6E0A-437E-9C87-98511E05C7C1.jpeg'],
 ['BR3-IAN-60','E3193413-1466-4AD9-A22F-EA0ADF8C9C38.jpeg'],
 ['BR3-OGU-60','C22C307C-A567-4CA9-9614-0088CE5B9F51.jpeg'],
 ['BR3-XAN-60','6CA0AEA4-FC97-4FFC-AD97-B91549788421.jpeg'],
 ['BR-EXU-3F','35862C9C-3ACE-48AC-AA10-D56599E29DB3.jpeg'],
 ['BR-POM-3F','7206C046-68BD-420C-A703-DEA3C1F9BEAF.jpeg']
];
const mapping=[];
for(const [sku,source] of pairs){const p=c.window.CATALOG_PRODUCTS.find(p=>p.code===sku);assert(p);const from='/workspace/scratch/2f60f8e06fc6/upload/'+source;mkdirSync(`dist/assets/products/${p.slug}`,{recursive:true});const image=`/assets/products/${p.slug}/capa.jpeg`;copyFileSync(from,'dist'+image);const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));p.cover=image;p.images=[image,...(p.images||[]).filter(x=>x!==image)];p.alt=p.name;p.photoStatus='Foto fornecida';mapping.push({sku,name:p.name,source,image,sha256:hash(from)});}
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-brajas-seven-covers.json',JSON.stringify(mapping,null,2)+'\n');
