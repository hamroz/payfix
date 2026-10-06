// Error messages from server actions and services, shown to the person who caused them.
const errors = {
  // Sign-in and sessions
  signInFirst: "Sign in first.",
  invalidEmail: "Enter a valid email address.",
  emailSendFailed: "We couldn’t send the email just now. Try again in a minute.",
  adminEmailUnavailable: "Admin sign-in needs real email, and it isn’t set up on this deployment.",
  codeExpired: "That code has expired. Send a new one.",
  codeTooManyAttempts: "Too many attempts. Send a new code.",
  codeWrong: "That code isn't right. Check it and try again.",
  rateCodes: "Too many codes sent to this address. Wait 15 minutes and try again.",
  rateCodesDay: "Too many codes sent to this address today. Try again tomorrow.",
  rateSignInNetwork: "Too many sign-in attempts from this network. Try again in an hour.",

  // Workspaces and team
  companyNameRequired: "Enter your company name.",
  noTestToken: "This deployment has no test token configured.",
  notMemberOfThatCompany: "You’re not a member of that company.",
  notMemberOfThisCompany: "You're not a member of this company.",
  roleForbidden: "Your role ({role}) can’t do this. Ask an owner for access.",
  alreadyOnTeam: "That person is already on the team.",
  notOnTeam: "That person isn't on the team.",
  lastOwner: "A company needs at least one owner.",
  resetDemoOnly: "Reset is only available in demo mode.",
  rateDemoCompanies: "You’ve created several demo companies today. Reuse one from the company menu, or try again tomorrow.",
  rateDemoCompaniesGlobal: "Lots of people are trying the demo right now. Try again in a few minutes.",

  // Customers and invoices
  customerNameRequired: "Enter the customer's name.",
  customerEmailExists: "A customer with that email already exists.",
  customerNotFound: "Customer not found",
  chooseCustomer: "Choose a customer.",
  invoiceAmountPositive: "The amount must be greater than zero.",
  invoiceTitleRequired: "Describe what this invoice is for.",
  invoiceAmountFormat: "Enter an amount like 1000 or 49.99.",
  invoiceAmountMax: "Invoices are limited to $1,000,000,000.",
  dueDateRequired: "Choose a due date.",
  invoiceNotFound: "Invoice not found.",
  paymentAmountPositive: "Enter an amount greater than zero.",
  paymentAmountFormat: "Enter an amount like 400 or 49.99.",
  noCreditLeft: "This customer has no credit left.",
  invoiceAlreadyPaid: "This invoice is already paid.",

  // Notifications
  notificationNotFound: "Notification not found.",
  chooseNotificationCategories: "Choose notification categories.",
  unknownNotificationCategory: "Unknown notification category: {categories}",

  // Wallets
  invalidWalletAddress: "That isn't a valid Solana wallet address.",
  receivingWalletRequired: "Enter the Solana wallet address payments should go to.",
  walletProofRequired: "Connect the wallet and sign the message to prove it’s yours.",
  walletProofStale: "That signature is for a different wallet or has expired. Sign again.",
  walletSignatureMismatch: "The signature doesn’t match this wallet.",
  walletAlreadyAdded: "That wallet is already added.",
  walletAddBeforeActivating: "Add the wallet before making it active.",
  walletActiveCantRemove: "Make another wallet active before removing this one.",
  walletHasPayments: "This wallet has received payments, so PayFix keeps watching it. It can’t be removed.",

  // Resolution links and cases
  linkInvalid: "This link isn't valid.",
  linkReplaced: "This link was replaced by a newer one. Check your email for the latest link.",
  linkExpired: "This link has expired. Ask the business to send a new one.",
  verifyEmailToContinue: "Verify your email to continue.",
  caseNotFound: "Case not found",
  onlyOpenUnmatchedAssignable: "Only open unmatched payments can be assigned",
  attributeCustomerFirst: "Attribute this payment to a customer first",
  caseAlreadyResolved: "This case is already resolved",
  cantChangeCase: "You can't change this case",
  planAlreadyRunning: "This plan is already being carried out",
  confirmRefundWallet: "Confirm the refund wallet by signing with it before submitting.",
  tellCustomerWhatToChange: "Tell the customer what to change.",
  newerVersionReview: "A newer version of this plan exists. Review it first.",
  newerVersionApprove: "A newer version of this plan exists. Review it before approving.",
  versionAlready: "Version {version} is already {status}.",
  planIntegrityFailed: "Plan integrity check failed",
  planNeedsApproval: "This plan needs an approval for its current version before it can run.",
  currentVersionNotApproved: "The current version isn't approved.",
  approvalMismatch: "The approval doesn't match the current plan.",
  unresolvedChanged: "The unresolved amount changed from {from} to {to}. Ask for a revised plan.",
  invoiceNoRoom: "{number} no longer has room for {amount}. Ask for a revised plan.",
  someInvoiceNoRoom: "An invoice no longer has room for {amount}. Ask for a revised plan.",
  notEnoughUnresolved: "Not enough unresolved funds",

  // Proposal validation
  allocationAmountPositive: "Every allocation needs a positive amount.",
  allocationRequired: "Add at least one allocation.",
  invoiceNotOpenForCustomer: "That invoice isn't open for this customer.",
  invoiceOnlyHasRemaining: "{number} only has {remaining} remaining.",
  invoiceOnce: "Each invoice can appear only once.",
  singleCreditLine: "Use a single credit line.",
  singleRefundLine: "Use a single refund line.",
  refundNeedsDestination: "A refund needs a destination wallet.",
  refundDestinationInvalid: "The refund destination isn't a valid wallet address.",
  overAllocated: "That's {over} more than the {available} available.",
  stillUnallocated: "{amount} is still unallocated.",

  // Refunds
  refundNotFound: "Refund not found",
  refundAlreadyConfirmed: "This refund is already confirmed.",
  refundInFlight: "A refund transaction is already in flight. Wait for it to confirm or expire.",
  refundAttemptNotFound: "Refund attempt not found",
  attemptAlready: "This attempt is already {status}.",
  signedTxMismatch: "The signed transaction doesn't match the prepared refund.",
  txNotSignedByBusiness: "The transaction isn't signed by the business wallet.",
  attemptAlreadySubmitted: "This attempt was already submitted.",
  refundInsufficientFunds: "The refund wasn’t sent: the business wallet doesn’t have enough funds or SOL for fees. Nothing moved; top it up and sign again.",
  refundRejected: "The network rejected the refund, so nothing moved. You can sign it again.",

  // Demo mode and faucet
  demoPaymentsOnly: "Demo payments are only available in demo mode.",
  demoWalletsOnly: "Demo wallets are only available in demo mode.",
  demoOutOfSol: "The demo has run out of devnet SOL for new wallets. Please try again later.",
  demoCustomerTooPoor:
    "The demo customer wallet only holds {balance} test USD and tops up to at most {limit} per payment, so it can’t pay {amount}. Pay a smaller amount.",
  walletKeyNotHeld: "This wallet's key isn't held by PayFix. Sign the refund in that wallet.",
  faucetDemoOnly: "The faucet is only available in demo mode.",
  faucetReceivingWallet: "That’s a company’s receiving wallet. Test USD sent there would appear as an unmatched payment, so use a customer wallet.",
  faucetPlenty: "This wallet already has plenty of test USD.",
  rateFaucetWallet: "This wallet just received test USD. Try again in 10 minutes.",
  rateFaucetWalletDay: "This wallet has reached today’s test USD limit.",
  rateFaucetNetwork: "Too many faucet requests from this network. Try again in an hour.",
  rateFaucetGlobal: "The faucet is busy. Try again in a few minutes.",
  feedbackInvalid: "Please check your answers: some are missing or too long.",
  rateFeedback: "Too many responses from this network today. Thank you, we have plenty!",
  rateFeedbackGlobal: "We’re getting a lot of responses right now. Try again in a few minutes.",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "prepared",
    submitted: "submitted",
    approved: "approved",
    superseded: "superseded",
    declined: "declined",
    executed: "executed",
    confirmed: "confirmed",
    expired: "expired",
    failed: "failed",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "The wallet doesn’t have enough funds for this. Pay a smaller amount, or top it up with the faucet in Settings.",
    expired: "The network took too long to confirm. Nothing was charged — try again.",
    busy: "The Solana devnet is busy right now. Wait a few seconds and try again.",
    unreachable: "Couldn’t reach the network. Check the transaction status in a moment, then try again.",
    generic: "Something went wrong. Try again — if it keeps happening, reload the page.",
  },

  // Route handlers
  exportSignIn: "Sign in first",
};

export default errors;
