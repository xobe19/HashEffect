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

function generateRandomPrime(
  min: bigInt.BigInteger,
  max: bigInt.BigInteger
): bigInt.BigInteger {
  if (min.compare(max) >= 0) {
    throw new Error("Invalid range. Max must be greater than Min.");
  }

  let randomNum;
  do {
    randomNum = bigInt.randBetween(min, max);
  } while (!randomNum.isProbablePrime());

  return randomNum;
}

function getPrimeFactorOfPMinus1(
  p: bigInt.BigInteger
): bigInt.BigInteger | null {
  const pMinus1 = p.subtract(1);
  if (pMinus1.isEven()) {
    return bigInt(2);
  }
  let i = bigInt(3);
  const sqrtPMinus1 = bigInt(pMinus1).square();
  while (i.compare(sqrtPMinus1) <= 0) {
    if (pMinus1.mod(i).equals(0)) {
      return i;
    }
    i = i.add(2);
  }

  return null;
}

function chooseAlpha(p: bigInt.BigInteger, q: bigInt.BigInteger | null) {
  if (!p.isPrime()) {
    throw new Error("p must be a prime number.");
  }

  if (!q || !q.isPositive() || q.compare(p) >= 0) {
    throw new Error("q must be a positive integer smaller than p.");
  }

  let alpha = bigInt(2);
  const one = bigInt(1);

  while (alpha.compare(p) < 0) {
    if (alpha.modPow(q, p).equals(one)) {
      return bigInt(alpha);
    }
    alpha = alpha.add(1);
  }
}

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
