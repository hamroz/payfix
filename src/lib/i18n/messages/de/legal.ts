import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "Hackathon-Prototyp. Nur Test-Token, keine Kundengelder. PayFix sieht keine Rückerstattungen, die außerhalb der App gesendet werden.",
    legalHeading: "Rechtliches",
    productHeading: "Produkt",
    howItWorks: "So funktioniert es",
    signIn: "Anmelden",
    rights: "© {year} PayFix. Alle Rechte vorbehalten.",
  },
  docs: {
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    cookies: "Cookie-Richtlinie",
    security: "Sicherheit",
  },
  page: {
    updated: "Zuletzt aktualisiert am {date}",
    onThisPage: "Auf dieser Seite",
    otherDocuments: "Weitere Dokumente",
    backHome: "Zur Startseite",
    translationNote: "Diese Übersetzung dient nur der Orientierung. Weicht sie von der englischen Fassung ab, gilt die englische Fassung.",
    fallbackNote: "Dieses Dokument ist noch nicht in Ihrer Sprache verfügbar und wird daher auf Englisch angezeigt.",
    home: "PayFix-Startseite",
    contactEmail: "Sie erreichen uns unter <link>{email}</link>.",
    contactFallback: "Für diesen Dienst wurde noch keine Kontakt-E-Mail-Adresse veröffentlicht. Wenden Sie sich bis dahin an die Person oder das Team, von der bzw. dem Sie diesen PayFix-Dienst erhalten haben.",
  },
};

export default legal;
