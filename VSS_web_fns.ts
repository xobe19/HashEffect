import bigInt, { BigInteger } from "big-integer";
import readline from "readline-sync";
import { exponentiationInField, multiplyInField } from "./field_math_exports";

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

function generate_random_coefficients(n: number, Q: BigInteger): BigInteger[] {
  let coefficients = [];
  for (let i = 0; i < n; i++) {
    let curr_coefficient = bigInt.randBetween(1, Q.minus(1));
    coefficients.push(curr_coefficient);
  }
  // console.log("coef len", coefficients.length);
  return coefficients;
}

function evaluate_polynomial(
  coefficients: BigInteger[],
  x: number,
  Q: BigInteger
) {
  let answer = bigInt(0);
  let acc = bigInt(1);
  for (let i = coefficients.length - 1; i >= 0; i--) {
    let term = acc.multiply(coefficients[i]);
    term = term.mod(Q);
    answer = answer.plus(term);
    answer = answer.mod(Q);
    acc = acc.multiply(bigInt(x));
    acc = acc.mod(Q);
  }
  return answer.mod(Q);
}

function VSS(
  secret: string,
  n: number,
  t: number,
  P: BigInteger,
  Q: BigInteger,
  g: BigInteger
) {
  let secret_int = string_to_integer(secret);

  console.log();
  console.log(`Secret as`, secret_int);
  console.log(`Secret as Hex { value: 0x${secret_int.toString(16)} }`);
  console.log();

  let degree = t - 1;
  let number_of_keys = n;

  //PRIME = choose_prime(number_of_keys, secret_int);
  let coefficients = generate_random_coefficients(degree, Q);

  // pushing the secret as the coefficient of 0th degree term

  coefficients.push(secret_int);

  let shared_secrets = [];
  for (let i = 1; i <= n; i++) {
    let fi = evaluate_polynomial(coefficients, i, Q);
    shared_secrets.push([bigInt(i), fi]);
  }

  let commitments = [];

  // looping through coefficients to generate commitment for each coefficient
  console.log("coefficient: " + coefficients);
  for (let i = 0; i < coefficients.length; i++) {
    commitments.push(exponentiationInField(g, coefficients[i], P));
  }

  return { shared_secrets, commitments };
}

function get_coefficient_at_zero(points: BigInteger[][], Q: BigInteger) {
  let p1 = bigInt(1);
  for (let i = 0; i < points.length; i++) {
    let x_coordinate = points[i][0];
    p1 = p1.multiply(x_coordinate.multiply(-1).mod(Q)).mod(Q);
  }
  // console.log("p1" + p1);

  let p2 = bigInt(0);

  for (let i = 0; i < points.length; i++) {
    let numerator = points[i][1];
    numerator = numerator
      .multiply(p1)
      .multiply(points[i][0].multiply(-1).modInv(Q))
      .mod(Q);
    let denominator = bigInt(1).mod(Q);

    for (let j = 0; j < points.length; j++) {
      if (i == j) continue;
      let front = points[i][0];
      let back = points[j][0];
      denominator = denominator.multiply(front.minus(back).mod(Q)).mod(Q);
    }

    let frac = numerator.multiply(denominator.modInv(Q)).mod(Q);
    // console.log("frac " + frac);
    p2 = p2.plus(frac).mod(Q);
  }

  return p2.mod(Q).plus(Q).mod(Q);
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

function generate_secret(points: BigInteger[][], Q: BigInteger) {
  // console.log(points.length);
  let integer_secret = get_coefficient_at_zero(points, Q);
  return integer_to_string(integer_secret);
}

export function verify_share(
  share: BigInteger[],
  commitments: BigInteger[],
  P: BigInteger,
  g: BigInteger
) {
  let i = share[0];
  let fi = share[1];
  let LHS = bigInt(1);
  let pow = bigInt(1);

  for (let j = commitments.length - 1; j >= 0; j--) {
    let term = exponentiationInField(commitments[j], pow, P);

    console.log("pow: " + pow);
    console.log("j = " + j);
    console.log("commitment: " + commitments[j]);
    console.log("term: " + term);
    LHS = multiplyInField(LHS, term, P);
    pow = pow.multiply(i);
  }

  const RHS = exponentiationInField(g, fi, P);
  return LHS.equals(RHS);
}

//console.log(string_to_integer("my secret"));
//console.log(choose_prime(999999, string_to_integer("hi how are you")));

// let { shared_secrets: points, commitments } = VSS(SECRET, SHARES, THRESHOLD);
// console.log("Shares:");
// for (let point of points) {
//   console.log(`(${point[0]}, ${point[1]})`);
// }

// console.log("Commitments:");
// for (let commitment of commitments) {
//   console.log(commitment);
// }

// for (let i = 0; i < points.length; i++) {
//   console.log(`Verifying Share of User ${i + 1}`);
//   verify_share(points[i], commitments);
// }

// let logged = false;
// console.log();
// for (let i = SHARES; i >= 1; i--) {
//   let recoveredSecret = generate_secret(points.slice(0, i));
//   if (!logged && i < THRESHOLD) {
//     console.log();
//     console.log(
//       `Invalid recovered secrets when using shares less than threshold: `
//     );
//     logged = true;
//   }
//   console.log(
//     `Recovered secret with ${i} shares: ${recoveredSecret}`,
//     string_to_integer(recoveredSecret)
//   );
// }
