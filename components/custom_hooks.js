import { useEffect } from "react"
import { useAtom } from "jotai"
import { useInterval } from "usehooks-ts"
import { errorHandler } from "./error_handler"
import { getResult } from "../functions/tictactoeBot"
import axios from "axios"
import * as atoms from "./game_atoms"

// short polling at 1s interval
export function useShortPolling() {
  const [roomId] = useAtom(atoms.roomIdAtom)
  const [error, setError] = useAtom(atoms.errorAtom)
  const [latestMove, setLatestMove] = useAtom(atoms.latestMoveAtom)
  const [result, setResult] = useAtom(atoms.resultAtom)
  const [, setIsOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [onlineMode] = useAtom(atoms.onlineModeAtom)
  const [isOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [squares, setSquares] = useAtom(atoms.squaresAtom)
  const [player, setPlayer] = useAtom(atoms.playerAtom)

  useInterval(
    async function () {
      try {
        const res = await axios.get("/api/tictactoeAPI", {
          params: {
            roomId: roomId,
            request: "ping",
          },
        })

        const Latest_Move = parseInt(res.data.Latest_Move)

        //if no change, continue pinging the room
        if (Latest_Move === latestMove) return

        console.log(
          `received opponent move: ${Latest_Move}. updating game state...`
        )

        //update game state
        const newSquares = [...squares]
        newSquares[Latest_Move] = player
        setSquares(newSquares)

        const result = getResult(newSquares)
        if (result) return setResult(result)
        
        setPlayer(player === "X" ? "O" : "X")
        setLatestMove(Latest_Move)
        setIsOpponentTurn(false)
      } catch (error) {
        if ("response" in e) errorHandler(e.response.data, setError)
        else errorHandler(e, setError)
      }
    },
    // Delay in milliseconds or null to stop it
    !onlineMode || result || !isOpponentTurn || error ? null : 1000
  )
}

// listen for player turn changes and act accordingly
export function useOnPlayerMove(handleBotMove, startFirst, onlineMode) {
  const [isOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [move] = useAtom(atoms.myLatestMoveAtom)
  const [squares] = useAtom(atoms.squaresAtom)
  const [roomId] = useAtom(atoms.roomIdAtom)
  const [myMove] = useAtom(atoms.myLatestMoveAtom)
  const [, setError] = useAtom(atoms.errorAtom)

  useEffect(
    () => {
      // offline mode
      if (!onlineMode) {
        if (isOpponentTurn) handleBotMove()
        return
      }
      // online mode
      if (move === -1 && !startFirst) {
        return
      }
      if (isOpponentTurn) {
        updateMyMove(squares, roomId, myMove, setError)
        return
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpponentTurn]
  )
}

// initialize the online mode state
export function useInit({
  onlineMode,
  Squares,
  propCurrentSymbol,
  propIsOpponentTurn,
  roomId,
}) {
  const [, setOnlineMode] = useAtom(atoms.onlineModeAtom)
  const [, setSquares] = useAtom(atoms.squaresAtom)
  const [, setGameMode] = useAtom(atoms.gameModeAtom)
  const [, setPlayer] = useAtom(atoms.playerAtom)
  const [, setIsOpponentTurn] = useAtom(atoms.isOpponentTurnAtom)
  const [, setRoomId] = useAtom(atoms.roomIdAtom)
  const [, setError] = useAtom(atoms.errorAtom)
  const [, setMyLatestMove] = useAtom(atoms.myLatestMoveAtom)
  const [, setLatestMove] = useAtom(atoms.latestMoveAtom)

  useEffect(() => {
    if (onlineMode) {
      setRoomId(roomId)
      setOnlineMode(true)
      setSquares(Squares)
      setGameMode("multiPlayer")
      setPlayer(propCurrentSymbol)
      setIsOpponentTurn(propIsOpponentTurn)
    }
    // reset stae on component unmount
    return () => {
      setGameMode("singlePlayer")
      setOnlineMode(false)
      setIsOpponentTurn(Math.random() < 0.5)
      setSquares(Array(9).fill(null))
      setPlayer("X")
      setError(null)
      // online mode
      setRoomId(null)
      setMyLatestMove(-1)
      setLatestMove(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

//update board in database
async function updateMyMove(squares, roomId, myMove, setError) {
  axios
    .put(
      "/api/tictactoeAPI",
      { Squares: squares },
      {
        params: {
          roomId: roomId,
          request: "update",
          Latest_Move: myMove,
        },
      }
    )
    .catch((e) => {
      if ("response" in e) errorHandler(e.response.data, setError)
      else errorHandler(e, setError)
    })
}
