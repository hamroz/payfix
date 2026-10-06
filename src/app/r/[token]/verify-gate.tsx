"use client";

import { AnimatePresence, motion } from "motion/react";
import { MailCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestCustomerCode, verifyCustomerCode } from "@/app/actions/auth";
import { LogoMark, LogoSpinner } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";
import { OtpInput } from "@/components/ui/otp-input";
import { useI18n } from "@/lib/i18n/client";

/**
 * Holding the link isn't enough: links get forwarded and transaction hashes are public.
 * The code goes only to the invoice customer's email on file.
 */
export function VerifyGate({ token, businessName, customerName }: { token: string; businessName: string; customerName: string }) {
  const [sent, setSent] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { m, t, rich } = useI18n();
  const V = m.resolve.verify;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex justify-center">
        <LogoMark size={56} animate />
      </div>
      <div className="glass rounded-3xl p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {!sent ? (
            <motion.div key="ask" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="text-xs uppercase tracking-[0.14em] text-violet">{businessName}</p>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{t(V.greeting, { name: customerName.split(" ")[0] })}</h1>
              <p className="mt-2 text-sm text-fg-2">{t(V.intro, { business: businessName })}</p>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-veil/[0.07] bg-veil/[0.03] p-3.5 text-[13px] text-fg-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" />
                {V.warning}
              </div>
              {error && <p className="mt-3 text-sm text-rose">{error}</p>}
              <Button
                size="lg"
                className="mt-6 w-full"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setError(null);
                    const res = await requestCustomerCode(token);
                    if (!res.ok) return setError(res.error);
                    setSent(res.maskedEmail);
                  })
                }
              >
                {pending ? <LogoSpinner size={20} /> : <MailCheck className="size-4" />} {V.emailMe}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="code" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 className="font-display text-2xl font-semibold tracking-tight">{V.enterCode}</h1>
              <p className="mt-2 text-sm text-fg-2">{rich(V.sentTo, { email: (c) => <span className="text-fg">{c}</span> }, { email: sent })}</p>
              <div className="mt-6">
                <OtpInput
                  value={code}
                  onChange={setCode}
                  error={!!error}
                  disabled={pending}
                  onComplete={(c) =>
                    start(async () => {
                      setError(null);
                      const res = await verifyCustomerCode(token, c);
                      if (!res.ok) {
                        setCode("");
                        return setError(res.error);
                      }
                      router.refresh();
                    })
                  }
                />
              </div>
              <div className="mt-4 h-5 text-sm">{pending ? <span className="inline-flex items-center gap-2 text-fg-2"><LogoSpinner size={16} /> {V.verifying}</span> : error ? <span className="text-rose">{error}</span> : null}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
