# Imagens responsivas e economia de tráfego

Objetivo: servir WebP menores nos cards, miniaturas e fotos principais, carregando a ampliação apenas ao abrir o lightbox. Preservar todos os originais no Blob e o layout atual.

1. Testar geração em 160/480/960/1600 px sem ampliar, recortar ou perder transparência. Gerar/upload de forma retomável, com hash e receita no manifesto e cache local ignorado.
2. Aplicar src/srcset/sizes no HTML estático usando posições do parser, preservando conteúdo e schemas. Miniaturas usam 160 px; cards 480/960; principal/hero 480/960; ampliação 1600. Metadados usam 960.
3. Compartilhar a seleção das variantes com busca, catálogo dinâmico, rotação do hero e troca de fotos. Não baixar fotos ocultas ou de ampliação antes da interação. Respeitar Save-Data e pausar rotação fora da tela.
4. Validar hashes remotos, build repetível sem token, páginas/catálogo e navegador desktop/mobile: requisições iniciais, troca de miniatura e ampliação. Medir bytes antes/depois e salvar evidências.

Restrições: sem exclusão de originais ou reescrita de histórico; token apenas no ambiente; build não gera nem envia imagens; fotos novas sem variantes devem bloquear publicação em vez de voltar silenciosamente aos originais grandes.
