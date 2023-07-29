import axios, { AxiosError } from "axios";
import bigInt, { BigInteger } from "big-integer";
import { verify_share } from "./VSS_web_fns";

interface Share {
  index: number;
  value: {
    value: string;
    prime: string;
  };
}

interface Commitment {
  tag: string;
  data: {
    value: string;
    prime: string;
  };
}

interface Generator {
  tag: string;
  data: {
    value: string;
    prime: string;
  };
}

interface Group {
  generator: Generator;
  p: string;
}

interface VSSResponse {
  share: Share;
  commitments: Commitment[];
  group: Group;
}

interface VSSBody {
  share: Share;
  commitments: Commitment[];
  group: Group;
  team_message: string;
}

function verifyShare(input: VSSResponse) {
  const p = bigInt(input.group.generator.data.prime, 16);
  const q = bigInt(input.group.p, 16);
  const g = bigInt(input.group.generator.data.value);

  const share = [
    bigInt(input.share.index),
    bigInt(input.share.value.value, 16),
  ];
  const commitments = input.commitments
    .map((commitment) => bigInt(commitment.data.value, 16))
    .reverse();
  return verify_share(share, commitments, p, q, g);
}

function verifyWithAPI() {
  axios
    .get<VSSResponse>("http://hash-effect.onrender.com/vss/share/invalid")
    .then((resp) => resp.data)
    .then((input) => {
      const result = verifyShare(input);
      console.log(result);
      const postData: VSSBody = {
        commitments: input.commitments,
        group: input.group,
        share: input.share,
        team_message: "You have been Pwned",
      };

      axios
        .post("https://hash-effect.onrender.com/vss/verify", postData)
        .then((resp) => resp.data)
        .then((output) => {
          console.log(output);
        })
        .catch((err: AxiosError) => console.error(err.response?.data));
    })
    .catch((err: AxiosError) => console.error(err.toJSON()));
}

verifyWithAPI();
