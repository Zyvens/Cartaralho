# Decomposição segura — `professionalUI.js` e `meta.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P77 / v1.4.77**  
> Regra: cada resultado observável precisa de owner explícito antes de um monólito deixar de executar.

## Estado final dos monólitos

### `professionalUI.js` — FECHADO

O arquivo não possui mais ownership runtime. Permanece apenas como shim compatível para delegates antigos de `polishHome/renderCards`.

Owners finais:

- Registro → `domains/registrationUI.js`;
- AppPanel + rota Perfil → `domains/appPanelUI.js`;
- Social foundation → `domains/socialFoundationUI.js`;
- Home presentation → `domains/homePresentationUI.js`;
- Cartas → `domains/cardsLibrary.js`;
- Perfil → `profileModal.js` + `domains/profileUI.js`;
- Navegação/Conta → `domains/navigationUI.js` + `domains/accountUI.js`.

### `meta.js` — FECHADO

`meta.js` está no `index.html` como `application/x-cartaralho-legacy` e não executa.

Owners finais:

- `MetaClient` → `metaClient.js` como binding lexical `const`;
- namespace mínimo → `metaUIBase.js`;
- Histórico/Replay → `domains/historyUI.js`;
- Turmas → `domains/socialGroupsUI.js`;
- reactions → `domains/reactionsUI.js` + `domains/metaLifecycleUI.js`;
- Espectador → `domains/spectatorUI.js`;
- room share/link direto → `domains/roomShareUI.js`;
- Missões → `domains/missionsUI.js`;
- Identidade/títulos → `domains/identityUI.js`;
- Rank/Halls → `domains/rankUI.js`;
- pós-navegação → `domains/navigationUI.js` / `domains/accountUI.js`.

## Gates adicionais fechados depois da retirada dos monólitos

- `app.js` reduzido a shell lexical; lifecycle pertence integralmente a `core/*`.
- `metaFixes.js` convertido em bridge explícita `publicProfileUI`, eliminando título duplicado e listener global de fechamento.
- `minimumPlayersGrace.js` aposentado; overlay/timer/lifecycle pertencem integralmente a `domains/gameplayUI.js`.
- `notificationsUI.js` aposentado; Central completa pertence a `domains/notificationsUI.js`.

## Bridges que NÃO devem ser apagadas ainda

- `canonicalCardBadge.js` — único resultado atual de **🧬 CARTA ORIGINAL**.
- `cardProgressionUI.js` — único resultado atual de **Meu Legado** e **DIRETO DA FONTE**.

O critério continua sendo resultado-vs-trajetória: bridge só sai quando o resultado tiver owner equivalente e contrato.

## Gates

- [x] writers supersedidos identificados;
- [x] AppPanel/Registro/Social/Home extraídos;
- [x] `MetaClient` extraído preservando binding lexical;
- [x] reactions/espectador/room share extraídos;
- [x] Rank/Identidade/Missões independentes do monólito;
- [x] `professionalUI.js` retirado do ownership runtime;
- [x] `meta.js` não executável;
- [x] `app.js` reduzido a shell lexical;
- [x] Perfil Público corrigido e isolado como bridge explícita;
- [x] grace period absorvido pelo gameplay owner;
- [x] Central de Notificações absorvida pelo domain;
- [ ] comparação visual desktop/mobile;
- [ ] CI integral + iPhone/PWA/multiplayer;
- [ ] retirada/rename físico dos bridges residuais quando seguro.
