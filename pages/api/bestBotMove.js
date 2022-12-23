const squares = ["O", "X", null, null, "X", null, "O", null, null];
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getResult(squares) {
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

const bestBotMove = (squares) => {
  const possibleMoves = squares
    .map((square, index) => (!square ? index : null))
    .filter((index) => index !== null);
  const miniMaxValues = possibleMoves.map((move) =>
    miniMax(move, possibleMoves, false, squares)
  );
  const indexOfBestMove = miniMaxValues.indexOf(Math.min(...miniMaxValues));
  return possibleMoves[indexOfBestMove];
};

//X / player is maximizer, O / Bot is minimizer
const miniMax = (selectedMove, moves, isMaximizer, gameBoard) => {
  const newGameBoard = [...gameBoard];
  newGameBoard[selectedMove] = isMaximizer ? "X" : "O";

  const result = getResult(newGameBoard);
  if (result) {
    if (result === "draw") return 0;
    if (result[3] === "X") return 5;
    if (result[3] === "O") return -5;
  }

  const newMoves = moves.filter((move) => move !== selectedMove);
  const miniMaxValues = newMoves.map((move) =>
    miniMax(move, newMoves, !isMaximizer, newGameBoard)
  );
  if (isMaximizer) return Math.min(...miniMaxValues);
  return Math.max(...miniMaxValues);
};
