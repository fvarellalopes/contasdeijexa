import sharp from 'sharp';
import { parse } from 'parse5';

export const recipe = { widths: [160,480,960,1600], qualities: [72,76,80,82], effort:4, version:1 };
export async function makeVariants(input) {
  const oriented = await sharp(input).rotate().toBuffer();
  const metadata = await sharp(oriented).metadata();
  const widths = [...new Set([...recipe.widths.filter(width => width < metadata.width), Math.min(metadata.width,1600)])].sort((a,b)=>a-b);
  const outputs = [];
  for (const width of widths) {
    const quality = recipe.qualities[recipe.widths.findIndex(size => size >= width)];
    const { data:body, info } = await sharp(oriented).resize({ width, withoutEnlargement:true }).webp({ quality, effort:recipe.effort }).toBuffer({ resolveWithObject:true });
    outputs.push({ body, width:info.width, height:info.height, bytes:body.length });
  }
  return outputs;
}

// Esta função também é serializada para o navegador, evitando regras diferentes
// entre páginas estáticas, busca e componentes que trocam imagens.
function responsiveClient(images) {
  const index = new Map();
  for (const [source, entry] of Object.entries(images)) {
    index.set(source,entry);
    for (const variant of entry.variants) index.set(variant.url,entry);
  }
  const target = role => ({ thumb:160,card:480,detail:480,display:960,hero:960,social:960,zoom:1600 }[role] || 480);
  const pick = (entry,width) => entry.variants.find(v=>v.width>=width) || entry.variants.at(-1);
  const url = (source,role='card') => index.has(source) ? pick(index.get(source),target(role)).url : source;
  const attributes = (source,role='card') => {
    const entry = index.get(source);
    if (!entry) return {src:source};
    const variant = pick(entry,target(role));
    const attributes = { src:variant.url, width:variant.width, height:variant.height, decoding:'async' };
    if (role==='thumb') { attributes.loading='lazy'; return attributes; }
    const candidates = [...new Map((role==='detail'?[480]:[480,960]).map(width=>{const v=pick(entry,width);return [v.width,v];})).values()];
    attributes.srcset=candidates.map(v=>`${v.url} ${v.width}w`).join(', ');
    attributes.sizes=role==='detail'?'240px':role==='card' ? '(max-width: 760px) calc(100vw - 36px), (max-width: 1040px) calc((100vw - 76px)/2), 380px'
      : role==='hero' ? '(max-width: 760px) 80vw, (max-width: 1000px) 42vw, 540px' : '(max-width: 760px) calc(100vw - 36px), 540px';
    attributes.loading=role==='card'?'lazy':'eager';
    if (role==='display'||role==='hero') attributes.fetchpriority='high';
    return attributes;
  };
  const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  const attrs = (source,role) => Object.entries(attributes(source,role)).map(([key,value])=>`${key}="${escape(value)}"`).join(' ');
  const set = (image,source,role) => {
    // srcset/sizes antes de src evita iniciar um download transitório maior.
    const values=attributes(source,role);
    for (const key of ['sizes','srcset','width','height','decoding','loading','fetchpriority']) {
      if (values[key]!==undefined) image.setAttribute(key,values[key]);
      else image.removeAttribute(key);
    }
    image.src=values.src;
  };
  return {url,attrs,attributes,set};
}
export function clientRuntime(manifest) {
  const images=Object.fromEntries(Object.entries(manifest.images).map(([url,entry])=>[url,{variants:entry.variants.map(({url,width,height})=>({url,width,height}))}]));
  return `window.RESPONSIVE_IMAGES = (${responsiveClient.toString()})(${JSON.stringify(images)});\n`;
}
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
function setAttributes(tag,attributes) {
  for (const [name,value] of Object.entries(attributes)) {
    const pattern=new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,'i');
    if (value===null) { tag=tag.replace(pattern,''); continue; }
    const text=` ${name}="${escape(value)}"`;
    tag=pattern.test(tag)?tag.replace(pattern,()=>text):tag.replace(/\s*\/?>(?=$)/,end=>text+end);
  }
  return tag;
}
export function transformHtml(html,manifest) {
  const api=responsiveClient(manifest.images), document=parse(html,{sourceCodeLocationInfo:true}), patches=[];
  const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
  const ancestors=(node,pattern)=>{
    for(let current=node;current;current=current.parentNode) if(pattern.test(attr(current,'class')||'')) return true;
    return false;
  };
  const schemaImages = value => {
    if (typeof value==='string') return api.url(value,'social');
    if (Array.isArray(value)) return value.map(schemaImages);
    if (value&&typeof value==='object') return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,schemaImages(v)]));
    return value;
  };
  const updateSchema = value => {
    if (Array.isArray(value)) return value.map(updateSchema);
    if (value&&typeof value==='object') return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,key==='image'||key==='thumbnailUrl'?schemaImages(v):updateSchema(v)]));
    return value;
  };
  function visit(node) {
    const location=node.sourceCodeLocation?.startTag;
    if(location) {
      const before=html.slice(location.startOffset,location.endOffset), attributes={};
      if(node.tagName==='img'&&attr(node,'src')) {
        const role=ancestors(node,/gallery-thumb|\bbrand\b|footer-brand/)?'thumb'
          : attr(node,'id')==='main-image'?'display'
          : ancestors(node,/hero-detail-photo/)?'detail'
          : ancestors(node,/hero-visual|about-hero|article-photo/)?'hero':'card';
        Object.assign(attributes,api.attributes(attr(node,'src'),role));
      }
      if(node.tagName==='button'&&attr(node,'data-display')) {
        const source=attr(node,'data-display'), display=api.attributes(source,'display');
        attributes['data-display']=display.src;
        attributes['data-large']=api.url(attr(node,'data-large')||source,'zoom');
        attributes['data-srcset']=display.srcset||'';
        attributes['data-sizes']=display.sizes||'';
      }
      if(node.tagName==='video'&&attr(node,'poster')) {
        attributes['data-poster']=api.url(attr(node,'poster'),'display');
        attributes.poster=null;
        attributes.preload='none';
      }
      if(node.tagName==='meta'&&/^(og:image|twitter:image)$/.test(attr(node,'property')||attr(node,'name')||'')) attributes.content=api.url(attr(node,'content'),'social');
      if(Object.keys(attributes).length) {
        const after=setAttributes(before,attributes);
        if(before!==after) patches.push({start:location.startOffset,end:location.endOffset,text:after});
      }
      if(node.tagName==='script'&&attr(node,'type')==='application/ld+json') {
        const start=location.endOffset,end=node.sourceCodeLocation.endTag?.startOffset;
        if(end!==undefined) {
          const before=html.slice(start,end), after=JSON.stringify(updateSchema(JSON.parse(before))).replace(/</g,'\\u003c');
          if(JSON.stringify(JSON.parse(before))!==after) patches.push({start,end,text:after});
        }
      }
    }
    for(const child of node.childNodes||[]) visit(child);
  }
  visit(document);
  for(const patch of patches.sort((a,b)=>b.start-a.start)) html=html.slice(0,patch.start)+patch.text+html.slice(patch.end);
  if(!html.includes('src="/assets/responsive-images.js"')) html=html.replace('</head>','<script src="/assets/responsive-images.js"></script>\n</head>');
  return html;
}
