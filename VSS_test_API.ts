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
  const commitments = input.commitments.map((commitment) =>
    bigInt(commitment.data.value, 16)
  );
  return verify_share(share, commitments, p, g);
}

function verifyWithAPI() {
  axios
    .get<VSSResponse>("https://hash-effect.onrender.com/vss/share")
    .then((resp) => resp.data)
    .then((input) => {
      input = {
        share: {
          index: 1,
          value: {
            value: "69f781c048e88491",
            prime: "6cfb0057f6deb517",
          },
        },
        commitments: [
          {
            tag: "prime",
            data: {
              value: "d60324888291b338",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "755b27bc4ab12b66",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "cbd3d890e3602683",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "d35605f6ea9da890",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "6c8dcdfa4e73df7d",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "9907ceaed3e7f45c",
              prime: "d9f600afedbd6a2f",
            },
          },
          {
            tag: "prime",
            data: {
              value: "70d6baa2338f361b",
              prime: "d9f600afedbd6a2f",
            },
          },
        ],
        group: {
          generator: {
            tag: "prime",
            data: {
              value: "2",
              prime: "d9f600afedbd6a2f",
            },
          },
          p: "6cfb0057f6deb517",
        },
      };
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
