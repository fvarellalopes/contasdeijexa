import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GLX-MNA-001',slug='glx-mna-001';
assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
const folder=`dist/assets/products/${slug}`;mkdirSync(folder,{recursive:true});
const photos=['215159','215204','215209','215213','215235','215305'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source;
 const image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);
 const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));
 return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Maria Navalha',category:'Guia Luxo',categoryKey:'guias-luxo',line:'Guia Luxo',badge:'Guia Luxo',path:`/guias-luxo/${slug}/`,price:'R$ 199,00',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia Premium Maria Navalha em vermelho, branco e dourado, com rosas, dados e pingentes',photoStatus:'Foto fornecida',inspiration:'Maria Navalha',highlights:'Vermelho e branco · Rosas · Pingentes dourados',measure:'Confirme a medida no orçamento',structure:'Um fio com composição de contas e elementos decorativos',materials:'Contas facetadas em vermelho, branco e dourado, contas decorativas em formato de dados e rosas, entremeios e pingentes.',finishes:'Rosa vermelha e chapéu no centro; pingentes de cartas, navalha, chapéu e Maria Navalha, com acabamento dourado.',lead:'Guia artesanal de Maria Navalha em vermelho, branco e dourado. Rosas, dados e pingentes compõem uma peça rica em detalhes. Produzida sob encomenda e enviada sem consagração.',storyTitle:'Rosas, dados e detalhes em dourado.',story:['Contas facetadas vermelhas e brancas se alternam a pontos dourados e entremeios, criando uma composição de contraste e brilho.','Rosas vermelhas, dados brancos e pingentes de cartas, navalha, chapéu e Maria Navalha valorizam os detalhes da peça.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-maria-navalha.json',JSON.stringify({sku:code,photos},null,2)+'\n');
mkdirSync('dist/guias-luxo',{recursive:true});
let html=readFileSync('dist/brajas-luxo/index.html','utf8').replaceAll('/brajas-luxo/','/guias-luxo/').replaceAll('Brajás Luxo','Guia Luxo').replace('data-catalog-category="luxo"','data-catalog-category="guias-luxo"').replace('Peças de um fio que se destacam pelas contas maiores, muranos, metais e acabamentos de presença.','Guias artesanais com composições elaboradas, pingentes e acabamentos de destaque.').replaceAll('com muranos, metais e peças de destaque.','com pingentes e acabamentos de destaque.');
writeFileSync('dist/guias-luxo/index.html',html);
function navigate(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const f=dir+'/'+entry.name;if(entry.isDirectory())navigate(f);else if(f.endsWith('.html')){let s=readFileSync(f,'utf8');s=s.replace(/(<nav[^>]*class="[^"]*category-nav[^"]*"[^>]*>)([\s\S]*?)(<\/nav>)/g,(_,a,b,z)=>a+(b.includes('>Guia Luxo</a>')?b:b+'<a href="/guias-luxo/">Guia Luxo</a>')+z);writeFileSync(f,s)}}}
navigate('dist');
