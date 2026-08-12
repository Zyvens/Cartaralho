# Cartaralho — build online (Vercel + Neon + Pusher)

Esta pasta é uma versão separada do jogo, feita para rodar 100% na Vercel
(serverless), com o estado da partida no Neon Postgres e o tempo real
(mesas, rodadas, etc.) via Pusher Channels — porque funções serverless da
Vercel não mantêm conexões WebSocket persistentes nem memória compartilhada
entre instâncias, então o Socket.IO original (usado no app desktop em
`server/`) não funciona nesse ambiente.

O app desktop (Electron) em `../server` e `../public` **não foi alterado**
por essa pasta — os dois builds são independentes.

## 1. Criar o banco (Neon Postgres)

Mais fácil pelo próprio painel da Vercel:

1. No projeto da Vercel → aba **Storage** → **Connect Store** → **Neon** → criar/conectar.
2. Isso já injeta a variável `DATABASE_URL` no projeto automaticamente.
3. Rode o `db/schema.sql` deste diretório contra o banco criado (pelo SQL
   Editor do próprio Neon, ou `psql "$DATABASE_URL" -f web/db/schema.sql`).

## 2. Criar o Pusher (tempo real)

1. Crie uma conta grátis em https://dashboard.pusher.com (plano Sandbox é suficiente para começar).
2. Crie um app do tipo **Channels**.
3. Na aba "App Keys", pegue `app_id`, `key`, `secret` e `cluster`.

## 3. Variáveis de ambiente na Vercel

Em Project → Settings → Environment Variables, adicione (veja `.env.example`):

- `DATABASE_URL` (se não veio automático do passo 1)
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `ADMIN_USER` (padrão sugerido: `admin`)
- `ADMIN_PASSWORD` (escolha uma senha forte — protege o painel de edição do baralho)

## 4. Deploy

Ao importar o repositório `Zyvens/Cartaralho` na Vercel, defina o **Root
Directory** do projeto como `web` (Project Settings → General → Root
Directory). A Vercel detecta `web/public` (estático) e `web/api` (funções)
automaticamente — não precisa de framework nem build command.

```bash
cd web
vercel link
vercel env pull .env.local   # opcional, só para rodar localmente com `vercel dev`
vercel --prod
```

## Como funciona (resumo)

- Cada aba do navegador gera um `playerId` estável (salvo no localStorage),
  que substitui o antigo `socket.id`.
- Toda ação do jogo (criar sala, jogar carta, etc.) é uma chamada HTTP para
  `/api/...`, que lê/grava o estado da sala no Postgres.
- Cada mudança de estado é publicada num canal Pusher `room-<CODIGO>`; todo
  jogador na sala está inscrito nesse canal e recebe a atualização em tempo real.
- Como o Pusher manda o mesmo payload pra todo mundo (não dá pra mandar a
  mão de cada jogador em um único evento), a mão de cada jogador é buscada
  à parte logo depois do evento `new_round` (`/api/game/hand`).
- Não existe timer no servidor (serverless não tem processo contínuo): o
  avanço automático de rodada (5s após o resultado) é agendado por cada
  cliente e é idempotente — o primeiro pedido que chegar avança a rodada,
  os outros são no-op.
- "Jogador desconectou" também não existe mais como evento de socket: cada
  cliente manda um heartbeat a cada 15s; se parar de mandar por ~35s ele
  aparece como desconectado, e após 2 minutos é removido da sala — mesmos
  prazos do app desktop, só que baseados em heartbeat em vez de socket.

## O que não foi portado

- **Multiplayer local (mesmo aparelho / "pass-and-play")** e **hospedar
  local + localtunnel**: são recursos específicos do app desktop (uma
  máquina hospeda, outras entram pela rede/túnel). Não fazem sentido numa
  versão que já roda na nuvem — todo jogador já entra direto pelo link
  público, de qualquer celular.
