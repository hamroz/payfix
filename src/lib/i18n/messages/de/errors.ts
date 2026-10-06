import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "Bitte melden Sie sich zuerst an.",
  invalidEmail: "Geben Sie eine gültige E-Mail-Adresse ein.",
  emailSendFailed: "Die E-Mail konnte gerade nicht gesendet werden. Versuchen Sie es in einer Minute erneut.",
  adminEmailUnavailable: "Die Admin-Anmeldung braucht echten E-Mail-Versand, und der ist in dieser Bereitstellung nicht eingerichtet.",
  accountSuspended: "Dieses Konto ist gesperrt. Wenn Sie das für einen Fehler halten, wenden Sie sich an PayFix.",
  signInBlocked: "Anmeldecodes für diese Adresse sind blockiert.",
  companySuspended: "Dieses Unternehmen ist gesperrt.",
  companyUnavailable: "Das PayFix-Konto dieses Unternehmens ist gerade nicht verfügbar.",
  faucetBlocked: "Der Faucet ist für dieses Wallet blockiert.",
  cannotModerateAdmin: "Admins können hier nicht gesperrt oder blockiert werden. Entfernen Sie sie stattdessen aus ADMIN_EMAILS.",
  reasonRequired: "Geben Sie einen kurzen Grund an (bis zu 500 Zeichen). Er wird im Audit-Protokoll gespeichert.",
  adminTargetMissing: "Dieses Konto oder Unternehmen gibt es nicht mehr.",
  codeExpired: "Dieser Code ist abgelaufen. Fordern Sie einen neuen an.",
  codeTooManyAttempts: "Zu viele Versuche. Fordern Sie einen neuen Code an.",
  codeWrong: "Dieser Code stimmt nicht. Prüfen Sie ihn und versuchen Sie es erneut.",
  rateCodes: "Zu viele Codes an diese Adresse gesendet. Warten Sie 15 Minuten und versuchen Sie es dann erneut.",
  rateCodesDay: "Heute wurden zu viele Codes an diese Adresse gesendet. Versuchen Sie es morgen erneut.",
  rateSignInNetwork: "Zu viele Anmeldeversuche aus diesem Netzwerk. Versuchen Sie es in einer Stunde erneut.",

  // Workspaces and team
  companyNameRequired: "Geben Sie den Namen Ihres Unternehmens ein.",
  noTestToken: "Für diese Instanz ist kein Test-Token konfiguriert.",
  notMemberOfThatCompany: "Sie sind kein Mitglied dieses Unternehmens.",
  notMemberOfThisCompany: "Sie sind kein Mitglied dieses Unternehmens.",
  roleForbidden: "Mit Ihrer Rolle ({role}) ist das nicht möglich. Bitten Sie einen Inhaber um Zugriff.",
  alreadyOnTeam: "Diese Person ist bereits im Team.",
  notOnTeam: "Diese Person ist nicht im Team.",
  lastOwner: "Ein Unternehmen braucht mindestens einen Inhaber.",
  resetDemoOnly: "Zurücksetzen ist nur im Demo-Modus verfügbar.",
  rateDemoCompanies: "Sie haben heute schon mehrere Demo-Unternehmen angelegt. Verwenden Sie eines aus dem Unternehmensmenü, oder versuchen Sie es morgen erneut.",
  rateDemoCompaniesGlobal: "Gerade probieren sehr viele Menschen die Demo aus. Versuchen Sie es in ein paar Minuten erneut.",

  // Customers and invoices
  customerNameRequired: "Geben Sie den Namen des Kunden ein.",
  customerEmailExists: "Es gibt bereits einen Kunden mit dieser E-Mail-Adresse.",
  customerNotFound: "Kunde nicht gefunden",
  chooseCustomer: "Wählen Sie einen Kunden aus.",
  invoiceAmountPositive: "Der Betrag muss größer als null sein.",
  invoiceTitleRequired: "Beschreiben Sie, wofür diese Rechnung ist.",
  invoiceAmountFormat: "Geben Sie einen Betrag wie 1000 oder 49,99 ein.",
  invoiceAmountMax: "Rechnungen sind auf $1,000,000,000 begrenzt.",
  dueDateRequired: "Wählen Sie ein Fälligkeitsdatum.",
  invoiceNotFound: "Rechnung nicht gefunden.",
  paymentAmountPositive: "Geben Sie einen Betrag größer als null ein.",
  paymentAmountFormat: "Geben Sie einen Betrag wie 400 oder 49,99 ein.",
  noCreditLeft: "Dieser Kunde hat kein Guthaben mehr.",
  invoiceAlreadyPaid: "Diese Rechnung ist bereits bezahlt.",

  // Notifications
  notificationNotFound: "Benachrichtigung nicht gefunden.",
  chooseNotificationCategories: "Wählen Sie Benachrichtigungskategorien aus.",
  unknownNotificationCategory: "Unbekannte Benachrichtigungskategorie: {categories}",

  // Wallets
  invalidWalletAddress: "Das ist keine gültige Solana-Wallet-Adresse.",
  receivingWalletRequired: "Geben Sie die Solana-Wallet-Adresse ein, an die Zahlungen gehen sollen.",
  walletProofRequired: "Verbinden Sie das Wallet und signieren Sie die Nachricht, um zu belegen, dass es Ihnen gehört.",
  walletProofStale: "Diese Signatur gehört zu einem anderen Wallet oder ist abgelaufen. Signieren Sie erneut.",
  walletSignatureMismatch: "Die Signatur passt nicht zu diesem Wallet.",
  walletAlreadyAdded: "Dieses Wallet wurde bereits hinzugefügt.",
  walletAddBeforeActivating: "Fügen Sie das Wallet hinzu, bevor Sie es aktivieren.",
  walletActiveCantRemove: "Aktivieren Sie ein anderes Wallet, bevor Sie dieses entfernen.",
  walletHasPayments: "Dieses Wallet hat Zahlungen erhalten, daher überwacht PayFix es weiterhin. Es kann nicht entfernt werden.",

  // Resolution links and cases
  linkInvalid: "Dieser Link ist ungültig.",
  linkReplaced: "Dieser Link wurde durch einen neueren ersetzt. Den aktuellen Link finden Sie in Ihren E-Mails.",
  linkExpired: "Dieser Link ist abgelaufen. Bitten Sie das Unternehmen, einen neuen zu senden.",
  verifyEmailToContinue: "Bestätigen Sie Ihre E-Mail-Adresse, um fortzufahren.",
  caseNotFound: "Fall nicht gefunden",
  onlyOpenUnmatchedAssignable: "Nur offene, nicht zugeordnete Zahlungen können zugewiesen werden",
  attributeCustomerFirst: "Ordnen Sie diese Zahlung zuerst einem Kunden zu",
  caseAlreadyResolved: "Dieser Fall ist bereits geklärt",
  cantChangeCase: "Sie können diesen Fall nicht ändern",
  planAlreadyRunning: "Dieser Plan wird bereits ausgeführt",
  confirmRefundWallet: "Bestätigen Sie das Erstattungs-Wallet per Signatur, bevor Sie absenden.",
  tellCustomerWhatToChange: "Teilen Sie dem Kunden mit, was er ändern soll.",
  newerVersionReview: "Es gibt eine neuere Version dieses Plans. Prüfen Sie zuerst diese.",
  newerVersionApprove: "Es gibt eine neuere Version dieses Plans. Prüfen Sie sie, bevor Sie freigeben.",
  versionAlready: "Version {version} ist bereits {status}.",
  planIntegrityFailed: "Integritätsprüfung des Plans fehlgeschlagen",
  planNeedsApproval: "Die aktuelle Version dieses Plans muss freigegeben sein, bevor er ausgeführt werden kann.",
  currentVersionNotApproved: "Die aktuelle Version ist nicht freigegeben.",
  approvalMismatch: "Die Freigabe passt nicht zum aktuellen Plan.",
  unresolvedChanged: "Der ungeklärte Betrag hat sich von {from} auf {to} geändert. Fordern Sie einen überarbeiteten Plan an.",
  invoiceNoRoom: "{number} kann {amount} nicht mehr aufnehmen. Fordern Sie einen überarbeiteten Plan an.",
  someInvoiceNoRoom: "Eine Rechnung kann {amount} nicht mehr aufnehmen. Fordern Sie einen überarbeiteten Plan an.",
  notEnoughUnresolved: "Nicht genügend ungeklärte Mittel",

  // Proposal validation
  allocationAmountPositive: "Jede Zuordnung braucht einen positiven Betrag.",
  allocationRequired: "Fügen Sie mindestens eine Zuordnung hinzu.",
  invoiceNotOpenForCustomer: "Diese Rechnung ist für diesen Kunden nicht offen.",
  invoiceOnlyHasRemaining: "Auf {number} sind nur noch {remaining} offen.",
  invoiceOnce: "Jede Rechnung darf nur einmal vorkommen.",
  singleCreditLine: "Verwenden Sie nur eine Guthabenzeile.",
  singleRefundLine: "Verwenden Sie nur eine Erstattungszeile.",
  refundNeedsDestination: "Eine Rückerstattung braucht ein Ziel-Wallet.",
  refundDestinationInvalid: "Das Ziel der Rückerstattung ist keine gültige Wallet-Adresse.",
  overAllocated: "Das sind {over} mehr als die verfügbaren {available}.",
  stillUnallocated: "{amount} sind noch nicht verteilt.",

  // Refunds
  refundNotFound: "Rückerstattung nicht gefunden",
  refundAlreadyConfirmed: "Diese Rückerstattung ist bereits bestätigt.",
  refundInFlight: "Eine Erstattungstransaktion ist bereits unterwegs. Warten Sie, bis sie bestätigt wird oder abläuft.",
  refundAttemptNotFound: "Erstattungsversuch nicht gefunden",
  attemptAlready: "Dieser Versuch ist bereits {status}.",
  signedTxMismatch: "Die signierte Transaktion passt nicht zur vorbereiteten Rückerstattung.",
  txNotSignedByBusiness: "Die Transaktion ist nicht mit dem Wallet des Unternehmens signiert.",
  attemptAlreadySubmitted: "Dieser Versuch wurde bereits übermittelt.",
  refundInsufficientFunds: "Die Rückerstattung wurde nicht gesendet: Das Wallet des Unternehmens hat nicht genug Token oder SOL für die Gebühren. Es wurde nichts bewegt; laden Sie das Wallet auf und signieren Sie erneut.",
  refundRejected: "Das Netzwerk hat die Rückerstattung abgelehnt, es wurde also nichts bewegt. Sie können sie erneut signieren.",

  // Demo mode and faucet
  demoPaymentsOnly: "Demo-Zahlungen sind nur im Demo-Modus verfügbar.",
  demoWalletsOnly: "Demo-Wallets sind nur im Demo-Modus verfügbar.",
  demoOutOfSol: "Der Demo ist das Devnet-SOL für neue Wallets ausgegangen. Bitte versuchen Sie es später erneut.",
  demoCustomerTooPoor:
    "Das Wallet des Demo-Kunden enthält nur {balance} Test-USD und wird pro Zahlung auf höchstens {limit} aufgefüllt – {amount} kann es daher nicht zahlen. Zahlen Sie einen kleineren Betrag.",
  walletKeyNotHeld: "Der Schlüssel dieses Wallets liegt nicht bei PayFix. Signieren Sie die Rückerstattung in diesem Wallet.",
  faucetDemoOnly: "Der Faucet ist nur im Demo-Modus verfügbar.",
  faucetReceivingWallet: "Das ist das Empfangs-Wallet eines Unternehmens. Dorthin gesendete Test-USD würden als nicht zugeordnete Zahlung erscheinen – verwenden Sie daher ein Kunden-Wallet.",
  faucetPlenty: "Dieses Wallet hat bereits reichlich Test-USD.",
  rateFaucetWallet: "Dieses Wallet hat gerade erst Test-USD erhalten. Versuchen Sie es in 10 Minuten erneut.",
  rateFaucetWalletDay: "Dieses Wallet hat das heutige Test-USD-Limit erreicht.",
  rateFaucetNetwork: "Zu viele Faucet-Anfragen aus diesem Netzwerk. Versuchen Sie es in einer Stunde erneut.",
  rateFaucetGlobal: "Der Faucet ist gerade ausgelastet. Versuchen Sie es in ein paar Minuten erneut.",
  feedbackInvalid: "Bitte prüfen Sie Ihre Antworten: Einige fehlen oder sind zu lang.",
  rateFeedback: "Heute kamen zu viele Antworten aus diesem Netzwerk. Danke, wir haben schon reichlich!",
  rateFeedbackGlobal: "Gerade gehen sehr viele Antworten ein. Versuchen Sie es in ein paar Minuten erneut.",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "vorbereitet",
    submitted: "übermittelt",
    approved: "freigegeben",
    superseded: "ersetzt",
    declined: "abgelehnt",
    executed: "ausgeführt",
    confirmed: "bestätigt",
    expired: "abgelaufen",
    failed: "fehlgeschlagen",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "Das Wallet hat dafür nicht genug Mittel. Zahlen Sie einen kleineren Betrag, oder laden Sie es über den Faucet in den Einstellungen auf.",
    expired: "Das Netzwerk hat zu lange für die Bestätigung gebraucht. Es wurde nichts belastet – versuchen Sie es erneut.",
    busy: "Das Solana Devnet ist gerade ausgelastet. Warten Sie ein paar Sekunden und versuchen Sie es erneut.",
    unreachable: "Das Netzwerk ist nicht erreichbar. Prüfen Sie gleich den Status der Transaktion und versuchen Sie es dann erneut.",
    generic: "Etwas ist schiefgelaufen. Versuchen Sie es erneut – wenn das Problem bleibt, laden Sie die Seite neu.",
  },

  // Route handlers
  exportSignIn: "Bitte zuerst anmelden",
};

export default errors;
