# Atualizar o catálogo

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
