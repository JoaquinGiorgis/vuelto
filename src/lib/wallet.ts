"use client";

import { withAttribution } from "@celo/attribution-tags";
import { createWalletClient, custom, type EIP1193Provider } from "viem";
import { ATTRIBUTION_CODE, CHAIN } from "./celo";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

// Wallet del navegador (MiniPay, MetaMask, Valora). Cada tx sale con el tag ERC-8021.
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No encontramos una wallet. Abrí este link desde MiniPay o MetaMask.");
  }
  const client = createWalletClient({
    chain: CHAIN,
    transport: custom(window.ethereum),
  }).extend(withAttribution(ATTRIBUTION_CODE));

  const [account] = await client.requestAddresses();
  try {
    await client.switchChain({ id: CHAIN.id });
  } catch {
    await client.addChain({ chain: CHAIN });
  }
  return { client, account };
}
