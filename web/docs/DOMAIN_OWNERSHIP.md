# Arquitetura de ownership por domínio

> Estado: proposta executável na branch `refactor/domain-owners`. Não é a arquitetura de produção enquanto a PR #96 permanecer sem merge.

## Princípio

Cada comportamento de frontend pertence a exatamente um módulo canônico. Um domínio pode consumir APIs de outro domínio, mas não pode reatribuir o renderer ou o lifecycle que pertence a esse outro domínio.

O registry `public/js/core/domainRegistry.js` torna essa regra explícita: `CartDomains.claim(domain, owner, install)` falha se um segundo módulo tentar reivindicar o mesmo domínio.

## Owners canônicos

| Domínio | Owner | Responsabilidade exclusiva |
| --- | --- | --- |
| `accountUI` | `public/js/domains/accountUI.js` | barra da conta, identidade, ações Perfil/Sair e composição dos indicadores da home |
| `adminUI` | `public/js/domains/adminUI.js` | ferramentas do criador, megafone, prêmios e aviso de versão |
| `cardCreationUI` | `public/js/domains/cardCreationUI.js` | UI de criação/seleção de cartas durante a partida |
| `cardProgression` | `public/js/domains/cardProgression.js` | Fundo, Borda, raridade, Super Trunfo e histórico visual da carta |
| `cardsLibrary` | `public/js/domains/cardsLibrary.js` | Minhas Cartas, filtros, favorito, ficha, autoria e criador da coleção |
| `marketplaceUI` | `public/js/domains/marketplaceUI.js` | saldo, extrato, sincronização realtime, ordem do mercado e reciclagem |
| `missionsUI` | `public/js/domains/missionsUI.js` | linha de missão e lifecycle da caixa de missões |
| `navigationUI` | `public/js/domains/navigationUI.js` | `App.showScreen`, botões de voltar, ordem do menu e background da home |
| `notificationsUI` | `public/js/domains/notificationsUI.js` | Central de Notificações, spoilers e estado de leitura |
| `profileUI` | `public/js/domains/profileUI.js` | Perfil, aparência, foto, títulos, molduras e Gênese |
| `rankUI` | `public/js/domains/rankUI.js` | ranking e decoração de identidade no ranking |
| `roomUI` | `public/js/domains/roomUI.js` | Criar Sala, Lobby, regras e cards expansíveis de recompensa |
| `socialUI` | `public/js/domains/socialUI.js` | presença de amigos, heartbeat e contador online |
| `statsUI` | `public/js/domains/statsUI.js` | renderer exclusivo de Estatísticas |

## Regras de ownership

1. Um renderer público tem um único escritor final. Ex.: somente `cardsLibrary` pode atribuir `HomeScreen.renderCards`.
2. Um lifecycle central tem um único escritor final. Ex.: somente `accountUI` pode atribuir `HomeScreen.renderAccount` entre os novos módulos; somente `navigationUI` controla `App.showScreen`.
3. Sincronização de carteira não pode existir em Estatísticas, Perfil ou Home. Esses módulos apenas consomem `CartMarketplaceDomain`.
4. Progressão da carta não pode ser reimplementada pela coleção. `cardsLibrary` chama `CartCardProgression`.
5. Patches de DOM depois do render não podem corrigir conteúdo que o owner consegue produzir corretamente na origem.
6. Novas features devem ampliar o owner do domínio ou criar um novo domínio; não devem criar `pXX.js`.

## Compatibilidade durante a migração

Os `p33.js` a `p68.js` ainda estão no repositório e aparecem no `index.html` como `type="application/x-cartaralho-legacy"`. Esse tipo não é JavaScript executável: os arquivos foram mantidos apenas para rastreabilidade e para permitir que contratos históricos continuem documentando o comportamento antigo enquanto a branch é revisada.

Os stylesheets `pXX.css` também permanecem carregados nesta etapa, pois os componentes canônicos ainda usam classes visuais estabilizadas nesses arquivos. A remoção física/renomeação do CSS deve acontecer somente depois da validação visual da branch.

## Critério para migração completa

A etapa final, condicionada à autorização antes do merge, deve:

1. validar o preview em desktop e mobile;
2. mover regras visuais de `pXX.css` para stylesheets por domínio;
3. substituir contratos de implementação PXX por contratos de comportamento/domínio;
4. apagar os `pXX.js` desativados que não forem mais referenciados;
5. revisar os módulos legados nomeados que ainda fazem monkey patch antes da camada canônica;
6. executar a suíte completa e testes de navegador dos fluxos críticos;
7. somente então remover o modo legado do `index.html` e considerar merge na `main`.

## Fluxos mínimos de validação

- Minhas Cartas → buscar → filtrar → favoritar → abrir ficha → confirmar `Criado por <usuário>` após cada redraw.
- Estatísticas → confirmar ausência total de saldo, transações e extrato.
- Mercado Paralelo → abrir Extrato pelo saldo → reciclar carta → confirmar atualização do saldo.
- Perfil → editar dados → trocar título/moldura → salvar → reabrir.
- Rank → alternar Ranking/Hall da Fama/Hall da Vergonha → abrir perfil público.
- Criar Sala/Lobby → abrir regras e recompensa → iniciar partida.
- Notificações → abrir → validar NOVA → fechar → reabrir e confirmar estado lido.
