import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const codes=['CIJ-GUI-LOG-4MM-001','GP-XAN-MIX-60-SH1','GP-OXM-MIX-60','GP-OXM-4MM-60','GP-OML-4MM-60','GP-NAN-MIX-60','GP-NAN-4MM-60','GP-IEM-MIX-60','GP-IEM-4MM-60','GP-OXU-4MM-60'];
const files=['191308','191342','191407','191437','191623','191642','191702','191727','191752','191817'];
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
writeFileSync('data/photo-batch-2026-10-21.json',JSON.stringify(mapping,null,2)+'\n');
console.log('10 fotos copiadas sem alteração, associadas aos SKUs pela ordem informada.');
