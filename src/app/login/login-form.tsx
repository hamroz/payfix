"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { requestBusinessCode, verifyBusinessCode } from "@/app/actions/auth";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Input, Label } from "@/components/ui/primitives";
import { OtpInput } from "@/components/ui/otp-input";
import { useI18n } from "@/lib/i18n/client";

export function LoginForm({ defaultEmail, demo }: { defaultEmail: string; demo: boolean }) {
  const { m, rich } = useI18n();
  const a = m.auth;
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(defaultEmail);
  const [masked, setMasked] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const sendCode = () =>
    start(async () => {
      setError(null);
      const res = await requestBusinessCode(email);
      if (!res.ok) return setError(res.error);
      setMasked(res.maskedEmail);
      setStep("code");
    });

  const verify = (c: string) =>
    start(async () => {
      setError(null);
      const res = await verifyBusinessCode(email, c);
      if (res && !res.ok) {
        setError(res.error);
        setCode("");
      }
    });

  return (
    <div className="glass w-full max-w-[400px] overflow-hidden rounded-3xl p-6 sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {step === "email" ? (
          <motion.form
            key="email"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
          >
            <h1 className="font-display text-2xl font-semibold tracking-tight">{a.email.title}</h1>
            <p className="mt-1.5 text-sm text-fg-2">{a.email.subtitle}</p>
            <div className="mt-6">
              <Label htmlFor="email">{a.email.label}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder={a.email.placeholder} />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-rose">{error}</p>}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || !email}>
              {pending ? <LogoSpinner size={20} /> : <>{m.common.continue} <ArrowRight className="size-4" /></>}
            </Button>
            {demo && (
              <p className="mt-5 rounded-xl border border-violet/20 bg-violet/[0.07] px-3.5 py-2.5 text-[13px] text-fg-2">
                {rich(a.email.demo, { b: (c) => <span className="font-medium text-violet">{c}</span> })}
              </p>
            )}
          </motion.form>
        ) : (
          <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <button onClick={() => setStep("email")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
              <ArrowLeft className="size-4" /> {m.common.back}
            </button>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{a.code.title}</h1>
            <p className="mt-1.5 text-sm text-fg-2">{rich(a.code.sent, { email: (c) => <span className="text-fg">{c}</span> }, { email: masked })}</p>
            <div className="mt-6">
              <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={pending} error={!!error} />
            </div>
            <div className="mt-4 flex h-6 items-center justify-between text-sm">
              {pending ? (
                <span className="inline-flex items-center gap-2 text-fg-2">
                  <LogoSpinner size={18} /> {a.code.verifying}
                </span>
              ) : error ? (
                <span className="text-rose">{error}</span>
              ) : (
                <span />
              )}
              <button onClick={sendCode} disabled={pending} className="text-fg-3 hover:text-fg">
                {a.code.resend}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
