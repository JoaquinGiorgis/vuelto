"use client";

import { ArrowUp, Check, Copy, WhatsappLogo, Wallet } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { publicClient } from "@/lib/celo";
import { encodeCharge, formatArs, parseIntent } from "@/lib/charge";
import { connectWallet } from "@/lib/wallet";

const examples = [
  "Cobrale 18.500 a Martina por el asado",
  "Cobrale 42.300 a Bruno por la expensa de octubre",
  "Cobrale 7.250 a Ailén por las entradas",
];

export function ChargeComposer() {
  const [text, setText] = useState(examples[0]);
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const intent = useMemo(() => parseIntent(text), [text]);
  const addressInvalid = to.length > 0 && !isAddress(to);

  function reset() {
    setLink(null);
    setCopied(false);
    setError(null);
  }

  async function useMyWallet() {
    setError(null);
    try {
      const { account } = await connectWallet();
      setTo(account);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar la wallet.");
    }
  }

  async function createLink(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!intent.amount) return setError("Decime un monto. Por ejemplo: 18.500.");
    if (!isAddress(to)) return setError("Pegá la wallet de Celo donde querés recibir, o conectá la tuya.");
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
      setError("No pude leer Celo. Probá de nuevo en unos segundos.");
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
    <div className="flex flex-col gap-4">
      <form onSubmit={createLink} noValidate className="glass flex flex-col rounded-[28px] p-2">
        <label htmlFor="intent" className="sr-only">
          Qué tenés que cobrar
        </label>
        <textarea
          id="intent"
          rows={2}
          value={text}
          placeholder="Cobrale 18.500 a Martina por el asado"
          onChange={(e) => {
            setText(e.target.value);
            reset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              createLink();
            }
          }}
          className="resize-none bg-transparent px-4 pt-3 text-lg leading-snug outline-none placeholder:text-muted/60"
        />

        <dl className="flex flex-wrap gap-1.5 px-4 pb-3 pt-2 text-xs" aria-live="polite">
          <Token label="Monto" value={intent.amount ? `$${formatArs(intent.amount)}` : null} />
          <Token label="A" value={intent.payer ?? null} />
          <Token label="Por" value={intent.concept ?? null} />
        </dl>

        <div className="flex items-center gap-2 rounded-[22px] bg-white/70 p-1.5">
          <label htmlFor="to" className="sr-only">
            Tu wallet para recibir
          </label>
          <input
            id="to"
            value={to}
            onChange={(e) => {
              setTo(e.target.value.trim());
              reset();
            }}
            placeholder="Tu wallet de Celo · 0x…"
            spellCheck={false}
            aria-invalid={addressInvalid}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-[13px] outline-none placeholder:font-sans placeholder:text-muted aria-[invalid=true]:text-red-600"
          />
          <button
            type="button"
            onClick={useMyWallet}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium hover:border-forest/40 active:translate-y-px"
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">Conectar</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            aria-label="Crear link de cobro"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-white hover:bg-[#184b3a] active:translate-y-px disabled:opacity-50"
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <div className="h-[140px] rounded-[24px] bg-white/50" aria-label="Creando link" />}

      {link && !loading && (
        <div className="glass flex flex-col gap-4 rounded-[24px] p-5" role="status">
          <div className="flex items-start gap-3">
            <img src="/mark.png" alt="" className="size-7 rounded-lg" />
            <p className="pt-0.5 text-[15px] leading-relaxed">
              Listo. Armé un cobro de{" "}
              <span className="font-mono font-medium">${formatArs(intent.amount)}</span> en wARS
              {intent.payer ? ` para ${intent.payer}` : ""}. Te aviso acá cuando llegue.
            </p>
          </div>
          <p className="truncate rounded-xl bg-forest-soft px-3 py-2.5 font-mono text-xs text-forest">{link}</p>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-forest text-sm font-medium text-white hover:bg-[#184b3a] active:translate-y-px"
            >
              <WhatsappLogo size={18} />
              Mandar
            </a>
            <button
              onClick={copy}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-medium hover:border-forest/40 active:translate-y-px"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a href={link} className="flex h-11 items-center px-3 text-sm text-muted hover:text-ink">
              Ver
            </a>
          </div>
        </div>
      )}

      {!link && !loading && (
        <div className="flex flex-wrap justify-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setText(ex);
                reset();
              }}
              className="glass-pill rounded-full px-3 py-1.5 text-[13px] text-muted hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Token({ label, value }: { label: string; value: string | null }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 ${
        value ? "bg-sol-soft text-ink" : "border border-dashed border-line text-muted"
      }`}
    >
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[16ch] truncate font-medium">{value ?? "falta"}</dd>
    </div>
  );
}
