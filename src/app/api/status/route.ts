import { NextResponse } from "next/server";
import { isAddress, parseUnits } from "viem";
import { publicClient, transferEvent, WARS, WARS_DECIMALS } from "@/lib/celo";

// forno.celo.org acepta como máximo 5.000 bloques por eth_getLogs (~83 min en Celo).
const CHUNK = BigInt(5000);
const MAX_CHUNKS = 10;

// El agente: mira Celo mainnet y concilia el cobro con una transferencia real de wARS.
// Escanea hasta 50.000 bloques por llamada y devuelve `scannedTo` para que el cliente siga desde ahí.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") ?? "";
  const amount = searchParams.get("amount") ?? "";
  const fromBlock = searchParams.get("fromBlock") ?? "";

  if (!isAddress(to) || !amount || !/^\d+$/.test(fromBlock)) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    const expected = parseUnits(amount, WARS_DECIMALS);
    const head = await publicClient.getBlockNumber();
    const start = BigInt(fromBlock);
    if (start > head) return NextResponse.json({ status: "pending", scannedTo: head.toString() });

    const ranges: [bigint, bigint][] = [];
    for (let from = start; from <= head && ranges.length < MAX_CHUNKS; from += CHUNK) {
      const end = from + CHUNK - BigInt(1);
      ranges.push([from, end < head ? end : head]);
    }

    const results = await Promise.all(
      ranges.map(([from, end]) =>
        publicClient.getLogs({ address: WARS, event: transferEvent, args: { to }, fromBlock: from, toBlock: end }),
      ),
    );
    const match = results.flat().find((log) => (log.args.value ?? BigInt(0)) >= expected);
    const scannedTo = ranges[ranges.length - 1][1].toString();

    return NextResponse.json(
      match
        ? { status: "paid", txHash: match.transactionHash, from: match.args.from, scannedTo }
        : { status: "pending", scannedTo },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message.split("\n")[0] : "Error leyendo Celo" },
      { status: 502 },
    );
  }
}
