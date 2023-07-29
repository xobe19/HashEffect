import axios, { AxiosError } from "axios";
import bigInt, { BigInteger } from "big-integer";
import { VSS, verify_share } from "./VSS_web_fns";

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

function generateCommitments(
  secret: string,
  n: number,
  t: number,
  P: BigInteger,
  Q: BigInteger,
  g: BigInteger
) {
  const { commitments, shared_secrets } = VSS(secret, n, t, P, Q, g);
  const postData: VSSBody = {
    share: {
      index: 1,
      value: {
        value: shared_secrets[0][1].toString(16),
        prime: Q.toString(16),
      },
    },
    commitments: commitments
      .map((commitment) => {
        return {
          tag: "prime",
          data: {
            value: commitment.toString(16),
            prime: P.toString(16),
          },
        };
      })
      .reverse(),
    group: {
      generator: {
        tag: "prime",
        data: {
          value: "2",
          prime: P.toString(16),
        },
      },
      p: Q.toString(16),
    },
    team_message: "You have been Pwned",
  };
  return postData;
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

//verifyWithAPI();

const toSend = generateCommitments(
  "hey",
  10,
  7,
  bigInt("15943542169520389343"),
  bigInt("7971771084760194671"),
  bigInt(2)
);

axios
  .post("https://hash-effect.onrender.com/vss/verify", toSend)
  .then((resp) => resp.data)
  .then((output) => console.log(output))
  .catch((err: AxiosError) => console.log(err.response?.data));
