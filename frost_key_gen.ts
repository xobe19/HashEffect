import bigInt, { BigInteger } from "big-integer";
import {
  addInField,
  exponentiationInField,
  multiplyInField,
} from "./field_math_exports";
const crypto = require("crypto-js");

let P = bigInt("15943542169520389343");
let Q = bigInt("7971771084760194671");
let g = bigInt(2);
let T = 4;
let node_id = 0;

function generate_random_polynomial(t: number) {
  let coefficients = [];
  for (let i = 0; i < t; i++) {
    coefficients.push(bigInt.randBetween(1, Q.minus(1)));
  }
  return coefficients;
}

function compute_pok(ai0: BigInteger, i: number) {
  let k = bigInt.randBetween(1, Q.minus(1));
  let R = exponentiationInField(g, k, P);
  let y = exponentiationInField(g, ai0, P);
  let c = crypto.SHA256(
    i.toString(16) + "context_string" + y.toString(16) + R.toString(16)
  );

  let mu = addInField(k, multiplyInField(ai0, c, P), P);

  return [R, mu];
}

function generate_public_commitments(coefficients: BigInteger[]) {
  let commitments = [];
  for (let i = 0; i < coefficients.length; i++) {
    commitments.push(exponentiationInField(g, coefficients[i], P));
  }
  return commitments;
}

function broadcast(commitments: BigInteger[], my_signature: BigInteger[]) {
  // sending
}
//call this function when broadcast received on API
function broadcastRouteCallback(
  others_commitments: BigInteger[],
  others_signature: BigInteger[],
  other_node_id: number
) {

    let other_r = others_signature[0];
    let other_mu = others_signature[1];

    let LHS = other_r;

    let RHS = exponentiationInField(g, other_mu, P);
    let cl = crypto.SHA256()
    RHS = multiplyInField(RHS, exponentiationInField(others_commitments[0],-cl, P), P);
}




function main() {
  let coefficients = generate_random_polynomial(T);
  let my_signature = compute_pok(
    coefficients[coefficients.length - 1],
    node_id
  );
  let commitments = generate_public_commitments(coefficients);

  broadcast(commitments, my_signature);
}
