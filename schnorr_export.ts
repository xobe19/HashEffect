import bigInt from "big-integer";
import crypto from "crypto-js";

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

function str_to_hex(str: string) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    let byte: number = str.charCodeAt(i);
    bytes.push(byte);
  }
  let bin_string = "";

  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i];
    let bin = byte.toString(16);
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
  let hex_data = crypto.enc.Hex.parse(
    r.toString(16) + y.toString(16) + str_to_hex(message)
  );

  //  console.log(hex_data.toString());

  let c_hex = crypto.SHA256(hex_data).toString();
  // console.log(c_hex);

  let c = bigInt(c_hex, 16).mod(Q);

  console.log("corig: " + c);
  // ? using thier hash
  const rd = exponentiationInField(g, s, P);

  const rdd = rd
    .multiply(exponentiationInField(y, c.multiply(-1).mod(Q), P))
    .mod(P);

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

  //  const [s, e] = sign("hi", x, Q, g, P);
  // verify(y, e, s, P, g, Q, "hi");

  console.log("public key: " + y);
}
