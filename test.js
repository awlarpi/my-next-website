function allAreNull(obj) {
  let bool = true;
  for (const property in obj) {
    if (obj[property] !== null) bool = false;
  }
  return bool;
}

const obj = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
console.log(allAreNull(obj));
