# Atualizar o catálogo

## Imagens no Vercel Blob

As imagens públicas são servidas pelo store `store_f7LsjtJxQwZmIifM`.
O manifesto `data/blob-assets.json` registra caminho local, URL pública, tamanho e SHA-256.
HTML, CSS, scripts e catálogo continuam no Git. Os binários locais e as pastas de fotos originais, pendentes e tratadas ficam fora dos novos commits e deploys; não são apagados do histórico Git.

Após instalar dependências com `npm ci`, configure `ijexa_READ_WRITE_TOKEN` em `.env.local` (veja `.env.example`). Nunca inclua esse token em arquivos de `dist`, no manifesto ou no Git.

Para novas imagens ou alterações:

1. Coloque as imagens nos caminhos locais de `dist` usados pelos geradores e gere as páginas normalmente.
   Para fotos ainda referenciadas por IDs/URLs do Google, execute antes `npm run assets:import-external`; falhas ficam em `data/blob-import-pending.json` e os links originais são preservados.
2. Execute `npm run assets:upload`. O script só envia imagens novas ou alteradas e salva o progresso no manifesto; caminhos incluem o hash do conteúdo para evitar cache antigo.
3. Execute `npm run assets:verify` para baixar e comparar todas as imagens remotas por SHA-256.
4. Execute `npm run build` para substituir referências locais, inclusive metadados, pelos endereços públicos do Blob.
5. Execute os verificadores abaixo e versione o manifesto, catálogo e páginas atualizados. URLs antigas continuam disponíveis no Blob; não há exclusão automática.

O build da Vercel aplica o manifesto e não precisa do token. Um checkout novo não contém as cópias binárias locais: recupere-as do backup antes de executar scripts de tratamento de fotos que leem arquivos de `dist`. O comando de upload apenas envia arquivos; aplique as referências somente depois da verificação remota.

As pastas de originais e fotos pendentes não foram enviadas ao Blob público. Preserve um backup separado dessas pastas.

A fonte publicada é dist/assets/products.js. O lote importado da planilha está em data/catalog-import.json; os oito códigos atribuídos aos Premium estão documentados em data/premium-sku-map.json.

Pipeline de geração (a partir da raiz do checkout):

1. node scripts/import-catalog.mjs — inclusão idempotente dos 48 registros e mapeamento dos Premium; mantém preços dos produtos existentes.
2. node scripts/prerender-products.mjs — páginas individuais e Product/Offer no HTML.
3. node scripts/create-support-pages.mjs — páginas de apoio; editar o gerador para preservar revisões futuras.
4. node scripts/prerender-catalog.mjs — home e categorias com conteúdo estático.
5. node scripts/finalize-navigation.mjs — links de rodapé e sitemap, excluindo confirmações noindex.
6. Rodar as três verificações listadas em ANALYTICS.md.

Os produtos novos têm `path` explícito e `categoryKey`. O slug preserva o SKU em letras minúsculas. Publicar fotos apenas quando a correspondência com o SKU estiver comprovada: preencher cover/images com os IDs corretos e gerar novamente. Não substituir a ausência de foto por outra peça ou imagem inventada.

Todas as peças estão marcadas sob encomenda conforme instrução expressa do prompt-agente-site.md. Nos oito Premium o código anterior não estava presente em products.js; foram atribuídos códigos novos aos produtos existentes, sem inferir equivalência com SKUs genéricos da planilha.

As páginas /prazo-e-entrega/ e /duvidas/ mantêm os textos anteriores. Os geradores só acrescentam navegação de rodapé a elas.

## Blog e lançamentos

- Artigos e referências: `scripts/blog-content.mjs`. Renderização: `node scripts/create-blog.mjs`. O gerador publica o índice, os artigos, os dados BlogPosting e BreadcrumbList, os links de descoberta e as URLs do sitemap. Ajustar a data editorial ao revisar os textos. As fontes são públicas e os artigos não alegam revisão por sacerdote.
- Os nomes Luxo, Premium, Cristal, Essencial e Destaque são comerciais. Não criar textos que os apresentem como tipos litúrgicos ou graus religiosos. Relatos de casas são exemplos localizados. Imagens de produtos só ilustram o modelo identificado na legenda; não atribuir a um produto o nome de objeto ritual por semelhança.
- `create-support-pages.mjs` e `create-discovery-pages.mjs` regeneram o blog ao final para preservar a versão completa.
- Lançamentos: `node scripts/render-latest-products.mjs`. O gerador busca a primeira inclusão de cada código nos registros `products.js` e `adornments.js` do histórico Git; mudanças de foto/preço não alteram a posição. As dez inclusões mais recentes aparecem em duas telas de cinco cards no desktop. Itens do mesmo lote usam a ordem inversa de inclusão no registro. A origem fica em `data/latest-product-additions.json`.
- `prerender-catalog.mjs` executa o gerador de lançamentos ao final. Novos registros ainda não commitados também são reconhecidos. Executar após alterar o catálogo e antes de publicar.
- Verificar `node scripts/verify-site.mjs`, `node scripts/verify-analytics.mjs`, a navegação do carrossel e os dados estruturados das páginas novas.
