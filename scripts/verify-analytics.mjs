import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script = readFileSync('dist/assets/analytics.js', 'utf8');
const scenarios = [
  ['?utm_source=instagram&utm_medium=social&utm_campaign=teste&gclid=TESTE123&email=cliente%40example.com&telefone=46999999999', {utm_source:'instagram',utm_medium:'social',utm_campaign:'teste',gclid:'TESTE123'}],
  ['?utm_content=sol%20%26%20%C3%A1gua&utm_campaign=um%3Ddois&gbraid=abc&wbraid=xyz&produto=teste', {utm_content:'sol & água',utm_campaign:'um=dois',gbraid:'abc',wbraid:'xyz'}],
  ['?utm_campaign=pessoa%40example.com&utm_term=%0Ateste&unknown=123', {}],
  ['', {}]
];
for (const [search, expected] of scenarios) {
  const scripts = [], handlers = {};
  class Element { closest() { return this.anchor; } }
  const context = { window:{}, URL, URLSearchParams, Element,
    location:{origin:'https://contasdeijexa.com.br',pathname:'/oxum/',search,href:'https://contasdeijexa.com.br/oxum/'+search},
    document:{referrer:'https://example.com/?email=private', createElement:()=>({}),
      head:{appendChild:s=>scripts.push(s)},addEventListener:(n,fn)=>handlers[n]=fn} };
  vm.createContext(context);
  vm.runInContext(readFileSync('dist/assets/analytics-config.js','utf8'),context);
  vm.runInContext(script, context); vm.runInContext(script, context);
  assert.equal(scripts.length,1,'carregador duplicado');
  const calls = Array.from(context.window.dataLayer, args=>Array.from(args));
  const configs = calls.filter(x=>x[0]==='config');
  assert.deepEqual(configs.map(x=>x[1]), ['AW-18528039166','G-FMM2ZG0P27']);
  for(const config of configs) {
    const url = new URL(config[2].page_location);
    assert.deepEqual(Object.fromEntries(url.searchParams),expected);
    assert.equal(config[2].allow_google_signals,false);
    assert.equal(config[2].allow_ad_personalization_signals,false);
    assert.equal(config[2].page_referrer,'https://example.com/');
  }
  const target = new Element();target.anchor={href:'https://wa.me/5546920002084?text=Ol%C3%A1'};
  handlers.click({target});
  const event = context.window.dataLayer.at(-1);
  assert.equal(event[1],'whatsapp_click');assert.deepEqual(Array.from(event[2].send_to),['AW-18528039166','G-FMM2ZG0P27']);
  assert.equal(event[2].event_label,'lead');
  assert(!Array.from(context.window.dataLayer, x=>x[1]).some(x=>['conversion','generate_lead'].includes(x)));
}
console.log('Analytics: 4 cenários de atribuição, encoding, descarte de parâmetros, destinos e inicialização única OK.');

const optedOut={window:{},localStorage:{getItem:()=> 'true'}};
vm.runInNewContext(script,optedOut);
assert.equal(optedOut.window.dataLayer,undefined);
console.log('Preferência de desativação: nenhuma tag ou evento inicializado.');
