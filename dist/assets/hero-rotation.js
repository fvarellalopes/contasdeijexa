(() => {
  const visual = document.querySelector('.storefront-hero .hero-visual');
  const mainLink = visual?.querySelector('.hero-main-photo');
  const detailLink = visual?.querySelector('.hero-detail-photo');
  const mainImage = mainLink?.querySelector('img');
  const detailImage = detailLink?.querySelector('img');
  if (!visual || !mainLink || !detailLink || !mainImage || !detailImage) return;

  const product = (name, href, image, alt) => ({ name, href, image, alt });
  const pairs = [
    [
      product('Brajá Premium de Oxum', '/oxum/', '/assets/products/bra-oxu-prm-new-photos/capa.webp', 'Brajá Premium de Oxum amarelo e dourado com cristais e búzios'),
      product('Guia Luxo Pombagira', '/guias-luxo/glx-pom-001/', '/assets/products/glx-pom-001/foto-3.webp', 'Detalhe de cristais vermelhos, rosas e acabamentos dourados da Guia Luxo Pombagira')
    ],
    [
      product('Brajá Luxo de Iemanjá', '/blx-iem-001/', 'https://lh3.googleusercontent.com/d/1KJVLJF6JUSb2KgGn70JTbEgP63mYmX4g=w1600', 'Brajá Luxo de Iemanjá em azul, branco e cristal'),
      product('Brajá 7 Fios de Exu Caveira', '/bra-exu-cav-7f-001/', 'https://lh3.googleusercontent.com/d/1E-7rayebnoOBOQnKAB7Bj9mVFj8ISEX-=w1600', 'Brajá de sete fios de Exu Caveira com contas pretas e caveiras brancas')
    ],
    [
      product('Brajá de Iansã com 3 Fios', '/brajas-3-fios/br3-ian-60/', '/assets/products/br3-ian-60/capa.jpeg', 'Brajá de Iansã com três fios em composição artesanal'),
      product('Guia Premium Iansã', '/guias-premium/gpr-ian-001/', '/assets/products/gpr-ian-001/capa.webp', 'Guia Premium Iansã vermelha e dourada, com raio e búzio')
    ],
    [
      product('Joia de quartinha de Oxum', '/joias-de-quartinha/oxum/', '/assets/adornments/joia-quartinha-oxum-20261022.jpeg', 'Joia de quartinha de Oxum em cristais âmbar e metal dourado'),
      product('Guia Luxo Oxóssi', '/guias-luxo/glx-oxs-001/', '/assets/products/glx-oxs-001/capa.webp', 'Guia Luxo de Oxóssi em verde e tons terrosos')
    ],
    [
      product('Guia Premium Exu Caveira', '/guias-premium/gpr-exu-cav-001/', '/assets/products/gpr-exu-cav-001/capa.webp', 'Guia Premium Exu Caveira com contas pretas, caveiras e cruz de ossos'),
      product('Brajá de Xangô com 3 Fios', '/brajas-3-fios/br3-xan-60/', '/assets/products/br3-xan-60/capa.jpeg', 'Brajá de Xangô com três fios em composição artesanal')
    ],
    [
      product('Guia Luxo Iemanjá', '/guias-luxo/glx-iem-001/', '/assets/products/glx-iem-001/capa.webp', 'Guia Luxo de Iemanjá em azul e branco com rosa branca'),
      product('Joia de quartinha de Oxóssi', '/joias-de-quartinha/oxossi/', '/assets/adornments/joia-quartinha-oxossi-20261022.jpeg', 'Joia de quartinha de Oxóssi em verde e branco com acabamentos prateados')
    ],
    [
      product('Brajá 7 Fios de Oxóssi', '/bra-oxo-7f-001/', 'https://lh3.googleusercontent.com/d/1XNcmdraI4yEYyvIJdmxoVpUPLDG0HDka=w1600', 'Brajá de sete fios de Oxóssi em tons verdes e terrosos'),
      product('Brajá Luxo de Pombagira', '/blx-pom-001/', 'https://lh3.googleusercontent.com/d/163Xi2WzUSbU03jvEtC3zjy89pUZJljd9=w1600', 'Brajá Luxo de Pombagira com rosas e detalhes vermelhos')
    ]
  ];

  const caption = link => link.querySelector(':scope > span');
  const preload = url => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = reject;
    image.src = url;
  });
  let current = 0;
  let changing = false;

  async function show(pair) {
    if (changing) return;
    changing = true;
    try {
      await Promise.all(pair.map(item => preload(item.image)));
      visual.classList.add('is-rotating');
      window.setTimeout(() => {
        [[mainLink, mainImage, pair[0]], [detailLink, detailImage, pair[1]]].forEach(([link, image, item]) => {
          link.href = item.href;
          link.setAttribute('aria-label', `Conhecer ${item.name}`);
          image.src = item.image;
          image.alt = item.alt;
          const text = caption(link);
          if (text?.firstChild) text.firstChild.nodeValue = `${item.name} `;
        });
        requestAnimationFrame(() => visual.classList.remove('is-rotating'));
        changing = false;
      }, 220);
    } catch {
      changing = false;
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.setInterval(() => {
    if (document.hidden || visual.matches(':hover') || visual.contains(document.activeElement)) return;
    current = (current + 1) % pairs.length;
    show(pairs[current]);
  }, 8000);
})();
