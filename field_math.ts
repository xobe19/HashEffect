import bigInt, { BigInteger } from "big-integer";
import readline from "readline-sync";

console.log(
  "Prime Field Operations ---------------------------------------------------------"
);

let PRIME = bigInt(readline.question("Select the prime: "));

function getFieldValue(n: BigInteger, prime = PRIME) {
  let val = n.mod(prime);
  if (val.lesser(0)) return val.plus(prime).mod(prime);
  return val;
}

function multiplyInField(x: BigInteger, y: BigInteger, prime = PRIME) {
  return getFieldValue(x.multiply(y));
}

function addInField(x: BigInteger, y: BigInteger, prime = PRIME) {
  return getFieldValue(x.add(y));
}

function divideInField(x: BigInteger, y: BigInteger, prime = PRIME) {
  let inv = y.modInv(prime);
  return getFieldValue(x.multiply(inv));
}

function subtractInField(x: BigInteger, y: BigInteger, prime = PRIME) {
  let sub = x.subtract(y);
  return getFieldValue(sub);
}

function exponentiationInField(x: BigInteger, y: BigInteger, prime = PRIME) {
  return getFieldValue(x.modPow(y, prime));
}

console.log("Operations:");
console.log("1: Get Value in Field");
console.log("2: Addition in Field");
console.log("3: Multiplication in Field");
console.log("4: Subtraction in Field");
console.log("5: Division in Field");
console.log("6: Exponentiation in Field");
console.log("7: Exit");

while (true) {
  let inp = readline.questionInt("Choose your operation: ");
  let x: BigInteger, y: BigInteger;
  let should_break = false;
  switch (inp) {
    case 1:
      x = bigInt(readline.question("Value = "));
      console.log(getFieldValue(x));
      break;
    case 2:
      x = bigInt(readline.question("Value1 = "));
      y = bigInt(readline.question("Value2 = "));
      console.log(addInField(x, y));
      break;
    case 3:
      x = bigInt(readline.question("Value1 = "));
      y = bigInt(readline.question("Value2 = "));
      console.log(multiplyInField(x, y));
      break;
    case 4:
      x = bigInt(readline.question("Value1 = "));
      y = bigInt(readline.question("Value2 = "));
      console.log(subtractInField(x, y));
      break;
    case 5:
      x = bigInt(readline.question("Value1 = "));
      y = bigInt(readline.question("Value2 = "));
      console.log(divideInField(x, y));
      break;
    case 6:
      x = bigInt(readline.question("Value1 = "));
      y = bigInt(readline.question("Value2 = "));
      console.log(exponentiationInField(x, y));
      break;
    case 7:
      should_break = true;
      break;
  }
  if (should_break) break;
}

console.log(
  "Field Groups -------------------------------------------------------------------"
);

PRIME = bigInt(readline.question("Enter the Prime: "));
let g = bigInt(readline.question("Select the value of generator (g): "));
let accum = bigInt(1);
let field_of_generator = new Set<string>();

while (true) {
  let new_push = accum.multiply(g).mod(PRIME);
  if (field_of_generator.has(new_push.toString())) {
    break;
  }

  field_of_generator.add(new_push.toString());
  accum = new_push;
}

console.log("field set: ", field_of_generator);
console.log("order: " + field_of_generator.size);

let pow = bigInt(
  readline.question("Enter a value x to calculate g^x in this group")
);

console.log(getFieldValue(exponentiationInField(g, pow)));
