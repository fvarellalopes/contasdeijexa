# Migração das imagens públicas para Vercel Blob

Escopo autorizado: enviar imagens públicas, atualizar referências do catálogo e das páginas e validar antes de retirar os binários dos próximos commits. Preservar originais locais e histórico Git.

1. Inventariar imagens em dist; enviar usando token apenas no ambiente, caminhos com SHA-256 e manifesto público em data/blob-assets.json.
2. Comparar os bytes remotos pelo SHA-256 antes de aplicar referências no HTML, CSS, JavaScript e metadados.
3. Aplicar manifesto também no build para suportar regenerações; preservar URLs já migradas em execuções repetidas.
4. Excluir imagens migradas e originais dos próximos commits e deploys, mantendo cópias locais.
5. Verificar idempotência, ausência de referências locais às imagens, páginas/catálogo, Analytics e busca. O teste do seletor já falhava antes desta migração.

Revisão: o manifesto não contém credenciais; upload é retomável; não sobrescrever versões diferentes da mesma imagem; não publicar fotos internas; não alterar o histórico Git.
