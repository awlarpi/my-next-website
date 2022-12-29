import { useState, useEffect, useContext, useRef } from "react";
import style from "../styles/Game.module.css";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/router";
import { bestBotMove, getResult } from "../functions/tictactoeBot";
import {
  SquaresContext,
  ResultContext,
  HandleTileClickContext,
  IsSinglePlayerContext,
  OnlineModeContext,
} from "../contexts/TicTacToeContext";
import {
  delay,
  randomBoolean,
  indexToPositionList,
  allAreNull,
} from "../functions/utils";

export default function TicTacToeGame({ onlineMode, roomId, startFirst }) {
  const router = useRouter();
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [theme, setTheme] = useState(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(
    onlineMode ? false : true
  );
  const [isOpponentTurn, setIsOpponentTurn] = useState(
    onlineMode ? !startFirst : Math.random() < 0.5
  );
  const resultRef = useRef(null);
  const playerRef = useRef("X");
  const squaresRef = useRef(squares);
  const myMoveRef = useRef(null);

  useEffect(() => {
    console.log("roomId: " + roomId);
    const handleOnlineModeSecondPlayer = async () => {
      await listenForOpponentMove();
    };
    if (onlineMode && !startFirst) handleOnlineModeSecondPlayer();
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    document.body.className = `${style[theme]}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      const handleOnlineModeMove = async () => {
        await updateAndListen();
      };
      const onResultTrue = async () => {
        await updateMyMove();
      };
      console.log(`1. Is opponent turn? ${isOpponentTurn}`);
      //offline mode:
      if (!onlineMode) {
        if (isOpponentTurn) handleBotMove();
        return;
      }
      //Online mode
      if (resultRef.current) {
        //if gameOver
        console.log("case one; game over: updating my move...");
        onResultTrue();
        return;
      } else if (!startFirst && allAreNull(squares)) {
        console.log(
          "case two; is beginning and is opponent turn: skip sending my move..."
        );
        return;
      } else if (isOpponentTurn) {
        console.log({
          squares: squares,
          allAreNull: allAreNull(squares),
        });
        console.log(
          "case three; past beginning and is opponent turn: updating and listening..."
        );
        handleOnlineModeMove();
        return;
      } else {
        console.log("all conditions fell through: skipping...");
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpponentTurn]
  );

  async function updateAndListen() {
    console.log("2. Update and listen to room: " + roomId);
    try {
      //update board in database
      const response = await axios.get("/api/tictactoeAPI", {
        params: {
          roomId: roomId,
          request: "updateAndListen",
          Latest_Move: myMoveRef.current,
        },
      });
      const opponentMove = response.data.Latest_Move;

      console.log(`3. Successfully retrieved opponent move: ${opponentMove}`);
      await delay(100);

      onIndexUpdate(opponentMove);
      setIsOpponentTurn(false);
    } catch (err) {
      console.error("3. Failed to update database!");
    }
  }

  async function listenForOpponentMove() {
    try {
      console.log("4. Listening for opponent move...");

      //get using the listenForOpponentMove request
      const response = await axios.get("/api/tictactoeAPI", {
        params: {
          roomId: roomId,
          request: "listenForOpponentMove",
        },
      });

      const opponentMove = response.data.Latest_Move;

      console.log(`5. Successfully retrieved opponent move: ${opponentMove}`);
      await delay(100);
      onIndexUpdate(opponentMove);
      setIsOpponentTurn(false);
    } catch (error) {
      console.error("5. Failed to fetch opponent move");
    }
  }

  async function updateMyMove(myMove) {
    console.log("2. Updating my move to roomId: " + roomId);
    try {
      //update board in database
      await axios.post("/api/tictactoeAPI", null, {
        params: {
          roomId: roomId,
          Latest_Move: myMoveRef.current,
        },
      });
      console.log(`3. Successfully updated database!`);
    } catch (err) {
      console.error("3. Failed to update database!");
    }
  }

  function handleTileClick(index) {
    if (squares[index]) return; //return if tile is full  already
    myMoveRef.current = index;
    if (!onlineMode) {
      if (resultRef.current || squares[index]) return; //return if gameOver or tile is clicked already
      onIndexUpdate(index);
      //handle everything and swap players
      if (resultRef.current || !isSinglePlayer) return; //if gameOver or is double player
      setIsOpponentTurn(true); //game not ended and is single player
      return;
    }
    //else is online mode
    onIndexUpdate(index);
    setIsOpponentTurn(true);
  }
  async function handleBotMove() {
    console.log("2. Executing handleBotMove...");
    await delay(300);
    const botMove = bestBotMove(squaresRef.current, playerRef.current);
    onIndexUpdate(botMove);
    setIsOpponentTurn(false);
  }
  function handleReset() {
    squaresRef.current = Array(9).fill(null);
    setSquares(squaresRef.current);
    resultRef.current = null;
    playerRef.current = "X";
    if (isSinglePlayer) {
      setIsOpponentTurn(randomBoolean());
    } else {
      setIsOpponentTurn(false);
    }
  }
  function handlePlayerModeToggle() {
    squaresRef.current = Array(9).fill(null);
    setSquares(squaresRef.current);
    resultRef.current = null;
    playerRef.current = "X";
    if (isSinglePlayer) {
      setIsSinglePlayer(false);
      setIsOpponentTurn(false);
    } else {
      setIsSinglePlayer(true);
      setIsOpponentTurn(randomBoolean());
    }
  }
  function handleChangeTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }
  function swapPlayers() {
    playerRef.current = playerRef.current === "X" ? "O" : "X";
  }
  function updateSquares(newSquares) {
    setSquares(newSquares);
    squaresRef.current = newSquares;
  }
  function onIndexUpdate(index) {
    const newSquares = [...squaresRef.current];
    newSquares[index] = playerRef.current;
    updateSquares(newSquares);
    swapPlayers();
    resultRef.current = getResult(newSquares);
  }
  function handleBackClick() {
    if (onlineMode) {
      console.log("deleting room...");
      axios.delete(`/api/tictactoeAPI`, {
        params: { roomId: roomId },
      });
    }
    router.back();
  }

  return (
    <>
      <Head>
        <title>Tic-Tac-Toe</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${style.main} ${style[theme]}`}>
        <MenuBar
          theme={theme}
          setTheme={handleChangeTheme}
          handleBackClick={handleBackClick}
          roomId={roomId}
          onlineMode={onlineMode}
        />
        <GameContextWrapper
          handleTileClick={handleTileClick}
          squares={squares}
          result={resultRef.current}
          isSinglePlayer={isSinglePlayer}
          onlineMode={onlineMode}
        >
          <GameContainer
            currentPlayer={playerRef.current}
            handleReset={handleReset}
            handlePlayerModeToggle={handlePlayerModeToggle}
            isBoardEnabled={!isOpponentTurn}
            startFirst={startFirst}
          />
        </GameContextWrapper>
      </main>
    </>
  );
}

function MenuBar({ setTheme, handleBackClick, roomId, onlineMode }) {
  return (
    <>
      <div onClick={() => handleBackClick()} className={`${style.homeLink}`}>
        <u>Back</u>
      </div>
      {onlineMode && (
        <div className={`${style.roomId}`}>
          <p>Room: {roomId}</p>
        </div>
      )}
      <div></div>
      <button
        className={`${style.themeSelector}`}
        onClick={() => setTheme()}
      ></button>
    </>
  );
}

function GameContextWrapper(props) {
  return (
    <OnlineModeContext.Provider value={props.onlineMode}>
      <HandleTileClickContext.Provider value={props.handleTileClick}>
        <SquaresContext.Provider value={props.squares}>
          <ResultContext.Provider value={props.result}>
            <IsSinglePlayerContext.Provider value={props.isSinglePlayer}>
              {props.children}
            </IsSinglePlayerContext.Provider>
          </ResultContext.Provider>
        </SquaresContext.Provider>
      </HandleTileClickContext.Provider>
    </OnlineModeContext.Provider>
  );
}

function GameContainer(props) {
  return (
    <div className={style.gameContainer}>
      <Grid isBoardEnabled={props.isBoardEnabled} />
      <GameMenuBar {...props} />
    </div>
  );
}

function GameMenuBar({
  handleReset,
  currentPlayer,
  handlePlayerModeToggle,
  startFirst,
}) {
  const onlineMode = useContext(OnlineModeContext);
  const isSinglePlayer = useContext(IsSinglePlayerContext);
  const result = useContext(ResultContext);
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
          {isSinglePlayer ? "2P" : "1P"}
        </button>
      )}
    </div>
  );
}

