# Cuentas Claras

Agente de cobros en pesos digitales (wARS de Ripio) sobre Celo mainnet. Track: **Stable Agents: LatAm**.

Escribís "Cobrale 18.500 a Martina por el asado", te da un link para WhatsApp, Martina paga en wARS desde MiniPay o MetaMask y el agente concilia la transferencia en la cadena. Sin dólar en el medio.

## Cómo funciona

```
Crear cobro ──► link /c/<cobro>  (el cobro viaja en el link, sin base de datos)
                     │
Pagador ─── wallet ──► wARS.transfer(to, monto) + tag ERC-8021 en el calldata
                     │
Agente  ─── /api/status ──► lee eventos Transfer de wARS en Celo desde el bloque del cobro
                     └──► "Pago recibido" + link a Celoscan
```

Si al pagador no le alcanza, el agente arma el link de on-ramp de Ripio con el faltante exacto y su wallet.

## Reglas de la hackathon

| Regla | Dónde |
| --- | --- |
| Celo mainnet (42220) | `src/lib/celo.ts` |
| Attribution tag ERC-8021 en cada tx | `withAttribution` en `src/lib/wallet.ts`; `dataSuffix` en `scripts/register-agent.ts` |
| Identidad ERC-8004 | `pnpm register-agent` (Identity Registry `0x8004A169…a432`) |
| Verificar el tag | `pnpm verify-tag <hash>` |

El gas lo paga cada wallet. No hay relayer.

## Correrlo

```bash
pnpm install
cp .env.example .env.local   # poné tu NEXT_PUBLIC_ATTRIBUTION_CODE
pnpm dev
```

## Próximos pasos

- Pasar el parser de intención a un agente eve con LLM y canal de WhatsApp.
- Recordatorios automáticos a quien no pagó (schedule).
- Dividir gastos entre varias personas, en wARS o wBRL.
