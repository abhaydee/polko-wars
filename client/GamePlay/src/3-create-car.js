import { connectSdk } from "./utils/connect-sdk.js";

// node ./src/create-token.js {collectionId} {address} {nickname} {image}
// i.e. node ./src/create-token.js 3131 5HRADyd2sEVtpqh3cCdTdvfshMV7oK4xXJyM48i4r9S3TNGH Speedy777 https://example.com/image.png
const createToken = async () => {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("run this command: node ./src/create-token.js {collectionId} {address} {nickname} {image}");
    process.exit(1);
  }

  const [collectionId, owner, nickname, tokenImage] = args;

  const { account, sdk } = await connectSdk();

  const tokenTx = await sdk.token.createV2({
    collectionId,
    image: tokenImage,
    owner,
    attributes: [
      {
        trait_type: "Nickname",
        value: nickname,
      },
      {
        trait_type: "Victories",
        value: 0,
      },
      {
        trait_type: "Defeats",
        value: 0,
      },
      {
        trait_type: "Coins",
        value: 0,
      },
      {
        trait_type: "BestLap",
        value: 0,
      }
    ],
  });

  const token = tokenTx.parsed;
  if (!token) throw Error("Cannot parse token");

  console.log(`Explore your NFT: https://uniquescan.io/opal/tokens/${token.collectionId}/${token.tokenId}`);
 
  process.exit(0);
}

createToken().catch(e => {
  console.log('Something wrong during token creation');
  throw e;
});
