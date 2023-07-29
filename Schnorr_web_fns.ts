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
  P: bigInt.BigInteger,
  y: bigInt.BigInteger
) {

let k = pickNumber(bigInt(1), Q.minus(1), Q);
let R = exponentiationInField(g, k, P);
  let c = crypto.SHA256(R.toString(2) + y.toString(2) + str_to_bin(message));
  c = bigInt(c, 16);
  let z = k.plus(multiplyInField(x, c, P)).mod(P);

  let signature = [R, z];

  console.log(verify(y,z,R,P, g,Q, message))
  return signature;

}

function str_to_bin(str: string) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    let byte: number = str.charCodeAt(i);
    bytes.push(byte);
  }
  let bin_string = "";

  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i];
    let bin = byte.toString();
    bin_string += bin;
  }
  return bin_string;
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
  let c = crypto.SHA256(r.toString(2) + y.toString(2) + str_to_bin(message));
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
