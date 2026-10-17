"use client";

import { ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { erc20Abi, explorerTx, publicClient, rampUrl, WARS, WARS_DECIMALS } from "@/lib/celo";
import { formatArs, type Charge } from "@/lib/charge";
import { connectWallet } from "@/lib/wallet";

type Status =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "no-funds"; account: string; balance: number }
  | { kind: "signing" }
  | { kind: "paid"; txHash: string };

export function PayPanel({ charge }: { charge: Charge }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const paid = status.kind === "paid";

  // El agente concilia contra la cadena: sirve aunque paguen desde otra app.
  useEffect(() => {
    if (paid) return;
    const query = new URLSearchParams({
      to: charge.to,
      amount: String(charge.amount),
      fromBlock: charge.fromBlock,
    });
    const check = async () => {
      const res = await fetch(`/api/status?${query}`).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (data?.status === "paid") setStatus({ kind: "paid", txHash: data.txHash });
    };
    check();
    const id = setInterval(check, 4000);
    return () => clearInterval(id);
  }, [charge, paid]);

  async function pay() {
    setError(null);
    setStatus({ kind: "connecting" });
    try {
      const { client, account } = await connectWallet();
      const amount = parseUnits(String(charge.amount), WARS_DECIMALS);
      const balance = await publicClient.readContract({
        address: WARS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      });
      if (balance < amount) {
        return setStatus({
          kind: "no-funds",
          account,
          balance: Number(formatUnits(balance, WARS_DECIMALS)),
        });
      }
      setStatus({ kind: "signing" });
      // withAttribution agrega el tag ERC-8021 al calldata de esta transferencia
      const hash = await client.writeContract({
        account,
        address: WARS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [charge.to, amount],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus({ kind: "paid", txHash: hash });
    } catch (e) {
      setStatus({ kind: "idle" });
      const msg = e instanceof Error ? e.message : "";
      setError(
        /reject|denied/i.test(msg) ? "Cancelaste el pago en la wallet." : msg.split("\n")[0] || "No se pudo pagar.",
      );
    }
  }

  if (status.kind === "paid") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-forest-soft p-5 text-forest" role="status">
        <p className="flex items-center gap-2 text-base font-semibold">
          <CheckCircle size={22} weight="fill" />
          Pago recibido
        </p>
        <p className="text-sm">El agente confirmó la transferencia en Celo. Cuentas claras.</p>
        <a
          href={explorerTx(status.txHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          Ver transacción <ArrowSquareOut size={16} />
        </a>
      </div>
    );
  }

  if (status.kind === "no-funds") {
    const missing = charge.amount - status.balance;
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tenés ${formatArs(status.balance)} en wARS. Te faltan ${formatArs(missing)}.
        </p>
        <a
          href={rampUrl(missing, status.account)}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-medium text-white hover:bg-[#184b3a]"
        >
          Cargar pesos con Ripio <ArrowSquareOut size={18} />
        </a>
        <button onClick={pay} className="text-sm text-muted underline-offset-4 hover:underline">
          Ya cargué, pagar
        </button>
      </div>
    );
  }

  const busy = status.kind === "connecting" || status.kind === "signing";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        onClick={pay}
        disabled={busy}
        className="flex h-12 items-center justify-center rounded-full bg-forest text-[15px] font-medium text-white hover:bg-[#184b3a] active:translate-y-px disabled:opacity-60"
      >
        {status.kind === "connecting" && "Conectando wallet…"}
        {status.kind === "signing" && "Confirmá en tu wallet…"}
        {status.kind === "idle" && `Pagar $${formatArs(charge.amount)}`}
      </button>
      <a
        href={rampUrl(charge.amount)}
        target="_blank"
        rel="noreferrer"
        className="text-center text-sm text-muted underline-offset-4 hover:underline"
      >
        ¿No tenés wARS? Cargalos con Ripio
      </a>
      <p className="flex items-center justify-center gap-2 text-xs text-muted" aria-live="polite">
        <span className="size-1.5 rounded-full bg-forest" />
        El agente está esperando el pago en Celo
      </p>
    </div>
  );
}
