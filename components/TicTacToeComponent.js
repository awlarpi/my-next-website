import { useInit, useOnPlayerMove, useShortPolling } from "./custom_hooks"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { bestBotMove, getResult } from "../functions/tictactoeBot"
import { delay, randomBoolean } from "../functions/utils"
import { Grid, GameMenuBar, MenuBar } from "./game_components"
import style from "../styles/Game.module.css"
import * as atoms from "./game_atoms"

export default function TicTacToeGame(props) {
  const router = useRouter()
  const [, setLatestMove] = useAtom(atoms.latestMoveAtom)
  const [, setMyMove] = useAtom(atoms.myLatestMoveAtom)
  const [error] = useAtom(atoms.errorAtom)
  const [squares, setSquares] = useAtom(atoms.squaresAtom)
  const [, setIsOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [result, setResult] = useAtom(atoms.resultAtom)
  const [gameMode, setGameMode] = useAtom(atoms.gameModeAtom)
  const [player, setPlayer] = useAtom(atoms.playerAtom)
  const [initialized] = useAtom(atoms.initializedAtom)

  useInit({ ...props })

  useOnPlayerMove(handleBotMove, props.startFirst, props.onlineMode)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (props.onlineMode) useShortPolling()

  function handleTileClick(index) {
    if (squares[index]) return //return if tile is full  already
    if (!props.onlineMode) {
      if (result) return //return if gameOver or tile is clicked already
      onIndexUpdate(index)
      //handle everything and swap players
      if (result || gameMode !== "singlePlayer") return //if gameOver or is double player
      setIsOpponentTurn(true) //game not ended and is single player
      return
    }
    //else is online mode
    setMyMove(index)
    setLatestMove(index)
    onIndexUpdate(index)
    setIsOpponentTurn(true)
  }

  async function handleBotMove() {
    console.log("getting bot move")
    if (result) return //return if gameOver or tile is clicked already
    if (props.onlineMode) return //return if online mode
    await delay(300)
    const botMove = bestBotMove(squares, player)
    onIndexUpdate(botMove)
    setIsOpponentTurn(false)
  }

  function handleReset() {
    console.log("resetting")
    setSquares(Array(9).fill(null))
    setResult(null)
    setPlayer("X")
    if (gameMode === "singlePlayer") {
      setIsOpponentTurn(randomBoolean())
    } else {
      setIsOpponentTurn(false)
    }
  }

  function handlePlayerModeToggle() {
    console.log("switching player mode")
    setSquares(Array(9).fill(null))
    setResult(null)
    setPlayer("X")
    if (gameMode === "singlePlayer") {
      setGameMode("multiPlayer")
      setIsOpponentTurn(false)
    } else {
      setGameMode("singlePlayer")
      setIsOpponentTurn(randomBoolean())
    }
  }

  function onIndexUpdate(index) {
    console.log("updating squares")
    const newSquares = [...squares]
    newSquares[index] = player
    setSquares(newSquares)
    setResult(getResult(newSquares))
    setPlayer(player === "X" ? "O" : "X")
  }

  if (error) router.push(`/`)

  if (!initialized) return <div>Loading...</div>
  
  return (
    <div className={`${style.main} ${style["light"]}`}>
      <MenuBar />
      <div className={style.gameContainer}>
        <Grid handleTileClick={handleTileClick} />
        <GameMenuBar
          handleReset={handleReset}
          handlePlayerModeToggle={handlePlayerModeToggle}
          startFirst={props.startFirst}
        />
      </div>
    </div>
  )
}
