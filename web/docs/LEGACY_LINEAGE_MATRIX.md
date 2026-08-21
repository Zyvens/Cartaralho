# Auditoria de trajetórias históricas — resultado atual → owners canônicos

Este documento protege a consolidação contra dois riscos: reativar comportamento antigo apenas porque ele ainda existe em um PXX e apagar uma correção válida ao remover a cadeia histórica de patches.

## Unidade primária de auditoria

A unidade de trabalho é **o resultado observável atual**, não o arquivo. Para cada comportamento relevante reconstruímos a trajetória causal completa que desemboca no produto estável.

O procedimento obrigatório é:

1. escolher um resultado atual e declarar seu contrato efetivo;
2. reconstruir a trajetória em ordem cronológica, começando na primeira revisão causalmente relevante: implementação inicial → alterações → correções → regressões → reversões/restaurações → resultado atual;
3. implementar esse resultado no owner canônico do domínio, sem reativar o patch histórico;
4. fazer a verificação inversa, do resultado atual para o passado, comprovando que cada requisito histórico que ainda deve sobreviver está coberto pela implementação canônica;
5. classificar explicitamente o que foi preservado, substituído, restaurado, morto ou mantido apenas por compatibilidade;
6. registrar evidência automatizada/manual e, somente então, classificar arquivos históricos como seguros para desativação ou remoção.

A matriz `arquivo → responsabilidade` existe apenas como **índice secundário de completude**. Ela ajuda a provar que nenhum arquivo foi esquecido, mas nunca decide qual comportamento deve voltar ao produto.

### Precedência

`resultado estável atual > correção posterior explícita > implementação anterior > compatibilidade remanescente`

Uma restauração nunca significa “ligar o arquivo antigo de novo”. Significa reconstruir a semântica restaurada no owner atual, preservando também todas as correções posteriores que continuem válidas.

### Classificações

- `CURRENT`: contrato vigente, implementado no owner canônico.
- `PRESERVED`: requisito histórico que continua válido dentro do resultado atual.
- `SUPERSEDED`: implementação ou requisito substituído por revisão posterior.
- `RESTORED`: comportamento anterior que voltou de forma explícita; deve existir como semântica atual, não como patch reativado.
- `COMPAT`: código ou interface mantida apenas para compatibilidade/transição.
- `DEAD`: comportamento que não participa mais do produto.
- `HISTORICAL`: release, migração ou evidência que precisa permanecer rastreável, mas não executar em runtime.

## Registro obrigatório por trajetória

Cada trajetória fechada deve responder:

- **Contrato atual:** o que o usuário/sistema observa hoje.
- **Trajetória causal:** revisões relevantes em ordem cronológica.
- **Preservado:** requisitos históricos ainda válidos.
- **Substituído:** requisitos/implementações superados.
- **Restaurado:** comportamento que voltou após regressão/reversão.
- **Morto:** comportamento que não deve mais existir.
- **Compatibilidade:** interfaces ainda mantidas sem ownership funcional.
- **Owner:** módulo canônico responsável.
- **Implementação canônica:** onde o resultado está materializado.
- **Evidência:** testes, contratos e validações.
- **Legado:** arquivos que podem permanecer não executáveis ou, após gates, ser removidos.

## Trajetórias críticas

### 1. Saldo da Home / carteira

- **Contrato atual:** saldo de Moedas Sujas nasce junto da identidade no primeiro render, não “salta” depois; Perfil/Sair permanecem íntegros no mobile; atualizações por transação/admin/realtime reconciliam com saldo autoritativo.
- **Trajetória causal:** P61 introduz exposição de saldo → P63 adiciona realtime → P64 adiciona endpoint/cache e reconciliação autoritativa → P65 elimina duplicidade do mostrador → P73 corrige primeiro render e integridade dos controles → P74 torna a carteira filha direta da barra da conta.
- **Preservado:** realtime, cache imediato, refresh autoritativo, um único mostrador, integridade dos botões.
- **Substituído:** estruturas duplicadas/intermediárias de saldo.
- **Owner:** `accountUI` + `marketplaceUI`.
- **Evidência:** contratos P61–P65, P73 e P74 migrados para owners; CSS/preview ainda pendentes.
- **Estado:** `CURRENT`; JS fechado, visual final ainda precisa gate de preview.

### 2. Estatísticas vs. carteira/extrato

- **Contrato atual:** Estatísticas exibe métricas de jogo; carteira/extrato pertencem ao Mercado.
- **Trajetória causal:** P54/P61 exibem dados econômicos em Stats → P62 remove duplicidade → P67 reforça separação → P71/P72 consolidam renderer/contrato final.
- **Preservado:** métricas de jogo em Stats e extrato acessível no Mercado.
- **Substituído:** wallet/extrato dentro de Stats.
- **Owner:** `statsUI` + `marketplaceUI`.
- **Estado:** `CURRENT`; comportamento JS fechado.

### 3. Borda de progressão da carta

