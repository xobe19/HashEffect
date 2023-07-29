import bigInt, { BigInteger } from "big-integer";

export function getFieldValue(n: BigInteger, prime: BigInteger) {
  let val = n.mod(prime);
  if (val.lesser(0)) return val.plus(prime).mod(prime);
  return val;
}

export function multiplyInField(
  x: BigInteger,
  y: BigInteger,
  prime: BigInteger
) {
  return getFieldValue(x.multiply(y), prime);
}

export function addInField(x: BigInteger, y: BigInteger, prime: BigInteger) {
  return getFieldValue(x.add(y), prime);
}

export function divideInField(x: BigInteger, y: BigInteger, prime: BigInteger) {
  let inv = y.modInv(prime);
  return getFieldValue(x.multiply(inv), prime);
}

export function subtractInField(
  x: BigInteger,
  y: BigInteger,
  prime: BigInteger
) {
  let sub = x.subtract(y);
  return getFieldValue(sub, prime);
}

export function exponentiationInField(
  x: BigInteger,
  y: BigInteger,
  prime: BigInteger
) {
  return getFieldValue(x.modPow(y, prime), prime);
}
