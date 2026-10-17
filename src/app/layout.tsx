import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cuentas Claras",
  description: "Cobrá en pesos digitales (wARS) con un link. Un agente confirma el pago en Celo.",
};

export const viewport: Viewport = { themeColor: "#f6f7f8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="backdrop" aria-hidden />
        <div className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-4 sm:px-6">
          <header className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <span className="grid size-7 place-items-center rounded-lg bg-ink text-[13px] text-white">=</span>
              Cuentas Claras
            </Link>
            <span className="glass-pill rounded-full px-3 py-1 text-xs text-muted">
              Celo mainnet · wARS
            </span>
          </header>
          <main className="flex-1 pb-16">{children}</main>
          <footer className="py-6 text-xs text-muted">
            Cuentas claras conservan la amistad. Liquidación en pesos digitales de Ripio, sin pasar por el dólar.
          </footer>
        </div>
      </body>
    </html>
  );
}
