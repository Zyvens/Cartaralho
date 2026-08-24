# CARTARALHO — Salvaguarda de transição v1.5.0

> **Status:** delta arquitetural/funcional da linha v1.5 sobre a salvaguarda P01–P77.
>
> **Base:** `main` pós-consolidação P77 (`web/docs/CARTARALHO_SAFEGUARD.md`).
>
> **Branch de implementação:** `feature/v1.5-ui-data-integrity`.
>
> **Regra de autoridade:** este documento não substitui regras de gameplay P01–P77 que não foram explicitamente alteradas abaixo. Ele registra somente as mudanças autorizadas da v1.5 e os novos invariantes de recuperação.

## 1. Objetivo da v1.5

A v1.5 é a primeira linha de produto criada **diretamente sobre owners canônicos**, sem criar um novo P78/PXX concorrente. Toda correção desta entrega deve continuar pertencendo ao owner já responsável pelo domínio.

A versão corrente da branch é `v1.5.0`, declarada em:

- `web/lib/releaseV15.js`
- `web/api/version.js`

A linhagem de versão continua preservando P75 → P76 → P77 → v1.5.

---

## 2. Mapa rápido de reparo v1.5

| Sintoma | Owner/fonte primária | Contrato de proteção |
|---|---|---|
| Perfil/Sair cortados no desktop | `public/css/accountActionsCurrent.css`, `accountCurrent.css` | `p56DesktopActionsCardModal.contract.test.js`, `v15Integrity.contract.test.js` |
| CTA Criar Mesa distante do Como Jogar / dashboard esparso | `public/css/roomSetupDashboardCurrent.css`, markup em `screens/createRoom.js` | `v15Integrity.contract.test.js` |
| Carta Original volta a virar badge externo grande | `public/js/canonicalCardBadge.js`, `cardLibraryPresentationCurrent.css` | `baseModuleOwnership.contract.test.js`, `v15Integrity.contract.test.js` |
| Título/Moldura salva ao clicar em vez de apenas experimentar | `public/js/domains/profileUI.js` | `p17FrameRarity`, `p20PublicCosmeticsShowcase`, `p23ProfileGenesisSave`, `v15Integrity` |
| Volta a aparecer seletor redundante de Título/Moldura no Perfil | `profileUI.js`, `profileSaveFooterCurrent.css` | `p40HomeIdentityRarity`, `v15Integrity` |
| `Usando` reaparece junto de `Equipado` | `profileUI.js`, `profileSaveFooterCurrent.css` | `v15Integrity`, `p20PublicCosmeticsShowcase` |
| BUFF de missão volta para a mesma linha de moedas/XP | `missionsTwoColumnCurrent.css` | `p53MobilePolishMissionsProfile`, `v15Integrity` |
| Pills da ficha de carta desalinhadas / histórico com grandes vazios | `cardDetailCurrent.css` | `v15Integrity`, browser acceptance |
| Raridade de BUFF cola novamente no pill BUFF | `buffRarityCurrent.css` | `v15Integrity` |
| Rank/Hall volta a receber contas `qa_*` | `api/auth/register.js` + política de CI isolado | `v15Integrity` |
| CI compartilhado volta a criar usuários/mesas reais | `.github/workflows/web-tests.yml`, `visual-smoke.yml` | `v15Integrity` |
| Vercel volta a explodir em dezenas de Functions | `vercel.json` + gateways `serverless/*` | `vercelApiGateway.contract.test.js` + inspeção de deployment |

---

## 3. Faixa de conta — Perfil e Sair

### Resultado canônico v1.5

No desktop, Perfil e Sair continuam sendo ações distintas da conta, mas **não possuem largura mínima rígida capaz de estourar a faixa**.

Owners:

- `public/css/accountActionsCurrent.css`
- `public/css/accountCurrent.css`

Invariantes:

- containers devem permitir `min-width: 0`;
- ações devem poder encolher (`flex: 0 1 auto`);
- Perfil usa `width: clamp(92px, 10.5vw, 132px)` na faixa desktop;
- Sair usa `width: clamp(82px, 9vw, 116px)`;
- a antiga exigência `min-width:142px` está **SUPERSEDED** porque provocava clipping;
- ícones e saldo continuam obrigatoriamente visíveis no primeiro paint.

