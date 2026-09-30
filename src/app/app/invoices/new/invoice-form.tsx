"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCustomerAction, createInvoiceAction } from "@/app/actions/business";
import { LogoSpinner } from "@/components/brand/logo";
import { Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

type Customer = { id: string; name: string; email: string };

export function InvoiceForm({ customers }: { customers: Customer[] }) {
  const [list, setList] = useState(customers);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(() => new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));
  const [adding, setAdding] = useState(customers.length === 0);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const addCustomer = () =>
    start(async () => {
      setError(null);
      const res = await createCustomerAction({ name: newName, email: newEmail });
      if (!res.ok) return setError(res.error);
      const c = { id: res.id, name: newName.trim(), email: newEmail.trim().toLowerCase() };
      setList((l) => [...l, c]);
      setCustomerId(c.id);
      setAdding(false);
      setNewName("");
      setNewEmail("");
    });

  const submit = () =>
    start(async () => {
      setError(null);
      const res = await createInvoiceAction({ customerId, title, amount, dueDate: due });
      if (!res.ok) return setError(res.error);
      toast.push({ tone: "success", title: `${res.number} created`, body: "Share its payment link with your customer." });
      router.push(`/app/invoices/${res.id}`);
    });

  return (
    <Card className="p-5 sm:p-6">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <Label>Customer</Label>
            {!adding && (
              <button onClick={() => setAdding(true)} className="mb-1.5 inline-flex items-center gap-1 text-xs text-violet hover:underline">
                <Plus className="size-3.5" /> New customer
              </button>
            )}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {adding ? (
              <motion.div key="add" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
                <Input placeholder="Company or person" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="billing@company.com" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <div className="flex gap-2">
                  {list.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={addCustomer} disabled={pending || !newName || !newEmail}>
                    <UserPlus className="size-4" /> Add customer
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {list.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.email}
                    </option>
                  ))}
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <Label htmlFor="title">What’s it for</Label>
          <Input id="title" placeholder="Brand refresh — phase 2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Amount (USD stablecoin)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3">$</span>
              <Input id="amount" inputMode="decimal" placeholder="1,000" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="pl-7 font-display font-semibold tabular" />
            </div>
          </div>
          <div>
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-rose">{error}</p>}
        <Button size="lg" className="w-full" onClick={submit} disabled={pending || adding || !customerId || !title || !amount}>
          {pending ? <LogoSpinner size={20} /> : "Create invoice"}
        </Button>
      </div>
    </Card>
  );
}
