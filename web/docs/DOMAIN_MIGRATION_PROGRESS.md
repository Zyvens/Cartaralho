# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P77 / v1.4.77**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 87%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P77 + baseline de CI | 3% | 3% | `main@P77` reconciliada; branch ficou behind=0; previews verdes |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P77 fechada |
| 3 | Core de ownership / lifecycle | 7% | 7% | estado/router/turno/bootstrap + 20 eventos core em owners próprios |
| 4 | Design system / fundação CSS | 5% | 4% | trajetória classificada; falta comparação visual antes de retirar shims |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 6% | owners finais e P77 da carteira preservados; Perfil modal roteado no owner atual |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 6% | foundations e renderers atuais separados; `meta.js` não executa mais |
| 7 | Cartas / criação / progressão | 10% | 9% | renderer/progressão canônicos; bridges residuais ainda podem ser renomeados/removidos |
| 8 | Economia / mercado / cosméticos | 7% | 6% | wallet/realtime/reciclagem/catalog/cosméticos em owners; fechamento visual pendente |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 6% | lifecycle consolidado; foundations/telas-base e aceite multiplayer ainda pendentes |
| 11 | BUFFs | 6% | 6% | matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 2% | owner ativo; falta validação real browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | regras/idempotência protegidas; foundations funcionais mantidas |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 4% | `professionalUI` superseded e `meta.js` histórico; fallbacks físicos restantes ainda serão limpos |
| 16 | Consolidação/remoção de CSS PXX | 4% | 3% | owners/shims classificados; retirada depende de comparação visual |
| 17 | Release/versionamento consolidado | 2% | 2% | P77 corrente com P75/P76 preservados no histórico |
| 18 | CI final + preview + aceite interno | 5% | 0% | Vercel READY não substitui CI integral nem aceite desktop/mobile/iPhone/PWA/multiplayer |
| | **TOTAL** | **100%** | **87%** | |

## Gates fechados desde o checkpoint de 83%

### Monólito `professionalUI.js`

- Registro → `registrationUI`;
- AppPanel → `appPanelUI`;
- Social foundation → `socialFoundationUI`;
- Home visual → `homePresentationUI`;
- Cartas/Perfil/Navegação/Conta → owners já existentes;
- arquivo reduzido a shim `SUPERSEDED` sem writers runtime.

### Monólito `meta.js`

- `MetaClient` extraído preservando **binding lexical `const`**;
- `metaUIBase.js` substitui o namespace mínimo;
- Histórico/Replay, Turmas, Reactions, Espectador, Room Share, Missões, Identidade e Rank distribuídos por owners próprios;
- transporte de reactions → `metaLifecycleUI`;
- `meta.js` movido para `application/x-cartaralho-legacy` e não executa mais.

O corte runtime (`ee5b5eb8ae510434d37c693e977b35790d2de6eb`), o contrato específico (`eca04f8d0a80b408e0612d35be35991c42ae43ec`) e o contrato consolidado (`f14f87d94e8cbe516419bf6d13f68fcc715460e2`) chegaram a Vercel **READY**.

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só conta após classificação/migração ou prova de supersessão.
4. Os últimos 5% ficam reservados a CI integral e aceite real.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.

## Próxima sequência

1. varrer foundations atuais por writers/listeners duplicados;
2. remover/reduzir fallbacks físicos que já possuem contrato, começando pelo `app.js`;
3. comparar visualmente desktop/mobile antes de remover shims CSS;
4. CI integral + desktop/mobile + iPhone/PWA + multiplayer crítico;
5. somente após aprovação explícita considerar merge na `main`.
