"use client";

import { AnimatePresence, motion } from "motion/react";
import { UserPlus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { createCustomerAction } from "@/app/actions/business";
import { Button, Input, Label } from "@/components/ui/primitives";
import { BodyPortal } from "@/components/ui/portal";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n/client";

export function AddCustomer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const { m, t } = useI18n();
  const a = m.customers.add;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" /> {a.button}
      </Button>
      <BodyPortal>
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <motion.form
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                className="glass w-full max-w-sm space-y-4 rounded-3xl bg-ink-850/95 p-6"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    const res = await createCustomerAction({ name, email });
                    if (!res.ok) return setError(res.error);
                    toast.push({ tone: "success", title: t(a.added, { name }) });
                    setOpen(false);
                    setName("");
                    setEmail("");
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                  <button type="button" onClick={() => setOpen(false)} className="text-fg-3 hover:text-fg" aria-label={m.common.close}>
                    <X className="size-5" />
                  </button>
                </div>
                <div>
                  <Label>{a.name}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Robotics" autoFocus />
                </div>
                <div>
                  <Label>{a.email}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ap@acme.com" />
                  <p className="mt-1.5 text-xs text-fg-3">{a.emailHint}</p>
                </div>
                {error && <p className="text-sm text-rose">{error}</p>}
                <Button type="submit" className="w-full" disabled={pending || !name || !email}>
                  {a.submit}
                </Button>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </BodyPortal>
    </>
  );
}
