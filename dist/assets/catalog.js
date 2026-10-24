const image = id => /^(?:https?:\/\/|\/)/.test(id) ? id : `https://lh3.googleusercontent.com/d/${id}=w1600`;
const imageAttrs = id => window.RESPONSIVE_IMAGES?.attrs(image(id),'card') || `src="${image(id)}" loading="lazy"`;
const productLink = product => product.path || (product.slug.startsWith('gpc-') ? `/guias-cristal/${product.slug}/` : `/${product.slug}/`);
const categories = [
  { key: 'tercos', label: 'Terços', eyebrow: 'Peças artesanais', path: '/tercos/', description: 'Terços artesanais com contas, cristais e acabamentos cuidadosamente compostos.' },
  { key: 'naturais', label: 'Guias Naturais', eyebrow: 'Peças artesanais', path: '/guias-naturais/', description: 'Guias com sementes e materiais naturais.' },
  { key: 'guias-premium', label: 'Guia Premium', eyebrow: 'Linha especial', path: '/guias-premium/', description: 'Guias artesanais com composições especiais e detalhes de destaque.' },
  { key: 'guias-luxo', label: 'Guia Luxo', eyebrow: 'Linha especial', path: '/guias-luxo/', description: 'Guias artesanais com composições elaboradas, pingentes e acabamentos de destaque.' },
  { key: 'micangas', label: 'Guias de Miçangas', eyebrow: 'Guias de Proteção', path: '/guias-micangas/', description: 'Modelos em miçangas com combinações de cores, símbolos e acabamentos artesanais.' },
  { key: 'cristais', label: 'Guias de Cristais', eyebrow: 'Guias de Proteção', path: '/guias-cristal/', description: 'Guias em cristais facetados, com pingentes e detalhes cuidadosamente compostos.' },
  { key: '3-fios', label: 'Brajás 3 Fios', eyebrow: 'Brajás', path: '/brajas-3-fios/', description: 'Modelos de três fios que unem caimento, presença e identidade em cada composição.' },
  { key: '7-fios', label: 'Brajás 7 Fios', eyebrow: 'Brajás', path: '/brajas-7-fios/', description: 'Brajás de sete fios, com volume, movimento e detalhes que valorizam a peça.' },
  { key: 'luxo', label: 'Brajás Luxo', eyebrow: 'Linha especial', path: '/brajas-luxo/', description: 'Peças de um fio com contas maiores, muranos, metais e acabamentos de destaque.' },
  { key: 'premium', label: 'Brajás Premium', eyebrow: 'Linha especial', path: '/brajas-premium/', description: 'Composições de presença, desenvolvidas com materiais especiais e riqueza de detalhes.' }
];
const categoryFor = product => {
  if (product.categoryKey) return product.categoryKey;
  if (product.slug.startsWith('gpc-')) return 'cristais';
  if (product.line === 'Brajá Luxo' || product.slug.startsWith('blx-')) return 'luxo';
  if (product.line === 'Brajá 7 Fios' || product.slug.includes('-7f-')) return '7-fios';
  if (product.line === 'Brajá 3 Fios' || product.slug.includes('-3f-')) return '3-fios';
  if (product.line === 'Guia de Miçangas') return 'micangas';
  return 'premium';
};
const card = product => `<article class="product-card"><a class="product-image" href="${productLink(product)}" aria-label="Ver ${product.name}">${product.cover ? `<img ${imageAttrs(product.cover)} alt="${product.alt}" />` : `<span class="photo-pending">Foto em preparação</span>`}</a><div class="card-copy"><span class="badge">${product.badge || product.line || 'Brajá Premium'}</span><h3>${product.name.replace(' de ', '<br>de ')}</h3><p>${product.highlights}</p><div class="card-bottom"><strong>${product.price}</strong><a href="${productLink(product)}">Ver modelo <span>→</span></a></div></div></article>`;
const productsByCategory = key => window.CATALOG_PRODUCTS.filter(product => categoryFor(product) === key);
const renderHome = () => {
  const highlightSlugs = ['oxum', 'omolu', 'exu', 'blx-iem-001', 'bra-exu-cav-7f-001'];
  document.querySelector('#highlights-track').innerHTML = highlightSlugs.map(slug => window.CATALOG_PRODUCTS.find(product => product.slug === slug)).filter(Boolean).map(card).join('');
  document.querySelector('#category-sections').innerHTML = categories.map(category => {
    const products = productsByCategory(category.key);
    if (!products.length) return '';
    const more = products.length > 10 ? `<a class="view-more" href="${category.path}">Ver todas as ${products.length} peças <span>→</span></a>` : '';
    return `<section class="catalog category-section" id="${category.key}" aria-labelledby="${category.key}-title"><div class="section-heading"><div><p class="eyebrow">${category.eyebrow}</p><h2 id="${category.key}-title">${category.label}</h2></div><div class="section-heading-side"><p>${category.description}</p>${more}</div></div><div class="product-grid category-grid">${products.slice(0, 10).map(card).join('')}</div></section>`;
  }).join('');
  const track = document.querySelector('#highlights-track');
  document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => track.scrollBy({ left: (button.dataset.scroll === 'next' ? 1 : -1) * track.clientWidth * .82, behavior: 'smooth' })));
};
const renderCategory = key => {
  const category = categories.find(item => item.key === key);
  const products = productsByCategory(key);
  const grid = document.querySelector('#category-grid');
  const count = document.querySelector('#category-count');
  if (count) count.textContent = products.length ? `${products.length} ${products.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}` : 'Novidades em breve';
  if (grid) grid.innerHTML = products.length ? products.map(card).join('') : `<div class="empty-state"><p class="eyebrow">Em preparação</p><h2>Novos modelos em breve.</h2><p>Estamos preparando esta seleção com o mesmo cuidado de cada peça. Fale conosco para conhecer as opções disponíveis.</p><a class="primary" href="https://wa.me/5546920002084?text=Ol%C3%A1!%20Vi%20o%20cat%C3%A1logo%20da%20Contas%20de%20Ijex%C3%A1%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noreferrer">Falar no WhatsApp</a></div>`;
  document.querySelectorAll('.category-nav a').forEach(link => { if (link.getAttribute('href') === category.path) link.setAttribute('aria-current', 'page'); });
};
const categoryPage = document.body.dataset.catalogCategory;
if (categoryPage) renderCategory(categoryPage); else renderHome();
