# Instrumentação atual

- Destino Ads: AW-18528039166. Tag associada informada: GT-5DFRMHK2.
- GA4: G-FMM2ZG0P27.
- Um carregador gtag.js inicializa os dois destinos uma vez por documento.
- `whatsapp_click` usa `send_to: [adsId, measurementId]`, `contact_category: whatsapp`, `event_category: contact`, `event_label: lead`, `contact_channel: whatsapp`, conforme prompt-agente-site.md.
- Esse evento mede clique/intenção de contato, não mensagem enviada ou venda. Enviá-lo ao destino AW não cria uma ação de conversão do Ads. Ainda é necessário configurar a ação na conta (importar do GA4 ou usar uma conversão nativa com rótulo real). Não configurar duas ações principais para o mesmo clique sem analisar duplicação.
- `allow_google_signals: false`, `allow_ad_personalization_signals: false` e o `set` global permanecem. Esses parâmetros não garantem aprovação de anúncios ou conformidade de toda a conta.
- A lista de parâmetros de campanha é explícita e permanece preservada. Outros parâmetros, fragmentos, e-mails evidentes e controles são removidos de page_location. Nenhum dado de cliente deve ser colocado em UTMs.
- O seletor “Comece aqui” não registra as escolhas em evento de Analytics ou cadastro; prepara a mensagem em memória no navegador.
- O controle /cookies/ grava `ijexa-disable-tracking=true` no localStorage ao desativar. Nessa condição analytics.js encerra antes de criar dataLayer, configurar destinos ou carregar a tag. Não afeta fontes, imagens ou serviços externos. Não é uma implementação de Consent Mode ou CMP.
- Não foram alteradas configurações da conta Google: vinculações, objetivos, ações de conversão, retenção, audiências ou labels.

# Páginas de confirmação

/solicitacao-recebida/ e /contato-recebido/ permanecem noindex e fora do sitemap. O site não tem backend de recebimento de formulário. Nunca usar clique no WhatsApp como confirmação de envio nem contar visitas diretas nessas páginas como envio comprovado.

# Verificação

- node scripts/verify-analytics.mjs
- node scripts/verify-selector.mjs
- node scripts/verify-site.mjs

Os testes verificam código e HTML, não recebimento real de dados na conta Google nem visualização em navegador.
