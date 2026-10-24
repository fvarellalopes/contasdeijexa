import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const c={window:{}};vm.createContext(c);vm.runInContext(readFileSync('dist/assets/products.js','utf8'),c);
const source=readFileSync('dist/assets/catalog.js','utf8');
vm.runInContext(source.slice(0,source.indexOf('const renderHome ='))+'\nglobalThis.classify = categoryFor;',c);
const changes=[];
for(const p of c.window.CATALOG_PRODUCTS){const category=c.classify(p);const price=category==='cristais'?'R$ 99,90':category==='3-fios'?'R$ 109,90':null;if(price){changes.push({sku:p.code,category,previous:p.price,price});p.price=price;}}
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/price-update-2026-10-21.json',JSON.stringify(changes,null,2)+'\n');
console.log(changes.reduce((counts,p)=>(counts[p.category]=(counts[p.category]||0)+1,counts),{}));
