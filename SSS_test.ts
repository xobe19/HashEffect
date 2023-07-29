import bigInt from "big-integer";
import axios from "axios";
import { generate_secret } from "./SSS_web";

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

axios
  .get<SSSSharesResponse>("https://hash-effect.onrender.com/sss/shares")
  .then((resp) => resp.data)
  .then((input) => {
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

    const postData: SSSSharesBody = {
      secret: recoveredSecret.toString(),
      shares: input.shares,
      team_message: "You have been Pwned",
    };

    axios
      .post("https://hash-effect.onrender.com/sss/verify", postData)
      .then((resp) => resp.data)
      .then((output) => {
        console.log(output);
      })
      .catch((err) => console.error(err));
  })
  .catch((err) => {
    console.error(err);
  });
