import fs from 'node:fs';
import {articles} from './blog-content.mjs';

const base='https://contasdeijexa.com.br',date='2026-10-23';
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const json=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const route=a=>`/blog/${a.slug}/`;
const topics=[['Fios de contas','Guias','Colares de santo'],['Guias na Umbanda','Guias de proteção','Guias de trabalho','Guia de firmeza'],['Ilequê','Ilequé','Ileke','Colares no Candomblé'],['Brajá','Brajás de búzios','Brajás de múltiplos fios'],['Delogum','Dilogum','Edilogum'],['Laguidibá','Lagidibá','Materiais dos fios de contas'],['Patuá','Amuletos','Patuá de retrovisor'],['Joia de quartinha','Adornos de quartinha'],['Quelê','Kelê','Colares iniciáticos no Candomblé'],['Guias de Exu','Guias de Pombagira','Umbanda e Quimbanda'],['Guia imperial','Nomenclatura dos fios de contas'],['Terços','Rosários','Guias de mão','Pretos-Velhos']];
const org={'@type':'Organization','@id':base+'/#organization',name:'Contas de Ijexá',url:base+'/',logo:{'@type':'ImageObject',url:base+'/assets/logo-contas-de-ijexa.png'}};
const website={'@type':'WebSite','@id':base+'/#website',url:base+'/',name:'Contas de Ijexá',inLanguage:'pt-BR',publisher:{'@id':org['@id']}};
const author={'@type':'Organization','@id':base+'/sobre/#equipe-editorial',name:'Equipe Contas de Ijexá',url:base+'/sobre/#equipe-editorial'};
const updateGraph=(html,change)=>html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,data)=>`<script type="application/ld+json">${json(change(JSON.parse(data)))}</script>`);
const robots=html=>html.replace(/<meta name="robots"[^>]*>/g,'').replace('</head>','<meta name="robots" content="index, follow, max-image-preview:large"></head>');