Não restaurar métricas P56 apenas porque um contrato histórico mencionar valores antigos: os contratos foram reconciliados para proteger o resultado v1.5.

---

## 4. Configurar Mesa — compactação do dashboard

Markup autoritativo: `public/js/screens/createRoom.js`.

Owner visual: `public/css/roomSetupDashboardCurrent.css`.

### Desktop

O dashboard usa as áreas:

```text
config    | summary
config    | estimate
howto     | howto
---------- CTA Criar Mesa ----------
```

Configuração atual:

- colunas: `minmax(320px,.9fr) minmax(360px,1.1fr)`;
- gap principal: `14px`;
- largura máxima: `1160px`;
- `Como Jogar` ocupa a largura das duas colunas;
- CTA `Criar Mesa` fica em container próprio com `margin-top:18px`;
- lista `Como Jogar` usa duas colunas em desktop.

### Mobile

Abaixo de `760px`:

```text
config
summary
estimate
howto
CTA
```

`Como Jogar` retorna a uma coluna.

### Regra de recuperação

Se houver espaço vazio excessivo, não mover conteúdo para PXX ou duplicar cards. Ajustar `roomSetupDashboardCurrent.css` respeitando as mesmas quatro áreas. Informações e funcionalidades de regras/recompensas não podem ser removidas para compactar a página.

---

## 5. Carta Original

Owner funcional: `public/js/canonicalCardBadge.js`.

Owner visual: `public/css/cardLibraryPresentationCurrent.css`.

### Resultado canônico v1.5

A autoria original continua sendo uma propriedade real da carta, mas sua marca visual é agora **interna e discreta**.

- texto visual: `🧬 Original`;
- `aria-label`: `Carta Original`;
- classe: `.canonical-original-mark`;
- a marca é anexada ao próprio elemento `.game-card`/`.p57-library-game-card`;
- ângulo atual: `rotate(-13deg)`;
- não existe mais badge externo grande `CARTA ORIGINAL`.

A remoção do texto externo **não altera autoria, progressão, Legado ou identificação de Carta Original no backend**.

---

## 6. Títulos e Molduras — preview transacional

Owner canônico: `public/js/domains/profileUI.js`.

Foundation de markup: `public/js/profileModal.js`.

Owner visual de persistência/preview: `public/css/profileSaveFooterCurrent.css`.

### Regra fundamental

**Clique não equipa. Clique experimenta. Salvar equipa. X descarta.**

Ao abrir o Perfil:

1. `_appearanceSaved` recebe `titleKey` e `frameKey` persistidos;
2. `data.equipped` funciona como draft visual durante a sessão do modal;
3. clicar em Título/Moldura desbloqueado chama `setAppearanceDraft`;
4. a identidade dentro do modal muda imediatamente para preview;
5. nenhuma persistência ocorre nesse clique;
6. `Salvar alterações` chama `AuthClient.saveProfile(...)` uma única vez com perfil + `titleKey` + `frameKey`;
7. fechar no X zera `_appearanceSaved/_appearanceDirty` do modal e não grava o draft.

### Seletores antigos

Os antigos selects `data-profile-draft-title` e `data-profile-draft-frame` estão **SUPERSEDED**.

O Perfil básico não deve voltar a oferecer dropdowns de aparência. A escolha acontece nas próprias páginas:

- `Títulos`
- `Molduras`

### Status visual

- `EQUIPADO` = valor persistido no servidor;
- `EXPERIMENTANDO` = item em preview que difere do persistido;
- não mostrar simultaneamente `EQUIPADO` e `EXPERIMENTANDO` para o mesmo item;
- o estado antigo `Usando` não é autoridade de persistência na v1.5;
- ao salvar, o item em preview passa a ser o novo `EQUIPADO`.

### Slot único de moldura permanece

