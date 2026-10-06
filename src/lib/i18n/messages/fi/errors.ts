import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "Kirjaudu ensin sisään.",
  invalidEmail: "Anna kelvollinen sähköpostiosoite.",
  emailSendFailed: "Sähköpostia ei juuri nyt voitu lähettää. Yritä uudelleen hetken kuluttua.",
  adminEmailUnavailable: "Ylläpidon kirjautuminen vaatii oikean sähköpostin, eikä sitä ole otettu käyttöön tässä asennuksessa.",
  codeExpired: "Koodi on vanhentunut. Pyydä uusi koodi.",
  codeTooManyAttempts: "Liian monta yritystä. Pyydä uusi koodi.",
  codeWrong: "Koodi ei ole oikein. Tarkista se ja yritä uudelleen.",
  rateCodes: "Tähän osoitteeseen on lähetetty liian monta koodia. Odota 15 minuuttia ja yritä uudelleen.",
  rateCodesDay: "Tähän osoitteeseen on lähetetty tänään liian monta koodia. Yritä uudelleen huomenna.",
  rateSignInNetwork: "Tästä verkosta on yritetty kirjautua liian monta kertaa. Yritä uudelleen tunnin kuluttua.",

  // Workspaces and team
  companyNameRequired: "Anna yrityksesi nimi.",
  noTestToken: "Tähän asennukseen ei ole määritetty testitokenia.",
  notMemberOfThatCompany: "Et ole kyseisen yrityksen jäsen.",
  notMemberOfThisCompany: "Et ole tämän yrityksen jäsen.",
  roleForbidden: "Roolisi ({role}) ei salli tätä. Pyydä käyttöoikeutta omistajalta.",
  alreadyOnTeam: "Henkilö on jo tiimissä.",
  notOnTeam: "Henkilö ei ole tiimissä.",
  lastOwner: "Yrityksellä on oltava vähintään yksi omistaja.",
  resetDemoOnly: "Nollaus on käytettävissä vain demotilassa.",
  rateDemoCompanies: "Olet luonut tänään jo useita demoyrityksiä. Käytä jotakin niistä yritysvalikosta tai yritä uudelleen huomenna.",
  rateDemoCompaniesGlobal: "Demoa kokeilee juuri nyt moni muukin. Yritä uudelleen muutaman minuutin kuluttua.",

  // Customers and invoices
  customerNameRequired: "Anna asiakkaan nimi.",
  customerEmailExists: "Asiakas tällä sähköpostiosoitteella on jo olemassa.",
  customerNotFound: "Asiakasta ei löytynyt",
  chooseCustomer: "Valitse asiakas.",
  invoiceAmountPositive: "Summan on oltava suurempi kuin nolla.",
  invoiceTitleRequired: "Kerro, mistä lasku on.",
  invoiceAmountFormat: "Anna summa muodossa 1000 tai 49,99.",
  invoiceAmountMax: "Laskun enimmäissumma on $1,000,000,000.",
  dueDateRequired: "Valitse eräpäivä.",
  invoiceNotFound: "Laskua ei löytynyt.",
  paymentAmountPositive: "Anna nollaa suurempi summa.",
  paymentAmountFormat: "Anna summa muodossa 400 tai 49,99.",
  paymentCodeInvalid: "Tämä maksukoodi ei ole voimassa. Päivitä laskusivu saadaksesi uuden.",
  paymentAccountMissing: "Lompakko ei kertonut, mikä tili maksaa. Skannaa koodi uudelleen.",
  ratePaymentNetwork: "Liian monta maksuyritystä tästä verkosta. Yritä uudelleen minuutin kuluttua.",
  noCreditLeft: "Asiakkaalla ei ole saldoa jäljellä.",
  invoiceAlreadyPaid: "Lasku on jo maksettu.",

  // Notifications
  notificationNotFound: "Ilmoitusta ei löytynyt.",
  chooseNotificationCategories: "Valitse ilmoitusluokat.",
  unknownNotificationCategory: "Tuntematon ilmoitusluokka: {categories}",

  // Wallets
  invalidWalletAddress: "Tämä ei ole kelvollinen Solana-lompakon osoite.",
  receivingWalletRequired: "Anna Solana-lompakon osoite, johon maksut ohjataan.",
  walletProofRequired: "Yhdistä lompakko ja allekirjoita viesti todistaaksesi, että lompakko on sinun.",
  walletProofStale: "Allekirjoitus on toiselle lompakolle tai se on vanhentunut. Allekirjoita uudelleen.",
  walletSignatureMismatch: "Allekirjoitus ei vastaa tätä lompakkoa.",
  walletAlreadyAdded: "Lompakko on jo lisätty.",
  walletAddBeforeActivating: "Lisää lompakko ennen kuin asetat sen aktiiviseksi.",
  walletActiveCantRemove: "Aseta toinen lompakko aktiiviseksi ennen kuin poistat tämän.",
  walletHasPayments: "Tähän lompakkoon on saapunut maksuja, joten PayFix seuraa sitä edelleen. Sitä ei voi poistaa.",

  // Resolution links and cases
  linkInvalid: "Linkki ei ole kelvollinen.",
  linkReplaced: "Linkki on korvattu uudemmalla. Tarkista uusin linkki sähköpostistasi.",
  linkExpired: "Linkki on vanhentunut. Pyydä yritystä lähettämään uusi.",
  verifyEmailToContinue: "Vahvista sähköpostiosoitteesi jatkaaksesi.",
  caseNotFound: "Tapausta ei löytynyt",
  onlyOpenUnmatchedAssignable: "Vain avoimia kohdistamattomia maksuja voi liittää asiakkaaseen",
  attributeCustomerFirst: "Liitä maksu ensin asiakkaaseen",
  caseAlreadyResolved: "Tapaus on jo ratkaistu",
  cantChangeCase: "Et voi muuttaa tätä tapausta",
  planAlreadyRunning: "Suunnitelmaa toteutetaan jo",
  confirmRefundWallet: "Vahvista palautuslompakko allekirjoittamalla sillä ennen lähettämistä.",
  tellCustomerWhatToChange: "Kerro asiakkaalle, mitä pitää muuttaa.",
  newerVersionReview: "Suunnitelmasta on uudempi versio. Tarkista se ensin.",
  newerVersionApprove: "Suunnitelmasta on uudempi versio. Tarkista se ennen hyväksymistä.",
  versionAlready: "Versio {version} on jo {status}.",
  planIntegrityFailed: "Suunnitelman eheystarkistus epäonnistui",
  planNeedsApproval: "Suunnitelman nykyinen versio on hyväksyttävä ennen toteutusta.",
  currentVersionNotApproved: "Nykyistä versiota ei ole hyväksytty.",
  approvalMismatch: "Hyväksyntä ei vastaa nykyistä suunnitelmaa.",
  unresolvedChanged: "Ratkaisematon summa muuttui: {from} → {to}. Pyydä päivitetty suunnitelma.",
  invoiceNoRoom: "Laskulle {number} ei enää mahdu {amount}. Pyydä päivitetty suunnitelma.",
  someInvoiceNoRoom: "Jollekin laskulle ei enää mahdu {amount}. Pyydä päivitetty suunnitelma.",
  notEnoughUnresolved: "Ratkaisemattomia varoja ei ole tarpeeksi",

  // Proposal validation
  allocationAmountPositive: "Jokaisen kohdistuksen summan on oltava positiivinen.",
  allocationRequired: "Lisää vähintään yksi kohdistus.",
  invoiceNotOpenForCustomer: "Lasku ei ole avoinna tälle asiakkaalle.",
  invoiceOnlyHasRemaining: "Laskulla {number} on jäljellä vain {remaining}.",
  invoiceOnce: "Kukin lasku voi esiintyä vain kerran.",
  singleCreditLine: "Käytä vain yhtä saldoriviä.",
  singleRefundLine: "Käytä vain yhtä palautusriviä.",
  refundNeedsDestination: "Palautukselle tarvitaan vastaanottava lompakko.",
  refundDestinationInvalid: "Palautuksen vastaanottajan osoite ei ole kelvollinen lompakon osoite.",
  overAllocated: "Tämä on {over} enemmän kuin käytettävissä oleva {available}.",
  stillUnallocated: "{amount} on vielä kohdistamatta.",

  // Refunds
  refundNotFound: "Palautusta ei löytynyt",
  refundAlreadyConfirmed: "Palautus on jo vahvistettu.",
  refundInFlight: "Palautustransaktio on jo matkalla. Odota, että se vahvistuu tai vanhenee.",
  refundAttemptNotFound: "Palautusyritystä ei löytynyt",
  attemptAlready: "Tämä lähetysyritys on jo {status}.",
  signedTxMismatch: "Allekirjoitettu transaktio ei vastaa valmisteltua palautusta.",
  txNotSignedByBusiness: "Yrityksen lompakko ei ole allekirjoittanut transaktiota.",
  attemptAlreadySubmitted: "Tämä lähetysyritys on jo lähetetty.",
  refundInsufficientFunds: "Palautusta ei lähetetty: yrityksen lompakossa ei ole tarpeeksi varoja tai SOLia maksuihin. Mitään ei siirtynyt – lisää varoja ja allekirjoita uudelleen.",
  refundRejected: "Verkko hylkäsi palautuksen, joten mitään ei siirtynyt. Voit allekirjoittaa sen uudelleen.",

  // Demo mode and faucet
  demoPaymentsOnly: "Demomaksut ovat käytettävissä vain demotilassa.",
  demoWalletsOnly: "Demolompakot ovat käytettävissä vain demotilassa.",
  demoOutOfSol: "Demosta on loppunut devnetin SOL uusia lompakoita varten. Yritä myöhemmin uudelleen.",
  demoCustomerTooPoor:
    "Demoasiakkaan lompakossa on vain {balance} testi-USD:tä, ja sitä täydennetään enintään {limit} maksua kohden, joten sillä ei voi maksaa summaa {amount}. Maksa pienempi summa.",
  walletKeyNotHeld: "PayFix ei säilytä tämän lompakon avainta. Allekirjoita palautus kyseisessä lompakossa.",
  faucetDemoOnly: "Faucet on käytettävissä vain demotilassa.",
  faucetReceivingWallet: "Tämä on yrityksen vastaanottolompakko. Sinne lähetetty testi-USD näkyisi kohdistamattomana maksuna, joten käytä asiakkaan lompakkoa.",
  faucetPlenty: "Tässä lompakossa on jo runsaasti testi-USD:tä.",
  rateFaucetWallet: "Tämä lompakko sai juuri testi-USD:tä. Yritä uudelleen 10 minuutin kuluttua.",
  rateFaucetWalletDay: "Tämä lompakko on saavuttanut tämän päivän testi-USD-rajan.",
  rateFaucetNetwork: "Tästä verkosta on tehty liian monta faucet-pyyntöä. Yritä uudelleen tunnin kuluttua.",
  rateFaucetGlobal: "Faucet on ruuhkautunut. Yritä uudelleen muutaman minuutin kuluttua.",
  feedbackInvalid: "Tarkista vastauksesi: jotkin puuttuvat tai ovat liian pitkiä.",
  rateFeedback: "Tästä verkosta on tullut tänään liian monta vastausta. Kiitos, saimme niitä jo runsaasti!",
  rateFeedbackGlobal: "Saamme juuri nyt paljon vastauksia. Yritä uudelleen muutaman minuutin kuluttua.",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "valmisteltu",
    submitted: "lähetetty",
    approved: "hyväksytty",
    superseded: "korvattu",
    declined: "hylätty",
    executed: "toteutettu",
    confirmed: "vahvistettu",
    expired: "vanhentunut",
    failed: "epäonnistunut",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "Lompakossa ei ole tähän tarpeeksi varoja. Maksa pienempi summa tai lisää varoja Asetusten faucetista.",
    expired: "Verkon vahvistus kesti liian kauan. Mitään ei veloitettu – yritä uudelleen.",
    busy: "Solana devnet on juuri nyt ruuhkainen. Odota muutama sekunti ja yritä uudelleen.",
    unreachable: "Verkkoon ei saatu yhteyttä. Tarkista transaktion tila hetken päästä ja yritä sitten uudelleen.",
    generic: "Jokin meni vikaan. Yritä uudelleen – jos ongelma toistuu, lataa sivu uudelleen.",
  },

  // Route handlers
  exportSignIn: "Kirjaudu ensin sisään",
};

export default errors;
