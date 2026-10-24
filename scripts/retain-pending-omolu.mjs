import fs from 'node:fs';
const file='data/pending-brajas-prices.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const files=['223524','223545','223549','223554','223608'].map(t=>`image(20261021-${t}).png`);
data.products.push({name:'Brajá Luxo Omolu/Obaluaiê',category:'Brajá Luxo',files});
for(const f of files)fs.copyFileSync('/workspace/scratch/2f60f8e06fc6/upload/'+f,'data/pending-photos/'+f);
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
