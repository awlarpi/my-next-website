const { MongoClient } = require("mongodb");
var crypto = require("crypto");

export default async function handler(req, res) {
  const { roomId, request, Is_X_Turn } = req.query;
  const { squares } = req.body;
  const method = req.method;
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
  } catch (error) {
    console.error("Could not connect to MongoClient");
    res.status(500).send("Could not connect to database");
    return;
  }

  console.log("Client connected!");
  const database = client.db("tictactoe");
  const coll = database.collection("rooms");

  try {
    if (method === "GET" && request === "joinRoom") {
      try {
        const playerIdObject = await handleJoinRequest(coll, roomId);
        res.status(200).send(playerIdObject);
      } catch (error) {
        res.status(404).send(error.message);
      }
    } else if (method === "GET" && request === "createRoom") {
      try {
        const response = await handleCreateRoom(coll);
        res.status(200).send(response);
      } catch (error) {
        res.status(500).send(error.message);
      }
    } else if (method === "GET" && request === "listenForOpponentMove") {
      try {
        const response = await handleListener(coll, roomId);
        res.status(200).send(response);
      } catch (error) {
        res.status(400).send(error.message);
      }
    } else if (method === "POST") {
      try {
        const data = await handleUpdate(coll, roomId, squares, Is_X_Turn);
        res.status(200).send(data);
      } catch (error) {
        res.status(400).send(error.message);
      }
    } else if (method === "DELETE") {
      try {
        const response = await handleDeleteRoom(coll, roomId);
        res.status(200).send(response);
      } catch (error) {
        res.status(500).send(error.message);
      }
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(400).send(`Bad request`);
    }
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    console.log("closing client...");
    await client.close();
  }
}

//returns the playerId if successful, otherwise returns error
async function handleJoinRequest(coll, roomId) {
  try {
    console.log(`searching for room ${roomId}...`);
    //request for room
    const room = await coll.findOne({ Room_ID: roomId });
    //if no room found, reject request
    if (!room) throw new Error(`room ${roomId} not found!`);
    console.log(`room ${roomId} found!`);
    //if room full, reject request
    if (room.Room_Full) throw new Error(`room ${roomId} is full!`);
    //generate random ids for authentication
    const player2Id = crypto.randomBytes(10).toString("hex");
    //update that room is now full
    const response = await coll.updateOne(
      { Room_ID: roomId },
      { $set: { Room_Full: true, Player2_ID: player2Id } }
    );
    console.log(`response: ${response}`);
    console.log(`player 2 joining room ${roomId}...`);
    //return player2Id object
    return { playerId: player2Id };
  } catch (error) {
    console.error(error.message);
    throw new Error(error);
  }
}

//handle creating new room
async function handleCreateRoom(coll) {
  try {
    console.log(`creating new room...`);
    //generate new unique room ID, add room ID to the list of occupied rooms
    const newRoomId = crypto.randomBytes(10).toString("hex");
    //generate new unique player ID
    const player1Id = crypto.randomBytes(10).toString("hex");
    // select who starts first
    const player1StartFirst = Math.random() < 0.5;
    //generate new room with new room ID
    const response = await coll.insertOne({
      Room_Full: false,
      Room_ID: newRoomId,
      Player1_Start_First: player1StartFirst,
      Board_State: Array(9).fill(null),
      Is_X_Turn: true,
      Rematch: false,
      Player1_ID: player1Id,
      Player2_ID: null,
    });
    console.log(`response: ${response}`);
    console.log(`room ${newRoomId} created successfully!`);
    //TODO: WHAT IF SIMULTANEOUS REQUEST GET MADE AND OVERWRITE EACH OTHER???
    return {
      roomId: newRoomId,
      playerId: player1Id,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error("Error creating new room!");
  }
}

async function handleUpdate(coll, roomId, squares, Is_X_Turn) {
  try {
    console.log(`updating room ${roomId}...`);
    const response = await coll.updateOne(
      { Room_ID: roomId },
      { $set: { Board_State: squares, Is_X_Turn: Is_X_Turn } }
    );
    console.log(`response: ${response}`);
    return { Is_X_Turn: Is_X_Turn };
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error updating room ${roomId}!`);
  }
}

async function handleDeleteRoom(coll, roomId) {
  try {
    console.log(`deleting room ${roomId}...`);
    await coll.deleteOne({ Room_ID: roomId });
    console.log(`room ${roomId} deleted successfully!`);
    return `room ${roomId} deleted successfully!`;
  } catch (error) {
    console.error(error.message);
    throw new Error("Error deleting room!");
  }
}

async function handleListener(coll, roomId) {
  console.log(`listener request received!`);

  //const room = await coll.findOne({ Room_ID: roomId });
  console.log(`listening for changes to room ${roomId}`);
  //wait for changes to the room, then return with the updated board
  const pipeline = [{ $match: { Room_ID: roomId } }];
  const changeStream = coll.watch(pipeline);

  changeStream.on("change", (next) => {
    // process any change event
    console.log("received a change to the coll: \t", next);
  });

  await coll.updateOne(
    { Room_ID: roomId },
    { $set: { Board_State: squares, Is_X_Turn: Is_X_Turn } }
  );
}
