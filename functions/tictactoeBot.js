export function bestBotMove(squares, isMaximizer) {
  //generate possible moves from current state
  const possibleMoves = getPossibleMoves(squares);

  //return if board is full or only one possible move
  if (possibleMoves.length === 0) return "No Moves Left";
  if (possibleMoves.length === 1) return possibleMoves[0];

  //if is maximizer
  if (isMaximizer) {
    let bestMove = { move: null, evaluation: Number.NEGATIVE_INFINITY };
    possibleMoves.forEach((move) => {
      const newBoard = squares.map((square, index) =>
        index === move ? "X" : square
      );
      const evaluation = newMiniMax(
        newBoard,
        false,
        1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY
      );
      if (evaluation > bestMove.evaluation) {
        bestMove.move = move;
        bestMove.evaluation = evaluation;
      }
    });

    console.log(
      `\nPlayer X\nBest Move: ${bestMove.move}\nEvaluation: ${bestMove.evaluation}\n___________________`
    );

    return bestMove.move;
  }

  //if is minimizer
  let bestMove = { move: null, evaluation: Number.POSITIVE_INFINITY };
  possibleMoves.forEach((move) => {
    const newBoard = squares.map((square, index) =>
      index === move ? "O" : square
    );
    const evaluation = newMiniMax(
      newBoard,
      true,
      1,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    if (evaluation < bestMove.evaluation) {
      bestMove.move = move;
      bestMove.evaluation = evaluation;
    }
  });

  console.log(
    `\nPLayer O\nBest Move: ${bestMove.move}\nEvaluation: ${bestMove.evaluation}\n\n`
  );

  return bestMove.move;
}

const newMiniMax = (board, isMaximizer, depth, alpha, beta) => {
  //base case
  const result = getResult(board);
  if (result) {
    if (result === "draw") return 0;
    if (result[3] === "X") return 100 - depth;
    if (result[3] === "O") return -100 + depth;
  }

  //calculate possible moves
  const possibleMoves = getPossibleMoves(board);

  //if is maximizer
  if (isMaximizer) {
    let newAlpha = alpha;
    let maxEval = Number.NEGATIVE_INFINITY;
    possibleMoves.some((move) => {
      const newBoard = board.map((square, index) =>
        index === move ? "X" : square
      );
      const evaluation = newMiniMax(newBoard, false, depth + 1, newAlpha, beta);
      if (evaluation > maxEval) maxEval = evaluation;
      if (maxEval > newAlpha) newAlpha = maxEval;
      return beta <= newAlpha;
    });
    return maxEval;
  }

  //if is minimizer
  let newBeta = beta;
  let minEval = Number.POSITIVE_INFINITY;
  possibleMoves.some((move) => {
    const newBoard = board.map((square, index) =>
      index === move ? "O" : square
    );
    const evaluation = newMiniMax(newBoard, true, depth + 1, alpha, newBeta);
    if (evaluation < minEval) minEval = evaluation;
    if (minEval < newBeta) newBeta = minEval;
    return newBeta <= alpha;
  });
  return minEval;
};

export const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getResult(squares) {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c, squares[a]];
    }
  }
  if (squares.every((square) => square !== null)) {
    return "draw";
  }
  return null;
}

//easy mode bot
export function anyhowBotMove(squares) {
  const emptyIndexes = squares
    .map((square, index) => (!square ? index : null))
    .filter((index) => index !== null);
  if (!emptyIndexes.length) return;
  return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
}

function getPossibleMoves(squares) {
  return squares
    .map((square, index) => (!square ? index : null))
    .filter((index) => index !== null);
}
