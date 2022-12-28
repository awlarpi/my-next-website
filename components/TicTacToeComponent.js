import { useState, useEffect, useContext, useRef } from "react";
import style from "../styles/Game.module.css";
import Link from "next/link";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/router";
import { bestBotMove, getResult } from "../functions/tictactoeBot";
import {
  SquaresContext,
  ResultContext,
  HandleTileClickContext,
  IsSinglePlayerContext,
} from "../contexts/TicTacToeContext";
const util = require("util");

export default function TicTacToeGame({ onlineMode, roomId, startFirst }) {
  const router = useRouter();
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [theme, setTheme] = useState(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [isOpponentTurn, setIsOpponentTurn] = useState(Math.random() < 0.5);
  const resultRef = useRef(null);
  const playerRef = useRef("X");
  const squaresRef = useRef(squares);

  useEffect(() => {
    const handleOnlineModeSecondPlayer = async () => {
      try {
        await listenForOpponentMove();
      } catch (error) {
        console.error(error);
      }
    };
    if (onlineMode) {
      setIsOpponentTurn(!startFirst);
      setIsSinglePlayer(false);
      if (!startFirst) handleOnlineModeSecondPlayer;
    }
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
        try {
          await updateMyMove();
          await listenForOpponentMove();
        } catch (error) {
          console.error(error);
        }
      };
      console.log(`1. Is opponent turn? ${isOpponentTurn}`);
      if (!onlineMode && isOpponentTurn) {
        handleBotMove();
        return;
      } else if (onlineMode && isOpponentTurn) {
        handleOnlineModeMove();
        return;
      } else {
        console.log("2. Effect not executed");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpponentTurn]
  );

  async function listenForOpponentMove() {
    try {
      console.log("4. Listening for opponent move...");

      //get using the listenForOpponentMove request
      const response = await axios.get("/api/tictactoeAPI", {
        params: {
          roomId: roomId,
          request: "listenForOpponentMove",
          Is_X_Turn: isXTurn(),
        },
      });

      console.log(`5. Successfully retrieved opponent move!`);
      console.log("Response: " + response);

      const newSquares = response.data.Board_State;

      //update local state
      updateSquares(newSquares);
      swapPlayers();
      resultRef.current = getResult(newSquares);
      setIsOpponentTurn(false);
    } catch (error) {
      console.error("Failed to fetch opponent move!");
    }
  }

  async function updateMyMove() {
    console.log("2. Updating my move...");
    try {
      //update board in database
      const response = await axios.post(
        "/api/tictactoeAPI",
        {
          squares: squaresRef.current,
          Is_X_Turn: isXTurn(playerRef.current),
        },
        { params: { roomId: roomId } }
      );
      console.log(`3. Successfully updated database!`);
    } catch (err) {
      console.error("3. Failed to update database!");
    }
  }
  function handleTileClick(index) {
    if (!onlineMode) {
      if (resultRef.current || squares[index]) return; //return if gameOver or tile is clicked already
      onIndexUpdate(index); //handle everything and swap players
      if (resultRef.current || !isSinglePlayer) return; //if gameOver or is double player
      setIsOpponentTurn(true); //game not ended and is single player
      return;
    }
    //else is online mode
    if (resultRef.current || squares[index]) return; //return if gameOver or tile is clicked already
    onIndexUpdate(index); //handle everything and swap players
    if (resultRef.current) return; //if gameOver or is double player
    setIsOpponentTurn(true);
  }
  const handleBotMove = async () => {
    console.log("2. Executing handleBotMove...");
    await delay(300);
    const botMove = bestBotMove(squaresRef.current, playerRef.current);
    onIndexUpdate(botMove);
    setIsOpponentTurn(false);
  };
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
        />
        <GameContextWrapper
          handleTileClick={handleTileClick}
          squares={squares}
          result={resultRef.current}
          isSinglePlayer={isSinglePlayer}
        >
          <GameContainer
            currentPlayer={playerRef.current}
            handleReset={handleReset}
            handlePlayerModeToggle={handlePlayerModeToggle}
            isBoardEnabled={!isOpponentTurn}
            onlineMode={onlineMode}
          />
        </GameContextWrapper>
      </main>
    </>
  );
}

function MenuBar({ setTheme, handleBackClick }) {
  return (
    <>
      <div onClick={() => handleBackClick()} className={`${style.homeLink}`}>
        <u>Back</u>
      </div>
      <button
        className={`${style.themeSelector}`}
        onClick={() => setTheme()}
      ></button>
    </>
  );
}

function GameContextWrapper(props) {
  return (
    <HandleTileClickContext.Provider value={props.handleTileClick}>
      <SquaresContext.Provider value={props.squares}>
        <ResultContext.Provider value={props.result}>
          <IsSinglePlayerContext.Provider value={props.isSinglePlayer}>
            {props.children}
          </IsSinglePlayerContext.Provider>
        </ResultContext.Provider>
      </SquaresContext.Provider>
    </HandleTileClickContext.Provider>
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
  onlineMode,
}) {
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
        {resultButtonText(result, currentPlayer)}
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

const indexToPositionList = [
  "topLeft",
  "top",
  "topRight",
  "middleLeft",
  "middle",
  "middleRight",
  "bottomLeft",
  "bottom",
  "bottomRight",
];

//decides what text to put on gameState info button
const resultButtonText = (result, currentPlayer) => {
  if (!result) return `${currentPlayer}, your turn now!`;
  if (result.winner === "null") return "It's a draw!";
  return `${result.winner} wins!`;
};
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
const randomBoolean = () => Math.random() < 0.5;
const isXTurn = (p) => p === "X" && true;
