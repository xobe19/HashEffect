import axios from "axios";
import bigInt from "big-integer";
import verify from "./Schnorr_web_fns";

interface Group {
  generator: Generator;
  p: string;
}

interface Generator {
  tag: string;
  data: {
    value: string;
    prime: string;
  };
}
interface PublicKey {
  tag: string;
  data: {
    value: string;
    prime: string;
  };
}

interface GetSignature {
  r: {
    tag: string;
    data: {
      value: string;
      prime: string;
    };
  };
  sigma: Sigma;
}

interface Sigma {
  value: string;
  prime: string;
}

interface GetSchnorrRes {
  group: Group;
  message: string;
  publicKey: PublicKey;
  signature: GetSignature;
  hash: {
    value: string;
    prime: string;
  };
}

interface SchnorrVerificationBody {
  group: Group;
  message: string;
  publicKey: PublicKey;
  signature: GetSignature;
}

function verifyWithAPI() {
  axios
    .get<GetSchnorrRes>("https://hash-effect.onrender.com/schnorr/sign")
    .then((res) => {
      return res.data;
    })
    .then((input) => {
      const P = bigInt(input.group.generator.data.prime, 16);
      const Q = bigInt(input.group.p, 16);
      const g = bigInt(input.group.generator.data.value);
      const y = bigInt(input.publicKey.data.value, 16);
      const s = bigInt(input.signature.sigma.value, 16);
      const r = bigInt(input.signature.r.data.value, 16);

      const hash = bigInt(input.hash.value, 16);
      console.log(P);
      const message = input.message;
      const a = verify(y, s, r, P, g, Q, message, hash);
      console.log(a);

      const postData: SchnorrVerificationBody = {
        group: input.group,
        message: input.message,
        publicKey: input.publicKey,
        signature: input.signature,
      };

      axios
        .post<SchnorrVerificationBody>(
          "https://hash-effect.onrender.com/schnorr/verify",
          postData
        )
        .then((resp) => resp.data)
        .then((output) => console.log(output));
    });
}

verifyWithAPI();
