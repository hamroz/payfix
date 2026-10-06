import type { Messages } from "../types";

// The tester survey at /feedback (after the walkthrough in docs/tester-walkthrough.md).
const feedback: Messages["feedback"] = {
  title: "Wie lief es?",
  intro: "Danke, dass Sie PayFix ausprobiert haben. Das dauert etwa zwei Minuten. Nur die mit * markierten Fragen sind Pflicht.",
  anonymous: "Ihre Antworten bleiben anonym, es sei denn, Sie verknüpfen unten Ihr PayFix-Konto damit.",
  completed: {
    label: "Haben Sie den Durchgang abgeschlossen?",
    unaided: "Ja, ganz allein",
    aided: "Ja, mit etwas Hilfe",
    no: "Nein",
  },
  minutes: { label: "Wie viele Minuten hat es ungefähr gedauert?", suffix: "Minuten" },
  ease: { label: "Wie einfach war es?", low: "Sehr schwer", high: "Sehr einfach" },
  nps: { label: "Wie wahrscheinlich ist es, dass Sie PayFix einem Unternehmen empfehlen, das Zahlungen in Stablecoins erhält?", low: "Sehr unwahrscheinlich", high: "Sehr wahrscheinlich" },
  openTitle: "In Ihren eigenen Worten",
  questions: {
    happened: "Was ist mit den zusätzlichen $100 passiert, und wer hat das entschieden?",
    hesitated: "Wo haben Sie gezögert oder waren unsicher, was Sie als Nächstes antippen sollen?",
    voidedApproval: "Als sich nach der Freigabe das Wallet für die Rückerstattung geändert hat: Haben Sie bemerkt, dass die Freigabe aufgehoben wurde? Fühlte sich das richtig an?",
    currentProcess: "Falls Ihr Unternehmen Zahlungen in Stablecoins erhält: Wie gehen Sie heute mit einer Überzahlung um, und wie oft kommt das vor?",
    receiptTrust: "Würden Sie den Beleg als Nachweis an einen Kunden oder Ihre Buchhaltung schicken? Was fehlt?",
    blockers: "Was würde Sie davon abhalten, PayFix zu nutzen, und welches Tool würde es ersetzen oder ergänzen?",
  },
  aboutTitle: "Über Sie",
  about: { label: "Was für ein Unternehmen, und wie groß?", placeholder: "z. B. Designagentur, 4 Personen" },
  device: { label: "Was haben Sie verwendet?", phone: "Smartphone", tablet: "Tablet", computer: "Computer" },
  quoteOk: "Sie dürfen meine Antworten ohne meinen Namen zitieren.",
  attach: "Mein PayFix-Konto ({email}) mit diesen Antworten verknüpfen, damit das Team sieht, wie weit ich gekommen bin.",
  submit: "Feedback senden",
  sending: "Wird gesendet…",
  required: "Bitte beantworten Sie die mit * markierten Fragen.",
  thanks: { title: "Vielen Dank!", body: "Ihre Antworten helfen uns zu entscheiden, was wir als Nächstes verbessern.", back: "Zurück zu PayFix" },
  guidedDemoLink: "Sagen Sie uns, wie es lief",
};

export default feedback;
