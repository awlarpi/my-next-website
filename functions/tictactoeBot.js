export function bestBotMove(squares, player) {
  const isMaximizer = player === "X" ? true : false;
  //generate possible moves from current state
  const possibleMoves = getPossibleMoves(squares);

  //return if board is full or only one possible move
  if (possibleMoves.length === 0) return "No Moves Left";
  if (possibleMoves.length === 1) return possibleMoves[0];

  // sort moves based on heuristic scores
  const sortedPossibleMoves = sortMoves(squares, isMaximizer, possibleMoves);

  //if is maximizer
  if (isMaximizer) {
    let bestMove = { move: null, evaluation: Number.NEGATIVE_INFINITY };
    sortedPossibleMoves.forEach((move) => {
      const newBoard = squares.map((square, index) =>
        index === move ? "X" : square
      );
      const evaluation = newMiniMax(
        newBoard,
        false,
        0,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY
      );
      if (evaluation > bestMove.evaluation) {
        bestMove.move = move;
        bestMove.evaluation = evaluation;
      }
    });

    /*
    console.log(
      `\nPlayer X\nBest Move: ${bestMove.move}\nEvaluation: ${bestMove.evaluation}\n___________________`
    );
    */

    return bestMove.move;
  }

  //if is minimizer
  let bestMove = { move: null, evaluation: Number.POSITIVE_INFINITY };
  sortedPossibleMoves.forEach((move) => {
    const newBoard = squares.map((square, index) =>
      index === move ? "O" : square
    );
    const evaluation = newMiniMax(
      newBoard,
      true,
      0,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    if (evaluation < bestMove.evaluation) {
      bestMove.move = move;
      bestMove.evaluation = evaluation;
    }
  });

  /*
  console.log(
    `\nPLayer O\nBest Move: ${bestMove.move}\nEvaluation: ${bestMove.evaluation}\n\n`
  );
  */

  return bestMove.move;
}

const newMiniMax = (board, isMaximizer, depth, alpha, beta) => {
  // base case: if depth is greater than 4, return the heuristic score for the current state
  const result = getResult(board);
  if (result || depth > 0) return heuristic(board);

  //calculate possible moves
  const possibleMoves = getPossibleMoves(board);

  // sort moves based on heuristic scores
  const sortedPossibleMoves = sortMoves(board, isMaximizer, possibleMoves);

  //if is maximizer
  if (isMaximizer) {
    let maxEval = Number.NEGATIVE_INFINITY;
    sortedPossibleMoves.some((move) => {
      const newBoard = board.map((square, index) =>
        index === move ? "X" : square
      );
      const evaluation = newMiniMax(newBoard, false, depth + 1, alpha, beta);
      if (evaluation > maxEval) maxEval = evaluation;
      if (maxEval > alpha) alpha = maxEval;
      return beta <= alpha;
    });
    return maxEval;
  }

  //if is minimizer
  let minEval = Number.POSITIVE_INFINITY;
  sortedPossibleMoves.some((move) => {
    const newBoard = board.map((square, index) =>
      index === move ? "O" : square
    );
    const evaluation = newMiniMax(newBoard, true, depth + 1, alpha, beta);
    if (evaluation < minEval) minEval = evaluation;
    if (minEval < beta) beta = minEval;
    return beta <= alpha;
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
      return { winningCombination: [a, b, c], winner: squares[a] };
    }
  }
  if (squares.every((square) => square !== null)) {
    return { winningCombination: [], winner: "null" };
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

//get possible moves
function getPossibleMoves(squares) {
  return squares
    .map((square, index) => (!square ? index : null))
    .filter((index) => index !== null);
}

const heuristic = (board) => {
  //check for game over
  const result = getResult(board);
  if (result) {
    if (result.winner === "null") return 0;
    if (result.winner === "X") return Number.POSITIVE_INFINITY;
    if (result.winner === "O") return Number.NEGATIVE_INFINITY;
  }

  //keep track of scores
  let score = 0;

  //heuristic scoring criterion
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    // check if 2 in a line and 1 blank
    if (board[a] === null && board[b] && board[b] === board[c]) {
      score += board[b] === "X" ? 10 : -10;
    }
    if (board[b] === null && board[a] && board[a] === board[c]) {
      score += board[a] === "X" ? 10 : -10;
    }
    if (board[c] === null && board[a] && board[a] === board[b]) {
      score += board[a] === "X" ? 10 : -10;
    }
    // check if 1 in a line and 2 blank
    if (board[a] && board[b] === null && board[c] === null) {
      score += board[a] === "X" ? 1 : -1;
    }
    if (board[b] && board[a] === null && board[c] === null) {
      score += board[b] === "X" ? 1 : -1;
    }
    if (board[c] && board[a] === null && board[b] == null) {
      score += board[c] === "X" ? 1 : -1;
    }
  }

  return score;
};

function sortMoves(squares, isMaximizer, moveList) {
  return moveList.sort((a, b) => {
    const boardAfterMoveA = [...squares];
    boardAfterMoveA[a] = isMaximizer ? "X" : "O";
    const scoreA = heuristic(boardAfterMoveA);
    const boardAfterMoveB = [...squares];
    boardAfterMoveB[b] = isMaximizer ? "X" : "O";
    const scoreB = heuristic(boardAfterMoveB);
    return scoreB - scoreA;
  });
}
