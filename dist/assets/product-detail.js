const selectedProduct = new URLSearchParams(window.location.search).get('produto') || document.body.dataset.product;
const product = window.CATALOG_PRODUCTS.find(item => item.slug === selectedProduct);
if (!product) window.location.replace('/');
const productPath = product.path || (product.slug.startsWith('gpc-') ? `/guias-cristal/${product.slug}/` : `/${product.slug}/`);
const whatsappUrl = `https://wa.me/5546920002084?text=${encodeURIComponent(`Olá! Vi ${product.name}${product.code ? ` (${product.code})` : ''} no site e gostaria de um orçamento. https://contasdeijexa.com.br${productPath}`)}`;
const siteUrl = 'https://contasdeijexa.com.br';
const thumb = id => window.RESPONSIVE_IMAGES?.url(id,'thumb') || (/^(?:https?:\/\/|\/)/.test(id) ? id : `https://lh3.googleusercontent.com/d/${id}=w600`);
const display = id => window.RESPONSIVE_IMAGES?.url(id,'display') || (/^(?:https?:\/\/|\/)/.test(id) ? id : `https://lh3.googleusercontent.com/d/${id}=w1600`);
const large = id => window.RESPONSIVE_IMAGES?.url(id,'zoom') || (/^(?:https?:\/\/|\/)/.test(id) ? id : `https://lh3.googleusercontent.com/d/${id}=w2000`);
const upsertMeta = (attribute, key, content) => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};
const upsertCanonical = href => {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = href;
};
const setProductMetadata = () => {
  const query = window.location.pathname === '/guias-cristal/' ? `?produto=${encodeURIComponent(product.slug)}` : '';
  const canonical = `${siteUrl}${window.location.pathname}${query}`;
  const description = product.lead.length > 155 ? `${product.lead.slice(0, 152).trim()}...` : product.lead;
  const image = display(product.cover);
  const title = `${product.name} | Contas de Ijexá`;
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', 'index, follow');
  upsertMeta('property', 'og:locale', 'pt_BR');
  upsertMeta('property', 'og:type', 'product');
  upsertMeta('property', 'og:site_name', 'Contas de Ijexá');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:image:alt', product.alt);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);
  upsertCanonical(canonical);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.code ? { sku: product.code } : {}),
    description,
    image: [image],
    brand: { '@type': 'Brand', name: 'Contas de Ijexá' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'),
      availability: 'https://schema.org/OnlineOnly',
      url: canonical
    }
  };
  let schema = document.querySelector('#product-schema');
  if (!schema) {
    schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.id = 'product-schema';
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify(productSchema);
};
setProductMetadata();
const videoMarkup = product.video ? `<button class="gallery-thumb gallery-video" type="button" data-kind="video" aria-label="Assistir vídeo da peça" aria-selected="false"><img src="${thumb(product.cover)}" alt="" /></button>` : '';
const imageThumbs = product.images.map((id, index) => `<button class="gallery-thumb${index === 0 ? ' is-active' : ''}" type="button" data-kind="image" data-large="${large(id)}" data-display="${display(id)}" data-alt="${product.alt}" aria-label="Ver foto ${index + 1}" aria-selected="${index === 0}"><img src="${thumb(id)}" alt="" /></button>`).join('');
document.querySelector('#breadcrumb').innerHTML = `<a href="/">Catálogo</a><span>›</span>${product.category || 'Brajás Premium'}<span>›</span>${product.name.replace('Brajá Premium de ', '')}`;
document.querySelector('#product-detail').innerHTML = `<article class="product"><section class="gallery" aria-label="Galeria de fotos de ${product.name}"><div class="gallery-thumbs" role="tablist" aria-label="Escolha uma mídia">${imageThumbs}${videoMarkup}</div><div class="gallery-main"><button id="main-image-open" type="button" aria-label="Ampliar foto atual"><img id="main-image" src="${display(product.cover)}" alt="${product.alt}" /></button><video id="main-video" controls preload="none" hidden data-poster="${display(product.cover)}"><source src="https://drive.google.com/uc?export=download&id=${product.video || ''}" type="video/mp4">Seu navegador não suporta a reprodução de vídeo.</video></div></section><section class="details"><span class="badge">${product.badge || 'Brajá Premium'}</span><h2>${product.name.replace(' de ', '<br>de ')}</h2><p class="subtitle">${product.highlights}</p><p class="price">${product.price}</p><p class="lead">${product.lead}</p><div class="specs" aria-label="Especificações da peça"><div class="spec"><span class="spec-label">Medida</span><span class="spec-value">${product.measure}</span></div><div class="spec"><span class="spec-label">Estrutura</span><span class="spec-value">${product.structure}</span></div><div class="spec"><span class="spec-label">Materiais</span><span class="spec-value">${product.materials}</span></div><div class="spec"><span class="spec-label">Acabamentos</span><span class="spec-value">${product.finishes}</span></div></div><a class="primary" href="${whatsappUrl}" target="_blank" rel="noreferrer">◌ Solicitar este modelo</a><aside class="notice" id="fundamento"><strong>Respeito aos fundamentos</strong><p>Esta peça é enviada sem cruzamento, lavagem ritual ou consagração. Esses procedimentos devem ser realizados pelo sacerdote ou dirigente responsável, conforme o fundamento de cada casa.</p></aside></section></article><section class="story" aria-labelledby="composicao-title"><div class="story-grid"><div><p class="eyebrow">Composição e acabamento</p><h2 id="composicao-title">${product.storyTitle}</h2></div><div>${product.story.map(text => `<p>${text}</p>`).join('')}<p>Encomende este modelo como apresentado ou crie uma peça totalmente personalizada, conforme suas preferências e as orientações da sua casa. Cores, materiais, medidas, fios, pingentes e acabamentos podem ser definidos no atendimento. Mudanças na composição podem alterar o valor e o prazo de produção, informados no orçamento antes da confirmação.</p></div></div></section>`;

window.RESPONSIVE_IMAGES?.set(document.querySelector('#main-image'), product.cover, 'display');
