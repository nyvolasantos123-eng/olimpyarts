# Olimpy Arts

Site de serviços de design gráfico, thumbnails, artes para streaming e desenvolvimento de sites.

## Publicação

O código é publicado automaticamente pelo GitHub na Netlify, em https://olimpyarts.netlify.app/. A página principal é `index.html` e as imagens ficam em `assets/`.

## Pedidos e WhatsApp

O botão de orçamento chama `POST /api/next-whatsapp`, atendido pela função `netlify/functions/next-whatsapp.mjs`. O rodízio entre Leandro e Santos é compartilhado e armazenado no Netlify Blobs, com escritas condicionais para pedidos simultâneos.

## SEO

Os arquivos `robots.txt`, `sitemap.xml`, metadados sociais e o bloco de dados estruturados ajudam buscadores a descobrir o site. A indexação em buscadores exige tempo e não é garantida.
