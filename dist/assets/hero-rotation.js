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
      product('Brajá Premium de Oxum', '/oxum/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/95e8efe829adc165/assets/products/bra-oxu-prm-new-photos/capa.webp', 'Brajá Premium de Oxum amarelo e dourado com cristais e búzios'),
      product('Guia Luxo Pombagira', '/guias-luxo/glx-pom-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/c3e5126c4dbba1b9/assets/products/glx-pom-001/foto-3.webp', 'Detalhe de cristais vermelhos, rosas e acabamentos dourados da Guia Luxo Pombagira')
    ],
    [
      product('Brajá Luxo de Iemanjá', '/blx-iem-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/e4a575fa65cfa4ee/assets/imported-google/1KJVLJF6JUSb2KgGn70JTbEgP63mYmX4g.jpg', 'Brajá Luxo de Iemanjá em azul, branco e cristal'),
      product('Brajá 7 Fios de Exu Caveira', '/bra-exu-cav-7f-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/4a7af93a2f0935ac/assets/imported-google/1E-7rayebnoOBOQnKAB7Bj9mVFj8ISEX-.jpg', 'Brajá de sete fios de Exu Caveira com contas pretas e caveiras brancas')
    ],
    [
      product('Brajá de Iansã com 3 Fios', '/brajas-3-fios/br3-ian-60/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/8256cde729a5a882/assets/products/br3-ian-60/capa.jpeg', 'Brajá de Iansã com três fios em composição artesanal'),
      product('Guia Premium Iansã', '/guias-premium/gpr-ian-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/7ed623677b5f000a/assets/products/gpr-ian-001/capa.webp', 'Guia Premium Iansã vermelha e dourada, com raio e búzio')
    ],
    [
      product('Joia de quartinha de Oxum', '/joias-de-quartinha/oxum/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/48f6a735d8b3b907/assets/adornments/joia-quartinha-oxum-20261022.jpeg', 'Joia de quartinha de Oxum em cristais âmbar e metal dourado'),
      product('Guia Luxo Oxóssi', '/guias-luxo/glx-oxs-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/d1e505e61c244dfa/assets/products/glx-oxs-001/capa.webp', 'Guia Luxo de Oxóssi em verde e tons terrosos')
    ],
    [
      product('Guia Premium Exu Caveira', '/guias-premium/gpr-exu-cav-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/7aa08a1050b399e7/assets/products/gpr-exu-cav-001/capa.webp', 'Guia Premium Exu Caveira com contas pretas, caveiras e cruz de ossos'),
      product('Brajá de Xangô com 3 Fios', '/brajas-3-fios/br3-xan-60/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/8fc1ebb7bcfbecfb/assets/products/br3-xan-60/capa.jpeg', 'Brajá de Xangô com três fios em composição artesanal')
    ],
    [
      product('Guia Luxo Iemanjá', '/guias-luxo/glx-iem-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/cbb452aa54b70f9b/assets/products/glx-iem-001/capa.webp', 'Guia Luxo de Iemanjá em azul e branco com rosa branca'),
      product('Joia de quartinha de Oxóssi', '/joias-de-quartinha/oxossi/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/edd7677f1abfb0f6/assets/adornments/joia-quartinha-oxossi-20261022.jpeg', 'Joia de quartinha de Oxóssi em verde e branco com acabamentos prateados')
    ],
    [
      product('Brajá 7 Fios de Oxóssi', '/bra-oxo-7f-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/36742d5b9b25545b/assets/imported-google/1XNcmdraI4yEYyvIJdmxoVpUPLDG0HDka.jpg', 'Brajá de sete fios de Oxóssi em tons verdes e terrosos'),
      product('Brajá Luxo de Pombagira', '/blx-pom-001/', 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com/site/e6e2ab4447af0c87/assets/imported-google/163Xi2WzUSbU03jvEtC3zjy89pUZJljd9.jpg', 'Brajá Luxo de Pombagira com rosas e detalhes vermelhos')
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
