import type { LegalDoc } from "../types";

const security: LegalDoc = {
  title: "Sicherheit",
  description: "Wie PayFix Zahlungen, Freigaben, Rückerstattungen und Konten schützt und wie Sie eine Schwachstelle melden.",
  updated: "2026-10-05",
  intro: [
    "PayFix kümmert sich um den Moment, in dem bei einer Zahlung etwas schiefgeht – deshalb ist es so gebaut, dass jeder Schritt überprüfbar ist. Diese Seite erklärt, wie PayFix Zahlungen, Freigaben, Rückerstattungen und Konten schützt und wie Sie uns ein Sicherheitsproblem melden können.",
    "PayFix ist ein Hackathon-Prototyp, der ausschließlich in Testnetzen mit Test-Token läuft. Er wurde keinem unabhängigen Sicherheitsaudit unterzogen. Verwenden Sie ihn nicht für echtes Geld.",
  ],
  sections: [
    {
      id: "payments",
      heading: "Zahlungen werden verifiziert und nur einmal gezählt",
      blocks: [
        {
          list: [
            "PayFix prüft jeden eingehenden Transfer direkt auf der Blockchain: den Token, das Empfangskonto, den Betrag und ob die Transaktion bestätigt ist. Der Betrag ergibt sich aus den Kontoständen vor und nach der Transaktion; fehlgeschlagene Transaktionen werden ignoriert.",
            "Jede Transaktionssignatur wird genau einmal erfasst, und zwar in derselben Datenbanktransaktion, in der die Zahlung gezählt wird. Erneutes Synchronisieren, Wiederholungen oder ein Neustart des Servers können dieselbe Zahlung nicht doppelt zählen.",
            "Ein Transfer ohne Zahlungsreferenz wird nie automatisch einer Rechnung zugeordnet. Er bleibt nicht zugeordnet, bis das Unternehmen ihn zuweist und der Kunde den Plan bestätigt.",
          ],
        },
      ],
    },
    {
      id: "ledger",
      heading: "Ein ausgeglichenes Hauptbuch",
      blocks: [
        "Jeder Betrag wird in einem Hauptbuch mit doppelter Buchführung erfasst, in exakten ganzen Token-Einheiten ohne Rundung. Jede Buchung ergibt in Summe null und hat einen eindeutigen Schlüssel, sodass die doppelte Verarbeitung desselben Ereignisses keine Wirkung hat. Zu jedem Zeitpunkt entspricht die erhaltene Gesamtsumme den Beträgen, die auf Rechnungen verrechnet, als Guthaben behalten, erstattet, zur Erstattung vorgemerkt oder noch nicht geklärt sind.",
      ],
    },
    {
      id: "approvals",
      heading: "Freigaben sind an den exakten Plan gebunden",
      blocks: [
        {
          list: [
            "Jede Version eines Klärungsplans ist unveränderlich, sobald sie eingereicht wurde. Jede Änderung erzeugt eine neue Version.",
            "Eine Freigabe bezieht sich auf einen SHA-256-Hash des Plans: den Fall, die Version, den verfügbaren Betrag, jede Zuordnung und das Erstattungsziel. Ändert sich eines davon, gilt die frühere Freigabe nicht mehr.",
            "Bevor ein Plan ausgeführt wird, prüft PayFix den Hash, die aktuelle Version, den noch verfügbaren Betrag und den Restbetrag jeder Rechnung.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Rückerstattungen werden vorbereitet, geprüft und nur einmal gesendet",
      blocks: [
        {
          list: [
            "Der Kunde weist nach, dass er das Erstattungs-Wallet kontrolliert, indem er damit eine Nachricht signiert. Das fängt auch Tippfehler und Adressen ab, von denen aus der Kunde nicht signieren kann.",
            "PayFix bereitet die exakte Erstattungstransaktion vor, und das Unternehmen signiert sie in seinem eigenen Wallet. Anschließend prüft PayFix, ob die signierte Transaktion mit der vorbereiteten übereinstimmt.",
            "PayFix speichert die Transaktionssignatur, bevor es die Transaktion an das Netzwerk sendet.",
            "Es kann immer nur ein Erstattungsversuch gleichzeitig laufen; das erzwingt die Datenbank. Ein neuer Versuch ist erst zulässig, wenn der vorherige abgelaufen ist, ohne die Blockchain zu erreichen, oder fehlgeschlagen ist.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Wallets und Schlüssel",
      blocks: [
        {
          list: [
            "Ein Unternehmen kann ein Empfangs-Wallet nur hinzufügen, indem es damit eine Nachricht signiert. So kann eine vertippte Adresse keine Kundenzahlungen empfangen.",
            "PayFix fragt nie nach dem privaten Schlüssel oder der Wiederherstellungsphrase eines Wallets.",
            "Im Demo-Modus sind die Demo-Wallets Testschlüssel, die der Server verschlüsselt verwahrt, damit die Demo ohne Wallet-App funktioniert. Senden Sie niemals echtes Geld an sie.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      heading: "Konten und Zugriff",
      blocks: [
        {
          list: [
            "Sie melden sich mit einem 6-stelligen Code an, der an Ihre E-Mail-Adresse gesendet wird. Ein Code ist 10 Minuten gültig, kann einmal verwendet werden und erlaubt höchstens 5 Versuche. Wir speichern davon nur einen schlüsselgebundenen Hash.",
            "Sitzungstoken sind zufällig, werden auf unserem Server nur als Hash gespeichert und laufen nach 7 Tagen ab. Sie liegen in Cookies, die Skripte nicht lesen können und die auf sicheren Websites nur über verschlüsselte Verbindungen gesendet werden.",
            "Klärungslinks enthalten ein zufälliges Token, das wir nur als Hash speichern. Ein Link läuft nach 7 Tagen ab, und das Unternehmen kann ihn ersetzen oder widerrufen.",
            "Ein Kunde kann nur in dem Fall handeln, zu dem sein eigener Link gehört. Das wird bei jeder Aktion erneut geprüft.",
            "Teamrollen (Inhaber, Bearbeiter, Betrachter) werden bei jeder Änderung auf dem Server geprüft, und wichtige Aktionen werden im Aktivitätsprotokoll des Unternehmens festgehalten.",
          ],
        },
      ],
    },
    {
      id: "abuse",
      heading: "Ratenbegrenzung",
      blocks: [
        "PayFix begrenzt, wie viele Anmeldecodes an eine E-Mail-Adresse gesendet werden können (5 alle 15 Minuten und 20 pro Tag) und wie viele aus einem Netzwerk angefordert werden können (30 pro Stunde). Der Test-Token-Faucet hat Limits pro Wallet, pro Netzwerk und insgesamt. Diese Limits werden mit gehashten Kennungen gespeichert, nicht mit E-Mail-Adressen oder IP-Adressen im Klartext.",
      ],
    },
    {
      id: "web",
      heading: "Schutzmaßnahmen im Web",
      blocks: [
        {
          list: [
            "Strict Transport Security weist Browser an, ausschließlich verschlüsselte (HTTPS-)Verbindungen zu verwenden.",
            "Andere Websites können PayFix-Seiten nicht in einem Frame anzeigen. Das schützt Zahlungs- und Freigabeseiten vor Clickjacking.",
            "Browser werden angewiesen, Dateitypen nicht zu erraten und nur eingeschränkte Referrer-Informationen an andere Websites zu senden.",
            "Der Zugriff auf Kamera, Mikrofon und Standort ist deaktiviert.",
            "Geheimnisse wie E-Mail- und Datenbankschlüssel bleiben auf dem Server und werden nie an den Browser gesendet.",
          ],
        },
      ],
    },
    {
      id: "on-chain-privacy",
      heading: "Private Angaben bleiben von der Blockchain fern",
      blocks: [
        "Auf die Blockchain werden nur ein zufälliger Referenzschlüssel und eine Erstattungsnummer geschrieben. Namen, E-Mail-Adressen und Rechnungsdetails bleiben in der PayFix-Datenbank.",
      ],
    },
    {
      id: "limits",
      heading: "Bekannte Grenzen",
      blocks: [
        "PayFix sieht nur Zahlungen an die Empfangs-Wallets des Unternehmens und Rückerstattungen, die es selbst vorbereitet. Rückerstattungen, die direkt aus einem Wallet außerhalb der App gesendet werden, kann es weder sehen noch verhindern.",
      ],
    },
    {
      id: "staying-safe",
      heading: "So schützen Sie sich",
      blocks: [
        {
          list: [
            "Schützen Sie Ihr E-Mail-Konto, denn dorthin werden die Anmeldecodes gesendet.",
            "Prüfen Sie die Adresse der Website, bevor Sie einen Code eingeben oder etwas signieren.",
            "Lesen Sie jede Transaktion in Ihrem Wallet, bevor Sie sie signieren.",
            "Geben Sie Ihren privaten Schlüssel oder Ihre Wiederherstellungsphrase niemals weiter. PayFix wird nie danach fragen.",
            "Melden Sie sich auf gemeinsam genutzten Geräten ab.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      heading: "Eine Schwachstelle melden",
      blocks: [
        "Wenn Sie glauben, ein Sicherheitsproblem in PayFix gefunden zu haben, teilen Sie es uns bitte vertraulich mit. {contact}",
        "Bitte beschreiben Sie das Problem, die Schritte zur Reproduktion, die betroffene Seite oder Funktion und die erwarteten Auswirkungen.",
        "Wenn Sie zu Sicherheitsproblemen forschen, bitten wir Sie,",
        {
          list: [
            "nur Ihre eigenen Konten und Testdaten zu verwenden;",
            "nicht auf Daten anderer Personen zuzugreifen, diese nicht zu ändern oder zu löschen und sofort aufzuhören, sobald Sie solche Daten sehen;",
            "keine Denial-of-Service-Angriffe durchzuführen, keinen Spam zu versenden und kein Social Engineering einzusetzen;",
            "den Test-Token-Faucet und die Demo-Wallets nur so weit zu nutzen, wie es nötig ist, um das Problem zu zeigen;",
            "uns angemessen Zeit zur Behebung des Problems zu geben, bevor Sie Details veröffentlichen.",
          ],
        },
        "Im Gegenzug bestätigen wir den Eingang Ihrer Meldung, halten Sie über unsere Fortschritte auf dem Laufenden und nennen Sie auf Wunsch namentlich. Gegen in gutem Glauben durchgeführte Forschung, die diese Regeln einhält, werden wir keine rechtlichen Schritte einleiten. Wir zahlen keine Prämien.",
        "Probleme in Diensten, die wir nicht kontrollieren – etwa dem Solana-Netzwerk, Wallet-Apps oder unseren Hosting- und E-Mail-Anbietern –, melden Sie bitte direkt diesen Anbietern.",
      ],
    },
  ],
};

export default security;
