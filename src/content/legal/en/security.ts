import type { LegalDoc } from "../types";

const security: LegalDoc = {
  title: "Security",
  description: "How PayFix protects payments, approvals, refunds, and accounts, and how to report a vulnerability.",
  updated: "2026-10-05",
  intro: [
    "PayFix handles the moment when a payment goes wrong, so it is built to make every step checkable. This page explains how PayFix protects payments, approvals, refunds, and accounts, and how to report a security problem to us.",
    "PayFix is a hackathon prototype that runs on test networks with test tokens only. It has not had an independent security audit. Do not use it for real funds.",
  ],
  sections: [
    {
      id: "payments",
      heading: "Payments are verified and counted once",
      blocks: [
        {
          list: [
            "PayFix checks every incoming transfer on the blockchain itself: the token, the receiving account, the amount, and that the transaction is confirmed. The amount comes from the account balances before and after the transaction, and failed transactions are ignored.",
            "Each transaction signature is recorded once, in the same database transaction that counts the payment. Syncing again, retrying, or restarting the server cannot count the same payment twice.",
            "A transfer without a payment reference is never matched to an invoice automatically. It stays unmatched until the business assigns it and the customer confirms the plan.",
          ],
        },
      ],
    },
    {
      id: "ledger",
      heading: "A balanced ledger",
      blocks: [
        "Every amount is recorded in a double-entry ledger, in exact whole token units with no rounding. Every ledger entry balances to zero and has a unique key, so processing the same event twice has no effect. At any time, the total received equals the amounts applied to invoices, kept as credit, refunded, waiting to be refunded, and not yet resolved.",
      ],
    },
    {
      id: "approvals",
      heading: "Approvals are bound to the exact plan",
      blocks: [
        {
          list: [
            "Each version of a resolution plan is fixed once it is submitted. Any change creates a new version.",
            "An approval covers a SHA-256 hash of the plan: the case, the version, the amount available, every allocation, and the refund destination. If any of these changes, the earlier approval no longer counts.",
            "Before a plan runs, PayFix checks the hash, the current version, the amount still available, and the balance left on each invoice.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Refunds are prepared, checked, and sent once",
      blocks: [
        {
          list: [
            "The customer proves that they control the refund wallet by signing a message with it. This also catches typing mistakes and addresses the customer cannot sign from.",
            "PayFix prepares the exact refund transaction, and the business signs it in its own wallet. PayFix then checks that the signed transaction matches what it prepared.",
            "PayFix records the transaction signature before it sends the transaction to the network.",
            "Only one refund attempt can be in progress at a time; the database enforces this. A new attempt is allowed only after the previous one has expired without reaching the blockchain, or has failed.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Wallets and keys",
      blocks: [
        {
          list: [
            "A business can add a receiving wallet only by signing a message with it, so a mistyped address cannot receive customer payments.",
            "PayFix never asks for a wallet’s private key or recovery phrase.",
            "In demo mode, the demo wallets are test keys that the server holds, encrypted, so that the demo works without a wallet app. Never send real funds to them.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      heading: "Accounts and access",
      blocks: [
        {
          list: [
            "You sign in with a 6-digit code sent to your email. A code is valid for 10 minutes, can be used once, and allows at most 5 attempts. We store only a keyed hash of it.",
            "Session tokens are random, stored on our server only as a hash, and expire after 7 days. They are kept in cookies that scripts cannot read, and that are sent only over encrypted connections on secure sites.",
            "Resolution links contain a random token that we store only as a hash. A link expires after 7 days, and the business can replace or revoke it.",
            "A customer can act only on the case that their own link belongs to. This is checked again on every action.",
            "Team roles (owner, editor, viewer) are checked on the server for every change, and important actions are recorded in the company’s activity log.",
          ],
        },
      ],
    },
    {
      id: "abuse",
      heading: "Rate limits",
      blocks: [
        "PayFix limits how many sign-in codes can be sent to one email address (5 every 15 minutes and 20 a day) and how many can be requested from one network (30 an hour). The test-token faucet has limits per wallet, per network, and overall. These limits are stored with hashed identifiers, not with email addresses or IP addresses in plain text.",
      ],
    },
    {
      id: "web",
      heading: "Web protections",
      blocks: [
        {
          list: [
            "Strict Transport Security tells browsers to use only encrypted (HTTPS) connections.",
            "Other websites cannot show PayFix pages inside a frame, which protects payment and approval screens from clickjacking.",
            "Browsers are told not to guess file types, and to send only limited referrer information to other sites.",
            "Access to the camera, microphone, and location is turned off.",
            "Secrets such as email and database keys stay on the server and are never sent to the browser.",
          ],
        },
      ],
    },
    {
      id: "on-chain-privacy",
      heading: "Private details stay off the blockchain",
      blocks: [
        "Only a random reference key and a refund number are written to the blockchain. Names, email addresses, and invoice details stay in the PayFix database.",
      ],
    },
    {
      id: "limits",
      heading: "Known limits",
      blocks: [
        "PayFix can only see payments to the business’s receiving wallets and refunds it prepares itself. It cannot see or prevent refunds sent directly from a wallet outside the app.",
      ],
    },
    {
      id: "staying-safe",
      heading: "How you can stay safe",
      blocks: [
        {
          list: [
            "Keep your email account secure, because sign-in codes are sent there.",
            "Check the website address before you enter a code or sign anything.",
            "Read every transaction in your wallet before you sign it.",
            "Never share your private key or recovery phrase. PayFix will never ask for it.",
            "Sign out on shared devices.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      heading: "Reporting a vulnerability",
      blocks: [
        "If you believe you have found a security problem in PayFix, please tell us privately. {contact}",
        "Please include a description of the problem, the steps to reproduce it, the affected page or feature, and the impact you expect.",
        "When you research security problems, please:",
        {
          list: [
            "use only your own accounts and test data;",
            "do not access, change, or delete data that belongs to other people, and stop as soon as you see such data;",
            "do not run denial-of-service attacks, send spam, or use social engineering;",
            "do not use the test-token faucet or demo wallets beyond what you need to show the problem;",
            "give us reasonable time to fix the problem before you share details publicly.",
          ],
        },
        "In return, we will confirm that we received your report, keep you informed about our progress, and credit you if you wish. We will not take legal action against research done in good faith that follows these rules. We do not offer paid rewards.",
        "Problems in services we do not control, such as the Solana network, wallet apps, or our hosting and email providers, should be reported to those providers.",
      ],
    },
  ],
};

export default security;
