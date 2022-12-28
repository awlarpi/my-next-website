import React from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Loading({ roomId }) {
  const router = useRouter();

  function handleBackClick() {
    console.log("deleting room...");
    axios.delete(`/api/tictactoeAPI`, {
      params: { roomId: roomId },
    });
    router.back();
  }

  return (
    <div>
      <button onClick={handleBackClick}>Back</button>
      <h2>Room ID: {roomId}</h2>
      <p>Waiting for second player to join...</p>
    </div>
  );
}
