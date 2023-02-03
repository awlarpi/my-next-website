import { useAtom } from "jotai"
import { indexToPositionList } from "../functions/utils"
import style from "../styles/Game.module.css"
import Link from "next/link"
import * as atoms from "./game_atoms"

export function MenuBar() {
  const [roomId] = useAtom(atoms.roomIdAtom)
  const [onlineMode] = useAtom(atoms.onlineModeAtom)
  return (
    <div className={`${style.menuBar}`}>
      <Link href="/" className={`${style.homeLink}`}>
        <u>Back</u>
      </Link>
      {onlineMode && <p className={`${style.roomId}`}>Room: {roomId}</p>}
    </div>
  )
}

export function GameMenuBar({
  handleReset,
  handlePlayerModeToggle,
  startFirst,
}) {
  const [onlineMode] = useAtom(atoms.onlineModeAtom)
  const [gameMode] = useAtom(atoms.gameModeAtom)
  const [result] = useAtom(atoms.resultAtom)
  const [currentPlayer] = useAtom(atoms.playerAtom)
  return (
    <div className={`${style.infoContainer}`}>
      {!onlineMode && (
        <button className={`${style.resetButton}`} onClick={handleReset}>
          Reset
        </button>
      )}

      <button className={`${style.resetButton} ${result && style.celebrate}`}>
        {onlineMode
          ? onlineCurrentPlayerText(result, currentPlayer, startFirst)
          : offlineCurrentPlayerText(result, currentPlayer)}
      </button>

      {!onlineMode && (
        <button
          className={`${style.resetButton}`}
          onClick={handlePlayerModeToggle}
        >
          {gameMode === "singlePlayer" ? "2P" : "1P"}
        </button>
      )}
    </div>
  )
}

export function Grid({ handleTileClick }) {
  const [isOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  return (
    <div className={`${style.board} ${isOpponentTurn && style.disableClick}`}>
      <Square index={0} handleTileClick={handleTileClick} />
      <Square index={1} handleTileClick={handleTileClick} />
      <Square index={2} handleTileClick={handleTileClick} />
      <Square index={3} handleTileClick={handleTileClick} />
      <Square index={4} handleTileClick={handleTileClick} />
      <Square index={5} handleTileClick={handleTileClick} />
      <Square index={6} handleTileClick={handleTileClick} />
      <Square index={7} handleTileClick={handleTileClick} />
      <Square index={8} handleTileClick={handleTileClick} />
    </div>
  )
}

function Square({ index, handleTileClick }) {
  const [result] = useAtom(atoms.resultAtom)
  const [squares] = useAtom(atoms.squaresAtom)

  const winningCombination = result ? result.winningCombination : []
  const isIconDisabled = result ? "icon-disabled" : ""
  const appearClass = squares[index] ? "appear" : ""

  return (
    <div
      className={`${style.square} ${style[indexToPositionList[index]]}`}
      onClick={() => handleTileClick(index)}
    >
      <div
        className={`${style[appearClass]} ${style[isIconDisabled]} ${
          winningCombination.includes(index) && style.winTile
        }`}
      >
        {squares[index]}
      </div>
    </div>
  )
}

//decides what text to put on gameState info button
function offlineCurrentPlayerText(result, currentPlayer) {
  if (!result) return `${currentPlayer}, your turn now!`
  return winnerText(result.winner)
}

function onlineCurrentPlayerText(result, currentPlayer, startFirst) {
  if (result) return winnerText(result.winner)
  if (startFirst) {
    //player is playing as X
    if (currentPlayer === "X") return `Player X : Your turn!`
    return `Player X : Opponent's turn!`
  }
  //player is playing as O
  if (currentPlayer === "O") return `Player O : Your turn!`
  return `Player O : Opponent's turn!`
}

function winnerText(winner) {
  if (winner === "null") return "It's a draw!"
  return `${winner} wins!`
}
