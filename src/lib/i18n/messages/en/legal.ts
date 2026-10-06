// Site footer and the chrome around the legal pages. The documents themselves live in
// src/content/legal/<locale>/ so their text is never shipped to the browser as a dictionary.
const legal = {
  footer: {
    disclaimer: "Hackathon prototype. Test tokens only; not for customer funds. PayFix can’t see refunds sent outside the app.",
    legalHeading: "Legal",
    productHeading: "Product",
    howItWorks: "How it works",
    signIn: "Sign in",
    rights: "© {year} PayFix. All rights reserved.",
  },
  docs: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    cookies: "Cookie Policy",
    security: "Security",
  },
  page: {
    updated: "Last updated {date}",
    onThisPage: "On this page",
    otherDocuments: "Other documents",
    backHome: "Back to home",
    translationNote: "This translation is provided for convenience. If it differs from the English version, the English version applies.",
    fallbackNote: "This document is not yet available in your language, so it is shown in English.",
    home: "PayFix home",
    contactEmail: "You can write to us at <link>{email}</link>.",
    contactFallback: "This service has not published a contact email address yet. Until it does, contact the person or team who shared this PayFix service with you.",
  },
};

export default legal;
