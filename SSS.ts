import bigInt from "big-integer";
let PRIME: bigInt.BigInteger = bigInt(2).pow(127).minus(1);
function string_to_bytes(str: string): number[] {
  let byte_array = [];
  for (let i = 0; i < str.length; i++) {
    let curr_character = str[i];
    let byte = curr_character.charCodeAt(0);
    byte_array.push(byte);
  }
  return byte_array;
}

function string_to_integer(secret: string): bigInt.BigInteger {
  let byte_array = string_to_bytes(secret);

  // combining all bytes in byte_array to a single integer

  let secret_int = bigInt(byte_array.map((e) => e.toString(16)).join(""), 16);
  return secret_int;
}

function choose_prime(n: number, secret_int: bigInt.BigInteger) {
  let max = secret_int.compare(n) == 1 ? secret_int : bigInt(n);

  for (let i = max.plus(1); ; i = i.plus(1)) {
    if (i.isPrime()) return i;
  }
}

function generate_random_coefficients(n: number): bigInt.BigInteger[] {
  let coefficients = [];
  for (let i = 0; i < n; i++) {
    let curr_coefficient = bigInt.randBetween(1, PRIME.minus(1));

    coefficients.push(curr_coefficient);
  }
  return coefficients;
}

function evaluate_polynomial(coefficients: bigInt.BigInteger[], x: number) {
  let answer = bigInt(0);
  let acc = bigInt(1);
  for (let i = coefficients.length - 1; i >= 0; i--) {
    let term = acc.multiply(coefficients[i]);
    term = term.mod(PRIME);
    answer = answer.plus(term);
    answer = answer.mod(PRIME);
    acc = acc.multiply(bigInt(x));
    acc = acc.mod(PRIME);
  }
  return answer.mod(PRIME);
}

function SSS(secret: string, n: number, t: number) {
  let secret_int = string_to_integer(secret);

  console.log(secret_int);
  let degree = t - 1;
  let number_of_keys = n;

  PRIME = choose_prime(number_of_keys, secret_int);

  let coefficients = generate_random_coefficients(degree - 1);

  // pushing the secret as the coefficient of 0th degree term

  coefficients.push(secret_int);

  let shared_secrets = [];
  for (let i = 1; i <= n; i++) {
    let fi = evaluate_polynomial(coefficients, i);
    shared_secrets.push([bigInt(i), fi]);
  }

  return shared_secrets;
}

function getCoefficientAtZero(points: bigInt.BigInteger[][]) {
  let p1 = bigInt(1);
  for (let i = 0; i < points.length; i++) {
    let x_coordinate = points[i][0];
    p1 = p1.multiply(x_coordinate.multiply(-1).mod(PRIME)).mod(PRIME);
  }
  // console.log("p1" + p1);

  let p2 = bigInt(0);

  for (let i = 0; i < points.length; i++) {
    let numerator = points[i][1];
    numerator = numerator
      .multiply(p1)
      .multiply(points[i][0].multiply(-1).modInv(PRIME))
      .mod(PRIME);
    let denominator = bigInt(1).mod(PRIME);

    for (let j = 0; j < points.length; j++) {
      if (i == j) continue;
      let front = points[i][0];
      let back = points[j][0];
      denominator = denominator
        .multiply(front.minus(back).mod(PRIME))
        .mod(PRIME);
    }

    let frac = numerator.multiply(denominator.modInv(PRIME)).mod(PRIME);
    console.log("frac " + frac);
    p2 = p2.plus(frac).mod(PRIME);
  }

  return p2.mod(PRIME).plus(PRIME).mod(PRIME);
}

let yy = [
  [1, 8],
  [2, 16],
  [3, 26],
];

let yyyy = yy.map((e) => {
  return e.map((zz) => bigInt(zz));
});

console.log(getCoefficientAtZero(yyyy));

function integer_to_string(int_secret: bigInt.BigInteger) {
  let hex_string = int_secret.toString(16);

  let byte_array = [];

  for(let i = 0; i < hex_string.length;i += 2) {
    let byteString = hex_string[i] + hex_string[i+1];
    byte_array.push(parseInt(byteString,16));
  }

  let string_secret = "";

  for(let byte of byte_array) {
    string_secret += String.fromCharCode(byte);
  }
  return string_secret;
}

function generate_secret(points: bigInt.BigInteger[][]) {
  let integer_secret = getCoefficientAtZero(points);
  return integer_to_string(integer_secret);
}

//console.log(string_to_integer("my secret"));
//console.log(choose_prime(999999, string_to_integer("hi how are you")));
let points = SSS("hi how are you", 10, 7);

console.log(points);

console.log(generate_secret(points));
