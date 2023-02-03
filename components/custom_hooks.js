import { useEffect } from "react"
import { useAtom } from "jotai"
import * as atoms from "./game_atoms"

// listen for player turn changes and act accordingly
export function useOnPlayerMove(handleBotMove) {
  const [isOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)

  useEffect(
    () => {
      // offline mode
      if (isOpponentTurn) handleBotMove()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpponentTurn]
  )
}

// initialize the online mode state
export function useInit() {
  const [, setOnlineMode] = useAtom(atoms.onlineModeAtom)
  const [, setSquares] = useAtom(atoms.squaresAtom)
  const [, setGameMode] = useAtom(atoms.gameModeAtom)
  const [, setPlayer] = useAtom(atoms.playerAtom)
  const [, setIsOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [, setError] = useAtom(atoms.errorAtom)

  useEffect(() => {
    // reset stae on component unmount
    return () => {
      setGameMode("singlePlayer")
      setOnlineMode(false)
      setIsOpponentTurn(Math.random() < 0.5)
      setSquares(Array(9).fill(null))
      setPlayer("X")
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
