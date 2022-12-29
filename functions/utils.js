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

function allAreNull(arr) {
  return arr.every((element) => element === null);
}

export { delay, randomBoolean, indexToPositionList, isXTurn, allAreNull };
