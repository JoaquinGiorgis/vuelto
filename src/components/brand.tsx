import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Vuelto, inicio">
      <Image src="/mark.png" alt="" width={size} height={size} priority className="rounded-[9px]" />
      <span className="text-[17px] font-semibold tracking-tight">vuelto</span>
    </Link>
  );
}
