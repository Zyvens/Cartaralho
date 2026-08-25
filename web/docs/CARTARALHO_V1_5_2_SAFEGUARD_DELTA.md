# Cartaralho v1.5.2 — Safeguard Delta

## Escopo
Patch visual/semântico sobre v1.5.1. Não altera gameplay, economia, BUFFs, recompensas, progressão, salas ou persistência.

## Owners afetados
- `public/css/accountCurrent.css`: geometria da faixa da conta.
- `public/js/canonicalCardBadge.js`: identidade canônica `🧬 Original`.
- `public/css/cardLibraryPresentationCurrent.css`: apresentação da marca Original em biblioteca/ficha.
- `lib/releaseV152.js`, `api/version.js`, `api/notifications.js`: versionamento e histórico da Central.

## Invariantes v1.5.2
1. Em viewport mobile até 620px, a faixa da conta mantém `padding-inline: 10px`; até 360px, `8px`.
2. Avatar e grupo Perfil/Sair nunca encostam na borda interna da faixa nem causam overflow horizontal.
3. Perfil/Sair preservam a geometria v1.5.1: 40×40px; até 360px, 36×36px.
4. `🧬 Original` continua discreto e interno à carta em `Minhas Cartas`.
5. Ao abrir a ficha/estatísticas de uma carta Original, o mesmo marker `canonical-original-mark` deve ser aplicado ao preview da carta.
6. A decisão de originalidade permanece baseada em `isOriginal`/`is_original` ou no conjunto canônico de IDs carregado por `CanonicalCardOriginalUI`.
7. Cartas não originais não recebem o marker.
8. `/api/version` publica `v1.5.2` mantendo a linhagem P75 → P76 → P77 → v1.5.0 → v1.5.1 → v1.5.2.
9. A Central de Notificações publica v1.5.2 no topo e mantém v1.5.1/v1.5.0/PXX no histórico.

## Resultado vs trajetória
- P56 introduziu a ficha/progressão de carta.
- P57 consolidou o renderer único de `Minhas Cartas`.
- v1.5.0 transformou a identidade Original em marca interna discreta.
- v1.5.1 corrigiu centralização/contenção Perfil/Sair.
- v1.5.2 não substitui nenhum desses resultados: apenas acrescenta respiro lateral ao container mobile e propaga a mesma identidade Original para a ficha já existente.

## Reparação / rollback
- Regressão de borda mobile: revisar apenas `accountCurrent.css`; não aumentar largura dos botões para compensar.
- Regressão de Original: revisar `CanonicalCardOriginalUI.decorateCard` e `installDetailBridge`; não duplicar a regra dentro de `cardsLibrary`.
- Regressão visual do marker: revisar `cardLibraryPresentationCurrent.css`; manter a mesma classe na biblioteca e na ficha.
- Regressão de versão: `releaseV152` é current; `releaseV151` deve permanecer somente como predecessor histórico.

## Gate mínimo
- suíte de contratos completa verde;
- browser acceptance desktop/mobile verde;
- ausência de overflow horizontal no mobile;
- inspeção do screenshot mobile confirmando respiro nas duas extremidades da faixa;
- ficha de carta Original com o mesmo `🧬 Original` da biblioteca.
