# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P75 / v1.4.75**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Ela mede **implementação consolidada**, não quantidade de arquivos alterados. Uma etapa só recebe 100% do seu peso quando o comportamento está absorvido pelo owner canônico, o legado correspondente deixou de ser necessário em runtime e os contratos relevantes estão coerentes com a cabeça atual.

**Implementação atual: 77%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P75 + baseline de CI | 3% | 2% | P75 reconciliada; previews Vercel dos heads funcionais estão verdes; GitHub Actions de push ainda não está verificável pela integração atual |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P75 fechada por migrations, contratos históricos, owners e matrizes de trajetória |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry e writers finais ativos; lifecycle de `app.js` possui contrato, mas bootstrap/estado/socket ainda estão no monólito |
| 4 | Design system / fundação CSS | 5% | 0% | Fundação geral ainda depende da cascata histórica; resultados específicos estão sendo retirados primeiro |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos; conta/Home P49–P53 e P73/P74 já têm ownership visual classificado; falta fechamento visual/browser integral |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners principais ativos; presença, Central e Missões recentes já têm owners visuais; revisão visual final pendente |
| 7 | Cartas / criação / progressão | 10% | 9% | Renderer, autoria, criação, raridade e progressão canônicos; bloco visual P54/P56/P57/P58 é a principal pendência recente |
| 8 | Economia / mercado / cosméticos | 7% | 6% | Wallet P75, realtime, reciclagem, catálogo e cosméticos em owners; Reciclagem/Extrato recentes já têm ownership visual parcial |
| 9 | Salas / Lobby | 6% | 6% | Matriz completa: 64 combinações de flags, limites, autoridade, snapshot, capacidade e sincronização têm contrato |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle integral e telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 6% | Matriz funcional 21/21 fechada por papel, alvo, fase e owner/engine |
| 12 | Áudio / narrador | 3% | 2% | Owner canônico e contratos migrados; falta validação real de browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | Colocação, sobrevivência, consolação, Espólio, contribuição, Saqueador e idempotência protegidos por cenário |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers PXX possuem owner canônico; arquivos antigos são aliases COMPAT sem regra duplicada |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 3% | P33–P74 e wrappers absorvidos estão não executáveis; módulos-base restantes ainda precisam classificação |
| 16 | Consolidação/remoção de CSS PXX | 4% | 2% | P45–P53, P59/P60/P62/P66/P68/P73/P74 já perderam ownership funcional; P55 foi aposentado por estar integralmente supersedido |
| 17 | Release/versionamento consolidado | 2% | 2% | P75 formalizada em `releaseP75`, `/api/version` e Central de Notificações |
| 18 | CI final + preview + aceite interno | 5% | 0% | Vercel READY é evidência de build, mas não substitui CI integral nem aceite desktop/mobile |
| | **TOTAL** | **100%** | **77%** | |

## Regras para subir a porcentagem

1. Não se contabiliza arquivo criado; contabiliza-se **responsabilidade eliminada do legado** ou gate efetivamente fechado.
2. Regra histórica provadamente substituída é `SUPERSEDED` e removida; não ganha owner novo só para preservar o passado.
3. CSS só conta quando a regra vigente foi classificada, migrada e validada, ou quando a regra morta foi provada como superseded.
4. Backend só conta quando helpers de runtime com sufixo de pacote forem absorvidos/renomeados sem quebrar contratos.
5. Os últimos 5% são reservados a CI integral, preview desktop/mobile e matriz de aceite.
6. Ao atingir 100%, a PR continua Draft até verificação conjunta e autorização explícita para avaliar merge.

## Trabalho fechado desde o checkpoint anterior

- P75 reconciliado em `accountUI` + `marketplaceUI`: primeiro paint via `dirty_balance`/cache, confirmação leve por `/api/profile/wallet`, coalescing e realtime preservados.
- Backend PXX fechado em 8/8; BUFFs 21/21, recompensas/loot, Salas/Lobby e linhagem P01→P75 possuem matrizes/contratos.
- `APP_LIFECYCLE_AUDIT.md` + contrato congelam bootstrap, estado/reset, roteador-base e eventos de socket antes da extração.
- `CSS_VISUAL_OWNERSHIP_MATRIX.md` agora aplica `CURRENT` vs `SUPERSEDED`, evitando transformar patches mortos em novos owners.
- P45→P47: geometria 44px → 40px → alinhamento pixel-perfect dos controles superiores preservada em três owners canônicos.
- P49→P53: identidade, carteira, Home, Amigos, Central, Missões, Reciclagem e thumbnails de molduras foram separados por responsabilidade e mantidos na posição histórica via shims.
- concorrência real de P52 foi eliminada: CSS histórico não ordena mais Histórico antes de Notificações; `navigationUI` é o único owner da ordem.
- regras antigas de criação P48/P53 e pill P51 de Missões foram classificadas `SUPERSEDED`, pois o markup atual usa P54/P56/P57 e `p52-mission-coin-pill`.
- P55 foi aposentado integralmente: lacuna pertence à trajetória P59/P60 e modal/detalhe ao fluxo P56/P57 de `cardsLibrary`.
- heads funcionais até P55 chegaram a preview Vercel `READY`; o aceite visual final permanece reservado ao Gate 18.

## Próxima sequência

- consolidar P54/P56/P57/P58 separando criação, account actions, biblioteca/detalhe, Reciclagem e Gênese por resultado vigente;
- não migrar propriedades desses pacotes que P59/P60 ou owners posteriores já supersedem;
- depois revisar P14–P44 e fundação CSS;
- extrair responsabilidade executável do `app.js` em etapas, preservando `navigationUI` como writer final de navegação;
- classificar/remover módulos-base JS restantes somente após ownership provado;
- obter CI integral + preview desktop/mobile + aceite interno;
- somente após aprovação explícita considerar merge na `main`.
