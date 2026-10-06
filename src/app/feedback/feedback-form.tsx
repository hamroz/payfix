"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, ButtonLink, Card, Input, Label, Textarea } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import type { FeedbackAnswers, FeedbackCompleted, FeedbackDevice } from "@/lib/db/schema";

const ANSWERS = ["happened", "hesitated", "voidedApproval", "currentProcess", "receiptTrust", "blockers"] as const satisfies readonly (keyof FeedbackAnswers)[];

/** A row of choice pills that behaves as a radio group. */
function Choice<T extends string | number>({ label, options, value, onChange, cols }: { label: string; options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void; cols?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-1.5", cols)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-10 rounded-xl border px-3 text-sm transition",
            value === o.value ? "border-violet/60 bg-violet/15 font-medium text-fg" : "border-veil/10 bg-veil/[0.03] text-fg-2 hover:border-veil/20 hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Question({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: React.ReactNode; required?: boolean }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[15px] font-medium text-fg">
        {label}
        {required && <span className="text-violet"> *</span>}
      </legend>
      {children}
      {hint}
    </fieldset>
  );
}

export function FeedbackForm({ cohort, signedInEmail }: { cohort: string | null; signedInEmail: string | null }) {
  const { m, t } = useI18n();
  const f = m.feedback;
  const [completed, setCompleted] = useState<FeedbackCompleted | null>(null);
  const [minutes, setMinutes] = useState("");
  const [ease, setEase] = useState<number | null>(null);
  const [nps, setNps] = useState<number | null>(null);
  const [answers, setAnswers] = useState<FeedbackAnswers>({});
  const [about, setAbout] = useState("");
  const [device, setDevice] = useState<FeedbackDevice | null>(null);
  const [quoteOk, setQuoteOk] = useState(false);
  const [attachAccount, setAttachAccount] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const submit = () => {
    if (!completed || ease === null || nps === null) return setError(f.required);
    start(async () => {
      setError(null);
      const res = await submitFeedbackAction({
        completed,
        minutes: minutes === "" ? null : Number(minutes),
        ease,
        nps,
        answers,
        about,
        device,
        quoteOk,
        attachAccount,
        cohort,
        website,
      });
      if (!res.ok) return setError(res.error);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 text-center">
            <CheckCircle2 className="mx-auto size-10 text-mint" />
            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">{f.thanks.title}</h1>
            <p className="mt-2 text-sm text-fg-2">{f.thanks.body}</p>
            <ButtonLink href="/" variant="secondary" className="mt-6">
              {f.thanks.back}
            </ButtonLink>
          </Card>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0, y: -10 }}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-5"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{f.title}</h1>
            <p className="mt-2 text-[15px] text-fg-2">{f.intro}</p>
            <p className="mt-1 text-sm text-fg-3">{f.anonymous}</p>
          </div>

          <Card className="space-y-7 p-5 sm:p-6">
            <Question label={f.completed.label} required>
              <Choice
                label={f.completed.label}
                cols="grid-cols-1 sm:grid-cols-3"
                value={completed}
                onChange={setCompleted}
                options={(["unaided", "aided", "no"] as const).map((v) => ({ value: v, label: f.completed[v] }))}
              />
            </Question>

            <Question label={f.minutes.label}>
              <div className="flex items-center gap-2.5">
                <Input type="number" inputMode="numeric" min={0} max={240} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-28 tabular" aria-label={f.minutes.label} />
                <span className="text-sm text-fg-3">{f.minutes.suffix}</span>
              </div>
            </Question>

            <Question
              required
              label={f.ease.label}
              hint={
                <div className="flex justify-between text-xs text-fg-3">
                  <span>{f.ease.low}</span>
                  <span>{f.ease.high}</span>
                </div>
              }
            >
              <Choice label={f.ease.label} cols="grid-cols-5" value={ease} onChange={setEase} options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))} />
            </Question>

            <Question
              required
              label={f.nps.label}
              hint={
                <div className="flex justify-between text-xs text-fg-3">
                  <span>{f.nps.low}</span>
                  <span>{f.nps.high}</span>
                </div>
              }
            >
              <Choice label={f.nps.label} cols="grid-cols-6 sm:grid-cols-11" value={nps} onChange={setNps} options={Array.from({ length: 11 }, (_, v) => ({ value: v, label: String(v) }))} />
            </Question>
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">{f.openTitle}</h2>
            {ANSWERS.map((k) => (
              <div key={k}>
                <Label htmlFor={`q-${k}`} className="text-sm text-fg">
                  {f.questions[k]}
                </Label>
                <Textarea id={`q-${k}`} rows={3} maxLength={2000} value={answers[k] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [k]: e.target.value }))} />
              </div>
            ))}
          </Card>

          <Card className="space-y-5 p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">{f.aboutTitle}</h2>
            <div>
              <Label htmlFor="about">{f.about.label}</Label>
              <Input id="about" maxLength={200} value={about} onChange={(e) => setAbout(e.target.value)} placeholder={f.about.placeholder} />
            </div>
            <Question label={f.device.label}>
              <Choice
                label={f.device.label}
                cols="grid-cols-3"
                value={device}
                onChange={setDevice}
                options={(["phone", "tablet", "computer"] as const).map((v) => ({ value: v, label: f.device[v] }))}
              />
            </Question>
            <label className="flex items-start gap-3 text-sm text-fg-2">
              <input type="checkbox" checked={quoteOk} onChange={(e) => setQuoteOk(e.target.checked)} className="mt-0.5 size-4 accent-violet" />
              {f.quoteOk}
            </label>
            {signedInEmail && (
              <label className="flex items-start gap-3 text-sm text-fg-2">
                <input type="checkbox" checked={attachAccount} onChange={(e) => setAttachAccount(e.target.checked)} className="mt-0.5 size-4 accent-violet" />
                {t(f.attach, { email: signedInEmail })}
              </label>
            )}
            {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" />
          </Card>

          {error && <p className="text-sm text-rose">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <LogoSpinner size={20} /> {f.sending}
              </>
            ) : (
              <>
                <Send className="size-4" /> {f.submit}
              </>
            )}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
