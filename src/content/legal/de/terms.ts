import type { LegalDoc } from "../types";

const terms: LegalDoc = {
  title: "Nutzungsbedingungen",
  description: "Die Regeln für die Nutzung von PayFix: ein reiner Test-Prototyp, kein Finanzdienst, ohne Gewährleistung bereitgestellt.",
  updated: "2026-10-06",
  intro: [
    "Diese Bedingungen gelten, wenn Sie den PayFix-Dienst nutzen – sei es als Unternehmen, als Teammitglied oder als Kunde, der einen Klärungslink erhalten hat. „Wir“ und „uns“ bezeichnen in diesen Bedingungen den Betreiber dieses PayFix-Dienstes, „Sie“ die Person, die ihn nutzt. Indem Sie PayFix nutzen, stimmen Sie diesen Bedingungen zu. Wenn Sie nicht zustimmen, nutzen Sie den Dienst nicht.",
  ],
  sections: [
    {
      id: "about",
      heading: "Was PayFix ist",
      blocks: [
        "PayFix ist eine Software, die einem Unternehmen und seinem Kunden hilft, sich darüber zu einigen, was mit einer Stablecoin-Zahlung geschieht, die nicht zu einer Rechnung passt, zum Beispiel einer Überzahlung oder einer Doppelzahlung. Sie ordnet Zahlungen Rechnungen zu, ermöglicht beiden Seiten, sich auf einen Plan zu einigen, und hält das Ergebnis fest.",
        "PayFix ist ein Hackathon-Prototyp. Er befindet sich noch in der Entwicklung, kann Fehler enthalten und jederzeit geändert oder eingestellt werden.",
      ],
    },
    {
      id: "test-only",
      heading: "Nur zu Testzwecken",
      blocks: [
        "PayFix läuft im Testnetz Solana Devnet oder auf einer simulierten Chain. Es funktioniert nur mit Test-Token, die keinen Geldwert haben und nicht in Geld umgetauscht werden können.",
        {
          list: [
            "Senden Sie kein echtes Geld, etwa USDC im Solana-Hauptnetz, an eine von PayFix angezeigte Wallet-Adresse, auch nicht an die Demo-Wallets.",
            "Verwenden Sie PayFix nicht für echte Kundenzahlungen oder echte Geschäftsunterlagen.",
            "Demo-Wallets werden von unserem Server kontrolliert und existieren nur zu Testzwecken. Alles, was an sie gesendet wird, kann verloren gehen.",
            "Wir können Testdaten jederzeit ohne Vorankündigung zurücksetzen.",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      heading: "Wer PayFix nutzen darf",
      blocks: [
        "Sie müssen mindestens 18 Jahre alt und in der Lage sein, eine verbindliche Vereinbarung einzugehen. Wenn Sie PayFix für ein Unternehmen oder eine andere Organisation nutzen, bestätigen Sie, dass Sie berechtigt sind, diese Bedingungen in deren Namen anzunehmen.",
      ],
    },
    {
      id: "not-financial-service",
      heading: "Kein Finanzdienst",
      blocks: [
        "PayFix ist weder eine Bank noch ein Zahlungsdienst, eine Börse oder ein Verwahrer. PayFix hält, bewegt oder kontrolliert Ihre Gelder nicht. Zahlungen und Rückerstattungen erfolgen aus Wallets, die Sie oder die andere Partei kontrollieren, und werden dort signiert.",
        "PayFix bietet keine Finanz-, Rechts-, Steuer- oder Buchhaltungsberatung. Unternehmen und Kunden sind selbst für ihre Vereinbarungen untereinander verantwortlich und dafür, jeden Plan, jede Rechnung und jede Rückerstattung auf Richtigkeit zu prüfen, bevor sie sie freigeben oder signieren.",
      ],
    },
    {
      id: "accounts",
      heading: "Ihr Konto",
      blocks: [
        {
          list: [
            "Sie melden sich mit einem Einmalcode an, der an Ihre E-Mail-Adresse gesendet wird. Schützen Sie Ihr E-Mail-Konto, denn wer Ihre E-Mails lesen kann, kann sich als Sie anmelden.",
            "Sie sind für alles verantwortlich, was in Ihrem Konto geschieht. Melden Sie sich auf gemeinsam genutzten Geräten ab.",
            "Inhaber eines Unternehmens entscheiden, wer zu ihrem Team gehört und welche Rolle jede Person hat. Inhaber sind dafür verantwortlich, Personen zu entfernen, die keinen Zugriff mehr haben sollen.",
            "Teilen Sie uns so schnell wie möglich mit, wenn Sie vermuten, dass jemand Ihr Konto ohne Erlaubnis genutzt hat.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Wallets und Transaktionen",
      blocks: [
        {
          list: [
            "Sie allein sind für Ihr Wallet, dessen privaten Schlüssel und dessen Wiederherstellungsphrase verantwortlich. Wir werden nie danach fragen. Geben Sie sie niemals an andere weiter.",
            "Prüfen Sie jede Transaktion in Ihrem Wallet, bevor Sie sie signieren: Betrag, Token und Empfänger.",
            "Blockchain-Transaktionen können nicht rückgängig gemacht werden. Wir können keine Token zurückholen, die an eine falsche Adresse gesendet wurden.",
            "PayFix kennt nur Zahlungen, die es auf den Empfangs-Wallets des Unternehmens sehen kann, und Rückerstattungen, die es vorbereitet. Rückerstattungen oder Zahlungen außerhalb der App kann es nicht sehen.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Zulässige Nutzung",
      blocks: [
        "Bei der Nutzung von PayFix dürfen Sie nicht:",
        {
          list: [
            "gegen Gesetze verstoßen oder PayFix für Betrug oder zur Täuschung anderer nutzen;",
            "personenbezogene Daten anderer eingeben, sofern Sie dazu nicht berechtigt sind;",
            "sich als eine andere Person, ein anderes Unternehmen oder ein anderer Kunde ausgeben;",
            "versuchen, auf Konten, Unternehmen oder Daten zuzugreifen, die nicht Ihnen gehören;",
            "den Dienst angreifen, überlasten oder stören oder versuchen, seine Ratenbegrenzungen oder die Limits des Test-Token-Faucets zu umgehen;",
            "Schadsoftware oder schädlichen Code hochladen oder versenden;",
            "die Sicherheit von PayFix auf eine Weise testen, die unsere Seite „Sicherheit“ nicht erlaubt.",
          ],
        },
      ],
    },
    {
      id: "your-content",
      heading: "Ihre Daten",
      blocks: [
        "Alle Rechte an den Daten, die Sie eingeben, verbleiben bei Ihnen. Sie gestatten uns, sie ausschließlich zu speichern und zu verarbeiten, um den Dienst für Sie zu betreiben, wie in unserer Datenschutzerklärung beschrieben. Wenn Sie Angaben zu Ihren Kunden eingeben, bestätigen Sie, dass Sie dazu berechtigt sind und Ihre Kunden darüber informiert haben, wie ihre Daten verwendet werden.",
      ],
    },
    {
      id: "availability",
      heading: "Änderungen am Dienst",
      blocks: [
        "Wir können jeden Teil von PayFix jederzeit ändern, pausieren oder einstellen. Wir versprechen nicht, dass der Dienst immer verfügbar oder fehlerfrei ist oder dass Daten erhalten bleiben.",
      ],
    },
    {
      id: "no-warranty",
      heading: "Keine Gewährleistung",
      blocks: [
        "PayFix wird so bereitgestellt, wie es ist und wie es verfügbar ist, ohne jegliche Gewährleistung. Soweit gesetzlich zulässig, sichern wir nicht zu, dass der Dienst korrekt, zuverlässig, sicher oder für einen bestimmten Zweck geeignet ist.",
      ],
    },
    {
      id: "liability",
      heading: "Haftungsbeschränkung",
      blocks: [
        "Soweit gesetzlich zulässig, haften wir nicht für:",
        {
          list: [
            "indirekte Schäden oder Folgeschäden, etwa entgangenen Gewinn, entgangene Geschäfte oder Datenverlust;",
            "Schäden durch Blockchain-Transaktionen, durch Wallets oder durch Netzwerke und Dienste, die wir nicht kontrollieren;",
            "Schäden, die dadurch entstehen, dass entgegen diesen Bedingungen echtes Geld an PayFix oder an eine von PayFix angezeigte Adresse gesendet wird.",
          ],
        },
        "Haften wir Ihnen gegenüber auf andere Weise, ist unsere Gesamthaftung auf den Betrag begrenzt, den Sie uns in den 12 Monaten vor dem Anspruch für die Nutzung von PayFix gezahlt haben.",
        "Nichts in diesen Bedingungen beschränkt eine Haftung, die gesetzlich nicht beschränkt werden kann, etwa die Haftung für Betrug oder für Tod oder Körperverletzung infolge von Fahrlässigkeit. Nichts in diesen Bedingungen berührt Rechte, die Ihnen als Verbraucher zustehen und die nicht durch Vereinbarung geändert werden können.",
      ],
    },
    {
      id: "third-parties",
      heading: "Andere Dienste",
      blocks: [
        "PayFix arbeitet mit Diensten zusammen, die wir nicht kontrollieren, etwa dem Solana-Netzwerk, Wallet-Apps und dem E-Mail-Versand. Für Ihre Nutzung dieser Dienste gelten deren eigene Bedingungen.",
      ],
    },
    {
      id: "termination",
      heading: "Beendigung der Nutzung",
      blocks: [
        "Sie können die Nutzung von PayFix jederzeit beenden und uns bitten, Ihre Daten zu löschen, wie in unserer Datenschutzerklärung beschrieben.",
        "Wir können Ihren Zugang sperren oder beenden oder ein Unternehmen sperren, wenn Sie gegen diese Bedingungen verstoßen, wenn wir Anzeichen für Betrug oder Missbrauch feststellen, wenn Ihre Nutzung andere Nutzer oder den Dienst gefährdet oder wenn wir den Dienst einstellen. Die Abschnitte zu Wallets, zum Ausschluss der Gewährleistung und zur Haftungsbeschränkung gelten auch nach dem Ende Ihres Zugangs weiter.",
      ],
    },
    {
      id: "changes",
      heading: "Änderungen dieser Bedingungen",
      blocks: [
        "Wir können diese Bedingungen aktualisieren. Das Datum oben auf dieser Seite zeigt, wann sie zuletzt aktualisiert wurden. Wenn Sie PayFix nach einer Änderung weiter nutzen, gelten für Sie die aktualisierten Bedingungen.",
      ],
    },
    {
      id: "general",
      heading: "Allgemeines",
      blocks: [
        "Sollte ein Teil dieser Bedingungen nicht durchsetzbar sein, bleibt der Rest wirksam. Wenn wir einen Teil dieser Bedingungen nicht durchsetzen, verzichten wir damit nicht auf unser Recht, ihn später durchzusetzen. Zwingende Gesetze, die Sie in Ihrem Land schützen, gelten weiterhin.",
      ],
    },
    {
      id: "contact",
      heading: "Kontakt",
      blocks: ["Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie uns. {contact}"],
    },
  ],
};

export default terms;
