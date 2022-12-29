import { MongoClient } from "mongodb";
var crypto = require("crypto");
const util = require("util");
import { delay } from "../../functions/utils";

export default async function handler(req, res) {
  const { roomId, request, Latest_Move } = req.query;
  const method = req.method;
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri);

  console.log(`START | METHOD: ${method} | REQUEST: ${request}`);
  try {
    await client.connect();
  } catch (error) {
    console.error("Could not connect to MongoClient");
    res.status(500).send("Could not connect to database");
    return;
  }

  console.log("db client connected!");
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
    } else if (method === "GET" && request === "updateAndListen") {
      try {
        const latestMoveObject = await handleUpdateAndListen(
          coll,
          roomId,
          Latest_Move
        );
        res.status(200).send(latestMoveObject);
      } catch (error) {
        res.status(400).send(error.message);
      }
    } else if (method === "POST") {
      try {
        const data = await handleUpdate(coll, roomId, Latest_Move);
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
    console.error(error.message);
    res.status(500).send(error.message);
  } finally {
    await client.close();
    console.log(`db client closed!`);
    console.log(`END | METHOD: ${method} | REQUEST: ${request}`);
  }
}

//returns the playerId if successful, otherwise returns error
async function handleJoinRequest(coll, roomId) {
  try {
    console.log(`searching for room ${roomId}...`);
    //request for room
    const room = await coll.findOne({ _id: roomId });
    //if no room found, reject request
    if (!room) throw new Error(`error: room ${roomId} not found`);
    console.log(`room ${roomId} found!`);
    //if room full, reject request
    if (room.Room_Full) throw new Error(`error: room ${roomId} is full`);
    //generate random ids for authentication
    const player2Id = crypto.randomBytes(10).toString("hex");
    //update that room is now full
    const response = await coll.updateOne(
      { _id: roomId },
      { $set: { Room_Full: true, Player2_ID: player2Id } }
    );
    if (!response.modifiedCount) throw new Error("error: nothing modified");
    //console.log(`response: ${util.inspect(response)}`);
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
    const newRoomId = crypto.randomBytes(2).toString("hex");
    console.log(`new room ID: ${newRoomId}, type: ${typeof newRoomId}`);
    //generate new unique player ID
    const player1Id = crypto.randomBytes(10).toString("hex");
    // select who starts first
    const player1StartFirst = Math.random() < 0.5;
    //new room data
    const roomDocument = {
      _id: newRoomId,
      Latest_Move: null,
      Room_Full: false,
      Player1_Start_First: player1StartFirst,
      Rematch: false,
      Player1_ID: player1Id,
      Player2_ID: null,
    };
    //generate new room with new room ID
    await coll.insertOne(roomDocument);
    console.log(`room created successfully!`);
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

//runs when user makes a move
async function handleUpdate(coll, roomId, Latest_Move) {
  try {
    console.log(`updating room ${roomId}...`);
    const response = await coll.updateOne(
      { _id: roomId },
      { $set: { Latest_Move: Latest_Move } }
    );
    //console.log(`response: ${util.inspect(response)}`);
    if (!response.matchedCount) throw new Error("Room ID not matched!");
    if (!response.modifiedCount) throw new Error("Nothing modified!");
    console.log(`room ${roomId} updated successfully!`);
    return `room ${roomId} updated successfully!`;
  } catch (error) {
    console.error(error.message);
    throw new Error(error);
  }
}

async function handleDeleteRoom(coll, roomId) {
  try {
    console.log(`deleting room ${roomId}...`);
    await coll.deleteOne({ _id: roomId });
    console.log(`room ${roomId} deleted successfully!`);
    return `room ${roomId} deleted successfully!`;
  } catch (error) {
    console.error(error.message);
    throw new Error(error);
  }
}

async function handleListener(coll, roomId) {
  try {
    //specify what to filter for. Use tge console.next to see what objects are
    const pipeline = [
      {
        $match: {
          operationType: "update",
          "documentKey._id": roomId,
        },
      },
    ];
    //create changeStream object
    const change = await monitorRoomWithHasNext(coll, 10000, pipeline);
    const Latest_Move = change.Latest_Move;
    //return latest state of squares
    console.log(`sending latest move: ${JSON.stringify(Latest_Move)}`);
    return { Latest_Move: Latest_Move };
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to fetch opponent move!");
  }
}

async function handleUpdateAndListen(coll, roomId, Latest_Move) {
  try {
    await handleUpdate(coll, roomId, Latest_Move);
    const latestMoveObject = await handleListener(coll, roomId);
    return latestMoveObject;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to update and listen for opponent move!");
  }
}

async function monitorRoomWithEventEmitter(coll, timeOutInMs, pipeline) {
  let change;
  console.log(`opening changeStream using event emitter...`);

  const changeStream = coll.watch(pipeline, { fullDocument: "updateLookup" });
  closeChangeStream(timeOutInMs, changeStream);

  //use changeStream to listen for changes
  changeStream.on("change", (next) => {
    // process any change event
    change = next.updateDescription.updatedFields;
    console.log(`received a change to room:${JSON.stringify(change)}`);
  });

  return change;
}

async function monitorRoomWithHasNext(coll, timeOutInMs, pipeline) {
  console.log(`opening changeStream using hasNext...`);

  const changeStream = coll.watch(pipeline, { fullDocument: "updateLookup" });
  //closeChangeStream(timeOutInMs, changeStream);

  let latestMove, change;

  try {
    // breaks out of loop when changeStream is closed
    while (latestMove === undefined || latestMove === null) {
      //wait for next change until change occurs
      const next = await changeStream.next();
      latestMove = next.fullDocument.Latest_Move;
      change = next.updateDescription.updatedFields;
    }
    //console.log(`next: ${util.inspect(next)}`);
    console.log(`received a change to room: ${JSON.stringify(change)}`);
    changeStream.close();
    console.log(`changeStream is now closed!`);
    return change;
  } catch (error) {
    if (error.message === "ChangeStream is closed") {
      console.log(`time out! change: ${JSON.stringify(change)}`);
      return change;
    } else {
      throw error;
    }
  }
}

function closeChangeStream(timeInMs, changeStream) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("time out! closing the change stream...");
      changeStream.close();
      resolve();
    }, timeInMs);
  });
}
