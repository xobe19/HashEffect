import bigInt, { BigInteger } from "big-integer";

function string_to_bytes(str: string): number[] {
  let byte_array = [];
  for (let i = 0; i < str.length; i++) {
    let curr_character = str[i];
    let byte = curr_character.charCodeAt(0);
    byte_array.push(byte);
  }
  return byte_array;
}

function string_to_integer(secret: string): BigInteger {
  let byte_array = string_to_bytes(secret);

  // combining all bytes in byte_array to a single integer
  let secret_int = bigInt(byte_array.map((e) => e.toString(16)).join(""), 16);
  return secret_int;
}

function choose_prime(n: number, secret_int: BigInteger) {
  let max = secret_int.compare(n) == 1 ? secret_int : bigInt(n);

  for (let i = max.plus(1); ; i = i.plus(1)) {
    if (i.isPrime()) return i;
  }
}

function generate_random_coefficients(
  n: number,
  prime: BigInteger
): BigInteger[] {
  let coefficients = [];
  for (let i = 0; i < n; i++) {
    let curr_coefficient = bigInt.randBetween(1, prime.minus(1));
    coefficients.push(curr_coefficient);
  }
  // console.log("coef len", coefficients.length);
  return coefficients;
}

function evaluate_polynomial(
  coefficients: BigInteger[],
  x: number,
  prime: BigInteger
) {
  let answer = bigInt(0);
  let acc = bigInt(1);
  for (let i = coefficients.length - 1; i >= 0; i--) {
    let term = acc.multiply(coefficients[i]);
    term = term.mod(prime);
    answer = answer.plus(term);
    answer = answer.mod(prime);
    acc = acc.multiply(bigInt(x));
    acc = acc.mod(prime);
  }
  return answer.mod(prime);
}

export function SSS(secret: BigInteger, n: number, t: number) {
  let degree = t - 1;
  let number_of_keys = n;

  const prime = choose_prime(number_of_keys, secret);

  let coefficients = generate_random_coefficients(degree, prime);

  // pushing the secret as the coefficient of 0th degree term

  coefficients.push(secret);

  let shared_secrets = [];
  for (let i = 1; i <= n; i++) {
    let fi = evaluate_polynomial(coefficients, i, prime);
    shared_secrets.push([bigInt(i), fi]);
  }

  return { shares: shared_secrets, prime: prime };
}

function get_coefficient_at_zero(points: BigInteger[][], prime: BigInteger) {
  let p1 = bigInt(1);
  for (let i = 0; i < points.length; i++) {
    let x_coordinate = points[i][0];
    p1 = p1.multiply(x_coordinate.multiply(-1).mod(prime)).mod(prime);
  }
  // console.log("p1" + p1);

  let p2 = bigInt(0);

  for (let i = 0; i < points.length; i++) {
    let numerator = points[i][1];
    numerator = numerator
      .multiply(p1)
      .multiply(points[i][0].multiply(-1).modInv(prime))
      .mod(prime);
    let denominator = bigInt(1).mod(prime);

    for (let j = 0; j < points.length; j++) {
      if (i == j) continue;
      let front = points[i][0];
      let back = points[j][0];
      denominator = denominator
        .multiply(front.minus(back).mod(prime))
        .mod(prime);
    }

    let frac = numerator.multiply(denominator.modInv(prime)).mod(prime);
    // console.log("frac " + frac);
    p2 = p2.plus(frac).mod(prime);
  }

  return p2.mod(prime).plus(prime).mod(prime);
}

function hex_string_to_byte_array(hex: string) {
  let byte_array = [];

  for (let i = 0; i < hex.length; i += 2) {
    let byteString = hex[i] + hex[i + 1];
    byte_array.push(parseInt(byteString, 16));
  }
  return byte_array;
}

function integer_to_string(int_secret: BigInteger) {
  let hex_string = int_secret.toString(16);

  let byte_array = hex_string_to_byte_array(hex_string);

  let string_secret = "";

  for (let byte of byte_array) {
    string_secret += String.fromCharCode(byte);
  }
  return string_secret;
}

export function generate_secret(points: BigInteger[][], prime: BigInteger) {
  // console.log(points.length);
  let integer_secret = get_coefficient_at_zero(points, prime);
  return integer_secret;
  // return integer_to_string(integer_secret);
}
