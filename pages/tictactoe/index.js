import styles from "../../styles/Home.module.css";
import Link from "next/link";
import { Inter } from "@next/font/google";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
const util = require("util");

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
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
    <div className={styles.grid}>
      <button
        onClick={handleOnlineModeClick}
        className={styles.card}
        rel="noopener noreferrer"
      >
        <h2 className={inter.className}>
          Tic-Tac-Toe Online<span>-&gt;</span>
        </h2>
        <p className={inter.className}>Create new game room!</p>
      </button>

      <JoinGameForm />

      <Link
        href="/tictactoe/game/offline"
        className={styles.card}
        rel="noopener noreferrer"
      >
        <h2 className={inter.className}>
          Tic-Tac-Toe Offline<span>-&gt;</span>
        </h2>
        <p className={inter.className}>Play tic-tac-toe offline!</p>
      </Link>
    </div>
  );
}

const JoinGameForm = () => {
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
      console.log(response.data);
      const { playerId } = response.data;
      //direct user to room
      router.push({
        pathname: "tictactoe/game/[roomId]",
        query: {
          roomId: roomId,
          playerId: playerId,
        },
      });
    } catch (error) {
      console.error(error.response.data);
      setErrorMessage(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <label htmlFor="roomId" className={inter.className}>
        Room ID:
      </label>
      <input
        className={inter.className}
        type="alphanumeric"
        id="roomId"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
      />
      <button className={inter.className} type="submit">
        Join
      </button>
      {errorMessage && <p className={inter.className}>{errorMessage}</p>}
    </form>
  );
};
