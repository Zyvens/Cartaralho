# Progresso da consolidação por domínio

> Branch de trabalho: `refactor/domain-owners`  
> Baseline funcional reconciliado: **P75 / v1.4.75**  
> Regra de segurança: **não mergear nem marcar a PR #96 como pronta sem autorização expressa**.

## Como a porcentagem é calculada

A porcentagem abaixo é ponderada por risco e volume funcional. Mede responsabilidade realmente consolidada, não quantidade de arquivos.

**Implementação atual: 82%**

| # | Gate | Peso | Concluído | Situação |
|---|---|---:|---:|---|
| 1 | Sincronização P75 + baseline de CI | 3% | 2% | P75 reconciliada; previews Vercel verdes; GitHub Actions de push ainda não verificável pela integração atual |
| 2 | Matriz de linhagem PXX / auditoria histórica | 7% | 7% | Cadeia P01–P75 fechada |
| 3 | Core de ownership / lifecycle | 7% | 6% | Registry/writers ativos; `app.js` ainda concentra bootstrap/estado/socket |
| 4 | Design system / fundação CSS | 5% | 4% | P14–P44 classificados por resultado e migrados para owners; falta comparação visual real antes da retirada dos shims |
| 5 | Auth / conta / Home / perfil / créditos | 6% | 5% | Owners ativos; conta/Home e account strip visualmente classificados |
| 6 | Social / notificações / missões / Rank / Stats / histórico | 6% | 5% | Owners ativos; revisão visual final ainda pendente |
| 7 | Cartas / criação / progressão | 10% | 9% | Renderer/progressão canônicos e blocos P14–P23/P54–P60 consolidados visualmente |
| 8 | Economia / mercado / cosméticos | 7% | 6% | Wallet/realtime/reciclagem/catalog/cosméticos em owners; fechamento visual integral pendente |
| 9 | Salas / Lobby | 6% | 6% | 64 combinações de regras cobertas |
| 10 | Gameplay | 9% | 5% | Owner complementar ativo; lifecycle/telas-base ainda precisam consolidação |
| 11 | BUFFs | 6% | 6% | Matriz 21/21 fechada |
| 12 | Áudio / narrador | 3% | 2% | Owner ativo; falta validação browser/iPhone |
| 13 | Recompensas / loot | 5% | 5% | Regras e idempotência protegidas |
| 14 | Consolidação backend de runtime PXX | 5% | 5% | 8/8 helpers em owners canônicos |
| 15 | Remoção de JS/wrappers históricos do runtime | 4% | 3% | P20–P74 absorvidos relevantes estão não executáveis; bases restantes precisam classificação |
| 16 | Consolidação/remoção de CSS PXX | 4% | 3% | P14–P74 classificados/migrados nas faixas auditadas; shims permanecem até comparação visual desktop/mobile |
| 17 | Release/versionamento consolidado | 2% | 2% | P75 formalizada |
| 18 | CI final + preview + aceite interno | 5% | 0% | Vercel READY não substitui CI integral/aceite desktop-mobile |
| | **TOTAL** | **100%** | **82%** | |

## Regras para subir a porcentagem

1. Conta-se responsabilidade eliminada do legado, não arquivo criado.
2. Regra histórica substituída é `SUPERSEDED` e não ganha owner artificial.
3. CSS só conta após classificação/migração ou prova de supersessão.
4. Os últimos 5% ficam reservados a CI integral, preview desktop/mobile e matriz de aceite.
5. Mesmo em 100%, a PR permanece Draft até autorização explícita.

## Trabalho fechado

- P75: primeiro paint da carteira via `dirty_balance`/cache, confirmação leve, coalescing e realtime preservados.
- Backend PXX 8/8; BUFFs 21/21; rewards/loot; Sala/Lobby 64 combinações; linhagem P01→P75.
- `APP_LIFECYCLE_AUDIT.md` congela estado/bootstrap/socket antes da extração.
- P14: formulário-base de regras + molduras cosméticas-base; layout/reward/BUFF e efeitos posteriores classificados como `SUPERSEDED`.
- P15: Resumo da partida, editor de regras e cards econômicos por colocação em owners próprios; composição antiga da criação substituída por P21/P36.
- P16: Pronto explícito, base da Reciclagem e apresentação de BUFFs isolados; regra de 25 moedas/carta permanece no backend/`marketplaceUI` atual.
- P17: progressão de molduras Bronze → Prata → Ouro → Platina separada da raridade cosmética Comum → Celestial; Cintilante respeita override posterior P33.
- P18: contribuição/Mão de Vaca, grid-base de criação, raridade textual de BUFF e base da Central; Gênese/config-value antigos descartados em favor de P26+/P21.
- P19: ownership residual reduzido à resposta dupla no gameplay; pilhas e savebar local substituídas por P21/P23.
- P20: identidade pública, backdrop da Home e Player Showcase em owners separados; scripts P20 históricos permanecem não executáveis.
- P21–P23: criação/sala, Cartas Limpas, estimativa semântica e Salvar global do Perfil em owners atuais.
- P26–P31: Gênese consolidada em base + resultado final de seis estrelas; P27 histórico e P28 restrito ao skeleton da Reciclagem.
- P32–P44: trajetória auditada por `CURRENT` vs `SUPERSEDED`; P34/P42/P44 históricos, demais resultados vigentes em owners por domínio.
- P45→P53 consolidado por resultado, removendo concorrências e regras mortas.
- P54: integridade de avatar + base do botão Criar Carta; grid estático descartado porque `profileUI` converte para grids live.
- P55: totalmente `HISTORICAL`.
- P56: ações Perfil/Sair, refinamento de criação e ficha/modal em owners canônicos; classes antigas de biblioteca descartadas.
- P57: biblioteca real + grids live de molduras; dimensões/lacuna antigas classificadas como superseded.
- P58: somente tipografia residual da lacuna, metadados, creator, Reciclagem e Gênese permanecem; desenho/dimensões finais pertencem a P59/P60.
- P59/P60/P62/P66/P68/P73/P74 já possuem owners visuais/shims.
- contratos P14–P17, P19–P20 e respectivas ondas funcionais chegaram a preview Vercel `READY`; builds intermediários cancelados por commits supersedentes não são tratados como falha.

## Próxima sequência

- fechar comparação visual real desktop/mobile antes de remover qualquer shim PXX;
- extrair estado/bootstrap/socket lifecycle do `app.js` em etapas, sem duplicar listeners;
- consolidar gameplay/telas-base;
- classificar módulos-base JS restantes;
- obter CI integral + preview desktop/mobile/iPhone/PWA + fluxos multiplayer;
- somente após aprovação explícita considerar merge na `main`.
