# CARTARALHO — Salvaguarda de hotfix v1.5.1

> **Linha:** v1.5.x, sobre a arquitetura canônica consolidada em P77 e a salvaguarda v1.5.0.
>
> **Regra de autoridade:** este documento registra somente as alterações funcionais/visuais da v1.5.1. Regras de gameplay, economia, BUFFs, progressões, recompensas e persistência não citadas aqui permanecem exatamente como documentadas em `CARTARALHO_SAFEGUARD.md` e `CARTARALHO_V1_5_SAFEGUARD_DELTA.md`.

## 1. Versionamento canônico

A versão corrente deste hotfix é **v1.5.1**.

Fontes de verdade:

- `web/lib/releaseV15.js` — release histórica v1.5.0;
- `web/lib/releaseV151.js` — release corrente v1.5.1;
- `web/api/version.js` — expõe a versão corrente e a linhagem;
- `web/api/notifications.js` — publica a versão corrente e o histórico na Central de Notificações.

Linhagem preservada:

```text
P75 → P76 → P77 → v1.5.0 → v1.5.1
```

### Regra obrigatória para próximos hotfixes/releases

Nenhuma alteração considerada entregue deve chegar à `main` sem:

1. novo identificador de versão quando a mudança fizer parte de um hotfix/release;
2. objeto `RELEASE` próprio, sem sobrescrever releases anteriores;
3. `/api/version` apontando para a versão corrente e preservando a linhagem;
4. `/api/notifications` usando a versão corrente e inserindo o novo release antes dos anteriores;
5. descrição objetiva das mudanças visíveis na Central de Notificações;
6. contrato automatizado que impeça regressão desse encadeamento.

A Central de Notificações não deve voltar a usar `releaseP77` ou `releaseV15` como versão corrente após v1.5.1.

---

## 2. Compartilhamento direto da sala

Owner funcional:

- `web/public/js/domains/roomShareUI.js`

Owner visual:

- `web/public/css/roomSetupDashboardCurrent.css`

### Resultado canônico v1.5.1

A faixa inteira do link direto é a ação de copiar.

Invariantes:

- não existe botão interno separado `Copiar`;
- clique em qualquer ponto da faixa copia o URL;
- Enter e Espaço também acionam a cópia quando a faixa está focada;
- há hint discreto centralizado `clique para copiar`;
- após sucesso, o hint pode mostrar `link copiado!` temporariamente;
- o URL nunca usa `text-overflow: ellipsis`;
- o URL nunca é quebrado em duas linhas;
- em telas estreitas, a linha pode rolar horizontalmente dentro da faixa para preservar o endereço integral.

### Sinal de regressão

Se aparecer `…`, URL quebrado, botão `Copiar` separado ou área da faixa sem ação de cópia, reparar primeiro `roomShareUI.js` e `roomSetupDashboardCurrent.css`.

---

## 3. Configurar Mesa — cabeçalho e dashboard

Owners:

- `web/public/js/domains/roomUI.js`
- `web/public/css/roomSetupDashboardCurrent.css`
- markup-base: `web/public/js/screens/createRoom.js`

### Mobile

O título e a descrição devem possuir área segura suficiente para que os controles `Voltar` e `Missões` não os sobreponham.

A descrição também deve manter separação visual clara do primeiro card de configuração.

### Desktop

O dashboard canônico é:

```text
┌──────────────────────────┬─────────────────────────────┐
│ Configuração da mesa     │ Resumo da partida   ABERTO │
│                          ├─────────────────────────────┤
│                          │ Estimativa           ABERTO │
│                          ├─────────────────────────────┤
│                          │ Como Jogar        RETRAÍDO │
└──────────────────────────┴─────────────────────────────┘
```

Grid autoritativo:

```css
grid-template-areas:
  'config summary'
  'config estimate'
  'config howto';
```

O gap principal é uniforme (`14px`) e deve servir tanto ao espaço horizontal entre colunas quanto ao espaço vertical entre os cards da coluna direita.

### Acordeões

- `Resumo da partida`: inicia aberto;
- `Estimativa para mesa cheia`: inicia aberta;
- `Como Jogar`: inicia retraído;
- `Como Jogar` expande para baixo, dentro da coluna direita;
- alterar uma regra não pode fazer o Resumo fechar acidentalmente.

A antiga composição `howto howto`, em largura total sob as duas colunas, está **SUPERSEDED** na v1.5.1.

---

## 4. Perfil e Sair — centralização e contenção

Owner funcional:

- `web/public/js/domains/accountUI.js`

Owners visuais:

- `web/public/css/accountActionsCurrent.css`
- `web/public/css/accountCurrent.css`

### Causa da regressão corrigida

