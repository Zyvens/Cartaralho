const GAME_STATES = {
  AGUARDANDO_JOGADORES: 'aguardando_jogadores',
  CADASTRO_CARTAS: 'cadastro_cartas',
  PRONTA_PARA_INICIAR: 'pronta_para_iniciar',
  EM_ANDAMENTO: 'em_andamento',
  VOTACAO: 'votacao',
  RESULTADO_RODADA: 'resultado_rodada',
  FINALIZADA: 'finalizada',
};

const MAX_BLACK_CARDS = 5;
const MAX_WHITE_CARDS = 20;
const HAND_SIZE = 5;
const WINNING_SCORE = 10;
const MAX_NICKNAME_LENGTH = 20;
const MIN_PLAYERS = 3;

module.exports = {
  GAME_STATES,
  MAX_BLACK_CARDS,
  MAX_WHITE_CARDS,
  HAND_SIZE,
  WINNING_SCORE,
  MAX_NICKNAME_LENGTH,
  MIN_PLAYERS,
};