- **Contrato atual:** borda representa quantidade de jogadores que coletaram a carta canônica por Espólio, com thresholds 10/30/60/100 e labels Bronze/Prata/Ouro/Platina.
- **Trajetória causal:** P64 usa coleção própria → P65 restaura fonte externa → P66 usa holders mundiais → P67 redefine a métrica para coletores via Espólio.
- **Preservado:** ladder 10/30/60/100 e progressão independente do fundo.
- **Substituído:** coleção própria, `ownedDistinctCards`, duplicate count e holders genéricos como fonte da borda.
- **Owner:** `cardProgression` + backend canônico de progressão.
- **Estado:** `CURRENT`; P64–P66 são `SUPERSEDED` quanto à fonte da métrica.

### 4. Fundo/material da carta

- **Contrato atual:** fundo/material representa vitórias pessoais de rodada usando a carta, ladder 10/30/60/100.
- **Trajetória causal:** implementações anteriores de visual → P66 liga material a vitórias → P67 unifica a ladder final.
- **Preservado:** progressão pessoal por vitórias e independência da borda.
- **Owner:** `cardProgression`.
- **Estado:** `CURRENT`.

### 5. Raridade composta / Super Trunfo

- **Contrato atual:** raridade visual considera a progressão canônica; Super Trunfo exige topo da progressão e coeficiente global W/L >= 0,8.
- **Trajetória causal:** P67 consolida progressão → P68 adiciona histórico, raridade composta e W/L.
- **Preservado:** requisito duplo para Super Trunfo e histórico/origem.
- **Owner:** `cardProgression`.
- **Estado:** `CURRENT`.

### 6. Autoria em Minhas Cartas

- **Contrato atual:** renderer final sempre mostra `Criado por <usuário>`; cartas nativas preservam autoria `Cartaralho`; não existe rodapé técnico concorrente.
- **Trajetória causal:** P69 hotfixa o DOM → P70 tenta tornar canônico → P71 move a regra para o renderer → P72 corrige o renderer efetivamente usado.
- **Preservado:** autoria original e autoria visível no renderer final.
- **Substituído:** correções pós-render/DOM e renderers intermediários.
- **Owner:** `cardsLibrary`.
- **Estado:** `CURRENT`; P69/P70 `SUPERSEDED`.

### 7. Criação / pilha de Carta Limpa

- **Contrato atual:** somente a pilha da cor ativa aparece nos criadores; compra/consumo/saldo continuam respeitando as regras econômicas.
- **Trajetória causal:** UX P54–P60 → correção de pilhas após P72 → baseline P73/P74.
- **Preservado:** seleção ativa, reuso favorito e regras econômicas.
- **Substituído:** múltiplas pilhas simultâneas e correções DOM concorrentes.
- **Owner:** `cardCreationUI`.
- **Estado:** `CURRENT`.

### 8. Home / ordem de menu / mobile

- **Contrato atual:** ordem estável, sem oscilação e sem observers concorrentes; botões de conta permanecem utilizáveis em viewport móvel.
- **Trajetória causal:** P24 define ordem → P25 adapta mobile → P27 adiciona observer → P48–P53 estabilizam lifecycle → owners atuais assumem montagem/ordenação.
- **Preservado:** ordem e comportamento mobile final.
- **Substituído:** observers intermediários e escritores concorrentes.
- **Owner:** `navigationUI` + owners dos componentes da Home.
- **Estado:** `CURRENT`; preview real ainda pendente.

### 9. Perfil / molduras de progressão

- **Contrato atual:** progressão **Bronze → Prata → Ouro → Platina**; cada moldura desbloqueada continua equipável independentemente; desbloquear tier superior não força equip; cosméticos especiais continuam independentes e também podem ser equipados.
- **Trajetória causal:** P19/P20 estruturam aparência → P23 consolida save → P40 amplia identidade → correções posteriores separam desbloqueio de equip e normalizam labels atuais.
- **Preservado:** save único, aparência equipada e independência entre desbloqueio e escolha.
- **Substituído:** nomenclatura visual Copper/Silver/Gold/Platinum e qualquer comportamento que force o maior tier.
- **Owner:** `profileUI` + `identityUI`/`cosmeticsUI` para apresentação/itens.
- **Estado:** `CURRENT`.

### 10. Moldura Gênese

- **Contrato atual:** efeito final da Gênese é renderizado por um único owner, sem reaplicar geometrias intermediárias.
- **Trajetória causal:** P26 → P29 órbita → P30 estrela → P31 seis estrelas → refinamentos P32/P33+.
- **Preservado:** composição final.
- **Substituído:** geometrias e writers intermediários.
- **Owner:** `genesisFrameUI`.
- **Estado:** `CURRENT` no JS; CSS/visual pendente.

### 11. Admin

- **Contrato atual:** ferramentas administrativas permanecem protegidas por autoridade do servidor e aparecem somente no contexto permitido da Home; megafone/recompensas sincronizam UI e saldo.
- **Trajetória causal:** P37 ferramentas/megafone → P38 restringe visual à Home → P39+ integra navegação → `adminUI` assume ownership.
- **Preservado:** autorização e restrição visual.
- **Owner:** `adminUI`.
- **Estado:** `CURRENT`.

