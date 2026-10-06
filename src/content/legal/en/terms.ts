import type { LegalDoc } from "../types";

const terms: LegalDoc = {
  title: "Terms of Use",
  description: "The rules for using PayFix: a test-only prototype, not a financial service, provided without warranty.",
  updated: "2026-10-06",
  intro: [
    "These terms apply when you use the PayFix service, whether as a business, a team member, or a customer who received a resolution link. In these terms, “we” and “us” mean the operator of this PayFix service, and “you” means the person using it. By using PayFix, you agree to these terms. If you do not agree, do not use the service.",
  ],
  sections: [
    {
      id: "about",
      heading: "What PayFix is",
      blocks: [
        "PayFix is software that helps a business and its customer agree on what happens to a stablecoin payment that does not match an invoice, for example an overpayment or a duplicate payment. It matches payments to invoices, lets both sides agree on a plan, and records the result.",
        "PayFix is a hackathon prototype. It is still being developed, it may contain errors, and it may change or stop at any time.",
      ],
    },
    {
      id: "test-only",
      heading: "Test use only",
      blocks: [
        "PayFix runs on the Solana devnet test network or on a simulated chain. It works only with test tokens, which have no monetary value and cannot be exchanged for money.",
        {
          list: [
            "Do not send real funds, such as USDC on the Solana main network, to any wallet address shown by PayFix, including the demo wallets.",
            "Do not use PayFix to handle real customer payments or real business records.",
            "Demo wallets are controlled by our server and exist only for testing. Anything sent to them may be lost.",
            "We may reset test data at any time, without notice.",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      heading: "Who can use PayFix",
      blocks: [
        "You must be at least 18 years old and able to enter into a binding agreement. If you use PayFix for a company or another organization, you confirm that you are allowed to accept these terms for it.",
      ],
    },
    {
      id: "not-financial-service",
      heading: "Not a financial service",
      blocks: [
        "PayFix is not a bank, a payment service, an exchange, or a custodian. It does not hold, move, or control your funds. Payments and refunds are made from wallets that you or the other party control, and are signed there.",
        "PayFix does not give financial, legal, tax, or accounting advice. Businesses and customers are responsible for their own agreements with each other, and for checking that every plan, invoice, and refund is correct before they approve or sign it.",
      ],
    },
    {
      id: "accounts",
      heading: "Your account",
      blocks: [
        {
          list: [
            "You sign in with a one-time code sent to your email address. Keep your email account secure, because anyone who can read your email can sign in as you.",
            "You are responsible for what happens in your account. Sign out on shared devices.",
            "Company owners decide who is on their team and what role each person has. Owners are responsible for removing people who should no longer have access.",
            "Tell us as soon as possible if you think someone has used your account without permission.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Wallets and transactions",
      blocks: [
        {
          list: [
            "You are solely responsible for your wallet, its private key, and its recovery phrase. We will never ask for them. Never share them with anyone.",
            "Check every transaction in your wallet before you sign it: the amount, the token, and the recipient.",
            "Blockchain transactions cannot be reversed. We cannot recover tokens sent to a wrong address.",
            "PayFix only knows about payments it can see on the business’s receiving wallets and refunds it prepares. It cannot see refunds or payments made outside the app.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      blocks: [
        "When you use PayFix, you must not:",
        {
          list: [
            "break any law, or use PayFix for fraud or to mislead other people;",
            "enter personal data about other people unless you have the right to do so;",
            "pretend to be another person, business, or customer;",
            "try to access accounts, companies, or data that are not yours;",
            "attack, overload, or disrupt the service, or try to get around its rate limits or the test-token faucet limits;",
            "upload or send malware or harmful code;",
            "test the security of PayFix in ways that are not allowed by our Security page.",
          ],
        },
      ],
    },
    {
      id: "your-content",
      heading: "Your data",
      blocks: [
        "You keep all rights to the data you enter. You allow us to store and process it only to run the service for you, as described in our Privacy Policy. If you enter details about your customers, you confirm that you are allowed to do so and that you have told them how their data will be used.",
      ],
    },
    {
      id: "availability",
      heading: "Changes to the service",
      blocks: [
        "We may change, pause, or stop any part of PayFix at any time. We do not promise that the service will always be available, that it will be free of errors, or that data will be kept.",
      ],
    },
    {
      id: "no-warranty",
      heading: "No warranty",
      blocks: [
        "PayFix is provided as it is and as it is available, without any warranty. To the extent the law allows, we make no promises that the service is accurate, reliable, secure, or fit for a particular purpose.",
      ],
    },
    {
      id: "liability",
      heading: "Limits on our liability",
      blocks: [
        "To the extent the law allows, we are not liable for:",
        {
          list: [
            "indirect or consequential losses, such as lost profits, lost business, or lost data;",
            "losses caused by blockchain transactions, by wallets, or by networks and services that we do not control;",
            "losses caused by sending real funds to PayFix or to any address it shows, despite these terms.",
          ],
        },
        "If we are liable to you in any other way, our total liability is limited to the amount you paid us to use PayFix in the 12 months before the claim.",
        "Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence. Nothing in these terms affects rights you have as a consumer that cannot be changed by agreement.",
      ],
    },
    {
      id: "third-parties",
      heading: "Other services",
      blocks: [
        "PayFix works with services that we do not control, such as the Solana network, wallet apps, and email delivery. Your use of those services is subject to their own terms.",
      ],
    },
    {
      id: "termination",
      heading: "Ending your use",
      blocks: [
        "You can stop using PayFix at any time, and you can ask us to delete your data as described in our Privacy Policy.",
        "We may suspend or end your access, or suspend a company, if you break these terms, if we see signs of fraud or abuse, if your use puts other users or the service at risk, or if we stop the service. The sections on wallets, no warranty, and limits on our liability continue to apply after your access ends.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      blocks: [
        "We may update these terms. The date at the top of this page shows when they were last updated. If you keep using PayFix after a change, the updated terms apply to you.",
      ],
    },
    {
      id: "general",
      heading: "General",
      blocks: [
        "If any part of these terms cannot be enforced, the rest still applies. If we do not enforce a part of these terms, we have not given up our right to enforce it later. Mandatory laws that protect you in your country still apply.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: ["If you have questions about these terms, contact us. {contact}"],
    },
  ],
};

export default terms;