export function applyBlogSeo(){
 if(!fs.existsSync('dist/blog/index.html'))return;
 for(const [i,a] of articles.entries()){
  const url=base+route(a),file='dist'+route(a)+'index.html';
  let html=fs.readFileSync(file,'utf8');
  html=updateGraph(html,schema=>{
   const post=schema['@graph'].find(x=>x['@type']==='BlogPosting'),crumb=schema['@graph'].find(x=>x['@type']==='BreadcrumbList');
   Object.assign(post,{url,articleSection:a.tag,about:topics[i].map(name=>({'@type':'Thing',name})),isAccessibleForFree:true,author:{'@id':author['@id']},publisher:{'@id':org['@id']},mainEntityOfPage:{'@id':url+'#webpage'}});
   crumb['@id']=url+'#breadcrumb';
   schema['@graph']=[post,crumb,{'@type':'WebPage','@id':url+'#webpage',url,name:a.title,description:a.description,inLanguage:'pt-BR',isPartOf:{'@id':website['@id']},mainEntity:{'@id':post['@id']},breadcrumb:{'@id':crumb['@id']}},{'@type':'Blog','@id':base+'/blog/#blog',url:base+'/blog/',name:'Conteúdos e orientações — Contas de Ijexá',publisher:{'@id':org['@id']}},org,website,author];return schema;
  });
  html=html.replace(/(<p class="article-meta">)(?:<a class="article-author"[^>]*>)?Equipe Contas de Ijexá(?:<\/a>)?/,'$1<a class="article-author" href="/sobre/#equipe-editorial">Equipe Contas de Ijexá</a>');
  fs.writeFileSync(file,robots(html));
 }
 const groups=[['Primeiros passos',[0,1,2,10]],['Peças e nomes tradicionais',[3,4,5,8]],['Objetos e contextos de uso',[6,7,9,11]]];
 const map=`<!-- blog-topic-map:start --><section class="blog-topic-map" aria-labelledby="topic-map-title"><p class="eyebrow">Encontre seu assunto</p><h2 id="topic-map-title">Um caminho para cada dúvida.</h2><div>${groups.map(([label,indices])=>`<section><h3>${label}</h3><ul>${indices.map(i=>`<li><a href="${route(articles[i])}">${esc(articles[i].title)}</a></li>`).join('')}</ul></section>`).join('')}</div></section><!-- blog-topic-map:end -->`;
 const indexFile='dist/blog/index.html';let index=fs.readFileSync(indexFile,'utf8');
 index=index.includes('<!-- blog-topic-map:start -->')?index.replace(/<!-- blog-topic-map:start -->[\s\S]*?<!-- blog-topic-map:end -->/,map):index.replace('<section class="blog-library"',map+'<section class="blog-library"');
 index=updateGraph(index,schema=>{
  const blog=schema['@graph'].find(x=>x['@type']==='Blog'),list=schema['@graph'].find(x=>x['@type']==='ItemList');
  Object.assign(blog,{blogPost:articles.map(a=>({'@id':base+route(a)+'#article'})),mainEntityOfPage:{'@id':base+'/blog/#webpage'},publisher:{'@id':org['@id']}});list['@id']=base+'/blog/#articles';
  schema['@graph']=[blog,list,{'@type':'CollectionPage','@id':base+'/blog/#webpage',url:base+'/blog/',name:'Artigos sobre fios de contas, guias e brajás',inLanguage:'pt-BR',isPartOf:{'@id':website['@id']},mainEntity:{'@id':list['@id']},breadcrumb:{'@id':base+'/blog/#breadcrumb'}},{'@type':'BreadcrumbList','@id':base+'/blog/#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:base+'/'},{'@type':'ListItem',position:2,name:'Conteúdos e orientações',item:base+'/blog/'}]},org,website];return schema;
 });fs.writeFileSync(indexFile,robots(index));
 const aboutFile='dist/sobre/index.html';let about=fs.readFileSync(aboutFile,'utf8');
 if(!about.includes('id="equipe-editorial"'))about=about.replace('</main>','<section class="editorial-team" id="equipe-editorial"><p class="eyebrow">Quem escreve</p><h2>Equipe Contas de Ijexá</h2><p>Os artigos do blog são preparados pela equipe da marca a partir de referências públicas, com fontes indicadas em cada texto. Nosso trabalho editorial aproxima a pesquisa sobre os nomes das peças da experiência de confecção artesanal, distinguindo relatos de casas, interpretações religiosas e escolhas de modelo.</p><p>Para conversar sobre uma referência ou sugerir uma correção, <a href="/contato/">entre em contato com a Contas de Ijexá</a>.</p></section></main>');fs.writeFileSync(aboutFile,about);
 const parse=file=>{const s=fs.readFileSync(file,'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).trim().replace(/;\s*$/,''));};
 const items=[...parse('dist/assets/products.js'),...parse('dist/assets/adornments.js')];
 const choose=p=>p.categoryKey==='quartinhas'||p.path?.startsWith('/joias-de-quartinha/')?[7,6]:p.categoryKey==='patuas'||p.path?.startsWith('/patuas/')?[6,9]:p.categoryKey==='tercos'||p.path?.startsWith('/tercos/')?[11,1]:/brajá/i.test(p.name)?[3,0]:/exu|pomba/i.test((p.inspiration||'')+' '+p.name)?[9,1]:[1,0];
 const paths=new Map(items.map(p=>[p.path||(p.slug.startsWith('gpc-')?`/guias-cristal/${p.slug}/`:`/${p.slug}/`),choose(p)]));
 const categories={'/guias-micangas/':[1,0],'/guias-cristal/':[1,2],'/guias-luxo/':[1,0],'/guias-premium/':[1,0],'/guias-naturais/':[1,11],'/brajas-3-fios/':[3,4],'/brajas-7-fios/':[3,4],'/brajas-luxo/':[3,0],'/brajas-premium/':[3,0],'/joias-de-quartinha/':[7,6],'/patuas/':[6,9],'/patuas/retrovisor/':[6,9],'/tercos/':[11,1]};
 for(const [p,indices] of Object.entries(categories))paths.set(p,indices);
 let linked=0;
 for(const [path,indices] of paths){
  const file='dist'+path+'index.html';if(!fs.existsSync(file))continue;let html=fs.readFileSync(file,'utf8');
  const block=`<!-- piece-reading:start --><aside class="piece-reading"><p class="eyebrow">Para conhecer antes de escolher</p><h2>Entenda os nomes e os usos.</h2><p>Leituras sobre a peça e seu contexto. As linhas do catálogo organizam modelos comerciais; o uso religioso segue a orientação da sua casa.</p><ul>${indices.map(i=>`<li><a href="${route(articles[i])}">${esc(articles[i].title)}</a></li>`).join('')}</ul></aside><!-- piece-reading:end -->`;
  html=html.includes('<!-- piece-reading:start -->')?html.replace(/<!-- piece-reading:start -->[\s\S]*?<!-- piece-reading:end -->/,block):html.replace('</main>',block+'</main>');fs.writeFileSync(file,html);linked++;
 }
 const entries=[base+'/blog/',...articles.map(a=>base+route(a))];
 fs.writeFileSync('dist/sitemap-blog.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.map(url=>`<url><loc>${url}</loc><lastmod>${date}</lastmod></url>`).join('\n')+'\n</urlset>\n');
 let txt=fs.readFileSync('dist/robots.txt','utf8');if(!txt.includes(base+'/sitemap-blog.xml'))txt=txt.trimEnd()+'\nSitemap: '+base+'/sitemap-blog.xml\n';fs.writeFileSync('dist/robots.txt',txt);
 fs.writeFileSync('data/blog-seo-map.json',JSON.stringify({base,index:base+'/blog/',sitemap:base+'/sitemap-blog.xml',linkedCatalogPages:linked,articles:articles.map((a,i)=>({url:base+route(a),title:a.title,section:a.tag,topics:topics[i],catalog:a.catalog.map(([path])=>base+path),related:a.related.map(slug=>base+'/blog/'+slug+'/')}))},null,2)+'\n');
 console.log(`SEO: ${articles.length} artigos mapeados e ${linked} páginas do catálogo com leituras relacionadas.`);
}
