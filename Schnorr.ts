import bigInt from "big-integer";
const crypto = require("crypto-js");
import {
  exponentiationInField,
  multiplyInField,
  subtractInField,
} from "./field_math_exports";

const P = bigInt("15943542169520389343");
const Q = bigInt("7971771084760194671");
const g = bigInt(2);

function pickNumber(min: bigInt.BigInteger, max: bigInt.BigInteger) {
  while (true) {
    let pick = bigInt.randBetween(min, max);
    if (bigInt.gcd(pick, Q).equals(bigInt(1))) {
      return pick;
    }
  }
}

function sign(message: string, x: bigInt.BigInteger) {
  const k = pickNumber(bigInt(1), Q.minus(bigInt(1)));
  console.log("k: " + k);

  console.log("Q: " + Q);
  const r = exponentiationInField(g, k, P);
  const toHash = r.toString() + message;
  const e = crypto.SHA256(toHash); // ? hash
  const HASH = e.toString();
  const HASH_AS_INT = bigInt(HASH, 16);
  console.log(HASH_AS_INT + "    HASHASINT");
  const xe = multiplyInField(x, HASH_AS_INT, Q);

  const s = subtractInField(k, xe, Q);

  console.log("sign : " + [s, e]);
  return [s, HASH_AS_INT];
}

function verify(
  y: bigInt.BigInteger,
  e: bigInt.BigInteger,
  s: bigInt.BigInteger,
  message: string
): boolean {
  const gs = exponentiationInField(g, s, P);
  const ye = exponentiationInField(y, e, P);

  const rv = multiplyInField(gs, ye, P);

  const rv_to_string = rv.toString() + message;
  const ev = crypto.SHA256(rv_to_string).toString();

  const ev_to_int = bigInt(ev, 16);
  console.log("e     : " + e);
  console.log("evtt  :" + ev_to_int);

  const isequal = ev_to_int.compare(e);

  console.log(isequal);
  return isequal == 0 ? true : false;
}

function getPublicAndPrivate() {
  const x = pickNumber(bigInt(1), Q.minus(bigInt(1)));
  // ? private key

  const y = exponentiationInField(g, x, P);
  // ? public key

  const [s, e] = sign("hi", x);
  verify(y, e, s, "hi");

  console.log("public key: " + y);
}

getPublicAndPrivate();
