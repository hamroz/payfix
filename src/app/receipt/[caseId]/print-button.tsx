"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/client";

export function PrintButton() {
  const { m } = useI18n();
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" /> {m.receipt.saveAsPdf}
    </Button>
  );
}
