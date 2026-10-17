// Registra la identidad ERC-8004 del agente en Celo mainnet, desde la wallet del agente.
// Uso: AGENT_PRIVATE_KEY=0x... APP_URL=https://tu-app.vercel.app pnpm register-agent
import { toDataSuffix } from "@celo/attribution-tags";
import { createPublicClient, createWalletClient, http, parseAbi, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const abi = parseAbi([
  "function register(string agentURI) returns (uint256 agentId)",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);

const pk = process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined;
const appUrl = process.env.APP_URL ?? "https://vuelto.vercel.app";
const code = process.env.NEXT_PUBLIC_ATTRIBUTION_CODE ?? "celo_test1234";
if (!pk) throw new Error("Falta AGENT_PRIVATE_KEY");

const account = privateKeyToAccount(pk);

const registration = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name: "Vuelto",
  description:
    "Agente de cobros en pesos digitales (wARS de Ripio) sobre Celo. Genera links de cobro y concilia el pago onchain.",
  image: `${appUrl}/mark.png`,
  services: [{ name: "web", endpoint: appUrl }],
  x402Support: false,
  active: true,
  supportedTrust: ["reputation"],
};
const agentURI = `data:application/json;base64,${Buffer.from(JSON.stringify(registration)).toString("base64")}`;

const publicClient = createPublicClient({ chain: celo, transport: http() });
const wallet = createWalletClient({ account, chain: celo, transport: http() });

const { request } = await publicClient.simulateContract({
  account,
  address: IDENTITY_REGISTRY,
  abi,
  functionName: "register",
  args: [agentURI],
});
// El attribution tag también va en esta tx
const hash = await wallet.writeContract({ ...request, dataSuffix: toDataSuffix(code) });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
const [registered] = parseEventLogs({ abi, eventName: "Registered", logs: receipt.logs });

console.log("Agente:", account.address);
console.log("agentId:", registered?.args.agentId?.toString());
console.log("tx:", `https://celoscan.io/tx/${hash}`);
console.log("Explorer:", "https://8004scan.io");
