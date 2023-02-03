import styles from "../styles/Game.module.css";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
// import { useDarkMode } from "usehooks-ts";
import Head from "next/head";

export default function Home() {
  // const { isDarkMode, toggle, enable, disable } = useDarkMode();
  const router = useRouter();

  //create new room
  const handleOnlineModeClick = async () => {
    try {
      console.log("creating new room...");
      //request for a new room
      const response = await axios.get(`/api/tictactoeAPI`, {
        params: { roomId: null, request: "createRoom" },
      });
      const { roomId, playerId } = response.data;
      //direct user to game page
      router.push({
        pathname: "tictactoe/game/[roomId]",
        query: { roomId: roomId, playerId: playerId },
      });
    } catch (err) {
      console.error(err.response.data);
      alert("Error, failed to connect to server");
    }
  };

  return (
    <>
      <Head>
        <title>Play Tic Tac Toe Online | Multiplayer Strategy Game</title>
        <meta
          property="og:title"
          content="Play Tic Tac Toe Online | Multiplayer Strategy Game"
          key="title"
        />
        <meta
          name="description"
          content="Challenge friends or play against the computer in this classic strategy game. Play Tic Tac Toe online now!"
        />
        <meta
          property="og:description"
          content="Challenge friends or play against the computer in this classic strategy game. Play Tic Tac Toe online now!"
          key="description"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="keywords"
          context="tic tac toe, online, multiplayer, strategy, game"
        />
      </Head>
      <main
        className={`${styles.landingMain} ${
          // styles[isDarkMode ? "dark" : "light"]
          styles["light"]
        }`}
      >
        {/* <button className={styles.themeSelector} onClick={toggle}></button> */}

        <div className={styles.landingMenu}>
          <a className={styles.landingMenuItem} onClick={handleOnlineModeClick}>
            <h2>
              Create new game room!<span>-&gt;</span>
            </h2>
          </a>

          <JoinGameForm />

          <Link
            className={styles.landingMenuItem}
            href="/tictactoe/game/offline"
          >
            <h2>
              Play Offline!<span>-&gt;</span>
            </h2>
          </Link>
        </div>
      </main>
    </>
  );
}

function JoinGameForm() {
  const [roomId, setRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      //check if room exists
      console.log("attempting to join room...");
      const response = await axios.get(`/api/tictactoeAPI`, {
        params: { roomId: roomId, request: "joinRoom" },
      });
      const { playerId } = response.data;
      console.log(`Joined room ${roomId}!`);
      //direct user to room
      router.push({
        pathname: "tictactoe/game/[roomId]",
        query: {
          roomId: roomId,
          playerId: playerId,
        },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.landingForm}>
      <label htmlFor="roomId" className={styles.landingLabel}>
        <h2>Join room with ID:</h2>
      </label>
      <input
        type="alphanumeric"
        id="roomId"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
        className={styles.landingInput}
      />
      <button type="submit" className={styles.joinButton}>
        Join
      </button>
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </form>
  );
}
