import {readFileSync} from 'node:fs';
import {footer as storefrontFooter} from './storefront-footer.mjs';
import {shippingBanner} from './commercial-content.mjs';
import {addSearch} from './search-header.mjs';
const home=readFileSync('dist/index.html','utf8');
export const escapeHtml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const header=addSearch(home.match(/<header>[\s\S]*?<\/header>/)[0].replaceAll('src="assets/','src="/assets/')) + shippingBanner;
export const footer=storefrontFooter;
export function page({title,description,route,content,scripts=[]}){
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} | Contas de Ijexá</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://contasdeijexa.com.br${route}"><meta property="og:locale" content="pt_BR"><meta property="og:type" content="website"><meta property="og:site_name" content="Contas de Ijexá"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="https://contasdeijexa.com.br${route}"><link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="stylesheet" href="/assets/site.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"><script defer src="/assets/analytics-config.js"></script><script defer src="/assets/analytics.js"></script></head><body>${header}<main class="shell">${content}</main>${footer}${scripts.map(src=>`<script src="${src}"></script>`).join('')}</body></html>`;
}
