import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Cookie-Richtlinie",
  description: "Die wenigen Cookies und Browser-Speichereinträge, die PayFix verwendet, wozu sie dienen und wie lange sie bestehen. Keine Analyse- oder Werbe-Cookies.",
  updated: "2026-10-05",
  intro: [
    "Diese Richtlinie erklärt, welche Cookies und ähnlichen Browser-Speicher PayFix verwendet und warum. Kurz gesagt: PayFix verwendet nur, was nötig ist, um Sie anzumelden und sich Ihre Entscheidungen zu merken. Es verwendet keine Analyse-, Werbe- oder Tracking-Cookies.",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "Was Cookies und lokaler Speicher sind",
      blocks: [
        "Ein Cookie ist ein kleines Textstück, das eine Website in Ihrem Browser speichern lässt und bei späteren Besuchen zurückerhält. Der lokale Speicher (Local Storage) ist eine ähnliche Funktion, mit der eine Website kleine Werte in Ihrem Browser ablegen kann. Beides sind keine Programme, und keines von beiden kann andere Dateien auf Ihrem Gerät lesen.",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "Welche Cookies wir verwenden",
      blocks: [
        "Alle diese Cookies setzt PayFix selbst (Erstanbieter-Cookies). Keines davon wird mit anderen Websites geteilt.",
        {
          list: [
            "<b>pf_b</b> hält Sie in Ihrem Unternehmenskonto angemeldet. Es enthält ein zufälliges Sitzungstoken und läuft nach 7 Tagen ab oder wenn Sie sich abmelden.",
            "<b>pf_c</b> hält Sie als Kunde auf einem Klärungslink bestätigt, nachdem Sie den Code eingegeben haben, den wir Ihnen per E-Mail geschickt haben. Es enthält ein zufälliges Sitzungstoken und läuft nach 7 Tagen ab.",
            "<b>pf_ws</b> merkt sich, in welchem Unternehmen Sie gerade arbeiten, falls Sie mehreren angehören. Es enthält die interne ID des Unternehmens und läuft nach 30 Tagen ab.",
            "<b>pf_inbox</b> wird nur im Demo-Modus verwendet. Es merkt sich die E-Mail-Adresse (und bei Kunden das Unternehmen), für die Sie einen Anmeldecode angefordert haben, damit das Demo-Postfach Ihre Nachrichten anzeigt und keine fremden. Es läuft nach 1 Tag ab.",
            "<b>pf-locale</b> merkt sich die von Ihnen gewählte Sprache. Es wird nur gesetzt, wenn Sie eine Sprache auswählen, und läuft nach 1 Jahr ab. Ohne dieses Cookie verwendet PayFix die Sprache Ihres Browsers.",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Welchen lokalen Speicher wir verwenden",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> merkt sich, ob Sie das helle Design, das dunkle Design oder Ihre Systemeinstellung gewählt haben. Der Eintrag wird nur gesetzt, wenn Sie das Design ändern, und bleibt bestehen, bis Sie ihn löschen.",
            "<b>walletName</b> merkt sich, welches Browser-Wallet (zum Beispiel Phantom oder Solflare) Sie auf einer Zahlungs-, Klärungs- oder Einstellungsseite verbunden haben, damit sich die Seite beim nächsten Mal wieder damit verbinden kann. Der Eintrag bleibt bestehen, bis Sie ihn löschen oder die Verbindung trennen.",
          ],
        },
        "Ihre Wallet-App kann ebenfalls Daten in Ihrem Browser speichern. Dafür gelten deren eigene Richtlinien, nicht unsere.",
      ],
    },
    {
      id: "no-tracking",
      heading: "Keine Analyse und keine Werbung",
      blocks: [
        "PayFix verwendet keine Analyse-Tools, Werbenetzwerke, Social-Media-Plug-ins oder Tracking-Pixel. Unsere Schriftarten werden von unserer eigenen Website ausgeliefert, sodass beim Laden einer Seite keine anderen Schriftartdienste kontaktiert werden.",
        "Einige Links führen zu anderen Websites, etwa zum Solana Explorer oder zu einem Wallet-Anbieter. Diese Websites können nach ihren eigenen Richtlinien eigene Cookies setzen.",
      ],
    },
    {
      id: "why-no-banner",
      heading: "Warum wir nicht um Einwilligung bitten",
      blocks: [
        "Die Sitzungs-, Unternehmens- und Demo-Postfach-Cookies sind für den von Ihnen angeforderten Dienst unbedingt erforderlich: Ohne sie könnten Sie nicht angemeldet bleiben. Die Sprach- und Designeinstellungen werden nur gespeichert, wenn Sie sie wählen, um sich diese Wahl zu merken. Da wir keine anderen Cookies oder Speicher verwenden, zeigen wir kein Cookie-Banner an.",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "Wie wir Cookies schützen",
      blocks: [
        {
          list: [
            "Die Sitzungs-, Unternehmens- und Demo-Postfach-Cookies sind als HttpOnly gekennzeichnet, sodass Skripte auf der Seite sie nicht lesen können.",
            "Auf sicheren (HTTPS-)Websites sind Cookies als Secure gekennzeichnet und werden daher nur über verschlüsselte Verbindungen gesendet.",
            "Cookies verwenden die Einstellung SameSite=Lax, die verhindert, dass die meisten Anfragen von anderen Websites sie nutzen.",
            "Unser Server speichert nur einen Hash jedes Sitzungstokens, sodass sich mit einer Kopie unserer Datenbank niemand als Sie anmelden kann.",
          ],
        },
        "Das Sprach-Cookie ist nicht HttpOnly, weil das Sprachmenü es ausliest. Es enthält nur einen Sprachcode.",
      ],
    },
    {
      id: "managing",
      heading: "Wie Sie sie verwalten oder löschen",
      blocks: [
        "Sie können Cookies und lokalen Speicher in den Einstellungen Ihres Browsers einsehen und löschen, meist unter „Datenschutz“ oder „Websitedaten“. Sie können Cookies für diese Website auch blockieren.",
        "Wenn Sie die Sitzungs-Cookies löschen oder blockieren, werden Sie abgemeldet und können sich erst wieder anmelden, wenn Sie sie zulassen. Wenn Sie die Sprach- oder Designeinstellungen löschen, verwendet PayFix wieder die Sprache Ihres Browsers und das Design Ihres Systems.",
      ],
    },
    {
      id: "changes",
      heading: "Änderungen dieser Richtlinie",
      blocks: [
        "Wenn wir ein Cookie hinzufügen, ändern oder entfernen, aktualisieren wir diese Seite und das Datum oben. Bei Fragen kontaktieren Sie uns. {contact}",
      ],
    },
  ],
};

export default cookies;
