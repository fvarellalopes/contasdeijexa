import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const c={window:{}};
vm.createContext(c);
vm.runInContext(readFileSync('dist/assets/products.js','utf8'),c);
const source=readFileSync('dist/assets/catalog.js','utf8');
vm.runInContext(source.slice(0,source.indexOf('const renderHome ='))+'\nglobalThis.catalog = {categories, card, productsByCategory};',c);
const {categories,card,productsByCategory}=c.catalog;
function setSection(html,id,markup){
 const begin=`<!-- ${id}:start -->`,end=`<!-- ${id}:end -->`;
 if(html.includes(begin))return html.replace(new RegExp(`<!-- ${id}:start -->[\\s\\S]*?<!-- ${id}:end -->`),begin+markup+end);
 const re=new RegExp(`(<div[^>]*id="${id}"[^>]*>)(<\\/div>)`);
 if(!re.test(html))throw Error(`Contêiner ausente: ${id}`);
 return html.replace(re,(_,open,close)=>open+begin+markup+end+close);
}
for(const category of categories){
 const file=`dist${category.path}index.html`;
 let html=readFileSync(file,'utf8');
 const products=productsByCategory(category.key);
 html=setSection(html,'category-grid',products.map(card).join(''));
 html=html.replace(/(<span[^>]*id="category-count"[^>]*>)[\s\S]*?(<\/span>)/,`$1${products.length} ${products.length===1?'modelo disponível':'modelos disponíveis'}$2`);
 writeFileSync(file,html);
}
let home=readFileSync('dist/index.html','utf8');
const slugs=['oxum','omolu','exu','blx-iem-001','bra-exu-cav-7f-001'];
home=setSection(home,'highlights-track',slugs.map(s=>c.window.CATALOG_PRODUCTS.find(p=>p.slug===s)).map(card).join(''));
home=setSection(home,'category-sections',categories.map(category=>{
 const products=productsByCategory(category.key);if(!products.length)return '';
 const more=products.length>10?`<a class="view-more" href="${category.path}">Ver todas as ${products.length} peças <span>→</span></a>`:'';
 return `<section class="catalog category-section" id="${category.key}" aria-labelledby="${category.key}-title"><div class="section-heading"><div><p class="eyebrow">${category.eyebrow}</p><h2 id="${category.key}-title">${category.label}</h2></div><div class="section-heading-side"><p>${category.description}</p>${more}</div></div><div class="product-grid category-grid">${products.slice(0,10).map(card).join('')}</div></section>`;
}).join(''));
if(!home.includes('href="/comece-aqui/"'))home=home.replace('Conheça composições artesanais produzidas com atenção aos materiais, acabamentos e à orientação de cada casa espiritual.','Conheça composições artesanais produzidas com atenção aos materiais, acabamentos e à orientação de cada casa espiritual. <a href="/comece-aqui/">Precisa de ajuda para escolher? Comece aqui.</a>');
writeFileSync('dist/index.html',home);
console.log('Home e seis categorias disponíveis no HTML, com limite de 10 por seção da home.');

await import('./render-latest-products.mjs');

(await import('./blog-seo-map.mjs')).applyBlogSeo();
