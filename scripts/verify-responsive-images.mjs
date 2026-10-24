import { readFileSync, readdirSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { parse } from 'parse5';

const manifest=JSON.parse(readFileSync('data/responsive-images.json','utf8'));
const originals=new Set(Object.keys(manifest.images));
const variants=new Map(Object.values(manifest.images).flatMap(entry=>entry.variants).map(v=>[v.url,v]));
const walk=dir=>readdirSync(dir).flatMap(name=>{const file=path.join(dir,name);return statSync(file).isDirectory()?walk(file):[file];});
const isThumbNode=node=>{
  for(let current=node.parentNode;current;current=current.parentNode) {
    if(/gallery-thumb|\bbrand\b|footer-brand/.test(current.attrs?.find(a=>a.name==='class')?.value||'')) return true;
  }
  return false;
};
let count=0,thumbs=0;
for(const file of walk('dist').filter(file=>file.endsWith('.html'))) {
  const html=readFileSync(file,'utf8');
  assert(html.includes('src="/assets/responsive-images.js"'),`${file}: helper ausente`);
  const visit=node=>{
    const attributes=Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
    if(node.tagName==='img'&&attributes.src) {
      assert(!originals.has(attributes.src),`${file}: original carregado no img`);
      if(variants.has(attributes.src)) {
        const variant=variants.get(attributes.src);
        const isThumb=isThumbNode(node);
        assert(variant.width<=960,`${file}: ampliação carregada antes do clique`);
        if(isThumb){assert(variant.width<=160,`${file}: miniatura muito grande`);thumbs++;}
        else assert(attributes.srcset&&attributes.sizes,`${file}: imagem sem srcset/sizes`);
        assert(attributes.width&&attributes.height,`${file}: dimensões ausentes`);
        count++;
      }
      for(const candidate of (attributes.srcset||'').split(',').filter(Boolean)) {
        const url=candidate.trim().split(/\s+/)[0],variant=variants.get(url);
        assert(variant,`${file}: srcset fora do manifesto`);
        assert(variant.width<=960,`${file}: srcset carrega ampliação`);
      }
    }
    if(attributes['data-large']) assert(variants.has(attributes['data-large']),`${file}: ampliação fora do manifesto`);
    if(node.tagName==='video') assert(!attributes.poster&&attributes.preload==='none',`${file}: vídeo oculto carrega antecipadamente`);
    for(const child of node.childNodes||[])visit(child);
  };
  visit(parse(html));
}
console.log(`${count} imagens estáticas responsivas, ${thumbs} miniaturas/logos; ampliações e vídeos reservados para interação.`);
