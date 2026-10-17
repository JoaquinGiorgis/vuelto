import { ChargeComposer } from "@/components/charge-composer";

export default function Home() {
  return (
    <div className="grid gap-10 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-14 md:pt-16">
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
          Cobrá en pesos con un link.
          <span className="block text-muted">El agente avisa cuando llegó.</span>
        </h1>
        <p className="max-w-[46ch] text-base leading-relaxed text-muted">
          Escribí lo que tenés que cobrar como se lo dirías a un amigo. Te damos un link para
          mandar por WhatsApp. Se paga en wARS sobre Celo y el agente concilia la transferencia
          en la cadena, sin que tengas que revisar nada.
        </p>
        <ol className="flex flex-col divide-y divide-zinc-200/70 border-y border-zinc-200/70 text-sm">
          {[
            ["Escribís", "“Cobrale 18.500 a Martina por el asado”"],
            ["Compartís", "Un link con el monto en pesos, listo para pagar"],
            ["Se liquida", "wARS directo a tu wallet, confirmado en segundos"],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4 py-3">
              <span className="font-mono text-muted">0{i + 1}</span>
              <span>
                <span className="font-medium">{title}.</span>{" "}
                <span className="text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <ChargeComposer />
    </div>
  );
}
