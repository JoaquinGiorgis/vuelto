import { toDataSuffix } from "@celo/attribution-tags";
import { createPublicClient, http, parseAbi, parseAbiItem } from "viem";
import { celo } from "viem/chains";

export const CHAIN = celo; // mainnet, chain id 42220

// Ripio wARS: misma dirección en todas las EVM, 18 decimales
export const WARS = "0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d" as const;
export const WARS_DECIMALS = 18;

export const erc20Abi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]);

export const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

// Código ERC-8021 que da Loops House al inscribirse. Sin él no se acredita nada.
export const ATTRIBUTION_CODE =
  process.env.NEXT_PUBLIC_ATTRIBUTION_CODE ?? "celo_1e923cd4c9ff"; // = codeFromRepo("JoaquinGiorgis/vuelto")

export const attributionSuffix = toDataSuffix(ATTRIBUTION_CODE);

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.NEXT_PUBLIC_CELO_RPC ?? "https://forno.celo.org"),
});

export const explorerTx = (hash: string) => `https://celoscan.io/tx/${hash}`;

export function rampUrl(amountArs: number, address?: string) {
  const params = new URLSearchParams({
    country: "AR",
    chain: "42220",
    token: "WARS",
    amount: String(Math.ceil(amountArs)),
  });
  if (address) params.set("address", address);
  return `https://ramp.ripio.com/?${params}`;
}
