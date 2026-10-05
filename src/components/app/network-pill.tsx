import { env } from "@/lib/env";
import { cn } from "@/lib/cn";

/** Always-visible reminder of which network this is and, off mainnet, that the money is test money. */
export function NetworkPill({ className }: { className?: string }) {
  const { SOLANA_CLUSTER, PAYFIX_TOKEN_LABEL } = env();
  const sim = SOLANA_CLUSTER === "simulated";
  if (SOLANA_CLUSTER === "mainnet-beta")
    return (
      <span className={cn("inline-flex items-center overflow-hidden whitespace-nowrap rounded-full border border-veil/10 text-[11px] font-medium", className)}>
        <span className="bg-mint/10 px-2.5 py-1 text-mint">Mainnet</span>
        <span className="bg-veil/[0.04] px-2.5 py-1 text-fg-2">{PAYFIX_TOKEN_LABEL}</span>
      </span>
    );
  return (
    <span className={cn("inline-flex items-center overflow-hidden whitespace-nowrap rounded-full border border-veil/10 text-[11px] font-medium", className)}>
      <span className={cn("px-2.5 py-1", sim ? "bg-amber/10 text-amber" : "bg-violet/10 text-violet")}>
        {sim ? "Simulated" : SOLANA_CLUSTER}
        <span className="hidden sm:inline">{sim ? " chain" : ""}</span>
      </span>
      <span className="bg-veil/[0.04] px-2.5 py-1 text-fg-2">
        <span className="hidden sm:inline">{PAYFIX_TOKEN_LABEL} · </span>test money
      </span>
    </span>
  );
}
