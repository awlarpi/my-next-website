export const config = {
  runtime: 'edge',
}

import { clientPromise } from "../../functions/mongoDB";
var crypto = require("crypto");
const util = require("util");

export default async function handler(req, res) {
  const { roomId, request, Latest_Move } = req.query;
  const { Squares } = req.body;
  const method = req.method;
  let client = null;

  console.log(`START | METHOD: ${method} | REQUEST: ${request}`);

  try {
    client = await clientPromise();
  } catch (error) {
    console.error("Could not connect to MongoClient");
    res.status(500).send("Could not connect to database");
    return;
  }

  const database = client.db("tictactoe");
  const coll = database.collection("rooms");

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
  } else if (method === "GET" && request === "ping") {
    try {
      const pingData = await handlePing(coll, roomId);
      res.status(200).send(pingData);
    } catch (error) {
      res.status(400).send(error.message);
    }
  } else if (method === "PUT" && request === "updateAndListen") {
    try {
      const latestMoveObject = await handleUpdateAndListen(
        coll,
        roomId,
        Latest_Move,
        Squares
      );
      res.status(200).send(latestMoveObject);
    } catch (error) {
      res.status(400).send(error.message);
    }
  } else if (method === "PUT" && request === "update") {
    try {
      const data = await handleUpdate(coll, roomId, Latest_Move, Squares);
      res.status(200).send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  } else if (method === "DELETE" && request === "delete") {
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

  console.log(`END | METHOD: ${method} | REQUEST: ${request}`);
}

async function handlePing(coll, roomId) {
  console.log(`searching for room ${roomId}...`);
  //request for room
  const room = await coll.findOne({ _id: roomId });
  if (!room) throw new Error("room deleted!");
  const { Latest_Move, Rematch } = room;
  return { Latest_Move: Latest_Move, Rematch: Rematch };

}

//returns the playerId if successful, otherwise returns error
async function handleJoinRequest(coll, roomId) {
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
}

//handle creating new room
async function handleCreateRoom(coll) {
  console.log(`creating new room...`);
  //generate new unique room ID, add room ID to the list of occupied rooms
  const newRoomId = crypto.randomBytes(2).toString("hex");
  //generate new unique player ID
  const player1Id = crypto.randomBytes(10).toString("hex");
  // select who starts first
  const player1StartFirst = Math.random() < 0.5;
  //new room data
  const roomDocument = {
    _id: newRoomId,
    createdAt: new Date(),
    Latest_Move: -1,
    Room_Full: false,
    Is_Player1_Turn: player1StartFirst,
    Rematch: false,
    Player1_ID: player1Id,
    Player2_ID: null,
    Squares: Array(9).fill(null),
  };
  //generate new room with new room ID
  await coll.insertOne(roomDocument);
  console.log(`room created successfully!`);
  //TODO: WHAT IF SIMULTANEOUS REQUEST GET MADE AND OVERWRITE EACH OTHER???
  return {
    roomId: newRoomId,
    playerId: player1Id,
  };

}

//runs when user makes a move
async function handleUpdate(coll, roomId, Latest_Move, Squares) {
  console.log(`updating room ${roomId}...`);
  const response = await coll.updateOne(
    { _id: roomId },
    { $set: { Latest_Move: Latest_Move, Squares: Squares } }
  );
  //console.log(`response: ${util.inspect(response)}`);
  if (!response.matchedCount) throw new Error("Room ID not matched!");
  if (!response.modifiedCount) throw new Error("Nothing modified!");
  console.log(`room ${roomId} updated successfully!`);
  return `room ${roomId} updated successfully!`;
}

async function handleDeleteRoom(coll, roomId) {
  console.log(`deleting room ${roomId}...`);
  await coll.deleteOne({ _id: roomId });
  console.log(`room ${roomId} deleted successfully!`);
  return `room ${roomId} deleted successfully!`;
}

async function handleUpdateAndListen(coll, roomId, Latest_Move, Squares, res) {
  await handleUpdate(coll, roomId, Latest_Move, Squares);
  const latestMoveObject = await handleListener(coll, roomId);
  return latestMoveObject;
}

async function handleListener(coll, roomId, timeOutInMs = 9876) {
  const room = await coll.findOne({ _id: roomId });
  if (!room) throw new Error(`room ${roomId} not found!`);
  //specify what to filter for. Use tge console.next to see what objects are
  const pipeline = [{ $match: { "documentKey._id": roomId } }];
  //create changeStream object
  const change = await monitorRoomWithHasNext(coll, timeOutInMs, pipeline);
  const Latest_Move = change.Latest_Move;
  //return latest state of squares
  console.log(`sending latest move: ${JSON.stringify(Latest_Move)}`);
  return { Latest_Move: Latest_Move };
}

async function monitorRoomWithHasNext(coll, timeOutInMs, pipeline) {
  console.log(`opening changeStream using hasNext...`);
  const changeStream = coll.watch(pipeline, { fullDocument: "updateLookup" });
  let change = { Room_Full: false };
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("timeout!"));
      }, timeOutInMs);
    });
    // stays in loop for as long as the change object contains Room_Full., preventing room join requests from stopping the loop
    // if next.operation type === "delete" then break out of loop
    while (Object.hasOwn(change, "Room_Full")) {
      //wait for next change until change occurs
      const next = await Promise.race([changeStream.next(), timeoutPromise]);
      if (next.operationType === "delete") throw new Error("room deleted!");
      change = next.updateDescription.updatedFields;
    }
    //console.log(`next: ${util.inspect(next)}`);
    console.log(`received a change to room: ${JSON.stringify(change)}`);
    changeStream.close();
    console.log(`changeStream is now closed!`);
    return change;
  } catch (error) {
    if (error.message === "timeout!") {
      console.error(`time out! closing change stream...`);
      changeStream.close();
      throw new Error("Request exceeded runtime limit!");
    } else if (error.message === "room deleted!") {
      console.error(`room deleted! closing change stream...`);
      changeStream.close();
      throw new Error("room deleted!");
    } else {
      throw new Error(error);
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
