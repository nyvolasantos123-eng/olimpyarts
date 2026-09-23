OLIMPY ARTS — V6 CORRIGIDA (BASE V5)

Esta versão parte diretamente da V5 e NÃO usa a arquitetura/referência do Immersive Garden.

Ajustes desta revisão:
- logo oficial da Olimpy no cabeçalho;
- cabeçalho reformulado e com progresso de scroll;
- faixa de serviços em loop infinito;
- remoção de microtextos/códigos genéricos e expressões em inglês que pareciam template;
- hero mais útil, com atalhos reais para serviços;
- seção de resultados sem métricas artificiais;
- conteúdo em português e linguagem mais direta;
- rodízio global de WhatsApp, carrinho, parcelamento e mensagens UTF-8 da V5 preservados.

OLIMPY ARTS — V5 / ESTRUTURA COMERCIAL + RODÍZIO DE WHATSAPP

PRINCIPAIS MUDANÇAS
- Navegação reorganizada por intenção: empresa/site, criador/streamer e pedido personalizado.
- Comparativo “antes x depois” mais concreto, focado em oferta, CTA, organização e conversão.
- Serviços separados por categoria, com preços atualizados:
  • Thumbnail Profissional: R$ 25/unidade
  • Edição Básica: R$ 45
  • Edição Intermediária: R$ 70
  • Edição Completa: R$ 120
  • Stream Pack Completo: R$ 200
- Planos de site existentes preservados: Presence R$ 250, Commerce R$ 500 e Dominion R$ 990.
- Carrinho e simulação de parcelamento preservados e atualizados para os novos itens.
- Mensagens do WhatsApp padronizadas em UTF-8 com emojis nativos (💳 💸 📌 🛒 etc.).
- Rodízio global de WhatsApp via Netlify Function + Netlify Blobs:
  1º atendimento → Leandro: +55 11 95448-6713
  2º atendimento → Santos: +55 11 95142-2087
  3º → Leandro, e assim por diante.
- Se a função do Netlify ficar indisponível, o front-end usa um fallback local para não impedir o contato.

PUBLICAÇÃO NO NETLIFY
1. Publique o projeto completo (não apenas index.html).
2. Preferência: GitHub conectado ao Netlify ou Netlify Drop estando logado, para o build instalar as dependências.
3. O package.json declara @netlify/blobs; o build do Netlify instala a dependência.
4. A função netlify/functions/next-whatsapp.mjs será publicada no endpoint /api/next-whatsapp.
5. O estado do rodízio fica persistido no Netlify Blobs e continua entre novos deploys.

MÚSICA “CONGRATULATIONS”
A música do Post Malone não foi incluída no ZIP porque é uma faixa protegida por direitos autorais e o projeto não recebeu um arquivo/licença de uso.
O player já está preparado para procurar primeiro por:
  congratulations-licensed.mp3
Se vocês tiverem autorização/licença e colocarem uma cópia com esse nome na raiz do site, ela será usada. Se o arquivo não existir, o site continua usando ambient-olimp.mp3 como fallback.
O volume foi reduzido para 8% e o áudio só inicia depois do clique de entrada, respeitando as restrições de autoplay dos navegadores.

ARQUIVOS NOVOS
- package.json
- netlify.toml
- netlify/functions/next-whatsapp.mjs

ARQUIVOS PRINCIPAIS
- index.html
- styles.css
- script.js
- hero-strategy.png
- ambient-olimp.mp3

ATUALIZAÇÃO EMOJI / WHATSAPP
- O JavaScript principal agora se chama olimpy-app-v7.js para evitar cache de versões antigas.
- Emojis são criados via String.fromCodePoint, sem depender da codificação literal do arquivo.
- O link do WhatsApp usa URLSearchParams para serialização UTF-8.


CORREÇÃO WHATSAPP V9
- Removido wa.me do envio com mensagem.
- Agora usa diretamente https://api.whatsapp.com/send?phone=...&text=...
- Isso evita o redirecionamento que pode converter emojis em caractere de substituição no WhatsApp Web.