Progressão, cosmético e entitlement especial continuam compartilhando **um único `frameKey`**. A v1.5 muda a UX de escolha, não a regra do slot.

Molduras Bronze, Prata, Ouro e Platina continuam selecionáveis depois de desbloqueadas; níveis superiores não invalidam os anteriores.

Gênese (`genese-celestial`) continua sendo entitlement especial e permanece no mesmo slot.

---

## 7. Missões com recompensa de BUFF

Owner funcional das missões: `public/js/domains/missionsUI.js`.

Owner visual: `public/css/missionsTwoColumnCurrent.css`.

### Resultado v1.5

Em desktop:

- texto/descrição ocupa a coluna principal;
- moedas e XP ficam lado a lado na primeira linha de recompensas;
- BUFF (`.p10-mission-buff`) ocupa sozinho a segunda linha;
- barra de progresso e contador permanecem abaixo.

Em telas estreitas, recompensas descem para o fluxo de uma coluna sem perder nenhuma informação.

A existência de BUFF como recompensa de missão é **funcionalidade aprovada e preservada**; somente a apresentação foi alterada.

---

## 8. Ficha da Carta

Owner visual: `public/css/cardDetailCurrent.css`.

Owners de dados/progressão continuam:

- `public/js/domains/cardsLibrary.js`
- `public/js/domains/cardProgression.js`
- APIs de origem/progressão já documentadas na salvaguarda principal.

### Resultado v1.5

- pills de metadados ficam centralizadas abaixo da carta;
- painel visual e painel de informação usam grid compacto;
- Histórico da carta usa melhor distribuição, evitando cards largos vazios;
- métricas continuam presentes: origem, criador, data, primeira mesa, jogos vistos, pessoas que possuem, mesas vencedoras/perdedoras e demais métricas existentes;
- nenhum dado foi removido para obter compactação.

Se uma métrica desaparecer, tratar como regressão funcional; não considerar a ausência como parte do redesign.

---

## 9. Mercado — raridade do BUFF

Owner visual: `public/css/buffRarityCurrent.css`.

### Resultado v1.5

No card de BUFF:

- tipo `BUFF` permanece à esquerda;
- raridade (`COMUM`, `INCOMUM`, `RARO`, etc.) fica alinhada no canto superior direito;
- raridade não deve parecer parte do mesmo pill de tipo;
- nome, descrição, ícone, preço e botão Comprar permanecem intactos.

A mudança é exclusivamente de hierarquia visual; catálogo, preço, raridade e efeitos dos 21 BUFFs continuam regidos pelos owners/engines já documentados na salvaguarda principal.

---

## 10. Integridade de Rank e Hall da Vergonha

### Saneamento executado antes da v1.5

A base compartilhada havia sido contaminada por E2E que criou usuários e partidas reais.

Foram removidos:

- 86 usuários QA (`qa_host_*`, `qa_player_*`, `qa_third_*`);
- 32 mesas QA;
- 70 registros de origem/presença de cartas exclusivamente atribuíveis às execuções QA;
- vínculos de match players, snapshots/artefatos e telemetria rastreados a essas execuções.

Após a limpeza, foram verificados como usuários reais remanescentes:

- `VitorIvens`
- `Jaiminho`

O Hall da Vergonha não deve contabilizar partidas artificiais de CI.

### Barreira de cadastro QA

`api/auth/register.js` reserva o namespace:

```regex
^qa_(host|player|third)_
```

Essas contas só podem ser criadas quando:

```text
CARTARALHO_ALLOW_QA_ACCOUNTS=1
```

Esse sinalizador deve existir apenas em ambiente de teste explicitamente isolado/disposable.

### Regra de ouro

**Nunca executar teste que cria usuário, sala, partida, presença de carta, loot ou estatística contra o banco compartilhado de produção/preview normal.**

---

## 11. CI isolado na v1.5

Workflows:

- `.github/workflows/web-tests.yml`
- `.github/workflows/visual-smoke.yml`

O browser acceptance compartilhado agora usa servidor local estático em:

```text
http://127.0.0.1:4173
```

