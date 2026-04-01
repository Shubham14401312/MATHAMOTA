const sessions = new Map();

export function getOrCreateGame(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      ticTacToe: {
        board: Array(9).fill(null),
        next: "X",
        winner: null
      },
      miniLudo: {
        turn: "red",
        dice: 1,
        positions: { red: 0, blue: 0 },
        winner: null
      }
    });
  }
  return sessions.get(chatId);
}

export function playTicTacToe(chatId, index) {
  const game = getOrCreateGame(chatId).ticTacToe;
  if (game.winner || game.board[index]) return game;
  game.board[index] = game.next;
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, b, c] of lines) {
    if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
      game.winner = game.board[a];
    }
  }
  if (!game.winner) {
    game.next = game.next === "X" ? "O" : "X";
  }
  return game;
}

export function playMiniLudo(chatId) {
  const game = getOrCreateGame(chatId).miniLudo;
  if (game.winner) return game;
  const dice = Math.floor(Math.random() * 6) + 1;
  game.dice = dice;
  game.positions[game.turn] += dice;
  if (game.positions[game.turn] >= 20) {
    game.winner = game.turn;
  } else {
    game.turn = game.turn === "red" ? "blue" : "red";
  }
  return game;
}

