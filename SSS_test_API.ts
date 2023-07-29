import axios, { AxiosError } from "axios";
import bigInt, { BigInteger } from "big-integer";
import { SSS, generate_secret } from "./SSS_web_fns";

interface Share {
  index: number;
  value: {
    value: string;
    prime: string;
  };
}

interface SSSSharesResponse {
  k: number;
  n: number;
  shares: Share[];
}

interface SSSSharesBody {
  secret: string;
  shares: Share[];
  team_message: string;
}

function recover_secret(input: SSSSharesResponse) {
  const prime = bigInt(input.shares[0].value.prime, 16);
  const points = [];
  for (let share of input.shares) {
    points.push([bigInt(share.index), bigInt(share.value.value, 16)]);
  }
  console.log("input n", input.n);
  console.log("input k", input.k);
  console.log("input prime", prime);
  console.log("input points", points);
  const recoveredSecret = generate_secret(points, prime);
  return recoveredSecret;
}

function generate_shares(secret: BigInteger, n: number, threshold: number) {
  const shares = SSS(secret, n, threshold);
  const body: SSSSharesBody = {
    secret: secret.toString(),
    shares: shares.shares.map((share) => ({
      index: share[0].toJSNumber(),
      value: { value: share[1].toString(16), prime: shares.prime.toString(16) },
    })),
    team_message: "You have been Pwned",
  };
  // console.log("generated shares: ", body);
  return body;
}

function verifyWithAPI() {
  axios
    .get<SSSSharesResponse>("https://hash-effect.onrender.com/sss/shares")
    .then((resp) => resp.data)
    .then((input) => {
      const recoveredSecret = recover_secret(input);
      const shares = generate_shares(recoveredSecret, input.n, input.k);
      // console.log(JSON.stringify(shares, null, 4));
      axios
        .post("https://hash-effect.onrender.com/sss/verify", shares)
        .then((resp) => resp.data)
        .then((output) => {
          console.log(output);
        })
        .catch((err: AxiosError) => console.error(err.toJSON()));
    })
    .catch((err: AxiosError) => console.error(err.toJSON()));
}

verifyWithAPI();
