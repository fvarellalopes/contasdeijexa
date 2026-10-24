(() => {
 const input=new URLSearchParams(location.search).get('q')||'';
 const query=input.slice(0,120).trim();
 const engine=window.CATALOG_SEARCH,products=[...(window.CATALOG_PRODUCTS||[]),...(window.ADORNMENT_PRODUCTS||[])];
 const $=s=>document.querySelector(s),esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 document.querySelectorAll('input[name="q"]').forEach(e=>e.value=query);
 const results=query?engine.search(products,query):products.filter(p=>p.cover?.startsWith('/')).slice(0,6);
 $('#search-title').textContent=query?`Resultados para “${query}”`:'Encontre a sua peça';
 $('#search-summary').textContent=query?`${results.length} ${results.length===1?'peça encontrada':'peças encontradas'}.`:'Busque por nome, Orixá ou entidade, material ou tipo de peça.';
 $('#search-related').hidden=!query||!results.some(p=>p.related);
 $('#search-empty').hidden=!query||!!results.length;
 $('#search-grid').hidden=!results.length;
 const image=p=>p.cover?(/^(https?:\/\/|\/)/.test(p.cover)?p.cover:`https://lh3.googleusercontent.com/d/${p.cover}=w1600`):'';
 $('#search-grid').innerHTML=results.map(p=>`<article class="product-card"><a class="product-image" href="${esc(engine.route(p))}" aria-label="Ver ${esc(p.name)}">${p.cover?`<img src="${esc(image(p))}" alt="${esc(p.alt||p.name)}" loading="lazy" width="600" height="750">`:'<span class="photo-pending">Foto em preparação</span>'}</a><div class="card-copy"><span class="badge">${esc(p.line||p.category||'Peça artesanal')}</span><h2>${esc(p.name)}</h2><p>${esc(p.highlights||'Artesanal · Personalização no atendimento')}</p><div class="card-bottom"><strong>${esc(p.price||'Sob consulta')}</strong><a href="${esc(engine.route(p))}">Ver modelo <span aria-hidden="true">→</span></a></div></div></article>`).join('');
 $('#search-custom').href='https://wa.me/5546920002084?text='+encodeURIComponent('Olá! Procuro uma peça sob medida'+(query?' de '+query:'')+' e gostaria de um orçamento.');
})();
