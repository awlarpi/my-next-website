//import { bestBotMove } from "../../functions/tictactoeBot";
import axios from "axios";
const util = require("util");

const APIendpoint = process.env.DB_API_ENDPOINT;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Request-Headers": "*",
  "api-key": process.env.DB_API_KEY,
};

const documentPathData = {
  dataSource: "Cluster0",
  database: "tictactoe",
  collection: "rooms",
};

export default async function handler(req, res) {
  //process request data
  const squares = req.body.squares;
  const player = req.body.isMaximizer ? "X" : "O";
  const roomID = req.body.roomID;

  //enter data for the new document to be created from scratch
  const newDocument = {
    Room_ID: roomID,
    Board_State: squares,
    Player_Turn: player,
  };

  //enter data to filter for the find and delete document operations
  const dataToFilterBy = {
    Room_ID: roomID,
  };

  //input the filter or creation data for the situation, and get a config to plug into axios
  const insertDocConfig = getInsertDocConfig(newDocument);
  const findDocConfig = getFindDocConfig(dataToFilterBy);
  const deleteDocConfig = getDeleteDocConfig(dataToFilterBy);

  //send request to database
  //change the axios argument as necessary to insert, find, delete

  //upload data to database
  await axios(insertDocConfig);

  //retrieve response from database
  const response = await axios(findDocConfig);

  //error handling
  if (!response) {
    res.status(503).send("Failed to fetch data");
    return;
  }

  //extract data with .data
  const responseData = response.data;
  console.log(
    `Response: ${util.inspect(responseData)}\nData Type: ${typeof response}`
  );

  //send data to client
  res.status(200).send(responseData);
}

/*--------------------------------------------------------------*/

//refactored functions
const getInsertDocData = (newDocument) => {
  const insertDocData = {
    ...documentPathData,
    document: newDocument,
  };
  return insertDocData;
};

const getFilterDocData = (dataToFilterBy) => {
  const filterDocData = {
    ...documentPathData,
    filter: dataToFilterBy,
  };
  return filterDocData;
};

const getInsertDocConfig = (newDocument) => {
  const docConfig = {
    method: "post",
    url: APIendpoint + "/insertOne",
    headers: headers,
    data: getInsertDocData(newDocument),
  };
  return docConfig;
};

const getFindDocConfig = (dataToFilterBy) => {
  const docConfig = {
    method: "post",
    url: APIendpoint + "/findOne",
    headers: headers,
    data: getFilterDocData(dataToFilterBy),
  };
  return docConfig;
};

const getDeleteDocConfig = (dataToFilterBy) => {
  const docConfig = {
    method: "post",
    url: APIendpoint + "/deleteOne",
    headers: headers,
    data: getFilterDocData(dataToFilterBy),
  };
  return docConfig;
};
