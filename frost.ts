import bigInt, { BigInteger } from "big-integer";
import crypto from "crypto-js";
import {
  addInField,
  exponentiationInField,
  multiplyInField,
} from "./field_math_exports";

const P = bigInt("15943542169520389343");
const Q = bigInt("7971771084760194671");
const g = bigInt("2");
let t = 2;
let n = 3;
let all_commitments: BigInteger[][] = new Array(n + 1).fill([]);
let preprocess_storage: BigInteger[][][] = new Array(n + 1).fill([]);
function generate_random_polynomial(t: number) {
  let coefficients = [];
  for (let i = 0; i < t; i++) {
    coefficients.push(bigInt.randBetween(1, Q.minus(1)));
  }
  // console.log(coefficients);

  return coefficients;
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

function evaluate_polynomial(
  coefficients: BigInteger[],
  x: number,
  Q: BigInteger
) {
  let answer = bigInt(0);
  let acc = bigInt(1);
  for (let i = 0; i < coefficients.length; i++) {
    let term = acc.multiply(coefficients[i]);
    term = term.mod(Q);
    answer = answer.plus(term);
    answer = answer.mod(Q);
    acc = acc.multiply(bigInt(x));
    acc = acc.mod(Q);
  }
  return answer.mod(Q);
}

class Node {
  // id's from 1 to n
  public id: number;
  public polynomial: BigInteger[] = [];
  public ai0: BigInteger = bigInt(0);
  public k: BigInteger = bigInt(0);
  public Ri: BigInteger = bigInt(0);
  public Mui: BigInteger = bigInt(0);
  public ci: BigInteger = bigInt(0);
  public public_commitments: BigInteger[] = [];
  public secret_shares: BigInteger[][] = [];
  public signing_share: BigInteger = bigInt(0);
  public public_verification_share: BigInteger = bigInt(0);
  public group_public_key: BigInteger = bigInt(0);

  constructor(id: number) {
    this.id = id;
  }

  startRound1() {
    this.polynomial = generate_random_polynomial(t);
    this.ai0 = this.polynomial[0];
    this.k = bigInt.randBetween(1, Q.minus(1));
    this.Ri = exponentiationInField(g, this.k, P);
    let hash = crypto
      .SHA256(
        crypto.enc.Hex.parse(
          this.id.toString(16) +
            str_to_hex("cts") +
            exponentiationInField(g, this.ai0, P).toString(16) +
            this.Ri.toString(16)
        )
      )
      .toString();

    this.ci = bigInt(hash, 16).mod(Q);
    this.Mui = addInField(this.k, multiplyInField(this.ci, this.ai0, Q), Q);

    for (let i = 0; i < this.polynomial.length; i++) {
      this.public_commitments.push(
        exponentiationInField(g, this.polynomial[i], P)
      );
    }

    all_commitments[this.id] = this.public_commitments;

    //   console.log(`mui of ${this.id}: ${this.Mui}`);

    //broadcasting to all classes
    for (let i = 0; i < all_nodes.length; i++) {
      let curr_node = all_nodes[i];
      if (curr_node.id == this.id) continue;
      //      console.log(`${this.id} sent; ${this.public_commitments}`);
      curr_node.recieveRound1Broadcast(
        this.public_commitments,
        this.Ri,
        this.Mui,
        this.id
      );
    }
  }

  recieveRound1Broadcast(
    commitments_l: BigInteger[],
    Rl: BigInteger,
    Mul: BigInteger,
    l: number
  ) {
    let LHS = Rl;
    let phi_l_0 = commitments_l[0];

    let hash = crypto
      .SHA256(
        crypto.enc.Hex.parse(
          l.toString(16) +
            str_to_hex("cts") +
            phi_l_0.toString(16) +
            Rl.toString(16)
        )
      )
      .toString();
    let cl = bigInt(hash, 16).mod(Q);
    // console.log(`mui of ${l}: `, Mul);
    let RHS = exponentiationInField(g, Mul, P);
    RHS = multiplyInField(
      RHS,
      exponentiationInField(phi_l_0, cl.multiply(-1), P),
      P
    );
    if (LHS.equals(RHS)) {
      console.log(`Node ${this.id} verified the message sent by ${l}`);
    } else {
      console.log("Not able to verify");
    }
  }

  startRound2() {
    this.secret_shares.push([
      bigInt(this.id),
      evaluate_polynomial(this.polynomial, this.id, Q),
    ]);

    for (let i = 0; i < all_nodes.length; i++) {
      let curr_node = all_nodes[i];
      if (curr_node.id == this.id) continue;

      curr_node.recieveRound2Broadcast(
        [
          bigInt(curr_node.id),
          evaluate_polynomial(this.polynomial, curr_node.id, Q),
        ],
        this.id
      );
    }
  }

  recieveRound2Broadcast(share: BigInteger[], l: number) {
    let i = share[0];
    let fli = share[1];
    let LHS = exponentiationInField(g, fli, P);

    let RHS = bigInt(1);
    for (let k = 0; k <= t - 1; k++) {
      RHS = multiplyInField(
        RHS,
        exponentiationInField(
          all_commitments[l][k],
          exponentiationInField(i, bigInt(k), Q),
          P
        ),
        P
      );
    }
    if (LHS.equals(RHS)) {
      console.log(`${this.id} verified the secret sent by ${l} `);
      this.secret_shares.push(share);
    } else {
      console.log(`${this.id} not verified the secret sent by ${l} `);
    }
  }

  calculate_signing_share() {
    for (let i = 0; i < this.secret_shares.length; i++) {
      this.signing_share = this.signing_share.plus(this.secret_shares[i][1]);
    }
    console.log(
      `Node ${this.id} calculated it's signing share as: ${this.signing_share}`
    );

    this.public_verification_share = exponentiationInField(
      g,
      this.signing_share,
      P
    );
    console.log(
      `Node ${this.id} calculated it's public verification share as: ${this.public_verification_share}`
    );
  }

  compute_overall_public_key() {
    let ACC = bigInt(1);
    for (let j = 1; j <= n; j++) {
      ACC = ACC.multiply(all_commitments[j][0]).mod(P);
    }
    this.group_public_key = ACC;
    console.log(
      `Node ${this.id} computed the overall public key as ${this.group_public_key}`
    );
  }

  compute_public_key_of(l: number) {
    let overall = bigInt(1);
    for (let j = 1; j <= n; j++) {
      let ACC = bigInt(1);
      for (let k = 0; k <= t - 1; k++) {
        ACC = multiplyInField(
          ACC,
          exponentiationInField(
            all_commitments[j][k],
            exponentiationInField(bigInt(l), bigInt(k), Q),
            P
          ),
          P
        );
      }
      overall = multiplyInField(overall, ACC, P);
    }

    console.log(`Public key of ${l} is ${overall}`);
  }

  preprocess(pi: number) {
    let li: BigInteger[][] = [];
    for (let i = 0; i < pi; i++) {
      let di = bigInt.randBetween(1, Q.minus(1));
      let Di = exponentiationInField(g, di, P);
      li.push([di, Di]);
    }

    preprocess_storage[this.id] = li;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var all_nodes: Node[] = [new Node(1), new Node(2), new Node(3)];

(async function () {
  for (let node of all_nodes) {
    node.startRound1();
  }

  await sleep(4000);

  //  console.log(all_commitments);
  for (let node of all_nodes) {
    node.startRound2();
  }

  await sleep(4000);

  for (let node of all_nodes) {
    node.calculate_signing_share();
  }
  await sleep(4000);

  for (let node of all_nodes) {
    node.compute_overall_public_key();
  }

  await sleep(4000);

  all_nodes[0].compute_public_key_of(2);

  await sleep(4000);

  for (let node of all_nodes) {
    node.preprocess(2);
  }
  await sleep(4000);

  console.log(`Preprocessed Storage: `);

  for (let i = 1; i <= n; i++) {
    console.log(`Node ${i} preprocessed : ` + preprocess_storage[i]);
  }
})();