O lifecycle multiplayer do CI compartilhado é **simulado**, sem escrita no banco Neon.

`realMultiplayerPreview.js` não é chamado por esses workflows.

Se for necessário E2E real novamente, deve usar banco/branch Neon descartável e credenciais/realtime isolados, com teardown obrigatório.

---

## 12. Evidência do RC funcional v1.5

HEAD funcional auditado antes deste documento:

```text
297ac203f5517632b960ba878b91b490c1d4afdf
```

GitHub Actions:

- workflow: `Web tests #1080`
- run ID: `32790023417`
- full contract suite: **SUCCESS**
- browser acceptance isolado: **SUCCESS**
- multiplayer simulado sem DB compartilhado: **SUCCESS**
- artifact visual: `visual-smoke-evidence`
- artifact ID: `9542810482`

Vercel para o mesmo HEAD:

- deployment: `dpl_5adcEH8ZAHHhDhLnqTQwxvR7vJJv`
- state: `READY`
- branch: `feature/v1.5-ui-data-integrity`
- `lambdaRuntimeStats`: `{ "nodejs": 8 }`

A evidência visual contém Home, Perfil, Minhas Cartas, Mercado, Lobby, Rank, Stats e mobile, além do lifecycle multiplayer simulado.

---

## 13. Contratos PXX reconciliados — não são perda de trajetória

A v1.5 deliberadamente supersede algumas expectativas visuais PXX, sem apagar sua história.

Contratos atualizados:

- `baseModuleOwnership.contract.test.js`: autoria continua canônica, mas marca externa `CARTA ORIGINAL` foi substituída por `🧬 Original` interno;
- `p17FrameRarity.contract.test.js`: slot único e molduras de progressão permanecem, mas escolha agora usa cards/preview em vez de select;
- `p20PublicCosmeticsShowcase.contract.test.js`: preview passa a ser transacional;
- `p23ProfileGenesisSave.contract.test.js`: único Salvar global também controla o draft de aparência;
- `p40HomeIdentityRarity.contract.test.js`: selects P40 ficam supersedidos pelo preview em Títulos/Molduras;
- `p53MobilePolishMissionsProfile.contract.test.js`: BUFF de missão passa à segunda linha;
- `p56DesktopActionsCardModal.contract.test.js`: `min-width:142px` é supersedido por largura flexível anti-clipping.

Isso segue a metodologia **resultado atual × trajetória PXX**: a regra histórica continua rastreável, mas o teste passa a proteger o resultado explicitamente autorizado na versão atual.

---

## 14. Checklist de recuperação da v1.5

Antes de considerar um reparo concluído:

- [ ] alteração foi feita no owner canônico, não em novo PXX;
- [ ] comportamento P01–P77 não citado neste delta permanece intacto;
- [ ] Perfil/Sair não clipam no desktop;
- [ ] `🧬 Original` permanece dentro da carta e discreto;
- [ ] clique em título/moldura apenas experimenta;
- [ ] X descarta aparência não salva;
- [ ] Salvar persiste perfil + título + moldura;
- [ ] somente persistido recebe `EQUIPADO`;
- [ ] preview não salvo recebe `EXPERIMENTANDO`;
- [ ] BUFF de missão permanece em segunda linha;
- [ ] raridade de BUFF permanece no canto superior direito;
- [ ] Configurar Mesa preserva todas as regras/recompensas em layout compacto;
- [ ] testes compartilhados não escrevem em DB compartilhado;
- [ ] namespaces `qa_*` permanecem bloqueados fora de ambiente isolado;
- [ ] full contract suite verde;
- [ ] browser acceptance verde desktop/mobile;
- [ ] Vercel continua em 8 Functions;
- [ ] PR permanece Draft até autorização expressa de merge.

---

## 15. Regra para v1.5.x e versões futuras

Uma correção futura deve modificar o owner deste documento ou o owner principal indicado em `CARTARALHO_SAFEGUARD.md`. Não criar `p78.js`, `p79.css` ou equivalentes como novo writer permanente.

A versão identifica a entrega. **O owner identifica onde o comportamento vive.**
