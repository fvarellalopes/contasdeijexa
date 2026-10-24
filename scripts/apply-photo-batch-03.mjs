import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const codes=['GP-OML-MIX-60'];
const files=['192544'];
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const mapping=[];
for(let i=0;i<codes.length;i++){
 const p=c.window.CATALOG_PRODUCTS.find(p=>p.code===codes[i]);if(!p)throw Error(codes[i]);
 const filename=`image(20261021-${files[i]}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+filename;
 const folder=`dist/assets/products/${p.slug}`;mkdirSync(folder,{recursive:true});const destination=folder+'/capa.png';copyFileSync(from,destination);
 const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');if(hash(from)!==hash(destination))throw Error('Imagem alterada');
 p.cover=`/assets/products/${p.slug}/capa.png`;p.images=[p.cover];p.alt=p.name;p.photoStatus='Foto fornecida';
 mapping.push({order:i+1,sku:p.code,name:p.name,source:filename,image:p.cover,sha256:hash(destination)});
}
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-batch-2026-10-21-03.json',JSON.stringify(mapping,null,2)+'\n');
console.log('1 foto copiada sem alteração, associadas aos SKUs pela ordem informada.');
