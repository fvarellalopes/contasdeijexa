import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const c={window:{}};vm.runInNewContext(readFileSync('dist/assets/products.js','utf8'),c);
const labels=['Até R$ 90','Acima de R$ 90 até R$ 200','Acima de R$ 200 até R$ 330','Acima de R$ 330'];
const cases=[['Proteção','Oxum',0,true],['Trabalho','Exu',1,true],['Trabalho','Omolu / Obaluaiê',3,true],['Devoção','Iemanjá',0,true],['Proteção','Outra / quero orientação',3,false]];
for(const [purpose,spirit,budget,hasProducts] of cases){
 class Node {children=[];appendChild(n){this.children.push(n);return n;} replaceChildren(){this.children=[];}}
 const handlers={},form={reportValidity:()=>true,addEventListener:(n,f)=>handlers[n]=f},results=new Node();
 const nodes={'#piece-selector':form,'#purpose':{value:purpose},'#inspiration':{value:spirit},'#budget':{value:String(budget),selectedOptions:[{textContent:labels[budget]}]},'#selector-results':results};
 const env={window:{CATALOG_PRODUCTS:c.window.CATALOG_PRODUCTS},document:{querySelector:key=>nodes[key],createElement:()=>new Node()}};
 vm.runInNewContext(readFileSync('dist/assets/comece-aqui.js','utf8'),env);
 handlers.submit({preventDefault(){}});
 const all=n=>[n,...n.children.flatMap(all)];
 const links=all(results).filter(n=>n.href);
 const whatsapp=links.find(n=>n.href.startsWith('https://wa.me/'));
 assert(whatsapp);const message=new URL(whatsapp.href).searchParams.get('text');
 assert(message.includes(purpose)&&message.includes(spirit)&&message.includes(labels[budget]));
 assert.equal(results.children[0].textContent,hasProducts?'Modelos para consultar':'Vamos avaliar as opções');
 if(!hasProducts)assert(links.some(n=>n.href==='/guias-cristal/'));
}
console.log('Seletor: cinco combinações, aliases, faixas, categoria alternativa e mensagem WhatsApp OK.');
