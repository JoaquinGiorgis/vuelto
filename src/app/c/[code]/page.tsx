import Link from "next/link";
import { Logo } from "@/components/brand";
import { ShaderBackdrop } from "@/components/shader-backdrop";
import { PayPanel } from "@/components/pay-panel";
import { decodeCharge, formatArs, shortAddress } from "@/lib/charge";

export default async function ChargePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const charge = decodeCharge(code);

  if (!charge) {
    return (
      <Shell>
      <div className="glass mx-auto mt-16 flex max-w-md flex-col gap-3 rounded-[28px] p-8">
        <h1 className="text-xl font-semibold tracking-tight">Este link no es válido</h1>
        <p className="text-sm leading-relaxed text-muted">
          Puede que se haya cortado al copiarlo. Pedile a quien te cobra que te lo mande de nuevo.
        </p>
        <Link href="/" className="text-sm font-medium text-forest">
          Crear un cobro propio
        </Link>
      </div>
      </Shell>
    );
  }

  return (
    <Shell>
    <div className="mx-auto flex max-w-md flex-col gap-4 pt-6 md:pt-12">
      <section className="glass flex flex-col gap-6 rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">
            {charge.payer ? `${charge.payer}, te` : "Te"} están cobrando
          </p>
          <p className="font-mono text-5xl font-semibold tracking-tighter">
            ${formatArs(charge.amount)}
          </p>
          <p className="text-base">por {charge.concept}</p>
        </div>

        <dl className="flex flex-col divide-y divide-line border-y border-line text-sm">
          <Row label="Moneda" value="wARS · peso digital de Ripio" />
          <Row label="Red" value="Celo" />
          <Row label="Recibe" value={shortAddress(charge.to)} mono />
        </dl>

        <PayPanel charge={charge} />
      </section>
      <p className="text-center text-xs text-muted">Cobro creado con Vuelto · se liquida en Celo</p>
    </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-[100dvh] px-4 pb-16">
      <div className="fixed inset-0 -z-10">
        <ShaderBackdrop />
      </div>
      <header className="mx-auto flex max-w-md items-center justify-between py-5">
        <Logo />
        <span className="glass-pill rounded-full px-3 py-1 text-xs text-muted">Pago seguro en Celo</span>
      </header>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </div>
  );
}
