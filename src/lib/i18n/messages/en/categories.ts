// Notification categories (see src/lib/domain/notifications.ts). Keys match `CategoryId`.
const categories = {
  payments: { label: "Payments", description: "Incoming payments, transfers without a reference, and money leaving your wallet." },
  exceptions: { label: "Exceptions", description: "Overpayments and duplicates that need a decision, and when they're resolved." },
  resolutions: { label: "Resolutions", description: "Resolution links, customer proposals, approvals, and executed plans." },
  refunds: { label: "Refunds", description: "Refunds signed, confirmed on chain, failed, or expired." },
  invoices: { label: "Invoices", description: "New invoices, invoices paid in full or overdue, and credit applied." },
  customers: { label: "Customers", description: "New customers added to this company." },
  team: { label: "Team and wallets", description: "People joining, changing role, or leaving, and receiving wallet changes." },
};

export default categories;
