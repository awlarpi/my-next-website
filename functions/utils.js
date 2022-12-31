import axios from "axios";

const delay = (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

const randomBoolean = () => {
  return Math.random() < 0.5;
};

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

function isXTurn(p) {
  return p === "X" && true;
}

function allAreNull(obj) {
  let bool = true;
  for (const property in obj) {
    if (obj[property] !== null) bool = false;
  }
  return bool;
}

function numberOfNullElements(array) {
  let count = 0;
  array.forEach((element) => (element === null ? count++ : count));
}

async function deleteRoom(roomId) {
  await axios.delete("/api/tictactoeAPI", {
    params: { roomId: roomId, request: "delete" },
  });
}

export {
  delay,
  randomBoolean,
  indexToPositionList,
  isXTurn,
  allAreNull,
  numberOfNullElements,
  deleteRoom,
};
