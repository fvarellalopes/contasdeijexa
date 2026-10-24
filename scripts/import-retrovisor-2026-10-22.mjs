import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import {adornmentCollections} from './adornment-catalog.mjs';
const entries=[
 ['133754','oxum','OXU','Oxum','Amarelo e dourado, com contas facetadas, entremeios com brilho, medalhão de búzio, franja amarela e pequeno pingente.'],
 ['133804','omolu','OMO','Omolu/Obaluaê','Preto e branco, com contas facetadas, firma listrada, búzio e franja marrom.'],
 ['133820','oxossi','OXS','Oxóssi','Tons de verde e marrom, com contas de diferentes formatos, elemento grande arredondado, arco e flecha e franja verde.'],
 ['133827','oxala','OXL','Oxalá','Branco e transparente, com contas facetadas, detalhes prateados, búzio, pequeno pingente e franja branca.'],
 ['133837','iemanja','IEM','Iemanjá','Azul-claro, branco e transparente, com detalhes prateados, rosa branca, búzio, medalha e franja azul.'],
 ['133844','iansa','IAN','Iansã','Vermelho e laranja, com contas facetadas, medalhão de raio, borboleta dourada e franja vermelha.'],
 ['133852','ogum-azul','OGU-AZU','Ogum — Azul','Tons de azul e branco, com contas facetadas, firma decorada, espada prateada e franja azul.'],
 ['133901','ogum-azul-vermelho','OGU-VER','Ogum — Azul e Vermelho','Contas facetadas azuis e vermelhas, firma decorada, espada e ferradura prateadas e franja azul.'],
 ['133917','pombagira','POM','Pombagira','Vermelho, preto e dourado, com contas facetadas, rosas vermelhas, pingente de tridente e franja vermelha.'],
 ['133929','exu-buzio-caveira','EXU-01','Exu — Búzio e Caveira','Preto e vermelho, com contas facetadas, búzio, elemento grande marrom, caveira vermelha, tridente dourado e franja preta.'],
 ['133937','exu-contas-vermelhas','EXU-02','Exu — Contas Vermelhas','Preto e vermelho, com contas facetadas, elementos vermelhos alongados, elemento grande marrom, búzio, tridente prateado e franja preta.'],
 ['133945','exu-preto-branco','EXU-03','Exu — Preto e Branco','Contas pretas e brancas, elementos alongados, caveiras claras, elemento grande marrom, cruz com número 7 e franja preta.'],
 ['134017','exu-medalhao-pingentes','EXU-04','Exu — Medalhão e Pingentes','Contas pretas, firma trabalhada, búzio e medalhão prateado de Exu com pingentes de foice, tridente e lâmina curva.']
];
const c=adornmentCollections.find(c=>c.key==='patuas');assert(c);
c.subcategory={key:'retrovisor',label:'Patuás de Retrovisor',path:'/patuas/retrovisor/'};
c.description='Patuás artesanais para personalizar seus espaços, com contas, pingentes e acabamentos cuidadosamente compostos.';
c.products=[];const mapping=[];
for(const [time,slug,sku,name,description] of entries){
 const source=`image(20261022-${time}).png`,input=fs.readFileSync('/workspace/scratch/2f60f8e06fc6/upload/'+source),file=`patua-${slug}.webp`;
 fs.mkdirSync('data/original-photos/patuas-retrovisor',{recursive:true});fs.writeFileSync(`data/original-photos/patuas-retrovisor/${slug}.png`,input);
 await sharp(input).webp({lossless:true,effort:4}).toFile('dist/assets/adornments/'+file);
 assert((await sharp(input).ensureAlpha().raw().toBuffer()).equals(await sharp('dist/assets/adornments/'+file).ensureAlpha().raw().toBuffer()));
 c.products.push({slug,code:'PTR-'+sku+'-001',name:'Patuá de Retrovisor de '+name,inspiration:name.split(' — ')[0],file,alt:'Patuá de retrovisor de '+name+'. '+description,description,price:'R$ 69,90',subcategory:'Patuás de Retrovisor',subcategoryKey:'retrovisor'});
 mapping.push({order:mapping.length+1,source,slug,code:'PTR-'+sku+'-001',price:'R$ 69,90'});
}
assert.equal(c.products.length,13);
fs.writeFileSync('scripts/adornment-catalog.mjs','export const adornmentCollections = '+JSON.stringify(adornmentCollections,null,2)+';\n');
fs.writeFileSync('data/patuas-retrovisor-2026-10-22.json',JSON.stringify(mapping,null,2)+'\n');
console.log('13 patuás associados na ordem dos anexos, R$ 69,90 cada.');
