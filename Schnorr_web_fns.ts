import bigInt from "big-integer";
const crypto = require("crypto-js");

import {
  exponentiationInField,
  multiplyInField,
  subtractInField,
} from "./field_math_exports";

function pickNumber(
  min: bigInt.BigInteger,
  max: bigInt.BigInteger,
  Q: bigInt.BigInteger
) {
  while (true) {
    let pick = bigInt.randBetween(min, max);
    if (bigInt.gcd(pick, Q).equals(bigInt(1))) {
      return pick;
    }
  }
}

function sign(
  message: string,
  x: bigInt.BigInteger,
  Q: bigInt.BigInteger,
  g: bigInt.BigInteger,
  P: bigInt.BigInteger
) {
  const k = pickNumber(bigInt(1), Q.minus(bigInt(1)), Q);
  console.log("k: " + k);

  console.log("Q: " + Q);
  const r = exponentiationInField(g, k, P);
  const toHash = r.toString(2) + message;
  const e = crypto.SHA256(toHash); // ? hash
  const HASH = e.toString();
  const HASH_AS_INT = bigInt(HASH, 16);
  console.log("HASHASINT : " + HASH_AS_INT);
  const xe = multiplyInField(x, HASH_AS_INT, Q);

  const s = subtractInField(k, xe, Q);

  console.log("sign : " + [s, e]);
  return [s, HASH_AS_INT];
}

export default function verify(
  y: bigInt.BigInteger,
  s: bigInt.BigInteger,
  r: bigInt.BigInteger,
  P: bigInt.BigInteger,
  g: bigInt.BigInteger,
  Q: bigInt.BigInteger,
  message: string
): boolean {
  let c = crypto.SHA256(message + r.toString(16) + y.toString(16));
  c = bigInt(c, 16);
  const rd = exponentiationInField(g, s, P);

  const rdd = rd.multiply(exponentiationInField(y, c.multiply(-1), P)).mod(P);

  console.log("rdd : " + rdd);
  console.log("r   : " + r);
  return rdd.equals(r);
}

function getPublicAndPrivate(
  Q: bigInt.BigInteger,
  P: bigInt.BigInteger,
  g: bigInt.BigInteger
) {
  const x = pickNumber(bigInt(1), Q.minus(bigInt(1)), Q);
  // ? private key

  const y = exponentiationInField(g, x, P);
  // ? public key

  const [s, e] = sign("hi", x, Q, g, P);
  verify(y, e, s, P, g, Q, "hi");

  console.log("public key: " + y);
}
