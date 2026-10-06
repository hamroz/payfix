import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Cookie Policy",
  description: "The few cookies and browser storage items PayFix uses, what each one does, and how long it lasts. No analytics or advertising cookies.",
  updated: "2026-10-05",
  intro: [
    "This policy explains which cookies and similar browser storage PayFix uses, and why. In short: PayFix uses only what it needs to sign you in and to remember choices you make. It does not use analytics, advertising, or tracking cookies.",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "What cookies and local storage are",
      blocks: [
        "A cookie is a small piece of text that a website asks your browser to store and send back on later visits. Local storage is a similar feature that lets a website keep small values in your browser. Neither is a program, and neither can read other files on your device.",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "Cookies we use",
      blocks: [
        "All of these cookies are set by PayFix itself (first-party cookies). None of them are shared with other websites.",
        {
          list: [
            "<b>pf_b</b> keeps you signed in to your business account. It contains a random session token. It expires after 7 days, or when you sign out.",
            "<b>pf_c</b> keeps you verified as the customer on a resolution link, after you enter the code we emailed you. It contains a random session token and expires after 7 days.",
            "<b>pf_ws</b> remembers which company you are working in, if you belong to more than one. It contains the company’s internal ID and expires after 30 days.",
            "<b>pf_inbox</b> is used only in demo mode. It remembers the email address (and, for customers, the company) that you asked a sign-in code for, so that the demo inbox shows your messages and nobody else’s. It expires after 1 day.",
            "<b>pf-locale</b> remembers the language you chose. It is set only when you pick a language, and it expires after 1 year. Without it, PayFix uses your browser’s language.",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Local storage we use",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> remembers whether you chose the light theme, the dark theme, or your system setting. It is set only when you change the theme, and it stays until you clear it.",
            "<b>walletName</b> remembers which browser wallet (for example Phantom or Solflare) you connected on a payment, resolution, or settings page, so the page can reconnect to it next time. It stays until you clear it or disconnect.",
          ],
        },
        "Your wallet app may also store data in your browser. It does this under its own policies, not ours.",
      ],
    },
    {
      id: "no-tracking",
      heading: "No analytics or advertising",
      blocks: [
        "PayFix does not use analytics tools, advertising networks, social media plugins, or tracking pixels. Our fonts are served from our own site, so loading a page does not contact other font services.",
        "Some links lead to other websites, such as Solana Explorer or a wallet provider. Those websites may set their own cookies under their own policies.",
      ],
    },
    {
      id: "why-no-banner",
      heading: "Why we do not ask for consent",
      blocks: [
        "The session, company, and demo inbox cookies are strictly necessary for the service you ask for: without them, you could not stay signed in. The language and theme settings are stored only when you choose them, to remember that choice. Because we do not use any other cookies or storage, we do not show a cookie banner.",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "How we protect cookies",
      blocks: [
        {
          list: [
            "The session, company, and demo inbox cookies are marked HttpOnly, so scripts on the page cannot read them.",
            "On secure (HTTPS) sites, cookies are marked Secure, so they are sent only over encrypted connections.",
            "Cookies use the SameSite=Lax setting, which stops most requests from other websites from using them.",
            "Our server stores only a hash of each session token, so a copy of our database cannot be used to sign in as you.",
          ],
        },
        "The language cookie is not HttpOnly because the language menu reads it. It contains only a language code.",
      ],
    },
    {
      id: "managing",
      heading: "How to control or delete them",
      blocks: [
        "You can see and delete cookies and local storage in your browser’s settings, usually under privacy or site data. You can also block cookies for this site.",
        "If you delete or block the session cookies, you will be signed out and will not be able to sign in again until you allow them. If you delete the language or theme settings, PayFix returns to your browser’s language and your system’s theme.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        "If we add, change, or remove a cookie, we will update this page and the date at the top. If you have questions, contact us. {contact}",
      ],
    },
  ],
};

export default cookies;
