import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand";
import { ChargeComposer } from "@/components/charge-composer";
import { ShaderBackdrop } from "@/components/shader-backdrop";

const steps = [
  {
    n: "01",
    title: "Entiende el pedido",
    body: "Le escribís como a un amigo. Saca monto, a quién y por qué, y arma el cobro en wARS.",
  },
  {
    n: "02",
    title: "Cobra por WhatsApp",
    body: "Un link con el monto en pesos. Se paga desde MiniPay o MetaMask, y si no alcanza, ofrece cargar con Ripio.",
  },
  {
    n: "03",
    title: "Concilia en Celo",
    body: "Lee las transferencias de wARS en mainnet y marca el cobro como pagado. Vos no revisás nada.",
  },
];

const log = [
  ["18:02:11", "intent", "cobrar 18.500 ARS · Martina · el asado"],
  ["18:02:12", "link", "vuelto-celo.vercel.app/c/eyJ0byI6IjB4…"],
  ["18:09:47", "watch", "wARS Transfer → 0x8f3c…21ad"],
  ["18:09:48", "match", "18.500 wARS · bloque 80.356.442"],
  ["18:09:48", "done", "cobro saldado · tag celo_7b3c…"],
];

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <ShaderBackdrop />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper" />
        </div>

        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 text-sm">
            <a href="#como" className="hidden rounded-full px-3 py-1.5 text-muted hover:text-ink sm:block">
              Cómo funciona
            </a>
            <a
              href="https://github.com/JoaquinGiorgis/vuelto"
              className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium"
            >
              <GithubLogo size={16} />
              Código
            </a>
          </nav>
        </header>

        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-12 text-center sm:px-6 md:pt-20">
          <p className="glass-pill mb-6 flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3 text-xs font-medium">
            <span className="rounded-full bg-forest px-2 py-0.5 text-[11px] text-white">Nuevo</span>
            Agente de cobros en pesos sobre Celo
          </p>
          <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-tighter sm:text-6xl">
            Cobrá en pesos.
            <br />
            <span className="text-forest">Vuelto</span> se encarga del resto.
          </h1>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">
            Decile qué tenés que cobrar. Te arma el link, lo mandás por WhatsApp y te avisa cuando la
            plata llegó. En wARS de Ripio, sin pasar por el dólar.
          </p>

          <div className="mt-10 w-full text-left">
            <ChargeComposer />
          </div>
        </div>
      </section>

      <section id="como" className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16">
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Un agente que cobra,
            <br />
            <span className="text-muted">no un formulario.</span>
          </h2>
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {steps.map((s) => (
              <li key={s.n} className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-5">
                <span className="font-mono text-sm text-forest">{s.n}</span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="flex flex-col gap-3 self-center">
          <div className="overflow-hidden rounded-[24px] bg-ink text-[13px] text-white/80 shadow-[0_30px_60px_-30px_rgb(20_32_27/0.5)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="font-medium text-white">Registro del agente</span>
              <span className="flex items-center gap-1.5 text-xs text-sol">
                <span className="size-1.5 rounded-full bg-sol" />
                Celo mainnet
              </span>
            </div>
            <ul className="flex flex-col gap-2.5 px-5 py-5 font-mono">
              {log.map(([time, kind, msg]) => (
                <li key={time + kind} className="grid grid-cols-[4.5rem_3.5rem_1fr] gap-2">
                  <span className="text-white/40">{time}</span>
                  <span className={kind === "done" ? "text-sol" : "text-[#8fc5ad]"}>{kind}</span>
                  <span className="truncate">{msg}</span>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="text-xs text-muted">
            Cada transacción lleva el tag ERC-8021 y el agente tiene identidad ERC-8004.
          </figcaption>
        </figure>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo size={22} />
        <p>Hecho para Agents on Open Rails · Ripio × Celo · 2026</p>
      </footer>
    </>
  );
}
