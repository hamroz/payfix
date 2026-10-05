import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/cn";

/** Always-visible reminder of which network this is and, off mainnet, that the money is test money. */
export async function NetworkPill({ className }: { className?: string }) {
  const { SOLANA_CLUSTER, PAYFIX_TOKEN_LABEL } = env();
  const { m } = await getI18n();
  const sim = SOLANA_CLUSTER === "simulated";
  if (SOLANA_CLUSTER === "mainnet-beta")
    return (
      <span className={cn("inline-flex items-center overflow-hidden whitespace-nowrap rounded-full border border-veil/10 text-[11px] font-medium", className)}>
        <span className="bg-mint/10 px-2.5 py-1 text-mint">{m.app.network.mainnet}</span>
        <span className="bg-veil/[0.04] px-2.5 py-1 text-fg-2">{PAYFIX_TOKEN_LABEL}</span>
      </span>
    );
  return (
    <span className={cn("inline-flex items-center overflow-hidden whitespace-nowrap rounded-full border border-veil/10 text-[11px] font-medium", className)}>
      <span className={cn("px-2.5 py-1", sim ? "bg-amber/10 text-amber" : "bg-violet/10 text-violet")}>
        {sim ? (
          <>
            <span className="sm:hidden">{m.app.network.simulated}</span>
            <span className="hidden sm:inline">{m.app.network.simulatedChain}</span>
          </>
        ) : (
          SOLANA_CLUSTER
        )}
      </span>
      <span className="bg-veil/[0.04] px-2.5 py-1 text-fg-2">
        <span className="hidden sm:inline">{PAYFIX_TOKEN_LABEL} · </span>
        {m.app.network.testMoney}
      </span>
    </span>
  );
}
