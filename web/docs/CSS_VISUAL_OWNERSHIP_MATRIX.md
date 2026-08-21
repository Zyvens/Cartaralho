# Matriz de ownership visual — CSS histórico → owners atuais

> Branch: `refactor/domain-owners`  
> Baseline funcional: **P75 / v1.4.75**  
> Regra de segurança: consolidação visual não pode alterar posição efetiva da cascata antes do gate de comparação/aceite.

## Estratégia de migração

O CSS histórico foi publicado em camadas PXX sucessivas. Remover ou antecipar uma regra pode mudar especificidade/ordem mesmo quando o texto da regra é idêntico. Por isso a migração ocorre em duas fases:

1. **ownership funcional:** regra sai do arquivo PXX e passa para uma folha canônica nomeada pelo resultado/domínio;
2. **preservação de cascata:** o PXX fica temporariamente como shim `@import` na mesma posição histórica do `index.html`.

Somente no fechamento visual os shims podem ser removidos do `index` e os owners canônicos reordenados de forma explícita, com comparação desktop/mobile. Um shim não possui regra funcional; ele é `COMPAT` de ordem de carregamento.

## Ondas já migradas

| Trajetória | Resultado visual vigente | Owner canônico | PXX após migração | Estado |
|---|---|---|---|---|
| P73 + P74 | faixa principal da conta, ícones Perfil/Sair, carteira e comportamento mobile | `public/css/accountCurrent.css` | P73 = marcador `HISTORICAL`; P74 = shim `@import` | `CURRENT` |
| P66 | inputs de 16px em iOS/touch e painel Admin estável com teclado virtual | `public/css/mobileFormsCurrent.css` | P66 = shim `@import` | `CURRENT` |
| P68 | tema de raridade composta, Super Trunfo, histórico/origem e reduced-motion | `public/css/cardRarityCurrent.css` | P68 = shim `@import` | `CURRENT` |

## Invariantes da cascata migrada

### Account strip P73/P74

- `account.css` permanece na camada base original; não recebe overrides tardios.
- P73 deixa de ter regra própria.
- P74 importa `accountCurrent.css` exatamente onde a correção final já era aplicada.
- ordem lógica interna é preservada: wallet `order:30`, ações `order:40`.
- media query mobile continua em `max-width:620px`.

### Mobile forms P66

- `@supports (-webkit-touch-callout:none)` permanece na posição P66.
- inputs/textarea/select continuam em 16px para impedir zoom automático no iOS.
- o shell Admin continua ancorado no topo em touchscreen/teclado virtual.

### Card rarity P68

- todas as custom properties `--p68-rarity-*`, temas Common→Legendary/Super Trunfo e animação permanecem juntas.
- `prefers-reduced-motion:reduce` continua desligando a animação do Super Trunfo.
- o owner é carregado exatamente na posição histórica P68 via shim.

## Próximos agrupamentos candidatos

A ordem abaixo é de menor para maior risco, não necessariamente numérica:

1. **cartas quadradas/lacuna tipográfica — P59/P60**: consolidar como owner de apresentação de carta, mantendo os dois estágios de cascata até provar que P60 supersede integralmente P59 onde há conflito;
2. **progressão/card detail — P56/P57/P58**: grande volume e forte dependência de shell/modal; exige matriz de seletores antes de absorção;
3. **Gênese — P26/P29/P30/P31/P32/P58**: animações e transforms; exige comparação visual e reduced-motion;
4. **Home/top controls — P45/P46/P47/P49/P50/P51/P52/P53/P56/P73/P74**: parcialmente owned pela onda account strip, restante precisa auditoria de precedência;
5. **Marketplace/reciclagem — P41/P44/P45/P53/P55/P58**;
6. **design system/fundação geral — P14–P25 e folhas base**: somente depois dos resultados específicos, para evitar converter histórico em uma folha monolítica nova.

## Critério de conclusão de um PXX CSS

Um pacote visual só deixa de possuir ownership quando:

- cada regra funcional foi movida para owner canônico;
- o arquivo PXX contém no máximo comentário + `@import` de compatibilidade, ou está vazio/histórico;
- contratos apontam para o owner, não para a implementação histórica;
- a posição de cascata permanece equivalente enquanto o shim existir;
- qualquer mudança de posição posterior é validada visualmente.

## Evidência atual

- `tests/cssAccountOwnership.contract.test.js`
- `tests/p73AccountStripRender.contract.test.js`
- `tests/p74WalletPlacement.contract.test.js`
- `tests/p66CardProgressionMobileInput.contract.test.js`
- `tests/p68CardHistoryRarity.contract.test.js`

## Estado do Gate 16

A consolidação CSS está **em andamento**. Três resultados independentes já possuem owner visual canônico, mas a maior parte da cascata P14–P65 ainda está funcionalmente distribuída em PXX. O gate só será declarado 100% quando todas as regras vigentes tiverem owner e o carregamento final for validado sem shims históricos.
