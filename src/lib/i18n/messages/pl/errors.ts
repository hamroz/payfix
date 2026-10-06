import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "Najpierw się zaloguj.",
  invalidEmail: "Podaj prawidłowy adres e-mail.",
  emailSendFailed: "Nie udało się teraz wysłać e-maila. Spróbuj ponownie za minutę.",
  codeExpired: "Ten kod wygasł. Wyślij nowy.",
  codeTooManyAttempts: "Zbyt wiele prób. Wyślij nowy kod.",
  codeWrong: "Ten kod jest nieprawidłowy. Sprawdź go i spróbuj ponownie.",
  rateCodes: "Na ten adres wysłano zbyt wiele kodów. Odczekaj 15 minut i spróbuj ponownie.",
  rateCodesDay: "Na ten adres wysłano dziś zbyt wiele kodów. Spróbuj ponownie jutro.",
  rateSignInNetwork: "Zbyt wiele prób logowania z tej sieci. Spróbuj ponownie za godzinę.",

  // Workspaces and team
  companyNameRequired: "Podaj nazwę firmy.",
  noTestToken: "W tym wdrożeniu nie skonfigurowano tokena testowego.",
  notMemberOfThatCompany: "Nie należysz do tamtej firmy.",
  notMemberOfThisCompany: "Nie należysz do tej firmy.",
  roleForbidden: "Twoja rola ({role}) nie pozwala na to działanie. Poproś właściciela o dostęp.",
  alreadyOnTeam: "Ta osoba jest już w zespole.",
  notOnTeam: "Tej osoby nie ma w zespole.",
  lastOwner: "Firma musi mieć co najmniej jednego właściciela.",
  resetDemoOnly: "Reset jest dostępny tylko w trybie demo.",
  rateDemoCompanies: "Masz już dziś kilka nowych firm demo. Wybierz jedną z nich w menu firm albo spróbuj ponownie jutro.",
  rateDemoCompaniesGlobal: "Wiele osób testuje teraz demo. Spróbuj ponownie za kilka minut.",

  // Customers and invoices
  customerNameRequired: "Podaj nazwę klienta.",
  customerEmailExists: "Klient z tym adresem e-mail już istnieje.",
  customerNotFound: "Nie znaleziono klienta",
  chooseCustomer: "Wybierz klienta.",
  invoiceAmountPositive: "Kwota musi być większa od zera.",
  invoiceTitleRequired: "Opisz, za co jest ta faktura.",
  invoiceAmountFormat: "Podaj kwotę w formacie 1000 lub 49,99.",
  invoiceAmountMax: "Kwota faktury nie może przekraczać $1,000,000,000.",
  dueDateRequired: "Wybierz termin płatności.",
  invoiceNotFound: "Nie znaleziono faktury.",
  paymentAmountPositive: "Podaj kwotę większą od zera.",
  paymentAmountFormat: "Podaj kwotę w formacie 400 lub 49,99.",
  noCreditLeft: "Temu klientowi nie zostało już saldo.",
  invoiceAlreadyPaid: "Ta faktura jest już opłacona.",

  // Notifications
  notificationNotFound: "Nie znaleziono powiadomienia.",
  chooseNotificationCategories: "Wybierz kategorie powiadomień.",
  unknownNotificationCategory: "Nieznana kategoria powiadomień: {categories}",

  // Wallets
  invalidWalletAddress: "To nie jest prawidłowy adres portfela Solana.",
  receivingWalletRequired: "Podaj adres portfela Solana, na który mają trafiać płatności.",
  walletProofRequired: "Połącz portfel i podpisz wiadomość, aby potwierdzić, że należy do Ciebie.",
  walletProofStale: "Ten podpis dotyczy innego portfela lub wygasł. Podpisz ponownie.",
  walletSignatureMismatch: "Podpis nie pasuje do tego portfela.",
  walletAlreadyAdded: "Ten portfel jest już dodany.",
  walletAddBeforeActivating: "Dodaj portfel, zanim ustawisz go jako aktywny.",
  walletActiveCantRemove: "Zanim usuniesz ten portfel, ustaw jako aktywny inny.",
  walletHasPayments: "Ten portfel otrzymywał płatności, więc PayFix nadal go obserwuje. Nie można go usunąć.",

  // Resolution links and cases
  linkInvalid: "Ten link jest nieprawidłowy.",
  linkReplaced: "Ten link został zastąpiony nowszym. Najnowszy znajdziesz w swojej skrzynce e-mail.",
  linkExpired: "Ten link wygasł. Poproś firmę o nowy.",
  verifyEmailToContinue: "Aby kontynuować, zweryfikuj adres e-mail.",
  caseNotFound: "Nie znaleziono sprawy",
  onlyOpenUnmatchedAssignable: "Przypisać można tylko otwarte, nieprzypisane płatności",
  attributeCustomerFirst: "Najpierw przypisz tę płatność do klienta",
  caseAlreadyResolved: "Ta sprawa jest już rozwiązana",
  cantChangeCase: "Nie możesz zmienić tej sprawy",
  planAlreadyRunning: "Ten plan jest już wykonywany",
  confirmRefundWallet: "Przed wysłaniem potwierdź portfel do zwrotu, podpisując nim wiadomość.",
  tellCustomerWhatToChange: "Napisz klientowi, co ma zmienić.",
  newerVersionReview: "Istnieje nowsza wersja tego planu. Najpierw ją sprawdź.",
  newerVersionApprove: "Istnieje nowsza wersja tego planu. Sprawdź ją przed zatwierdzeniem.",
  versionAlready: "Wersja {version} ma już status: {status}.",
  planIntegrityFailed: "Kontrola integralności planu nie powiodła się",
  planNeedsApproval: "Zanim plan zostanie wykonany, jego bieżąca wersja musi zostać zatwierdzona.",
  currentVersionNotApproved: "Bieżąca wersja nie jest zatwierdzona.",
  approvalMismatch: "Zatwierdzenie nie odpowiada bieżącemu planowi.",
  unresolvedChanged: "Kwota niewyjaśniona zmieniła się z {from} na {to}. Poproś o poprawiony plan.",
  invoiceNoRoom: "Na fakturze {number} nie ma już miejsca na {amount}. Poproś o poprawiony plan.",
  someInvoiceNoRoom: "Na jednej z faktur nie ma już miejsca na {amount}. Poproś o poprawiony plan.",
  notEnoughUnresolved: "Za mało niewyjaśnionych środków",

  // Proposal validation
  allocationAmountPositive: "Każde przypisanie musi mieć kwotę większą od zera.",
  allocationRequired: "Dodaj co najmniej jedno przypisanie.",
  invoiceNotOpenForCustomer: "Ta faktura nie jest otwarta dla tego klienta.",
  invoiceOnlyHasRemaining: "Na fakturze {number} pozostało tylko {remaining}.",
  invoiceOnce: "Każda faktura może wystąpić tylko raz.",
  singleCreditLine: "Użyj jednej pozycji salda.",
  singleRefundLine: "Użyj jednej pozycji zwrotu.",
  refundNeedsDestination: "Zwrot wymaga portfela docelowego.",
  refundDestinationInvalid: "Portfel docelowy zwrotu nie jest prawidłowym adresem.",
  overAllocated: "To o {over} więcej niż dostępne {available}.",
  stillUnallocated: "Nadal nierozdzielone: {amount}.",

  // Refunds
  refundNotFound: "Nie znaleziono zwrotu",
  refundAlreadyConfirmed: "Ten zwrot jest już potwierdzony.",
  refundInFlight: "Transakcja zwrotu jest już w drodze. Poczekaj, aż zostanie potwierdzona lub wygaśnie.",
  refundAttemptNotFound: "Nie znaleziono próby zwrotu",
  attemptAlready: "Ta próba ma już status: {status}.",
  signedTxMismatch: "Podpisana transakcja nie odpowiada przygotowanemu zwrotowi.",
  txNotSignedByBusiness: "Transakcja nie jest podpisana portfelem firmy.",
  attemptAlreadySubmitted: "Ta próba została już wysłana.",
  refundInsufficientFunds: "Zwrot nie został wysłany: w portfelu firmy brakuje środków lub SOL na opłaty. Nic nie zostało przesłane — doładuj portfel i podpisz ponownie.",
  refundRejected: "Sieć odrzuciła zwrot, więc nic nie zostało przesłane. Możesz podpisać go ponownie.",

  // Demo mode and faucet
  demoPaymentsOnly: "Płatności demo są dostępne tylko w trybie demo.",
  demoWalletsOnly: "Portfele demo są dostępne tylko w trybie demo.",
  demoOutOfSol: "W demo skończyły się SOL z sieci devnet dla nowych portfeli. Spróbuj ponownie później.",
  demoCustomerTooPoor:
    "Portfel demo klienta ma tylko {balance} testowych USD i przy jednej płatności doładowuje się maksymalnie do {limit}, więc nie zapłaci {amount}. Zapłać mniejszą kwotę.",
  walletKeyNotHeld: "PayFix nie przechowuje klucza tego portfela. Podpisz zwrot w tym portfelu.",
  faucetDemoOnly: "Kranik jest dostępny tylko w trybie demo.",
  faucetReceivingWallet: "To portfel odbiorczy firmy. Testowe USD wysłane na ten adres pojawiłyby się jako nieprzypisana płatność — użyj portfela klienta.",
  faucetPlenty: "Ten portfel ma już wystarczająco dużo testowych USD.",
  rateFaucetWallet: "Ten portfel przed chwilą otrzymał testowe USD. Spróbuj ponownie za 10 minut.",
  rateFaucetWalletDay: "Ten portfel osiągnął dzisiejszy limit testowych USD.",
  rateFaucetNetwork: "Zbyt wiele żądań do kranika z tej sieci. Spróbuj ponownie za godzinę.",
  rateFaucetGlobal: "Kranik jest teraz przeciążony. Spróbuj ponownie za kilka minut.",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "przygotowana",
    submitted: "wysłana",
    approved: "zatwierdzona",
    superseded: "zastąpiona",
    declined: "odrzucona",
    executed: "wykonana",
    confirmed: "potwierdzona",
    expired: "wygasła",
    failed: "nieudana",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "W portfelu brakuje środków. Zapłać mniejszą kwotę albo doładuj portfel kranikiem w Ustawieniach.",
    expired: "Sieć zbyt długo potwierdzała transakcję. Nic nie zostało pobrane — spróbuj ponownie.",
    busy: "Sieć Solana devnet jest teraz przeciążona. Odczekaj kilka sekund i spróbuj ponownie.",
    unreachable: "Nie udało się połączyć z siecią. Za chwilę sprawdź status transakcji, a potem spróbuj ponownie.",
    generic: "Coś poszło nie tak. Spróbuj ponownie — jeśli problem się powtarza, odśwież stronę.",
  },

  // Route handlers
  exportSignIn: "Najpierw się zaloguj",
};

export default errors;
