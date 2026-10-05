import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  CalendarClock,
  CircleCheckBig,
  FilePlus2,
  Link2,
  MessageSquareText,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type EventIcon = { icon: LucideIcon; tone: string };

/** Icon and tint for each activity-log event type, shared by the activity feed and notifications. */
const icons: Record<string, EventIcon> = {
  "payment.received": { icon: ArrowDownLeft, tone: "text-mint bg-mint/10" },
  "transfer.out": { icon: ArrowUpRight, tone: "text-cyan bg-cyan/10" },
  "transfer.unmatched": { icon: TriangleAlert, tone: "text-amber bg-amber/10" },
  "case.opened": { icon: TriangleAlert, tone: "text-amber bg-amber/10" },
  "case.assigned": { icon: UserCheck, tone: "text-violet bg-violet/10" },
  "case.resolved": { icon: CircleCheckBig, tone: "text-mint bg-mint/10" },
  "invoice.created": { icon: FilePlus2, tone: "text-fg-2 bg-veil/[0.06]" },
  "invoice.paid": { icon: CircleCheckBig, tone: "text-mint bg-mint/10" },
  "invoice.overdue": { icon: CalendarClock, tone: "text-amber bg-amber/10" },
  "credit.applied": { icon: BadgeCheck, tone: "text-indigo bg-indigo/15" },
  "customer.created": { icon: UserPlus, tone: "text-fg-2 bg-veil/[0.06]" },
  "customer.verified": { icon: ShieldCheck, tone: "text-violet bg-violet/10" },
  "link.sent": { icon: Link2, tone: "text-violet bg-violet/10" },
  "proposal.submitted": { icon: MessageSquareText, tone: "text-violet bg-violet/10" },
  "proposal.declined": { icon: MessageSquareText, tone: "text-amber bg-amber/10" },
  "proposal.approved": { icon: BadgeCheck, tone: "text-indigo bg-indigo/15" },
  "approval.invalidated": { icon: Ban, tone: "text-rose bg-rose/10" },
  "plan.executed": { icon: PlayCircle, tone: "text-indigo bg-indigo/15" },
  "refund.submitted": { icon: ArrowUpRight, tone: "text-cyan bg-cyan/10" },
  "refund.confirmed": { icon: CircleCheckBig, tone: "text-mint bg-mint/10" },
  "refund.failed": { icon: Ban, tone: "text-rose bg-rose/10" },
  "refund.expired": { icon: RotateCcw, tone: "text-amber bg-amber/10" },
  "member.added": { icon: Users, tone: "text-violet bg-violet/10" },
  "member.role_changed": { icon: Users, tone: "text-violet bg-violet/10" },
  "member.removed": { icon: UserMinus, tone: "text-rose bg-rose/10" },
  "wallet.added": { icon: Wallet, tone: "text-cyan bg-cyan/10" },
  "wallet.activated": { icon: Wallet, tone: "text-cyan bg-cyan/10" },
  "wallet.removed": { icon: Wallet, tone: "text-rose bg-rose/10" },
};

const fallback: EventIcon = { icon: PlayCircle, tone: "text-fg-2 bg-veil/[0.06]" };

export const eventIcon = (type: string): EventIcon => icons[type] ?? fallback;
