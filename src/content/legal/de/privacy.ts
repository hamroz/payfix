import type { LegalDoc } from "../types";

const privacy: LegalDoc = {
  title: "Datenschutzerklärung",
  description: "Welche personenbezogenen Daten PayFix erhebt, warum, wer sie erhält, wie lange sie gespeichert werden und welche Rechte Sie haben.",
  updated: "2026-10-06",
  intro: [
    "Diese Erklärung beschreibt, welche personenbezogenen Daten der PayFix-Dienst erhebt, warum wir sie erheben, wer sie erhält, wie lange wir sie speichern und welche Rechte Sie haben. „Wir“ und „uns“ bezeichnen in dieser Erklärung den Betreiber dieses PayFix-Dienstes.",
    "PayFix ist ein Hackathon-Prototyp. Er läuft im Testnetz Solana Devnet oder auf einer simulierten Chain, mit Test-Token ohne Geldwert. Bitte verwenden Sie nach Möglichkeit Testdaten, und nutzen Sie PayFix nicht für echte Kundengelder.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Verantwortlicher",
      blocks: [
        "Verantwortlich für die in dieser Erklärung beschriebenen personenbezogenen Daten ist der Betreiber dieses PayFix-Dienstes. {contact}",
        "Wenn ein Unternehmen Ihnen über PayFix eine Rechnung oder einen Klärungslink sendet, entscheidet dieses Unternehmen, welche Ihrer Angaben es einträgt. Bei Fragen zu den eigenen Unterlagen dieses Unternehmens können Sie sich auch direkt an das Unternehmen wenden.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "Welche Daten wir erheben",
      blocks: [
        {
          list: [
            "<b>Kontodaten:</b> die E-Mail-Adresse, mit der Sie sich anmelden. Wenn Sie einen Anmeldecode anfordern, legen wir für diese Adresse einen Kontodatensatz an.",
            "<b>Unternehmens- und Teamdaten:</b> Namen von Unternehmen, die E-Mail-Adresse der Person, die das jeweilige Unternehmen angelegt hat, die E-Mail-Adressen und Rollen der Teammitglieder sowie die Benachrichtigungseinstellungen jedes Mitglieds.",
            "<b>Kunden- und Rechnungsdaten</b>, die Unternehmen eingeben: Namen und E-Mail-Adressen von Kunden sowie Rechnungsnummern, -titel, -beträge und Fälligkeitsdaten.",
            "<b>Klärungsdaten:</b> die Pläne, die Kunden und Unternehmen vorschlagen, etwaige Notizen, Freigaben sowie die vom Kunden gewählte Wallet-Adresse für die Rückerstattung, zusammen mit der signierten Nachricht, die belegt, dass der Kunde dieses Wallet kontrolliert.",
            "<b>Wallet- und Zahlungsdaten:</b> Wallet-Adressen, Transaktionssignaturen, Beträge und Zeitpunkte, die PayFix aus der Blockchain ausliest oder für Rückerstattungen erzeugt.",
            "<b>Sicherheitsdaten:</b> Anmeldecodes und Sitzungstoken (nur in gehashter Form gespeichert), ein Aktivitätsprotokoll der Aktionen in jedem Unternehmen sowie Datensätze zur Ratenbegrenzung. Diese Datensätze enthalten einen gekürzten Hash Ihrer E-Mail-Adresse oder IP-Adresse, nicht die Adresse selbst.",
            "<b>E-Mail-Protokoll:</b> Empfänger, Betreff, Text und Zustellstatus der E-Mails, die PayFix versendet.",
            "<b>Feedback:</b> wenn Sie an unserer freiwilligen Feedback-Umfrage teilnehmen, Ihre Antworten und die verwendete Sprache. Die Antworten sind anonym, es sei denn, Sie entscheiden sich, Ihr PayFix-Konto damit zu verknüpfen.",
            "<b>Technische Daten:</b> Ihre IP-Adresse und grundlegende Browserinformationen, die unser Hosting-Anbieter verarbeitet, wenn Ihr Browser eine Verbindung zum Dienst herstellt.",
          ],
        },
        "Wir fragen nicht nach Ihrer Wohnadresse, Ihrer Telefonnummer, Ihrem Geburtsdatum, amtlichen Ausweisdokumenten, Bankverbindungen oder den privaten Schlüsseln Ihres Wallets.",
      ],
    },
    {
      id: "how-we-use-data",
      heading: "Wie wir Ihre Daten verwenden",
      blocks: [
        {
          list: [
            "Um den Dienst bereitzustellen: um Sie anzumelden, Zahlungen Rechnungen zuzuordnen, Klärungen und Rückerstattungen durchzuführen und Belege zu erstellen.",
            "Um die E-Mails zu senden, die der Dienst benötigt: Anmeldecodes, Klärungslinks, Team-Einladungen und Bitten um Änderung eines Plans.",
            "Um PayFix sicher zu halten und Missbrauch zu verhindern, zum Beispiel indem wir begrenzen, wie viele Anmeldecodes oder Test-Token angefordert werden können.",
            "Um vollständige und korrekte Zahlungsaufzeichnungen zu führen, damit sich jeder erhaltene Betrag erklären lässt.",
            "Um den Dienst zu betreiben: Die Personen, die PayFix betreiben, können die E-Mail-Adressen von Konten, die Namen von Unternehmen, Teammitglieder und ihre Rollen sehen, ob ein Konto oder Unternehmen gesperrt ist, sowie Anzahlen und Summen der Aktivität im gesamten Dienst. Unsere Admin-Werkzeuge zeigen ihnen keine Kunden, Rechnungen, Beträge oder Wallets eines Unternehmens. Jede Admin-Aktion wird protokolliert.",
            "Um Betrug und Missbrauch zu unterbinden: Betreiber können ein Konto oder ein Unternehmen sperren, ein Konto abmelden oder Anmeldecodes bzw. Test-Token für eine Adresse blockieren. Jede dieser Aktionen wird mit einer Begründung protokolliert.",
            "Um PayFix anhand des Feedbacks zu verbessern, das Tester uns freiwillig geben.",
          ],
        },
        "Wir verkaufen Ihre Daten nicht. Wir verwenden sie weder für Werbung noch für Profiling, und PayFix setzt keine Analyse- oder Tracking-Tools ein.",
      ],
    },
    {
      id: "legal-bases",
      heading: "Rechtsgrundlagen",
      blocks: [
        "Soweit Datenschutzgesetze wie die Datenschutz-Grundverordnung der EU (DSGVO) anwendbar sind, verarbeiten wir Ihre Daten auf folgenden Rechtsgrundlagen:",
        {
          list: [
            "<b>Vertragserfüllung:</b> um den Dienst bereitzustellen, den Sie oder Ihr Unternehmen angefordert haben.",
            "<b>Berechtigte Interessen:</b> um den Dienst sicher zu halten, Missbrauch zu verhindern und verlässliche Aufzeichnungen zu führen. Darauf stützen wir uns nur, wenn Ihre Rechte diese Interessen nicht überwiegen.",
            "<b>Rechtliche Verpflichtungen:</b> wenn ein Gesetz uns verpflichtet, Daten aufzubewahren oder offenzulegen.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Öffentliche Blockchain-Daten",
      blocks: [
        "Zahlungen und Rückerstattungen sind Transaktionen auf einer öffentlichen Blockchain. Die Wallet-Adressen, Beträge und Zeitpunkte dieser Transaktionen sind für jeden einsehbar und können weder von uns noch von anderen geändert oder gelöscht werden.",
        "PayFix schreibt keine Namen, E-Mail-Adressen oder Rechnungsdetails auf die Blockchain. Es fügt Zahlungsanforderungen lediglich einen zufälligen Referenzschlüssel und Rückerstattungen eine Erstattungsnummer hinzu.",
      ],
    },
    {
      id: "sharing",
      heading: "Wer Ihre Daten erhält",
      blocks: [
        "Wir geben Daten nur an die Dienstleister weiter, die wir für den Betrieb von PayFix benötigen:",
        {
          list: [
            "<b>Hosting- und Datenbankanbieter</b>, die die Anwendung betreiben und ihre Daten speichern. Die öffentliche Demo nutzt Vercel für das Hosting und Neon für die Datenbank.",
            "<b>Resend</b>, das unsere E-Mails zustellt. Resend erhält die Empfängeradresse und den Inhalt jeder E-Mail.",
            "<b>Anbieter des Solana-Netzwerks (RPC-Knoten)</b>, die Ihr Browser und unser Server kontaktieren, um Transaktionen zu lesen und zu senden. Sie können Ihre IP-Adresse und die abgefragten Wallet-Adressen sehen.",
            "<b>Wallet-Apps</b>, die Sie selbst verbinden, etwa Phantom oder Solflare. Sie verarbeiten Daten nach ihren eigenen Datenschutzrichtlinien.",
          ],
        },
        "Innerhalb von PayFix können die Mitglieder eines Unternehmens dessen Kunden, Rechnungen, Zahlungen und Aktivitäten sehen. Ein Kunde sieht nur den Fall und die Rechnungen, die mit seinem eigenen Klärungslink verknüpft sind.",
        "Außerdem können wir Daten offenlegen, wenn das Gesetz es verlangt oder um die Rechte und die Sicherheit der Nutzer und des Dienstes zu schützen.",
      ],
    },
    {
      id: "international-transfers",
      heading: "Internationale Datenübermittlungen",
      blocks: [
        "Unsere Dienstleister können Daten in anderen Ländern als Ihrem verarbeiten, auch in den Vereinigten Staaten. Soweit das Datenschutzrecht für solche Übermittlungen Garantien verlangt, stützen wir uns auf die Garantien, die die Anbieter bereitstellen, etwa Standardvertragsklauseln.",
      ],
    },
    {
      id: "retention",
      heading: "Wie lange wir Daten speichern",
      blocks: [
        {
          list: [
            "Anmeldecodes sind 10 Minuten gültig und können nur einmal verwendet werden.",
            "Sitzungen enden nach 7 Tagen oder früher, wenn Sie sich abmelden.",
            "Klärungslinks laufen nach 7 Tagen ab oder früher, wenn das Unternehmen sie ersetzt oder widerruft.",
            "Datensätze zur Ratenbegrenzung werden in der Regel nach etwa zwei Tagen gelöscht.",
            "Feedback-Antworten bewahren wir auf, solange wir den Test auswerten, und löschen sie zusammen mit der Testbereitstellung oder früher, wenn Sie uns darum bitten.",
            "Nach der Zustellung einer E-Mail wird der darin enthaltene Link aus unserem E-Mail-Protokoll entfernt. Im Demo-Modus werden E-Mails nicht versendet: Sie bleiben in der Datenbank und werden nur im Demo-Postfach angezeigt.",
            "Konto-, Unternehmens-, Rechnungs-, Zahlungs- und Aktivitätsdaten werden aufbewahrt, solange das Konto oder das Unternehmen besteht, da Zahlungsaufzeichnungen vollständig bleiben müssen. Im Demo-Modus können Inhaber die Daten ihres Unternehmens jederzeit zurücksetzen.",
            "Serverprotokolle werden von unserem Hosting-Anbieter für eine begrenzte Zeit aufbewahrt. Im Demo-Modus enthalten diese Protokolle auch die E-Mail-Adressen, für die Anmeldecodes angefordert werden, sowie die Codes selbst.",
          ],
        },
        "Testinstanzen von PayFix können zurückgesetzt oder abgeschaltet werden, wodurch ihre Daten gelöscht werden. Daten auf der öffentlichen Blockchain sind dauerhaft.",
      ],
    },
    {
      id: "security",
      heading: "Sicherheit",
      blocks: [
        "Wir schützen Ihre Daten mit Maßnahmen wie gehashten Codes und Sitzungstoken, Cookies, die Skripte nicht lesen können, verschlüsselten Verbindungen, Rollenprüfungen bei jeder Änderung und Ratenbegrenzungen. Unsere Seite „Sicherheit“ beschreibt diese Maßnahmen ausführlicher. Kein System ist vollkommen sicher; bitte melden Sie uns daher jede Schwachstelle, die Sie finden.",
      ],
    },
    {
      id: "your-rights",
      heading: "Ihre Rechte",
      blocks: [
        "Je nachdem, wo Sie leben, haben Sie möglicherweise das Recht,",
        {
          list: [
            "Auskunft über die personenbezogenen Daten zu erhalten, die wir über Sie gespeichert haben, und eine Kopie davon zu bekommen;",
            "unrichtige oder unvollständige Daten berichtigen zu lassen;",
            "die Löschung Ihrer Daten zu verlangen;",
            "eine Einschränkung der Verwendung Ihrer Daten zu verlangen oder ihrer Verwendung zu widersprechen;",
            "Ihre Daten in einem strukturierten, maschinenlesbaren Format zu erhalten (Datenübertragbarkeit);",
            "sich bei einer Datenschutzaufsichtsbehörde zu beschweren, insbesondere in dem Land, in dem Sie leben oder arbeiten.",
          ],
        },
        "Um diese Rechte auszuüben, kontaktieren Sie uns. {contact} Bevor wir eine Anfrage bearbeiten, können wir Sie bitten zu bestätigen, dass die E-Mail-Adresse Ihnen gehört. Daten auf der öffentlichen Blockchain können wir nicht löschen oder ändern, und wir können Aufzeichnungen aufbewahren, die wir benötigen, um Zahlungsaufzeichnungen vollständig zu halten oder rechtliche Pflichten zu erfüllen.",
      ],
    },
    {
      id: "children",
      heading: "Kinder",
      blocks: ["PayFix ist ein Werkzeug für Unternehmen und nicht für Kinder bestimmt. Nutzen Sie es nicht, wenn Sie jünger als 18 Jahre sind."],
    },
    {
      id: "changes",
      heading: "Änderungen dieser Erklärung",
      blocks: [
        "Wir können diese Erklärung aktualisieren, wenn sich der Dienst oder die Rechtslage ändert. Das Datum oben auf dieser Seite zeigt, wann sie zuletzt aktualisiert wurde. Bei wesentlichen Änderungen weisen wir auf dieser Seite deutlich darauf hin.",
      ],
    },
  ],
};

export default privacy;
