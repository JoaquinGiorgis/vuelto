"use client";

import { ArrowRight, Check, Copy, WhatsappLogo, Wallet } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { publicClient } from "@/lib/celo";
import { encodeCharge, formatArs, parseIntent } from "@/lib/charge";
import { connectWallet } from "@/lib/wallet";

export function ChargeComposer() {
  const [text, setText] = useState("Cobrale 18.500 a Martina por el asado");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const intent = useMemo(() => parseIntent(text), [text]);
  const addressInvalid = to.length > 0 && !isAddress(to);

  async function useMyWallet() {
    setError(null);
    try {
      const { account } = await connectWallet();
      setTo(account);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar la wallet.");
    }
  }

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!intent.amount) return setError("Decinos un monto. Por ejemplo: 18.500.");
    if (!isAddress(to)) return setError("Necesitamos una wallet de Celo válida para recibir.");
    setLoading(true);
    try {
      const block = await publicClient.getBlockNumber();
      const code = encodeCharge({
        to,
        amount: intent.amount,
        concept: intent.concept ?? "Cobro",
        payer: intent.payer,
        fromBlock: (block - BigInt(5)).toString(),
      });
      setLink(`${window.location.origin}/c/${code}`);
    } catch {
      setError("No pudimos leer Celo. Probá de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  const shareText = link
    ? `Hola${intent.payer ? ` ${intent.payer}` : ""}, te paso el link para ${intent.concept ?? "el pago"}: $${formatArs(intent.amount)}. ${link}`
    : "";

  return (
    <section className="glass flex min-w-0 flex-col gap-6 rounded-[28px] p-6 sm:p-8">
      <form onSubmit={createLink} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="intent" className="text-sm font-medium">
            ¿Qué tenés que cobrar?
          </label>
          <textarea
            id="intent"
            rows={2}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setLink(null);
            }}
            className="resize-none rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-base outline-none focus:border-accent"
          />
          <dl className="grid grid-cols-3 gap-2 text-sm" aria-live="polite">
            <Field label="Monto" value={intent.amount ? `$${formatArs(intent.amount)}` : "—"} mono />
            <Field label="A quién" value={intent.payer ?? "—"} />
            <Field label="Por" value={intent.concept ?? "—"} />
          </dl>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="to" className="text-sm font-medium">
            Tu wallet para recibir
          </label>
          <div className="flex gap-2">
            <input
              id="to"
              value={to}
              onChange={(e) => {
                setTo(e.target.value.trim());
                setLink(null);
              }}
              placeholder="0x…"
              spellCheck={false}
              aria-invalid={addressInvalid}
              aria-describedby="to-help"
              className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 font-mono text-sm outline-none focus:border-accent aria-[invalid=true]:border-red-400"
            />
            <button
              type="button"
              onClick={useMyWallet}
              className="glass-pill flex shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-medium hover:bg-white active:translate-y-px"
            >
              <Wallet size={18} weight="regular" />
              <span className="hidden sm:inline">Usar la mía</span>
            </button>
          </div>
          <p id="to-help" className={`text-xs ${addressInvalid ? "text-red-600" : "text-muted"}`}>
            {addressInvalid ? "Esa dirección no es válida." : "Ahí llegan los wARS. Funciona con MiniPay o MetaMask."}
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!link && (
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink text-[15px] font-medium text-white hover:bg-zinc-800 active:translate-y-px disabled:opacity-60"
          >
            {loading ? "Creando link…" : "Crear link de cobro"}
            {!loading && <ArrowRight size={18} />}
          </button>
        )}
      </form>

      {link && (
        <div className="flex flex-col gap-3 border-t border-zinc-200/70 pt-6">
          <p className="text-sm font-medium">Listo. Mandá este link:</p>
          <p className="truncate rounded-2xl bg-accent-soft px-4 py-3 font-mono text-xs text-accent">
            {link}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copy}
              className="glass-pill flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-medium hover:bg-white active:translate-y-px"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-medium text-white hover:opacity-90 active:translate-y-px"
            >
              <WhatsappLogo size={18} />
              WhatsApp
            </a>
          </div>
          <a href={link} className="text-center text-sm text-muted underline-offset-4 hover:underline">
            Ver como lo ve quien paga
          </a>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/60 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`truncate ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
