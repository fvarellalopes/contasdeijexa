import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const code='GPR-EXU-CAV-001',slug='gpr-exu-cav-001';
assert(!c.window.CATALOG_PRODUCTS.some(p=>p.code===code));
mkdirSync(`dist/assets/products/${slug}`,{recursive:true});
const photos=['215410','215418','215420','215428'].map((time,i)=>{
 const source=`image(20261021-${time}).png`,from='/workspace/scratch/2f60f8e06fc6/upload/'+source;
 const image=`/assets/products/${slug}/${i===0?'capa':'foto-'+(i+1)}.png`;
 copyFileSync(from,'dist'+image);
 const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');assert.equal(hash(from),hash('dist'+image));
 return {source,image,sha256:hash(from)};
});
c.window.CATALOG_PRODUCTS.push({code,slug,name:'Guia Premium Exu Caveira',category:'Guia Premium',categoryKey:'guias-premium',line:'Guia Premium',badge:'Guia Premium',path:`/guias-premium/${slug}/`,price:'R$ 149,90',cover:photos[0].image,images:photos.map(p=>p.image),alt:'Guia Premium Exu Caveira com contas pretas facetadas, caveiras e cruz de ossos',photoStatus:'Foto fornecida',inspiration:'Exu Caveira',highlights:'Contas pretas · Caveiras · Cruz de ossos',measure:'Confirme a medida no orçamento',structure:'Um fio com contas e elementos decorativos',materials:'Contas pretas facetadas, contas de superfície porosa e elementos decorativos em formatos de caveira, caixão e cruz.',finishes:'Pingente preto em formato de cruz de ossos; caveiras claras e caixões pretos com cruzes claras nas laterais.',lead:'Guia artesanal de Exu Caveira com contas pretas facetadas, caveiras e pingente em formato de cruz de ossos. Produzida sob encomenda e enviada sem consagração.',storyTitle:'Preto, brilho e detalhes de caveira.',story:['Contas pretas facetadas em diferentes tamanhos compõem a guia, com pontos de textura e contraste nos elementos decorativos.','Caveiras claras e peças em formato de caixão aparecem nas laterais. No centro, o pingente preto em formato de cruz de ossos finaliza a composição.'],availability:'https://schema.org/OnlineOnly'});
writeFileSync('dist/assets/products.js','window.CATALOG_PRODUCTS = '+JSON.stringify(c.window.CATALOG_PRODUCTS,null,2)+';\n');
writeFileSync('data/photo-exu-caveira.json',JSON.stringify({sku:code,photos},null,2)+'\n');
mkdirSync('dist/guias-premium',{recursive:true});
let html=readFileSync('dist/guias-luxo/index.html','utf8').replaceAll('/guias-luxo/','/guias-premium/').replaceAll('Guia Luxo','Guia Premium').replaceAll('guias-luxo','guias-premium');
writeFileSync('dist/guias-premium/index.html',html);
function navigate(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const f=dir+'/'+entry.name;if(entry.isDirectory())navigate(f);else if(f.endsWith('.html')){let s=readFileSync(f,'utf8');s=s.replace(/(<nav[^>]*class="[^"]*category-nav[^"]*"[^>]*>)([\s\S]*?)(<\/nav>)/g,(_,a,b,z)=>{for(const [url,label] of [['/guias-luxo/','Guia Luxo'],['/guias-premium/','Guia Premium']])if(!b.includes(`href="${url}"`))b+=`<a href="${url}">${label}</a>`;return a+b+z});writeFileSync(f,s)}}}
navigate('dist');
