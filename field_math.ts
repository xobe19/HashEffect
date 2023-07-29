import bigInt, { BigInteger } from "big-integer";

let PRIME = bigInt(2027);

// Field is from 0...2026

// additon, multiplication, division, subtraction are all closed

let x = bigInt(234);

let y = bigInt(250);

let add = x.plus(y).mod(PRIME);

let mult = x.multiply(y).mod(PRIME);

let div = x.multiply(y.modInv(PRIME)).mod(PRIME);

let sub = x.subtract(y).mod(PRIME);

if (sub.lesser(bigInt(0))) {
  sub = sub.plus(PRIME).mod(PRIME);
}

console.log("addition: " + add);

console.log("multiplication: " + mult);

console.log("division: " + div);

console.log("subtraction: " + sub);

// if we use a non prime number, then divison MAY NOT be possible
// to find mod inverse (a, m) the gcd(a,m) = 1
// if it's not true, then mod inverse can't be found, hence division not possible

let COMPOSITE = 2028;

try {
  //ERROR
  div = x.multiply(y.modInv(COMPOSITE)).mod(COMPOSITE);
} catch (err) {
  console.log("division error");
}

// GENERATOR FIELDS

// Two ways to use:
// modular exponentiation
// elliptic curves

let g = bigInt(2);
let accum = bigInt(1);
let field_of_generator = new Set<string>();

while (true) {
  let new_push = accum.multiply(g).mod(PRIME);
  //  console.log(new_push);
  if (field_of_generator.has(new_push.toString())) {
    break;
  }

  field_of_generator.add(new_push.toString());
  accum = new_push;
  // console.log(field_of_generator.size);
}

console.log("generator(g) = " + g);
console.log("PRIME = " + PRIME);
console.log("field set: ", field_of_generator);
console.log("order: " + field_of_generator.size);
