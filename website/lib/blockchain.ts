import { createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";

// Initialize Thirdweb v5 client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

// Create account from private key
const account = privateKeyToAccount({
  client,
  privateKey: process.env.PRIVATE_KEY!,
});

// Get contract instance
export function getContractInstance() {
  return getContract({
    client,
    chain: sepolia,
    address: process.env.CONTRACT_ADDRESS!,
  });
}

export { client, account };