### 12. Reciclagem

- **Contrato atual:** qualquer quantidade elegível pode ser reciclada por 25 Moedas Sujas por carta, com confirmação e sincronização do saldo.
- **Trajetória causal:** P41 cria reciclagem livre/25 moedas → P44 corrige regressões → P45 integra saldo → P53/P55 refinam UI → owner de Mercado consolida.
- **Preservado:** 25 por carta, quantidade livre elegível e saldo reconciliado.
- **Owner:** `marketplaceUI`.
- **Estado:** `CURRENT`.

### 13. Áudio / configurações

- **Contrato atual:** preferências, mute legado, SFX, recuperação de autoplay e botão de Configurações sobrevivem a re-renders da Home/conta.
- **Trajetória causal:** P13 integra áudio → P28 recupera música → P32 trata iPhone/PWA → `audioUI` assume domínio → `accountUI` passa a remontar explicitamente Settings após reconstruir a conta.
- **Preservado:** preferências e recovery.
- **Restaurado:** presença do botão Settings após remount da Home.
- **Owner:** `audioUI`, com hook de lifecycle em `accountUI`.
- **Estado:** `CURRENT`; validação real de browser/iPhone pendente.

### 14. Gameplay / Amigo de Merda

- **Contrato pretendido pela especificação histórica:** alvo elegível devolve a mão inteira ao pool e recebe nova mão do mesmo tamanho antes da submissão, com decisão autoritativa no servidor.
- **Trajetória causal:** base/P19 → P32 descreve redraw autoritativo → engine atual ainda contém implementação divergente que apenas embaralha a mão existente.
- **Preservado:** autoridade server-side e alvo elegível.
- **Divergência aberta:** definição histórica e engine atual não coincidem; **não alterar silenciosamente** durante a migração.
- **Owner:** `gameplayUI` + buff engine server-side.
- **Estado:** `OPEN PRODUCT DECISION`; bloqueia declarar matriz dos 21 BUFFs como fechada.

### 15. Rank + identidade

- **Contrato atual:** Rank/Hall usam moldura/título equipados via identidade canônica, sem writers concorrentes.
- **Trajetória causal:** P33 identidade visual → P34 bootstrap → refinamentos posteriores → owners atuais.
- **Owner:** `rankUI` + `identityUI`.
- **Estado:** `CURRENT`.

## Índice secundário — legado já não executável

Os arquivos abaixo permanecem apenas como evidência histórica `application/x-cartaralho-legacy` durante a auditoria e **não devem voltar a executar**:

`gameplayP19.js`, `roomP14Sync.js`, `profileAppearanceP19.js`, `revisionConsolidated.js`, `refinementP13.js`, `audioIntegrationP13.js`, `musicRecoveryP28.js`, `cleanCardStacksFix.js`, `cosmeticUI.js`, `identityP20.js`, `profileAppearanceP20.js`, `playerShowcaseP20.js`, `homeMenuP24.js`, `uiP25.js`, `homeMenuP27.js`, `genesisFrameP29.js`.

Os PXX numéricos P33–P68 e P73–P74 já absorvidos permanecem não executáveis na branch de migração. P69–P72 devem continuar tratados como linhagem de hotfix/release mesmo quando não há um `pXX.js` cliente correspondente.

## Pendências de auditoria

- fechar trajetórias P1–P12 e P13–P32 que ainda não possuem registro completo por resultado;
- classificar módulos-base executáveis atuais (`meta`, `professionalUI`, `profileModal`, `marketplace*`, `lootUI`, `finalRewardUI`, `achievementUI`, `prestigeUI`, `uiRefinement2`, etc.) como `BASE CANÔNICA`, `COMPAT` ou `PATCH A ABSORVER`;
- construir matriz visual separada `regra CSS → resultado atual → owner visual` antes de qualquer exclusão de PXX CSS;
- auditar helpers backend com sufixos PXX como runtime canônico, facade de compatibilidade ou histórico;
- reconciliar a branch com releases posteriores ao baseline P74 somente após reconstruir a trajetória desses resultados; nunca copiar P75+ cegamente;
- fechar preview desktop/mobile e matriz dos 21 BUFFs.

## Gate de desativação/remoção histórica

Um arquivo histórico só pode ser removido quando:

1. todos os resultados atuais aos quais ele contribuiu possuem trajetória registrada;
2. cada requisito `PRESERVED`/`RESTORED` está comprovadamente presente no owner/base canônica;
3. comportamentos `SUPERSEDED`/`DEAD` não são chamados pelo runtime;
4. interfaces `COMPAT` têm consumidor identificado e plano de retirada ou justificativa de permanência;
5. existe evidência automatizada suficiente ou validação manual documentada;
6. CSS associado possui destino visual definido e validado;
7. a remoção não apaga migrations SQL, releases ou evidência necessária para reconstrução/auditoria.

Somente depois desses gates a matriz de arquivos pode autorizar limpeza física. Antes disso, histórico permanece histórico — nunca fonte automática de verdade do produto.
