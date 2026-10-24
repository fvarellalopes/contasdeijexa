import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { makeVariants, transformHtml, clientRuntime } from './responsive-images.mjs';
import vm from 'node:vm';

const source = 'https://example.public.blob.vercel-storage.com/site/photo.png';
const variants = [160,480,960,1600].map(width => ({ width, height: width*2, url: `https://example.public.blob.vercel-storage.com/site/photo-${width}.webp`, bytes: width, sha256: 'a'.repeat(64) }));
const manifest = { images: { [source]: { variants } } };

test('versões preservam proporção/transparência e nunca ampliam a origem', async () => {
  const input = await sharp({ create: { width:400, height:800, channels:4, background:'#ff000080' } }).png().toBuffer();
  const outputs = await makeVariants(input);
  assert.deepEqual(outputs.map(v => v.width), [160,400]);
  for (const output of outputs) {
    const metadata = await sharp(output.body).metadata();
    assert.equal(metadata.format,'webp');
    assert.equal(metadata.height,output.width*2);
    assert.equal(metadata.hasAlpha,true);
  }
});

test('HTML usa thumbnail leve, srcset limitado e reserva alta resolução para data-large', () => {
  const html = `<!doctype html><head><meta property="og:image" content="${source}"><script type="application/ld+json">{"@type":"Product","image":["${source}"]}</script></head><body><article class="product-card"><img src="${source}" alt="Peça"></article><button class="gallery-thumb" data-display="${source}" data-large="${source}"><img src="${source}" alt=""></button><img id="main-image" src="${source}"><dialog id="lightbox"><img alt="Ampliada"></dialog><p>Texto &amp; preço R$ 99,00.</p></body>`;
  const result = transformHtml(html,manifest);
  assert.match(result, /data-large="[^" ]*1600.webp"/);
  assert.match(result, /data-display="[^" ]*960.webp"/);
  assert.match(result, /src="[^" ]*160.webp"/);
  assert.match(result, /srcset="[^" ]*480.webp 480w, [^" ]*960.webp 960w"/);
  assert(!/src="[^" ]*1600.webp"/.test(result));
  assert(result.includes('<p>Texto &amp; preço R$ 99,00.</p>'));
  assert(result.includes(`"image":["${variants[2].url}"]`));
  assert.equal(transformHtml(result,manifest),result);
});

test('seleção dinâmica usa imagens menores e fallback desconhecido não muda conteúdo', () => {
  const c={window:{}}; vm.runInNewContext(clientRuntime(manifest),c);
  const helper=c.window.RESPONSIVE_IMAGES;
  assert.equal(helper.url(source,'thumb'),variants[0].url);
  assert.equal(helper.url(source,'card'),variants[1].url);
  assert.equal(helper.url(variants[1].url,'zoom'),variants[3].url);
  assert.equal(helper.url('/unknown.svg','card'),'/unknown.svg');
  assert(!helper.attrs(source,'card').includes('1600.webp'));
});
