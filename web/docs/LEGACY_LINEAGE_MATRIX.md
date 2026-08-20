# Matriz de linhagem histórica — PXX → owners canônicos

Este documento impede que a consolidação reverta correções posteriores ao analisar uma arquitetura construída incrementalmente.

## Método obrigatório

A auditoria usa dois sentidos, com funções diferentes:

1. **Recente → antigo**: localizar a implementação final, identificar de onde veio cada comportamento e classificar versões anteriores.
2. **Antigo → recente**: validar a causalidade da linhagem encontrada e confirmar que correções, regressões, rollbacks e restaurações desembocam exatamente no estado atual.

A leitura recente→antiga **nunca autoriza reutilizar uma implementação antiga**. O owner recebe somente a semântica final.

### Precedência

`estado estável atual > correção posterior explícita > implementação anterior > compatibilidade remanescente`

### Classificações

- `CURRENT`: comportamento vigente que deve existir no owner.
- `SUPERSEDED`: implementação substituída por versão posterior.
- `RESTORED`: comportamento antigo explicitamente restaurado depois; reconstruir a semântica restaurada, não o patch inteiro.
- `COMPAT`: código mantido apenas por compatibilidade/transição.
- `DEAD`: não participa mais do produto.
- `HISTORICAL`: release, migração ou evidência útil, mas não runtime.

## Linhagens críticas já fechadas ou parcialmente fechadas

| Área | Evolução causal | Estado final a preservar | Owner | Estado da auditoria |
|---|---|---|---|---|
| Saldo da Home | P61 → P63 realtime → P64 saldo autoritativo → P65 saldo único → P73 primeiro render/ícones → P74 saldo filho direto da tag | saldo nasce junto da identidade, sem salto; Perfil/Sair íntegros; transações sincronizam realtime | `accountUI` + `marketplaceUI` | CURRENT / fechada no JS, CSS pendente |
| Stats vs carteira | P54/P61 exibiam histórico → P62 remove duplicidade → P67 reforça Stats limpa → P71/P72 consolidam contrato | Estatísticas sem wallet/extrato; extrato somente no Mercado | `statsUI` + `marketplaceUI` | CURRENT / fechada no JS |
| Borda da carta | P64 coleção própria → P65 restaura presença externa → P66 world holders → P67 redefine como jogadores que coletaram por loot | Borda = coletores da carta canônica via Espólio; thresholds 10/30/60/100 | `cardProgression` + backend canônico | CURRENT; P64–P66 SUPERSEDED |
| Fundo da carta | versões anteriores → P66 vitórias → P67 unifica ladder | Fundo = vitórias pessoais de rodada com a carta; 10/30/60/100 | `cardProgression` | CURRENT |
| Raridade / Super Trunfo | P67 progressão → P68 histórico + raridade composta + W/L | raridade combinada; Super Trunfo somente no topo e W/L global >=80% | `cardProgression` | CURRENT |
| Autoria em Minhas Cartas | P69 hotfix DOM → P70 tentativa canônica → P71 move para renderer → P72 corrige o renderer efetivo P57 | `Criado por <usuário>` no renderer final, sem rodapé técnico | `cardsLibrary` | CURRENT; P69/P70 SUPERSEDED |
| Criação / pilha limpa ativa | UX P54–P60 → hotfix pós-P72 → P73/P74 baseline | apenas pilha da cor ativa em ambos os criadores; regras/saldo inalterados | `cardCreationUI` | CURRENT |
| Home/menu mobile | P24 ordem → P25 mobile → P27 observer → P48–P53 estabilizações | ordem final sem oscilação, sem observers concorrentes | `navigationUI` + owners de menu | CURRENT; observers intermediários SUPERSEDED |
| Perfil / molduras de progressão | P19/P20 aparência → P23 save único → P40 identidade completa → correções posteriores | **Bronze → Prata → Ouro → Platina**, desbloqueáveis e equipáveis individualmente; maior tier não força equip | `profileUI` | CURRENT |
| Moldura Gênese | P26 → P29 órbita → P30 estrela → P31 seis estrelas → P32/P33+ refinamentos | efeito final preservado sem reaplicar geometria intermediária | `genesisFrameUI` | CURRENT no JS; CSS/visual pendente |
| Admin | P37 ferramentas/megafone → P38 somente Home → P39+ navegação | ferramentas protegidas, acesso visual somente na Home | `adminUI` | CURRENT |
| Reciclagem | P41 livre/25 moedas → P44 correções → P45 saldo → P53/P55 visual | qualquer quantidade elegível, 25 moedas por carta, saldo sincronizado | `marketplaceUI` | CURRENT |
| Áudio | P13 integração → P28 recuperação → P32 iPhone/PWA | preferências, mute legado, autoplay recovery, SFX e modais no owner | `audioUI` | CURRENT; browser real pendente |
| Gameplay / Amigo de Merda | base/P19 → P32 redraw autoritativo | redraw integral da mão de alvo elegível antes da submissão, decidido no servidor | `gameplayUI` + buff engine | CURRENT; matriz de BUFFs pendente |
| Rank + identidade | P33 moldura/título → P34 bootstrap → refinamentos | decoração equipada no Rank/Hall sem escritores concorrentes | `rankUI` | CURRENT |

## Wrappers históricos já retirados do runtime

Os seguintes arquivos permanecem apenas como referências `application/x-cartaralho-legacy` durante a auditoria e **não devem voltar a executar**:

`gameplayP19.js`, `roomP14Sync.js`, `profileAppearanceP19.js`, `revisionConsolidated.js`, `refinementP13.js`, `audioIntegrationP13.js`, `musicRecoveryP28.js`, `cleanCardStacksFix.js`, `identityP20.js`, `profileAppearanceP20.js`, `playerShowcaseP20.js`, `homeMenuP24.js`, `uiP25.js`, `homeMenuP27.js`, `genesisFrameP29.js`.

Os PXX numéricos P33–P74 já absorvidos também estão não executáveis na branch de migração.

## Pendências de auditoria

- P1–P12 e demais pacotes iniciais: mapear implementação original de cada domínio e distinguir infraestrutura ainda válida de patch histórico.
- P13–P32: fechar todas as linhagens, não apenas wrappers nomeados já absorvidos.
- módulos-base atuais (`meta`, `professionalUI`, `profileModal`, `marketplace*`, `lootUI`, `finalRewardUI`, etc.): classificar como BASE CANÔNICA, COMPAT ou PATCH A ABSORVER.
- CSS PXX: fazer matriz separada de regra → owner visual antes de qualquer deleção.
- backend: classificar helpers com sufixo PXX como runtime, facade de compatibilidade ou histórico.

## Gate de remoção

Um arquivo histórico só pode ser removido quando:

1. todas as responsabilidades dele constarem nesta matriz;
2. cada responsabilidade CURRENT estiver presente em owner/base canônica;
3. comportamentos SUPERSEDED não forem chamados pelo runtime;
4. houver contrato automatizado suficiente ou validação manual documentada;
5. CSS associado tiver destino definido;
6. remoção não apagar migrations SQL ou histórico necessário para reconstrução/auditoria.
