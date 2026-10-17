import { NextResponse } from "next/server";
import { isAddress, parseUnits } from "viem";
import { publicClient, transferEvent, WARS, WARS_DECIMALS } from "@/lib/celo";

// El agente: mira Celo mainnet y concilia el cobro con una transferencia real de wARS.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") ?? "";
  const amount = searchParams.get("amount") ?? "";
  const fromBlock = searchParams.get("fromBlock") ?? "";

  if (!isAddress(to) || !amount || !fromBlock) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    const expected = parseUnits(amount, WARS_DECIMALS);
    const logs = await publicClient.getLogs({
      address: WARS,
      event: transferEvent,
      args: { to },
      fromBlock: BigInt(fromBlock),
      toBlock: "latest",
    });
    const match = logs.find((log) => (log.args.value ?? BigInt(0)) >= expected);

    return NextResponse.json(
      match
        ? { status: "paid", txHash: match.transactionHash, from: match.args.from }
        : { status: "pending" },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error leyendo Celo" },
      { status: 502 },
    );
  }
}
