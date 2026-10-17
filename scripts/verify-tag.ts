// Confirma que una tx salió con el attribution tag correcto.
// Uso: pnpm verify-tag 0xHASH
import { verifyTx } from "@celo/attribution-tags";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";

const hash = process.argv[2] as `0x${string}`;
if (!hash) throw new Error("Pasá el hash de la tx");

const client = createPublicClient({ chain: celo, transport: http() });
const result = await verifyTx({ client, hash });
console.log(result ? `Tag encontrado: ${result.codes.join(", ")}` : "Esta tx no tiene tag ERC-8021");
