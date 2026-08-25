# CARTARALHO — Salvaguarda Delta v1.5.3

## Escopo
Hotfix visual da linha v1.5. Não altera regras de gameplay, economia, BUFFs, progressão, recompensas, persistência ou regras de sala. O objetivo é preservar a arquitetura por owners e corrigir três pontos de apresentação observados em produção após v1.5.2.

## 1. Faixa da conta — carteira x Perfil
**Owner:** `web/public/css/accountCurrent.css`

### Resultado canônico v1.5.3
- Desktop: o grupo Perfil/Sair mantém separação visual própria em relação ao mostrador de dinheiro; `p56-account-actions` não deve encostar na carteira.
- Tablet: a separação é reduzida de forma proporcional, mas continua visível.
- Mobile: a distância carteira→Perfil existe sem perder a contenção conquistada em v1.5.1/v1.5.2.
- A faixa mantém `padding-inline` de proteção nas extremidades e não pode gerar overflow horizontal.

### Invariantes
- Perfil/Sair continuam vetoriais e concêntricos.
- Não aumentar largura de ações sem recalcular o espaço reservado da carteira.
- Não remover o respiro lateral do avatar/Sair introduzido na v1.5.2.

## 2. Marca 🧬 Original — ficha/estatísticas
**Owner visual:** `web/public/css/cardLibraryPresentationCurrent.css`
**Owner semântico/bridge:** `web/public/js/canonicalCardBadge.js`

### Resultado canônico v1.5.3
- `Minhas Cartas` continua usando a marca interna discreta `🧬 Original`.
- A ficha/estatísticas reutiliza exatamente a mesma marca canônica.
- Na ficha, a marca possui offset vertical próprio para não ficar colada ao texto `CARTA PARA CARTARALHO`.
- Não duplicar lógica de originalidade dentro de `cardsLibrary`.

### Runbook
Se a marca voltar a encostar no rodapé, corrigir apenas o posicionamento específico de `.p56-card-preview-host .p57-detail-game-card .canonical-original-mark`; não alterar o helper canônico nem criar outra tag externa.

## 3. Missões — recompensas
**Owner UI:** `web/public/js/domains/missionsUI.js`
**Owner visual:** `web/public/css/missionsTwoColumnCurrent.css`

### Resultado canônico v1.5.3
A ordem das recompensas permanece:
1. moedas;
2. XP;
3. BUFF.

As três recompensas devem ocupar a mesma linha quando apresentadas no card da missão, inclusive no layout mobile suportado. O prêmio de BUFF deve possuir respiro horizontal interno suficiente para que ícone e texto não encostem na borda da pill.

### Exemplo canônico
`[🪙 +60] [ +300 XP ] [🎲 1× Dedo no Olho]`

### Não fazer
- Não voltar a forçar `.p10-mission-buff` para `grid-row: 2`.
- Não separar o BUFF em um container independente das outras recompensas.
- Não alterar o reward real da missão; esta versão modifica somente a apresentação.

## 4. Versionamento e Central de Notificações
**Release atual:** `v1.5.3`

Arquivos:
- `web/lib/releaseV153.js`
- `web/api/version.js`
- `web/api/notifications.js`

Linhagem preservada:
`v1.4.75 → v1.4.76 → v1.4.77 → v1.5.0 → v1.5.1 → v1.5.2 → v1.5.3`

A Central de Notificações deve apresentar v1.5.3 no topo, mantendo v1.5.2 e versões anteriores no histórico.

## 5. Evidência obrigatória
- contratos: `web/tests/v153VisualPolish.contract.test.js`;
- browser acceptance focado: `web/tests/v153VisualAcceptance.js`;
- CI: `.github/workflows/web-tests.yml`;
- o teste visual deve comprovar:
  - espaço carteira→Perfil;
  - ausência de overflow;
  - recompensas de missão alinhadas na mesma linha;
  - padding lateral do BUFF;
  - clearance da marca Original na ficha.

## 6. Resultado x trajetória
- P52: missões/recompensas;
- P56: ficha/progressão da carta;
- P57: biblioteca de cartas;
- v1.5.1: centralização/contenção Perfil/Sair;
- v1.5.2: respiro das bordas da faixa + Original na ficha;
- v1.5.3: separação carteira→Perfil + clearance de Original + BUFF de missão novamente na linha principal de recompensas.
