import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

test('migração preserva URLs Blob, substitui imagens e metadados e é idempotente', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'ijexa-blob-'));
  try {
    mkdirSync(path.join(root, 'data'));
    mkdirSync(path.join(root, 'dist'));
    const origin = 'https://f7lsjtjxqwzmiifm.public.blob.vercel-storage.com';
    const image = origin + '/site/hash/assets/photo.jpg';
    const longer = origin + '/site/hash/assets/photo.jpg.webp';
    const googleId = '123456789012345678901234567890';
    writeFileSync(path.join(root, 'data/blob-assets.json'), JSON.stringify({
      origin, assets: {
        '/assets/photo.jpg': { url: image },
        '/assets/photo.jpg.webp': { url: longer },
      }, googleAliases: { [googleId]: '/assets/photo.jpg' },
    }));
    writeFileSync(path.join(root, 'dist/index.html'), `<img src="/assets/photo.jpg"><img src="/assets/photo.jpg.webp"><meta content="https://contasdeijexa.com.br/assets/photo.jpg"><img src="${image}"><img src="https://lh3.googleusercontent.com/d/${googleId}=w600"><script>const image='${googleId}';</script><style>a{background:url('/assets/photo.jpg')}</style><img src="../assets/photo.jpg"><img src="../../assets/photo.jpg">`);
    const script = path.resolve('scripts/blob-assets.mjs');
    execFileSync(process.execPath, [script, '--apply'], { cwd: root });
    const migrated = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
    assert.equal(migrated.split(image).length - 1, 9);
    assert(!migrated.includes('..https:'));
    assert(migrated.includes(`src="${longer}"`));
    assert(!migrated.includes('googleusercontent'));
    assert(!migrated.includes('contasdeijexa.com.br/assets'));
    execFileSync(process.execPath, [script, '--apply'], { cwd: root });
    assert.equal(readFileSync(path.join(root, 'dist/index.html'), 'utf8'), migrated);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