function Grid({ isBoardEnabled }) {
  return (
    <div className={`${style.board} ${!isBoardEnabled && style.disableClick}`}>
      <Square index={0} />
      <Square index={1} />
      <Square index={2} />
      <Square index={3} />
      <Square index={4} />
      <Square index={5} />
      <Square index={6} />
      <Square index={7} />
      <Square index={8} />
    </div>
  );
}

function Square({ index }) {
  const result = useContext(ResultContext);
  const squares = useContext(SquaresContext);
  const onClick = useContext(HandleTileClickContext);

  const winningCombination = result ? result.winningCombination : [];
  const isIconDisabled = result ? "icon-disabled" : "";
  const appearClass = squares[index] ? "appear" : "";

  return (
    <div
      className={`${style.square} ${style[indexToPositionList[index]]}`}
      onClick={() => onClick(index)}
    >
      <div
        className={`${style[appearClass]} ${style[isIconDisabled]} ${
          winningCombination.includes(index) && style.winTile
        }`}
      >
        {squares[index]}
      </div>
    </div>
  );
}

//decides what text to put on gameState info button
function offlineCurrentPlayerText(result, currentPlayer) {
  if (!result) return `${currentPlayer}, your turn now!`;
  return winnerText(result.winner);
}

function onlineCurrentPlayerText(result, currentPlayer, startFirst) {
  if (result) return winnerText(result.winner);
  if (startFirst) {
    //player is playing as X
    if (currentPlayer === "X") return `Player X, your move!`;
    return `Waiting for opponent to make a move...`;
  }
  //player is playing as O
  if (currentPlayer === "O") return `Player O, your move!`;
  return `Waiting for opponent to make a move...`;
}

function winnerText(winner) {
  if (winner === "null") return "It's a draw!";
  return `${winner} wins!`;
}
