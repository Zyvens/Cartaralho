# Cartaralho — P14: Narrador, Loja, Recompensas e Regras da Sala

## Objetivo

Consolidar correções solicitadas em revisões anteriores que ficaram parciais ou apenas cobertas por testes de contrato, e entregar as funcionalidades na interface real do jogo.

## Escopo

### 1. Narrador da partida
- Nova configuração de sala: `Narrador` ligado/desligado.
- A configuração pertence à sala e pode ser alterada pelo criador enquanto a partida ainda não começou.
- O narrador usa `SpeechSynthesis`/Web Speech API no navegador.
- Apenas o dispositivo do criador vocaliza, evitando múltiplos dispositivos falando ao mesmo tempo quando o Mestre da rodada muda.
- Narra somente informação pública: início da partida, número da rodada, Carta Preta, momento de revelação das respostas, carta vencedora/vencedor e fim da partida.
- Nunca lê mão privada, autoria oculta antes da revelação ou dados de espectador privados.
- Preferência respeita suporte do navegador e falha silenciosamente quando síntese de voz não existe.

### 2. Cards de BUFF na loja
- `BUFF` e raridade ocupam a mesma linha, alinhados verticalmente.
- Pill `BUFF` permanece amarela.
- Pill de raridade usa Comum → Incomum → Raro → Épico → Lendário.
- Ícone exclusivo de cada BUFF fica em área visual própria abaixo/à direita do cabeçalho, sem competir com os pills.
- Título, descrição, preço e CTA preservam alinhamento consistente entre cards.

### 3. Novas molduras cosméticas
Adicionar molduras compráveis sem interferir na progressão Copper → Silver → Gold → Platinum. As raridades de entrada são deliberadamente baratas; Épicas e Lendárias preservam um salto de prestígio em relação ao catálogo existente.

#### Comum
- Moldura Lisa — 4.000
- Moldura Dupla — 5.000
- Moldura Pontilhada — 6.000

#### Incomum
- Neon Roxa — 8.000
- Faísca — 9.000
- Ornamental — 10.000

#### Épica
- Cintilante — 65.000

#### Lendárias
- Arco-íris — 110.000
- Folhas — 125.000
- Asas — 135.000

Todas são ownership permanente, usam o fluxo cosmético existente e têm render visual próprio.

### 4. Reward preview e Espólio
- Remover o prefixo `~` de todos os valores de moedas.
- O número exibido é o número inteiro calculado pelo Reward Engine.
- `Espólio estimado` deixa de ser texto corrido.
- Cada faixa vira mini-card no mesmo idioma visual dos cards de moedas: 1º, 2º, 3º e Demais quando aplicável.
- Os valores vêm do preview atual (`loot.first`, `loot.second`, `loot.third`, `loot.other`), sem hardcode de números antigos.

### 5. Posição do preview e Como Jogar
- `Como Jogar` volta a ter sua largura/tamanho natural anterior.
- O Reward Preview passa a ser um card separado imediatamente abaixo de `Como Jogar` na coluna lateral.
- O preview não deve alterar a altura ou largura do card `Como Jogar`.
- No mobile, a coluna lateral fica em fluxo vertical: `Como Jogar` → `Estimativa de recompensa`.

### 6. Regras da mesa no Lobby
- Substituir o resumo textual por um card de configuração coerente com a tela `Configurar Mesa`.
- Para o criador, o card é editável antes da partida começar.
- Para os demais jogadores, o mesmo card é read-only.
- Controles: máximo de jogadores, pontos para vencer, cartas na mão, deck-base, criação de cartas, cartas próprias, BUFFs, AFK e Narrador.
- Salvar chama `/api/rooms/config` e só atualiza a interface após resposta autoritativa do servidor.
- O servidor transmite `room_config_updated` para todos os participantes.
- A atualização também recalcula preview econômico e estado de botões dependentes da configuração.
- Continuam válidas as proteções existentes: apenas criador altera, máximo não pode ficar abaixo dos participantes ativos e nenhuma regra é alterada depois do snapshot/início.

## Correções de implementação

- Não depender de patches de DOM por seletor frágil para os itens deste pacote.
- Alterar os componentes-fonte (`rewardPreviewUI`, `createRoom`, `lobby`, `marketplaceShop`, catálogo cosmético e configuração de sala).
- Testes devem validar o HTML realmente produzido pelos componentes e os contratos de servidor, não apenas a existência de strings em um arquivo de patch.

## Critérios de aceite

1. Nenhum `~` é exibido no reward preview.
2. Espólio aparece em cards separados.
3. Como Jogar mantém dimensões naturais e o preview está abaixo dele em card independente.
4. Criador consegue editar regras no Lobby antes do início; outro jogador não consegue.
5. Alterações de regras aparecem para todos via evento de sala.
6. Narrador pode ser ligado/desligado na criação e no Lobby e só vocaliza conteúdo público pelo dispositivo do criador.
7. Cards de BUFF exibem pills alinhados e ícones sem repetição visual.
8. As 10 novas molduras aparecem no catálogo após migração, com raridade/preço corretos e render próprio.
9. Progressão Copper/Silver/Gold/Platinum permanece separada dos cosméticos.
10. Suite completa de testes passa e o deploy de produção fica READY.
