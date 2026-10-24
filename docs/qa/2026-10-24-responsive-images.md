# Validação das imagens responsivas

Ambiente: site estático local em `http://127.0.0.1:4173`, imagens públicas no Blob existente. Base do trabalho: `e335f52`. Analytics externo bloqueado durante o navegador; sem envio de formulário ou mensagem. Nenhum original foi apagado.

## Arquivos e economia

- 426 imagens elegíveis com variantes WebP de até 160/480/960/1600 px; imagens menores não foram ampliadas. Favicons e imagem institucional de compartilhamento mantidos.
- 1.645 URLs WebP únicas baixadas e verificadas por tamanho, tipo de conteúdo e SHA-256.
- Soma dos originais elegíveis: 512,79 MiB. Soma de uma versão de até 480 px por origem: 12,27 MiB; redução de 97,6% nessa comparação. As versões de até 960 px somam 39,45 MiB. Esses totais não são estimativa do tráfego mensal nem de uma página específica.
- Logo usado no cabeçalho/rodapé: 4.672.934 bytes na origem e 3.376 bytes na versão de 160 px.

## Aprovado

- `npm test`: 4 testes aprovados, incluindo proporção/transparência, ausência de ampliação, srcset, metadados, idempotência e seleção dinâmica.
- Build e verificações das 188 páginas/133 produtos; 1.191 imagens estáticas responsivas, incluindo 793 miniaturas/logos.
- Verificadores existentes de busca e Analytics aprovados.
- Novo checkout preparado do índice, sem imagens binárias, `.env.local` ou token: build, verificação das páginas e testes aprovados. Segunda aplicação altera zero páginas.
- Auditoria npm: nenhuma vulnerabilidade informada.
- Revisão independente de código: nenhum achado concreto; revisão estática, sem repetição dos testes pelo revisor.
- Nenhum token Blob encontrado no conteúdo preparado para commit.

## Navegador

Desktop 1440×900, celular 390×844 e celular 390×844 com DPR 2. Onze cenários aprovados:

1. Home desktop sem fotos originais nos recursos carregados.
2. Produto `/blx-iem-001/`: URL de ampliação ausente das requisições iniciais e solicitada após clicar. A origem deste produto tem 1.122 px de largura; o zoom usa essa dimensão, sem ampliar para 1.600 px.
3. Troca de foto no desktop atualiza o srcset e mantém a miniatura de 160 px.
4. Home mobile sem fotos originais nos recursos carregados.
5. Categoria `/brajas-premium/` mobile com cards responsivos.
6. Busca `/busca/?q=oxum` mobile com imagens responsivas geradas dinamicamente.
7. Seletor `/comece-aqui/`, inspiração Oxum, mobile com imagens responsivas.
8. Produto mobile com foto principal responsiva.
9. Troca de foto no mobile.
10. Busca mobile com DPR 2 e seleção de variante pelo navegador.
11. Capa fora da tela sem rotação por 8,5 segundos.

Nenhum erro de JavaScript registrado nem resposta HTTP 4xx/5xx local no HAR. Capturas de home desktop/mobile, produto desktop/mobile, busca e seletor mobile foram abertas e inspecionadas visualmente.

## Evidências locais

Capturas e HAR ficam em `/tmp`, não são publicados nem versionados:

- `/tmp/ijexa-thumbnails-home-desktop-final.png`
- `/tmp/ijexa-thumbnails-home-mobile-final.png`
- `/tmp/ijexa-thumbnails-product-desktop-final.png`
- `/tmp/ijexa-thumbnails-product-mobile.png`
- `/tmp/ijexa-thumbnails-zoom-desktop-final.png`
- `/tmp/ijexa-thumbnails-search-mobile.png`
- `/tmp/ijexa-thumbnails-selector-mobile.png`
- `/tmp/ijexa-thumbnails-search-mobile-retina.png`
- `/tmp/ijexa-thumbnails-network.har`
- `/tmp/ijexa-thumbnails-browser-results.json`

## Limites

O teste legado `verify-selector.mjs` tem a falha histórica do simulador (`append` ausente); não foi alterado. O seletor real foi validado no navegador. Não foi verificado deploy de produção, consumo mensal da conta, reprodução de vídeos ou qualidade visual de cada uma das 426 origens.

Durante a geração ocorreu ENOSPC no volume do projeto. Apenas o cache desta tarefa foi movido para `/tmp`; o upload foi retomado pelo manifesto. Todos os hashes e a completude foram verificados após a retomada.
