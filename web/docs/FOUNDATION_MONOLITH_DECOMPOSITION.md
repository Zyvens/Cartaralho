# Decomposição segura — `professionalUI.js` e `meta.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P77 / v1.4.77**  
> Status: **FECHADO EM RUNTIME**.

## Resultado

Os dois monólitos de frontend deixaram de possuir comportamento runtime exclusivo. A decomposição foi feita por resultado observável, preservando bindings lexicais, ordem de carregamento e fluxos existentes.

### `professionalUI.js` — SUPERSEDED

O arquivo é agora apenas shim compatível. Seus resultados foram distribuídos para:

- `domains/registrationUI.js` — cadastro explícito de usuário/nickname/senha, recovery code;
- `domains/appPanelUI.js` — shell dos painéis e rota Perfil → `ProfileModal`;
- `domains/socialFoundationUI.js` — amizades, pedidos, turmas e entrada da Home;
- `domains/homePresentationUI.js` — composição visual profissional da Home;
- `domains/cardsLibrary.js` — Minhas Cartas;
- `domains/profileUI.js` — Perfil, raridade e progressão visual;
- `domains/navigationUI.js` / `domains/accountUI.js` — navegação e account strip finais.

`professionalUI.js` não registra mais `HomeScreen.openPanel`, `HomeScreen.register`, renderAccount, SocialUI, AppPanelModal ou patches de ProfileModal. Mantém apenas delegates de compatibilidade para `polishHome` e `renderCards`.

### `meta.js` — HISTORICAL / NÃO EXECUTÁVEL

`meta.js` saiu do runtime e aparece no `index.html` somente como `application/x-cartaralho-legacy`.

A API e os resultados sobreviventes foram distribuídos para:

- `metaClient.js` — **`const MetaClient` lexical** + exposição em `window`, preservando a semântica exigida pela trajetória P77;
- `metaUIBase.js` — namespace mínimo `MetaUI` para compatibilidade entre módulos;
- `domains/historyUI.js` — Histórico e Replay;
- `domains/socialGroupsUI.js` — detalhe/ranking/histórico de Turmas;
- `domains/reactionsUI.js` — dock e apresentação de reactions;
- `domains/spectatorUI.js` — lifecycle completo do Modo Espectador;
- `domains/roomShareUI.js` — link direto, hint e compartilhamento da sala;
- `domains/metaLifecycleUI.js` — transporte de `reaction` pelo lifecycle normal do `SocketClient`;
- `domains/missionsUI.js` — superfície completa de Missões, sem implementation-base do monólito;
- `domains/identityUI.js` — catálogo completo de títulos, cores e observer de decoração;
- `domains/rankUI.js` — renderer completo de Rank/Halls, sem wrapper sobre `MetaUI.renderRank`;
- `domains/navigationUI.js` — pós-navegação: reaction dock, room-share e montagens da Home;
- `domains/accountUI.js` — entradas de Amigos, Espectador, Missões e link direto;
- `domains/profileUI.js` / `ProfileModal` — experiência atual de perfil.

## Regressões de trajetória encontradas e corrigidas

1. **Perfil:** aposentar `professionalUI` removeu junto a rota para o modal. `appPanelUI` agora garante `profile → ProfileModal.open('profile')`.
2. **MetaClient lexical:** a extração foi feita preservando `const MetaClient`; não foi convertido para uma dependência exclusivamente em `window`, evitando repetir a classe de bug corrigida em P77.
3. **Missões:** `missionsUI` passou a possuir FAB/card diretamente e mantém moedas + XP + BUFF, sem auto-open no startup.
4. **Rank:** deixou de decorar renderer antigo e passou a ser renderer integral.
5. **Identidade:** catálogo-base histórico e títulos posteriores foram unidos no owner de identidade; também foi removido um acesso `window.AuthClient` incompatível com o padrão lexical atual.
6. **Reactions:** o binding direto antigo de sala foi substituído por um transporte canônico em `metaLifecycleUI`.

## Evidências

- `tests/registrationOwnership.contract.test.js`
- `tests/appPanelSocialOwnership.contract.test.js`
- `tests/homePresentationOwnership.contract.test.js`
- `tests/metaClientOwnership.contract.test.js`
- `tests/metaContentOwnership.contract.test.js`
- `tests/metaMonolithRetirement.contract.test.js`
- `tests/foundationMonolithBoundaries.contract.test.js`

O corte de `meta.js` (`ee5b5eb8ae510434d37c693e977b35790d2de6eb`), o contrato específico (`eca04f8d0a80b408e0612d35be35991c42ae43ec`) e o contrato consolidado dos dois monólitos (`f14f87d94e8cbe516419bf6d13f68fcc715460e2`) chegaram a preview Vercel **READY**.

## Próximo gate

A arquitetura de monólitos está fechada. A sequência passa a ser:

1. varrer writers/listeners duplicados restantes entre foundations legítimas;
2. classificar/remover wrappers e fallbacks físicos, inclusive `app.js`, somente com contratos equivalentes;
3. executar comparação visual desktop/mobile antes de remover shims CSS;
4. CI integral + aceite desktop/mobile/iPhone/PWA/multiplayer;
5. manter PR #96 Draft até autorização expressa.
