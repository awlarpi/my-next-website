import TicTacToeGame from "../../../components/TicTacToeComponent";
import LoadingScreen from "../../../components/LoadingScreenComponent.js";
import { useState } from "react";

export default function App({ roomId, startFirst, player }) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading ? (
        <LoadingScreen roomId={roomId} />
      ) : (
        <TicTacToeGame
          onlineMode={true}
          roomId={roomId}
          startFirst={startFirst}
        />
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const { roomId, playerId } = query;

  //if no query parameters in url, return 404
  if (!roomId || !playerId) {
    return {
      notFound: true,
    };
  }

  //connect to server
  const { MongoClient } = require("mongodb");
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (error) {
    console.error("Could not connect to MongoClient");
    return {
      notFound: true,
    };
  }
  console.log("Client connected!");
  const database = client.db("tictactoe");
  const collection = database.collection("rooms");

  //fetch room data
  console.log(`fetching room ${roomId}...`);
  const room = await collection
    .findOne({ Room_ID: roomId })
    .catch((err) => console.error(err));

  //disconnect from DB
  console.log("closing client...");
  await client.close();

  //if room is not found, return 404
  if (!room)
    return {
      notFound: true,
    };

  const Player1_ID = room.Player1_ID;
  const Player2_ID = room.Player2_ID;

  //if player_id does not match up, 404
  if (playerId !== Player1_ID && playerId !== Player2_ID) {
    return {
      notFound: true,
    };
  }

  //determine player number
  const player = playerId === Player1_ID ? "player1" : "player2";

  //determine whether player starts first
  const startFirst =
    player === "player1" ? room.Player1_Start_First : !room.Player1_Start_First;

  /*
  if (player === "player1") {
    // Create a change stream cursor
    const changeStreamCursor = collection.watch([
      {
        $match: {
          Room_ID: roomId,
          Room_Full: { $in: [true, false] },
        },
      },
    ]);

    // Iterate over the change stream events
    for await (const change of changeStreamCursor) {
      console.log(change);
      if (change.fullDocument.Room_Full === true) {
        // Room is now full
        break;
      }
    }
  }
*/

  return {
    props: {
      roomId,
      startFirst,
      player,
    },
  };
}
