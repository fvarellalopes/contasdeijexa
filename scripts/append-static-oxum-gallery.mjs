import fs from 'node:fs';
const file='dist/oxum/index.html';let html=fs.readFileSync(file,'utf8');
const images=Array.from({length:5},(_,i)=>`/assets/products/bra-oxu-prm-new-photos/${i?'foto-'+(i+1):'capa'}.webp`);
if(!html.includes('data-new-oxum')){
 html=html.replace('gallery-thumb is-active','gallery-thumb').replace('aria-selected="true"','aria-selected="false"');
 const buttons=images.map((src,i)=>`<button data-new-oxum class="gallery-thumb${i?'':' is-active'}" type="button" data-kind="image" data-large="${src}" data-display="${src}" data-alt="Brajá Premium Oxum — foto enviada ${i+1}" aria-label="Ver nova foto ${i+1}" aria-selected="${!i}"><img src="${src}" alt=""></button>`).join('\n');
 html=html.replace(/(<div class="gallery-thumbs"[^>]*>)/,'$1'+buttons).replace(/(<img id="main-image" src=")[^"]+/, '$1'+images[0]);
}
fs.writeFileSync(file,html);
