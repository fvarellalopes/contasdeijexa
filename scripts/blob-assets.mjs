import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import vm from 'node:vm';

const manifestPath = 'data/blob-assets.json';
const origin = 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com';
const imagePattern = /\.(?:webp|png|jpe?g|gif|svg|ico|avif)$/i;
const walk = root => readdirSync(root).flatMap(name => {
  const file = path.join(root, name);
  return statSync(file).isDirectory() ? walk(file) : [file];
});
let manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { origin, assets: {} };
const save = () => writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
async function pool(items, work) {
  let index = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < items.length) await work(items[index++]);
  }));
}

if (process.argv.includes('--import-external')) {
  const context = { window: {} };
  vm.runInNewContext(readFileSync('dist/assets/products.js', 'utf8'), context);
  const ids = new Set(context.window.CATALOG_PRODUCTS.flatMap(p => [p.cover, ...(p.images || [])])
    .filter(value => value && /^[\w-]{20,}$/.test(value)));
  for (const file of walk('dist').filter(file => /\.(?:html|js|css|xml)$/i.test(file))) {
    for (const match of readFileSync(file, 'utf8').matchAll(/https:\/\/lh3\.googleusercontent\.com\/d\/([\w-]+)/g)) ids.add(match[1]);
  }
  manifest.googleAliases ||= {};
  const failures = [];
  let completed = 0;
  mkdirSync('dist/assets/imported-google', { recursive: true });
  await pool([...ids], async id => {
    const local = `/assets/imported-google/${id}.jpg`;
    if (!existsSync('dist' + local)) {
      try {
        const response = await fetch(`https://lh3.googleusercontent.com/d/${id}=w2000`, { signal: AbortSignal.timeout(60000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error(`HTTP ${response.status}`);
        writeFileSync('dist' + local, Buffer.from(await response.arrayBuffer()));
      } catch (error) { failures.push({ id, error: error.message }); }
    }
    if (existsSync('dist' + local)) { manifest.googleAliases[id] = local; save(); }
    if (++completed % 20 === 0 || completed === ids.size) console.log(`Fotos externas processadas: ${completed}/${ids.size}`);
  });
  writeFileSync('data/blob-import-pending.json', JSON.stringify(failures, null, 2) + '\n');
  console.log(`Importação externa: ${ids.size - failures.length} disponíveis, ${failures.length} pendentes.`);
}

if (process.argv.includes('--upload')) {
  const token = process.env.ijexa_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw Error('Defina ijexa_READ_WRITE_TOKEN no ambiente local.');
  const { put } = await import('@vercel/blob');
  const files = walk('dist').filter(file => imagePattern.test(file));
  let completed = 0;
  await pool(files, async file => {
    const body = readFileSync(file);
    const sha256 = createHash('sha256').update(body).digest('hex');
    const local = '/' + path.relative('dist', file).split(path.sep).join('/');
    const isPng = body.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const contentType = isPng ? 'image/png' : undefined;
    if (manifest.assets[local]?.sha256 !== sha256 || (isPng && file.endsWith('.jpg') && manifest.assets[local]?.contentType !== contentType)) {
      const pathname = `site/${sha256.slice(0, 16)}${local}`;
      const { url } = await put(pathname, body, {
        token, access: 'public', addRandomSuffix: false, allowOverwrite: true,
        cacheControlMaxAge: 31536000,
        ...(contentType ? { contentType } : {}),
      });
      if (!url.startsWith(origin + '/')) throw Error('Upload retornou um store diferente do esperado.');
      manifest.assets[local] = { url, sha256, bytes: body.length, ...(contentType ? { contentType } : {}) };
      save();
    }
    if (++completed % 20 === 0 || completed === files.length) console.log(`Imagens enviadas: ${completed}/${files.length}`);
  });
}

if (process.argv.includes('--verify')) {
  const entries = Object.entries(manifest.assets);
  if (!entries.length) throw Error('Manifesto vazio.');
  await pool(entries, async ([local, asset]) => {
    const response = await fetch(asset.url);
    if (!response.ok) throw Error(`${local}: HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length !== asset.bytes || createHash('sha256').update(body).digest('hex') !== asset.sha256) {
      throw Error(`${local}: conteúdo remoto diferente do original.`);
    }
  });
  console.log(`${entries.length} imagens remotas verificadas por SHA-256.`);
}

if (process.argv.includes('--apply')) {
  if (!Object.keys(manifest.assets).length) throw Error('Envie as imagens antes de publicar.');
  const mapping = new Map();
  for (const [local, asset] of Object.entries(manifest.assets)) {
    mapping.set(local, asset.url);
    mapping.set('https://contasdeijexa.com.br' + local, asset.url);
    for (let depth = 0; depth <= 8; depth++) mapping.set('../'.repeat(depth) + local.slice(1), asset.url);
  }
  const googleUrl = id => manifest.assets[manifest.googleAliases?.[id]]?.url;
  // Um único replace impede substituir novamente o caminho dentro da URL Blob.
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escape(origin) + String.raw`/[^\s"'<>)]*|` + [...mapping.keys()].sort((a,b) => b.length-a.length).map(escape).join('|'), 'g');
  let changed = 0;
  for (const file of walk('dist').filter(file => /\.(?:html|css|js|json|xml|txt)$/i.test(file))) {
    const before = readFileSync(file, 'utf8');
    const after = before
      .replace(/https:\/\/lh3\.googleusercontent\.com\/d\/([\w-]+)(?:=w\d+)?/g, (url, id) => googleUrl(id) || url)
      .replace(/(["'])([\w-]{20,})\1/g, (value, quote, id) => googleUrl(id) ? quote + googleUrl(id) + quote : value)
      .replace(pattern, match => mapping.get(match) || match);
    if (before !== after) { writeFileSync(file, after); changed++; }
  }
  console.log(`Referências Blob aplicadas: ${changed} arquivos alterados.`);
}
