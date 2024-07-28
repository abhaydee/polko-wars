

const getConfig = () => {
  const MNEMONIC = "pool later morning tag mixed nominee diamond unaware exhibit coconut parrot stuff";
  console.log("mnemonic", MNEMONIC)
  if (!MNEMONIC)
    throw Error("Create .env from .env-example and set MNEMONIC env");

  return {
    mnemonic: MNEMONIC,
  }
}

export const config = getConfig();