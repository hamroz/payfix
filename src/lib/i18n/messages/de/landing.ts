import type { Messages } from "../types";

const landing: Messages["landing"] = {
  nav: {
    howItWorks: "So funktioniert es",
    signIn: "Anmelden",
    dashboard: "Dashboard",
  },
  hero: {
    simulatedChain: "Simulierte Chain",
    cluster: "Solana {cluster}",
    tagline: "Klärung von USDC-Zahlungen für Agenturen",
    titleLead: "Falsche Zahlungen,",
    titleAccent: "ins Lot gebracht.",
    body: "Wenn ein Kunde zu viel zahlt, doppelt zahlt oder USDC ohne Referenz schickt, macht PayFix daraus eine vereinbarte, abgeschlossene Abrechnung – über einen einzigen gemeinsamen Link, dem beide Seiten vertrauen können.",
    tryDemo: "Live-Demo ausprobieren",
    getStarted: "Jetzt starten",
    seeHow: "So funktioniert es",
    signIn: "Anmelden",
    testNote: "Die Demo nutzt einen klar gekennzeichneten Test-Token – niemals echtes Geld.",
    equation: "{received} erhalten = {invoice} + {applied} + {refunded}.",
  },
  how: {
    eyebrow: "Der Klärungsablauf",
    title: "Von „zu viel bezahlt“ zur sauberen Abrechnung – in vier Schritten.",
  },
  steps: {
    detect: {
      title: "Erkennen",
      body: "Jeder Transfer an Ihr Wallet wird auf Solana verifiziert – Mint, Betrag, Empfänger, Bestätigung – und seiner Rechnung zugeordnet. Überzahlungen, Doppelzahlungen und Transfers ohne Referenz landen in einem einzigen Eingang.",
    },
    propose: {
      title: "Vorschlagen",
      body: "Ihr Kunde erhält einen sicheren Link. Dort entscheidet er, wohin der Überschuss geht: auf eine andere Rechnung, als Guthaben, als Rückerstattung oder aufgeteilt. Erstattungs-Wallets werden per Signatur nachgewiesen.",
    },
    approve: {
      title: "Freigeben",
      body: "Sie geben genau diese Version frei. Ändert sich ein Betrag, eine Rechnung oder das Ziel, ist die Freigabe ungültig, bis Sie erneut freigeben.",
    },
    settle: {
      title: "Abwickeln",
      body: "Sie signieren die Rückerstattung aus Ihrem eigenen Wallet. Die Zuordnungen werden gebucht, die Rückerstattung wird on-chain bestätigt, und beide Seiten erhalten denselben Beleg.",
    },
  },
  film: {
    eyebrow: "So läuft es ab",
    title: "Eine Überzahlung, von Anfang bis Ende.",
    note: "49 Sekunden · das Szenario der Live-Demo, mit Testgeld",
  },
  controls: {
    eyebrow: "Gebaut für Geldflüsse",
    title: "Kontrollen, die jedes Finanzteam unterschreiben würde.",
    body: "Solana liefert verifizierbare Zahlungseingänge und vom Händler signierte Rückerstattungen. PayFix ergänzt den Teil dazwischen: Einigung, Autorisierung und ein Hauptbuch, das immer aufgeht.",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "Nie doppelt gezählt",
      body: "Jede On-Chain-Signatur wird genau einmal erfasst. Erneutes Synchronisieren, Wiederholungen und Neustarts können Ihre Eingänge nicht aufblähen.",
    },
    hashBound: {
      title: "Freigabe an einen Hash gebunden",
      body: "Freigaben umfassen Beträge, Rechnungen und Ziel. Jede Änderung erzeugt eine neue Version, die eine eigene Freigabe braucht.",
    },
    oneRefund: {
      title: "Nur eine Rückerstattung unterwegs",
      body: "PayFix speichert die Signatur einer Rückerstattung vor dem Senden und lässt einen neuen Versuch erst zu, wenn ihr Blockhash abgelaufen ist, ohne dass sie on-chain angekommen ist.",
    },
    everyDollar: {
      title: "Jeder Dollar erklärt",
      body: "Ein Hauptbuch mit doppelter Buchführung in exakten Token-Einheiten. Erhalten ist immer gleich verrechnet + Guthaben + erstattet + ausstehend + ungeklärt.",
    },
  },
  heroDemo: {
    invoiceCount: { one: "{count} Rechnung", other: "{count} Rechnungen" },
    incomingTransfer: "Eingehender Transfer",
    received: "{amount} erhalten",
    reconciled: "Abgeglichen",
    needsResolution: "{amount} zu klären",
    verifying: "Wird verifiziert…",
    refunded: "Erstattet",
    unresolved: "Ungeklärt",
    stages: {
      arrive: { title: "Zahlungen gehen ein", note: "Zwei Transfers auf Solana verifiziert" },
      excess: { title: "Rechnung beglichen, {amount} zu viel", note: "Der Überschuss wird markiert, nicht geraten" },
      propose: { title: "Kunde schlägt Aufteilung vor", note: "{applied} → {invoice} · {refund} Rückerstattung" },
      approve: { title: "Unternehmen gibt {version} frei", note: "Exakter Plan, an den Hash gebundene Freigabe" },
      settled: { title: "Jeder Dollar hat seinen Platz", note: "Rückerstattung bestätigt · {amount} ungeklärt" },
    },
  },
};

export default landing;
