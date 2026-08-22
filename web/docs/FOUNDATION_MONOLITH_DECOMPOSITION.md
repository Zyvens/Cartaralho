# Decomposição segura — `professionalUI.js` e `meta.js`

> Branch: `refactor/domain-owners`  
> Baseline: **P77 / v1.4.77**  
> Regra: não reduzir fisicamente um monólito enquanto uma API pública ainda consumida não tiver owner explícito.

## `professionalUI.js`

### CURRENT FOUNDATION

- `AppPanelModal`: shell modal de Minhas Cartas, Estatísticas, Rank, Histórico e Amigos; fechamento/Escape/normalização continuam usados pelos fluxos atuais.
- `RegistrationModal`: criação explícita de usuário + nickname + senha + confirmação + e-mail opcional; `HomeScreen.register()` ainda delega para esse modal.
- `SocialUI`: base funcional de amizades, pedidos e turmas. `domains/socialUI.js` decora `renderFriends/personRow`, portanto ainda depende desta implementação-base.
- `ProfessionalUI.polishHome()`: ainda chamado pelo owner final `domains/accountUI.js`; fornece shell/ambient/dashboard/action cards e botões Perfil/Sair que owners posteriores refinam.
- wrapper de `HomeScreen.render()` que chama `polishHome()` continua útil até o polish ser movido integralmente a um owner.

### SUPERSEDED / NÃO RECOPIAR

- `ProfessionalUI.renderCards()` e `HomeScreen.renderCards=...`: resultado final pertence a `domains/cardsLibrary.js`.
- ordem/labels finais do menu: pertencem a `domains/navigationUI.js`.
- presença/decoração final de Amigos: pertence a `domains/socialUI.js`, mantendo `SocialUI` somente como foundation.
- identidade final da account strip/carteira: pertence a `domains/accountUI.js` + `domains/marketplaceUI.js`.
- Rank/Stats abertos pelo `AppPanelModal` usam `MetaUI/HomeScreen`, mas os renderers finais são `rankUI/statsUI`.

### Candidato de extração

A próxima extração física deve separar:

1. `core/appPanelModal.js`;
2. `domains/registrationUI.js`;
3. uma foundation social mínima (`socialFoundation.js`) ou absorção integral por `domains/socialUI.js`;
4. `ProfessionalUI.polishHome()` para `uiPolishUI/accountUI`;
5. então transformar `professionalUI.js` em marker/fallback.

Não remover `professionalUI.js` antes desses quatro resultados.

## `meta.js`

### CURRENT FOUNDATION

- `MetaClient`: API transversal de metajogo, missões, equip, Hall da Vergonha, replay, grupos, reactions e spectator.
- `MetaUI.decorateTitles/titleName/titleColor`: ainda é uma base decorada por `domains/identityUI.js`.
- `HomeScreen.renderProfile` → `MetaUI.extendProfile`: extensão de progressão/aparência; o `profileUI` final estabiliza o modal, mas a trajetória ainda depende de dados/metagame.
- reactions de partida: binding em `SocketClient.subscribeRoom`, dock, envio `MetaClient.react()` e `showReaction()`.
- link direto de sala: `addRoomShare()`.
- modo Espectador: `openSpectator`, refresh do canal, `renderSpectator`, `exitSpectator`.
- utilitários sociais `MetaClient.groups/group/createGroup/joinGroup`, consumidos pela foundation social.

### SUPERSEDED / NÃO RECOPIAR

- `HomeScreen.renderRank=...`: owner final `domains/rankUI.js`.
- `HomeScreen.renderStats=...`: owner final `domains/statsUI.js`.
- `HomeScreen.renderCards=...`: owner final `domains/cardsLibrary.js`.
- interceptação genérica `App.showScreen` dentro de `MetaUI.patch()`: owner final `domains/navigationUI.js`; apenas os efeitos observáveis (`afterScreen`) devem ser extraídos antes da remoção.
- `HomeScreen.openPanel('friends')`: navegação/modal final passa por `professionalUI/socialUI` + domains, não deve haver segundo writer permanente em `meta.js`.
- missão final: `domains/missionsUI.js/profileUI`; foundation antiga não deve reassumir renderer.

### Candidato de extração

1. `core/metaClient.js` para API sem UI;
2. `domains/reactionsUI.js` para dock/binding/reaction pop;
3. `domains/spectatorUI.js` para espectador;
4. `domains/roomShareUI.js` para link direto;
5. migrar extensão de perfil ainda vigente para `profileUI`;
6. só então retirar `MetaUI.patch()` e transformar `meta.js` em marker/fallback.

## Resultado vs trajetória

A estratégia não é "apagar monólitos": é retirar writers mortos sem perder funções únicas. O critério é que cada item CURRENT acima tenha novo owner e contrato antes de o arquivo original deixar de executar.

## Gates

- [x] writers claramente supersedidos identificados;
- [x] APIs/current foundations identificadas;
- [ ] extração de `AppPanelModal`/Registration;
- [ ] extração social foundation;
- [ ] extração `MetaClient`;
- [ ] extração reactions/espectador/room share;
- [ ] extensão de perfil absorvida;
- [ ] remoção física dos writers mortos/monólitos;
- [ ] preview + fluxo manual antes de aumentar progresso.
