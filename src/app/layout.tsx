import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vuelto · Cobrá en pesos con un link",
  description:
    "Agente de cobros en pesos digitales (wARS de Ripio) sobre Celo. Escribís qué cobrar, mandás un link y el agente confirma el pago en la cadena.",
};

export const viewport: Viewport = { themeColor: "#f5f3ee" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
