import type { LegalDoc } from "../types";

const privacy: LegalDoc = {
  title: "Privacy Policy",
  description: "What personal data PayFix collects, why, who receives it, how long it is kept, and the rights you have.",
  updated: "2026-10-06",
  intro: [
    "This policy explains what personal data the PayFix service collects, why we collect it, who receives it, how long we keep it, and what rights you have. In this policy, “we” and “us” mean the operator of this PayFix service.",
    "PayFix is a hackathon prototype. It runs on the Solana devnet test network or on a simulated chain, with test tokens that have no monetary value. Please use test data where you can, and do not use PayFix for real customer funds.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Who is responsible",
      blocks: [
        "The operator of this PayFix service is responsible for the personal data described in this policy. {contact}",
        "If a business uses PayFix to send you an invoice or a resolution link, that business decides which of your details it enters. For questions about that business’s own records, you can also contact the business directly.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "What data we collect",
      blocks: [
        {
          list: [
            "<b>Account data:</b> the email address you sign in with. When you ask for a sign-in code, we create an account record for that address.",
            "<b>Company and team data:</b> company names, the email address of the person who created each company, the email addresses and roles of team members, and each member’s notification settings.",
            "<b>Customer and invoice data</b> that businesses enter: customer names and email addresses, and invoice numbers, titles, amounts, and due dates.",
            "<b>Resolution data:</b> the plans that customers and businesses propose, any notes they write, approvals, and the refund wallet address a customer chooses, together with the signed message that proves the customer controls that wallet.",
            "<b>Wallet and payment data:</b> wallet addresses, transaction signatures, amounts, and times that PayFix reads from the blockchain or creates for refunds.",
            "<b>Security data:</b> sign-in codes and session tokens (stored only in hashed form), an activity log of actions in each company, and rate-limit records. Rate-limit records contain a shortened hash of your email address or IP address, not the address itself.",
            "<b>Email log:</b> the recipient, subject, text, and delivery status of the emails PayFix sends.",
            "<b>Feedback:</b> if you fill in our optional feedback survey, your answers and the language you used. Answers are anonymous unless you choose to attach your PayFix account to them.",
            "<b>Technical data:</b> your IP address and basic browser information, which our hosting provider processes when your browser connects to the service.",
          ],
        },
        "We do not ask for your home address, phone number, date of birth, government identity documents, bank details, or wallet private keys.",
      ],
    },
    {
      id: "how-we-use-data",
      heading: "How we use your data",
      blocks: [
        {
          list: [
            "To provide the service: to sign you in, match payments to invoices, run resolutions and refunds, and produce receipts.",
            "To send the emails the service needs: sign-in codes, resolution links, team invitations, and requests to change a plan.",
            "To keep PayFix secure and prevent abuse, for example by limiting how many sign-in codes or test tokens can be requested.",
            "To keep complete and accurate payment records, so that every amount received can be explained.",
            "To run the service: the people who operate PayFix can see account email addresses, company names, team members and their roles, whether an account or company is suspended, and counts and totals of activity across the service. Our admin tools do not show them a company’s customers, invoices, amounts, or wallets. Every admin action is recorded.",
            "To stop fraud and abuse: operators can suspend an account or a company, sign an account out, or block sign-in codes or test tokens for an address. Each of these actions is recorded with a reason.",
            "To improve PayFix from the feedback testers choose to give us.",
          ],
        },
        "We do not sell your data. We do not use it for advertising or profiling, and PayFix does not use analytics or tracking tools.",
      ],
    },
    {
      id: "legal-bases",
      heading: "Legal bases",
      blocks: [
        "Where data protection laws such as the EU General Data Protection Regulation (GDPR) apply, we process your data on these legal bases:",
        {
          list: [
            "<b>Performance of a contract:</b> to provide the service you or your company asked for.",
            "<b>Legitimate interests:</b> to keep the service secure, prevent abuse, and keep reliable records. We only rely on this when your rights do not outweigh these interests.",
            "<b>Legal obligations:</b> when a law requires us to keep or disclose data.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Public blockchain data",
      blocks: [
        "Payments and refunds are transactions on a public blockchain. Anyone can see the wallet addresses, amounts, and times of these transactions, and they cannot be changed or deleted by us or by anyone else.",
        "PayFix does not put names, email addresses, or invoice details on the blockchain. It adds only a random reference key to payment requests and a refund number to refunds.",
      ],
    },
    {
      id: "sharing",
      heading: "Who receives your data",
      blocks: [
        "We share data only with the service providers we need to run PayFix:",
        {
          list: [
            "<b>Hosting and database providers</b> that run the application and store its data. The public demo uses Vercel for hosting and Neon for its database.",
            "<b>Resend</b>, which delivers our emails. It receives the recipient address and the content of each email.",
            "<b>Solana network providers (RPC nodes)</b>, which your browser and our server contact to read and send transactions. They can see your IP address and the wallet addresses that are requested.",
            "<b>Wallet apps</b> that you choose to connect, such as Phantom or Solflare. They process data under their own privacy policies.",
          ],
        },
        "Inside PayFix, members of a company can see that company’s customers, invoices, payments, and activity. A customer can see only the case and invoices linked to their own resolution link.",
        "We may also disclose data when the law requires it, or to protect the rights and safety of users and the service.",
      ],
    },
    {
      id: "international-transfers",
      heading: "International transfers",
      blocks: [
        "Our service providers may process data in countries other than yours, including the United States. Where data protection law requires safeguards for these transfers, we rely on the safeguards the providers offer, such as standard contractual clauses.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep data",
      blocks: [
        {
          list: [
            "Sign-in codes are valid for 10 minutes and can be used only once.",
            "Sessions end after 7 days, or earlier when you sign out.",
            "Resolution links expire after 7 days, or earlier when the business replaces or revokes them.",
            "Rate-limit records are usually deleted after about two days.",
            "Feedback answers are kept while we evaluate the test, and are deleted with the test deployment or earlier if you ask us.",
            "After an email is delivered, the link it contained is removed from our email log. In demo mode, emails are not sent: they stay in the database and are shown only in the demo inbox.",
            "Account, company, invoice, payment, and activity records are kept while the account or company exists, because payment records must stay complete. In demo mode, company owners can reset their company’s data at any time.",
            "Server logs are kept by our hosting provider for a limited time. In demo mode, these logs also contain the email addresses that request sign-in codes and the codes themselves.",
          ],
        },
        "Test deployments of PayFix may be reset or shut down, which deletes their data. Data on the public blockchain is permanent.",
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        "We protect your data with measures such as hashed codes and session tokens, cookies that scripts cannot read, encrypted connections, role checks for every change, and rate limits. Our Security page describes these measures in more detail. No system is completely secure, so please report any weakness you find.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        "Depending on where you live, you may have the right to:",
        {
          list: [
            "access the personal data we hold about you and receive a copy of it;",
            "correct data that is wrong or incomplete;",
            "ask us to delete your data;",
            "ask us to restrict how we use your data, or object to our use of it;",
            "receive your data in a structured, machine-readable format (data portability);",
            "complain to a data protection supervisory authority, especially in the country where you live or work.",
          ],
        },
        "To use these rights, contact us. {contact} We may ask you to confirm that the email address is yours before we act on a request. We cannot delete or change data on the public blockchain, and we may keep records that we need to keep payment records complete or to meet legal obligations.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: ["PayFix is a business tool and is not meant for children. Do not use it if you are under 18."],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        "We may update this policy when the service or the law changes. The date at the top of this page shows when it was last updated. If a change is significant, we will make it clear on this page.",
      ],
    },
  ],
};

export default privacy;
