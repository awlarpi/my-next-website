import TicTacToeGame from "../../../components/TicTacToeComponent";
import LoadingScreen from "../../../components/LoadingScreenComponent.js";
import { useState } from "react";
import { connectToDatabase } from "../../../functions/mongoDB";

export default function App(props) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading ? (
        <LoadingScreen roomId={props.roomId} />
      ) : (
        <TicTacToeGame onlineMode={true} {...props} />
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
  let client;
  try {
    client = await connectToDatabase();
  } catch (error) {
    console.error("Could not connect to MongoClient");
    return {
      notFound: true,
    };
  }
  console.log("Page loading / refreshing!");
  const database = client.db("tictactoe");
  const collection = database.collection("rooms");
  //fetch room data
  console.log(`Fetching room ${roomId}...`);
  const room = await collection
    .findOne({ _id: roomId })
    .catch((err) => console.error(err));
  //if room is not found, return 404
  if (!room)
    return {
      notFound: true,
    };

  const { Player1_ID, Player2_ID, Squares, Is_Player1_Turn } = room;

  let numberOfEmptyTiles = 0;
  for (const property in Squares) {
    if (Squares[property] === null) numberOfEmptyTiles++;
  }
  //console.log(`number of empty tiles: ${numberOfEmptyTiles}`);
  const propCurrentSymbol = numberOfEmptyTiles % 2 === 1 ? "X" : "O";
  //console.log(`propCurrentSymbol: ${propCurrentSymbol}`);

  let startFirst, propIsOpponentTurn;
  //case is player 1
  if (playerId === Player1_ID) {
    startFirst = Is_Player1_Turn;
    if (Is_Player1_Turn) {
      propIsOpponentTurn = propCurrentSymbol === "O" ? true : false;
    } else {
      propIsOpponentTurn = propCurrentSymbol === "O" ? false : true;
    }
    //console.log(`player1: IsOpponentTurn: ${propIsOpponentTurn}`);
    //case is player 2
  } else if (playerId === Player2_ID) {
    startFirst = !Is_Player1_Turn;
    if (Is_Player1_Turn) {
      propIsOpponentTurn = propCurrentSymbol === "O" ? false : true;
    } else {
      propIsOpponentTurn = propCurrentSymbol === "O" ? true : false;
    }
    //console.log(`player2: IsOpponentTurn: ${propIsOpponentTurn}`);
    //case player does not match
  } else {
    return {
      notFound: true,
    };
  }
  console.log("Page successfully loaded!");
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
  //pass props
  return {
    props: {
      roomId,
      startFirst,
      Squares,
      propIsOpponentTurn,
      propCurrentSymbol,
    },
  };
}
