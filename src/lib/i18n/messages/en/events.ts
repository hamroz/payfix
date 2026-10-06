// Activity-log and notification sentences (one per event type and variant), plus journal memos
// and approval reasons. Placeholders are filled from the event's stored data.
const events = {
  invoice: {
    created: "{number} created for {customer}: {amount}",
    paid: "{number} is paid in full",
    overdue: "{number} is overdue: {remaining} remaining",
  },
  customer: {
    created: "{name} added as a customer ({email})",
    verified: "Customer verified their email and opened the resolution link",
  },
  payment: {
    received: {
      settled: "{customer} paid {amount} toward {number} — invoice settled",
      settledLate: "{customer} paid {amount} toward {number} — invoice settled (late)",
      partial: "{customer} paid {amount} toward {number} — {remaining} remaining",
      partialLate: "{customer} paid {amount} toward {number} — {remaining} remaining (late)",
    },
  },
  transfer: {
    out: "{amount} sent to {address}",
    unmatched: "{amount} arrived from {address} without an invoice reference",
  },
  case: {
    opened: {
      duplicate: "Apparent duplicate: {amount} arrived after {number} was already settled",
      overpayment: "{amount} over the balance of {number} needs resolution",
    },
    assigned: "Payment attributed to {customer}",
    resolved: {
      settled: "Exception resolved: {amount} settled as agreed",
      refunded: "Exception resolved: {amount} refunded",
    },
  },
  link: {
    sent: "Resolution link sent to {email}",
  },
  proposal: {
    submitted: {
      first: "Customer proposed a plan (v{version}): {lines}",
      revised: "Customer revised the plan (v{version}): {changes}",
      unchanged: "Customer revised the plan (v{version}): no changes",
    },
    approved: "Business approved plan v{version} ({shortHash})",
    declined: "Business asked for changes to v{version}: “{note}”",
  },
  approval: {
    invalidated: {
      changed: "Approval of v{previous} no longer applies — {changes}. Execution is blocked until v{version} is approved.",
      resubmitted: "Approval of v{previous} no longer applies — plan resubmitted. Execution is blocked until v{version} is approved.",
    },
  },
  plan: {
    executed: {
      refundReserved: "Allocations recorded. {amount} refund reserved and waiting for the business wallet signature.",
      resolved: "Allocations recorded. Case resolved.",
    },
  },
  refund: {
    submitted: "Business signed the {amount} refund to {destination}",
    confirmed: "Refund of {amount} confirmed on chain. Case resolved.",
    failed: "Refund transaction failed and did not move funds. It can be retried.",
    expired: "The refund transaction expired without landing. No funds moved; it's safe to sign again.",
  },
  credit: {
    applied: "{amount} of customer credit applied to {number}",
  },
  member: {
    added: "{email} joined as {role}",
    roleChanged: "{email} is now {role}",
    removed: "{email} was removed from the team",
  },
  wallet: {
    added: "Receiving wallet added: {label} ({address})",
    activated: "New payments now go to {label} ({address})",
    removed: "Receiving wallet removed: {label} ({address})",
  },

  // Stand-ins when a name is unknown
  fallbacks: {
    customer: "Customer",
    member: "A member",
    invoice: "invoice",
  },

  // One line of a plan ({lines} above), joined with `separator`
  planLines: {
    invoice: "{amount} to {number}",
    credit: "{amount} as credit",
    refund: "{amount} refunded",
    separator: ", ",
  },

  // What changed between two versions of a plan ({changes} above), joined with `separator`
  changes: {
    allocationAdded: "Allocation to {number} added: {amount}",
    allocationRemoved: "Allocation to {number} removed (was {amount})",
    allocationChanged: "Allocation to {number} changed from {from} to {to}",
    creditAdded: "Credit added: {amount}",
    creditRemoved: "Credit removed (was {amount})",
    creditChanged: "Credit changed from {from} to {to}",
    refundAdded: "Refund added: {amount}",
    refundRemoved: "Refund removed (was {amount})",
    refundChanged: "Refund changed from {from} to {to}",
    destinationChanged: "Refund destination changed from {from} to {to}",
    destinationSet: "Refund destination set to {to}",
    destinationRemoved: "Refund destination removed",
    separator: "; ",
  },

  // Ledger journal-entry memos
  memos: {
    received: "Received {amount}",
    applied: "Applied to {number}",
    creditApplied: "Credit applied to {number}",
    refundConfirmed: "Refund of {amount} confirmed",
    plan: "Plan v{version}: {lines}",
  },

  // Why an approval no longer applies
  approvalReasons: {
    superseded: "Superseded by v{version}: {changes}",
    resubmitted: "Superseded by v{version}: plan resubmitted",
    changesRequested: "Business requested changes: {note}",
  },
};

export default events;
