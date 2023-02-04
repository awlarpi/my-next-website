import { useEffect } from "react"
import { useAtom } from "jotai"
import * as atoms from "./game_atoms"

// listen for player turn changes and act accordingly
export function useOnPlayerMove(handleBotMove) {
  const [isOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  useEffect(
    () => {
      if (isOpponentTurn) handleBotMove()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpponentTurn]
  )
}

// initialize the online mode state
export function useInit(handleReset) {
  useEffect(() => {
    // reset stae on component unmount
    return () => {
      handleReset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
