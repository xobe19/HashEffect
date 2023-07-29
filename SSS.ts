import bigInt from "big-integer";

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

function generate_random_coefficients(
  n: number,
  P: bigInt.BigInteger
): bigInt.BigInteger[] {
  let coefficients = [];
  for (let i = 0; i < n; i++) {
    let curr_coefficient = bigInt.randBetween(1, P.minus(1));

    coefficients.push(curr_coefficient);
  }
  return coefficients;
}


function evaluate_polynomial(coefficients: bigInt.BigInteger[], x: number, P:bigInt.BigInteger) {

    let answer = bigInt(0);
    let acc = bigInt(1);
    for(let i = coefficients.length-1; i >= 0; i--) {
        
        let term = acc.multiply(coefficients[i]);
        term = term.mod(P);
        answer = answer.plus(term); 
        answer = answer.mod(P);
        acc = acc.multiply(bigInt(x));
        acc = acc.mod(P);
    }
    return answer.mod(P);
}

function SSS(
  secret: string,
  n: number,
  t: number
) {
  let secret_int = string_to_integer(secret);

  console.log(secret_int);
  let degree = t - 1;
  let number_of_keys = n;

  let P = choose_prime(number_of_keys, secret_int);

  let coefficients = generate_random_coefficients(degree-1, P);

  // pushing the secret as the coefficient of 0th degree term

  coefficients.push(secret_int);


  let shared_secrets = [];
  for(let i = 1; i <= n; i++) {
    let fi = evaluate_polynomial(coefficients, i, P);
    shared_secrets.push([bigInt(i), fi]);
  }


  return shared_secrets;
}




//console.log(string_to_integer("my secret"));
//console.log(choose_prime(999999, string_to_integer("hi how are you")));
console.log(SSS("hi how are you", 10, 7));