A centralização anterior usava glifos de fonte/emoji (`👤` e `↪`). Mesmo com o container matematicamente centralizado, a caixa tipográfica desses caracteres é assimétrica e produzia desalinhamento óptico.

Além disso, no mobile o grupo de ações não tinha reserva rígida de largura dentro do account strip e podia ultrapassar a tag visual.

### Resultado canônico v1.5.1

Os ícones são SVGs geométricos próprios com `viewBox="0 0 24 24"`.

Invariantes:

- não depender de emoji/fonte para Perfil ou Sair;
- SVG centralizado dentro do icon well;
- desktop mantém cards próprios e texto;
- mobile oculta texto e mantém somente ícones;
- até 620px, cada ação usa 40×40px;
- o grupo mobile reserva 85px para as duas ações e o gap;
- até 360px, cada ação pode reduzir para 36×36px e o grupo para 76px;
- o account strip não pode permitir que Perfil/Sair ultrapassem sua borda;
- a carteira pode encolher antes de empurrar as ações para fora;
- conteúdo excedente da faixa mobile deve ser contido pelo próprio owner, não por offsets negativos.

### Sinal de regressão

Se o quadrado estiver centralizado mas o desenho parecer deslocado, verificar se alguém reintroduziu texto/emoji no `accountUI.js`.

Se os botões saírem da tag no mobile, verificar primeiro as reservas de `85px/76px` em `accountCurrent.css` e os tamanhos `40px/36px` em `accountActionsCurrent.css`.

---

## 5. Central de Notificações

Owner de UI:

- `web/public/js/domains/notificationsUI.js`

API autoritativa:

- `web/api/notifications.js`

Release corrente:

- `web/lib/releaseV151.js`

### v1.5.1 deve aparecer como atualização

A Central deve exibir:

- **VERSÃO ATUAL: v1.5.1**;
- release `v1.5.1 — hotfix de interface e configuração de mesa` no topo de `Últimas atualizações`;
- `v1.5.0` preservada imediatamente como release histórica anterior;
- releases PXX anteriores preservadas abaixo.

O hotfix v1.5.1 registra:

- faixa inteira do link de sala clicável para copiar;
- URL mobile integral sem truncamento;
- respiros do cabeçalho de Configurar Mesa;
- dashboard desktop em duas colunas com stack informativo à direita;
- Como Jogar retraído por padrão;
- centralização vetorial de Perfil/Sair;
- contenção dos botões Perfil/Sair dentro da faixa da conta no mobile.

---

## 6. Contratos de não-regressão

Principais contratos afetados/reconciliados:

- `web/tests/roomSetupResponsive.contract.test.js`;
- `web/tests/v15Integrity.contract.test.js`;
- `web/tests/p15LayoutSummary.contract.test.js`;
- `web/tests/p21SmallBugsUI.contract.test.js`;
- `web/tests/p56DesktopActionsCardModal.contract.test.js`.

Expectativas históricas explicitamente supersedidas:

- `Como Jogar` ocupando `howto howto` nas duas colunas;
- botões mobile Perfil/Sair em 44×44px quando isso estoura a faixa;
- ícones baseados em glifo/emoji;
- versão corrente da Central presa em P77 ou v1.5.0.

Nenhuma dessas mudanças altera regra de jogo.

---

## 7. Procedimento de reparo rápido

| Sintoma | Verificar primeiro |
|---|---|
| Link mostra `…` | `roomSetupDashboardCurrent.css` → `.direct-room-link-line` |
| Link exige botão interno | `roomShareUI.js` |
| Voltar/Missões sobrepõem título | `roomSetupDashboardCurrent.css` → `.create-room-screen>h2` / subtitle |
| Como Jogar volta para largura total | `grid-template-areas` em `roomSetupDashboardCurrent.css` |
| Resumo fecha após mexer em regra | wrapper de `CreateRoomScreen.updateSummary` em `roomUI.js` |
| Ícone Perfil/Sair parece torto | SVGs em `accountUI.js`, não usar emoji |
| Botões saem da tag mobile | `accountCurrent.css` + `accountActionsCurrent.css` |
| Central mostra P77/v1.5.0 como atual | `api/notifications.js`, `api/version.js`, `releaseV151.js` |
| v1.5.1 não aparece em Últimas atualizações | array `releases` em `api/notifications.js` |

---

## 8. Regra de continuidade

Para v1.5.2 ou próxima versão:

> **Não sobrescrever `releaseV151.js`.** Criar um novo release, atualizar os dois endpoints de versão/notificações, preservar a linhagem e acrescentar nova salvaguarda/delta quando houver mudança de comportamento ou reparo estrutural relevante.
