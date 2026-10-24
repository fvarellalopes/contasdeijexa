import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { makeVariants, recipe, transformHtml, clientRuntime } from './responsive-images.mjs';

const sourceManifest=JSON.parse(readFileSync('data/blob-assets.json','utf8'));
const manifestPath='data/responsive-images.json';
const manifest=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{recipe,images:{}};
const digest=body=>createHash('sha256').update(body).digest('hex');
const save=()=>{
  writeFileSync(manifestPath+'.tmp',JSON.stringify(manifest,null,2)+'\n');
  renameSync(manifestPath+'.tmp',manifestPath);
};
const sources=Object.entries(sourceManifest.assets).filter(([local])=>/\.(?:png|jpe?g|webp|avif)$/i.test(local)&&!/(?:favicon|apple-touch-icon|social-preview)/.test(local));
async function pool(items,work) {
  let next=0;
  await Promise.all(Array.from({length:4},async()=>{while(next<items.length) await work(items[next++]);}));
}
if(process.argv.includes('--upload')) {
  const token=process.env.ijexa_READ_WRITE_TOKEN||process.env.BLOB_READ_WRITE_TOKEN;
  if(!token) throw Error('Defina o token Blob no ambiente local.');
  const {put}=await import('@vercel/blob');
  const sameRecipe=JSON.stringify(manifest.recipe)===JSON.stringify(recipe);
  if(!sameRecipe) manifest.images={};
  manifest.recipe=recipe;
  const cacheDir=process.env.IJEXA_IMAGE_CACHE||path.join(tmpdir(),'ijexa-responsive-images');
  mkdirSync(cacheDir,{recursive:true});
  const pending=new Map();
  let completed=0;
  await pool(sources,async([local,source])=>{
    if(manifest.images[source.url]?.sourceSha256!==source.sha256) {
      if(!pending.has(source.sha256)) pending.set(source.sha256,(async()=>{
        let body;
        if(existsSync('dist'+local)) body=readFileSync('dist'+local);
        else {
          const response=await fetch(source.url,{signal:AbortSignal.timeout(60000)});
          if(!response.ok) throw Error(`${local}: HTTP ${response.status}`);
          body=Buffer.from(await response.arrayBuffer());
        }
        if(digest(body)!==source.sha256) throw Error(`${local}: fonte mudou; envie a original antes de gerar versões.`);
        const outputs=await makeVariants(body),variants=[];
        for(const output of outputs) {
          const sha256=digest(output.body),pathname=`site/responsive/${sha256.slice(0,16)}/w${output.width}.webp`;
          writeFileSync(path.join(cacheDir,`${sha256}.webp`),output.body);
          const {url}=await put(pathname,output.body,{token,access:'public',addRandomSuffix:false,allowOverwrite:true,contentType:'image/webp',cacheControlMaxAge:31536000});
          if(!url.startsWith(sourceManifest.origin+'/')) throw Error('Store de destino inesperado.');
          variants.push({url,sha256,width:output.width,height:output.height,bytes:output.bytes});
        }
        return {sourceSha256:source.sha256,sourceBytes:source.bytes,variants};
      })());
      manifest.images[source.url]=await pending.get(source.sha256);
      save();
    }
    if(++completed%20===0||completed===sources.length) console.log(`Fotos com versões WebP: ${completed}/${sources.length}`);
  });
}
if(process.argv.includes('--verify')) {
  const variants=[...new Map(Object.values(manifest.images).flatMap(entry=>entry.variants).map(v=>[v.url,v])).values()];
  if(!variants.length) throw Error('Nenhuma versão gerada.');
  await pool(variants,async variant=>{
    const response=await fetch(variant.url,{signal:AbortSignal.timeout(60000)});
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/webp')) throw Error(`Versão indisponível: ${variant.url}`);
    const body=Buffer.from(await response.arrayBuffer());
    if(body.length!==variant.bytes||digest(body)!==variant.sha256) throw Error(`Hash remoto diferente: ${variant.url}`);
  });
  console.log(`${variants.length} versões WebP remotas verificadas por SHA-256.`);
}
if(process.argv.includes('--apply')) {
  for(const [,source] of sources) {
    if(manifest.images[source.url]?.sourceSha256!==source.sha256) throw Error(`Gere as versões WebP antes de publicar: ${source.url}`);
  }
  if(JSON.stringify(manifest.recipe)!==JSON.stringify(recipe)) throw Error('Receita de imagens mudou; gere novas versões antes de publicar.');
  const walk=dir=>readdirSync(dir).flatMap(name=>{const file=path.join(dir,name);return statSync(file).isDirectory()?walk(file):[file];});
  let changed=0;
  for(const file of walk('dist').filter(file=>file.endsWith('.html'))) {
    const before=readFileSync(file,'utf8'),after=transformHtml(before,manifest);
    if(before!==after){writeFileSync(file,after);changed++;}
  }
  writeFileSync('dist/assets/responsive-images.js',clientRuntime(manifest));
  console.log(`Imagens responsivas aplicadas: ${changed} páginas alteradas.`);
}
