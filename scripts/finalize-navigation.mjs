import {readdirSync,statSync,readFileSync,writeFileSync} from 'node:fs';
const walk=dir=>readdirSync(dir).flatMap(n=>{const p=dir+'/'+n;return statSync(p).isDirectory()?walk(p):[p];});
const files=walk('dist').filter(p=>p.endsWith('.html'));
const links=[['/comece-aqui/','Comece aqui'],['/contato/','Contato'],['/blog/','Conteúdos'],['/politica-de-privacidade/','Privacidade'],['/cookies/','Cookies'],['/politica-de-devolucao/','Trocas e devoluções']];
for(const file of files){
 let html=readFileSync(file,'utf8');
 const footer=html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0];if(!footer)throw Error(file);
 const add=links.filter(([url])=>!footer.includes(`href="${url}"`)).map(([url,label])=>`<a href="${url}">${label}</a>`).join('');
 if(add)html=html.replace('<div class="footer-links">','<div class="footer-links">'+add);
 writeFileSync(file,html);
}
// Apenas páginas públicas; as duas confirmações continuam noindex e fora do sitemap.
const urls=files.filter(p=>!p.includes('/contato-recebido/')&&!p.includes('/solicitacao-recebida/')&&!p.includes('/busca/')).map(p=>'https://contasdeijexa.com.br/'+p.replace(/^dist\//,'').replace(/index\.html$/,''));
writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(url=>`<url><loc>${url}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`${files.length} páginas; ${urls.length} URLs no sitemap.`);
