import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "पहले साइन इन करें।",
  invalidEmail: "सही ईमेल पता डालें।",
  emailSendFailed: "अभी ईमेल नहीं भेजा जा सका। एक मिनट बाद फिर से कोशिश करें।",
  adminEmailUnavailable: "एडमिन साइन इन के लिए असली ईमेल सर्विस चाहिए, और वह इस डिप्लॉयमेंट में सेट नहीं है।",
  codeExpired: "यह कोड एक्सपायर हो गया है। नया कोड मँगवाएँ।",
  codeTooManyAttempts: "बहुत ज़्यादा कोशिशें हो गईं। नया कोड मँगवाएँ।",
  codeWrong: "यह कोड सही नहीं है। जाँचकर फिर से कोशिश करें।",
  rateCodes: "इस पते पर बहुत ज़्यादा कोड भेजे जा चुके हैं। 15 मिनट रुककर फिर से कोशिश करें।",
  rateCodesDay: "आज इस पते पर बहुत ज़्यादा कोड भेजे जा चुके हैं। कल फिर से कोशिश करें।",
  rateSignInNetwork: "इस नेटवर्क से साइन इन की बहुत ज़्यादा कोशिशें हुई हैं। एक घंटे बाद फिर से कोशिश करें।",

  // Workspaces and team
  companyNameRequired: "अपनी कंपनी का नाम डालें।",
  noTestToken: "इस डिप्लॉयमेंट में कोई टेस्ट टोकन कॉन्फ़िगर नहीं है।",
  notMemberOfThatCompany: "आप उस कंपनी के सदस्य नहीं हैं।",
  notMemberOfThisCompany: "आप इस कंपनी के सदस्य नहीं हैं।",
  roleForbidden: "आपका रोल ({role}) यह नहीं कर सकता। एक्सेस के लिए किसी ओनर से कहें।",
  alreadyOnTeam: "यह व्यक्ति पहले से टीम में है।",
  notOnTeam: "यह व्यक्ति टीम में नहीं है।",
  lastOwner: "कंपनी में कम से कम एक ओनर होना ज़रूरी है।",
  resetDemoOnly: "रीसेट सिर्फ़ डेमो मोड में उपलब्ध है।",
  rateDemoCompanies: "आप आज कई डेमो कंपनियाँ बना चुके हैं। कंपनी मेन्यू से कोई मौजूदा कंपनी इस्तेमाल करें, या कल फिर से कोशिश करें।",
  rateDemoCompaniesGlobal: "इस समय बहुत से लोग डेमो आज़मा रहे हैं। कुछ मिनट बाद फिर से कोशिश करें।",

  // Customers and invoices
  customerNameRequired: "ग्राहक का नाम डालें।",
  customerEmailExists: "इस ईमेल वाला ग्राहक पहले से मौजूद है।",
  customerNotFound: "ग्राहक नहीं मिला",
  chooseCustomer: "कोई ग्राहक चुनें।",
  invoiceAmountPositive: "राशि शून्य से ज़्यादा होनी चाहिए।",
  invoiceTitleRequired: "बताएँ कि यह इनवॉइस किस काम के लिए है।",
  invoiceAmountFormat: "राशि इस तरह डालें: 1000 या 49.99।",
  invoiceAmountMax: "इनवॉइस की अधिकतम राशि $1,000,000,000 है।",
  dueDateRequired: "देय तिथि चुनें।",
  invoiceNotFound: "इनवॉइस नहीं मिला।",
  paymentAmountPositive: "शून्य से ज़्यादा राशि डालें।",
  paymentAmountFormat: "राशि इस तरह डालें: 400 या 49.99।",
  noCreditLeft: "इस ग्राहक का कोई क्रेडिट बाकी नहीं है।",
  invoiceAlreadyPaid: "यह इनवॉइस पहले ही चुकाया जा चुका है।",

  // Notifications
  notificationNotFound: "नोटिफ़िकेशन नहीं मिला।",
  chooseNotificationCategories: "नोटिफ़िकेशन की कैटेगरी चुनें।",
  unknownNotificationCategory: "अज्ञात नोटिफ़िकेशन कैटेगरी: {categories}",

  // Wallets
  invalidWalletAddress: "यह सही Solana वॉलेट पता नहीं है।",
  receivingWalletRequired: "वह Solana वॉलेट पता डालें जिस पर पेमेंट आने चाहिए।",
  walletProofRequired: "वॉलेट कनेक्ट करें और यह साबित करने के लिए मैसेज साइन करें कि वह आपका है।",
  walletProofStale: "यह सिग्नेचर किसी दूसरे वॉलेट का है या एक्सपायर हो चुका है। फिर से साइन करें।",
  walletSignatureMismatch: "सिग्नेचर इस वॉलेट से मेल नहीं खाता।",
  walletAlreadyAdded: "यह वॉलेट पहले से जुड़ा हुआ है।",
  walletAddBeforeActivating: "एक्टिव करने से पहले वॉलेट जोड़ें।",
  walletActiveCantRemove: "इसे हटाने से पहले किसी दूसरे वॉलेट को एक्टिव करें।",
  walletHasPayments: "इस वॉलेट में पेमेंट आ चुके हैं, इसलिए PayFix इस पर नज़र रखता रहेगा। इसे हटाया नहीं जा सकता।",

  // Resolution links and cases
  linkInvalid: "यह लिंक मान्य नहीं है।",
  linkReplaced: "इस लिंक की जगह एक नया लिंक भेजा जा चुका है। सबसे नए लिंक के लिए अपना ईमेल देखें।",
  linkExpired: "यह लिंक एक्सपायर हो गया है। बिज़नेस से नया लिंक भेजने के लिए कहें।",
  verifyEmailToContinue: "आगे बढ़ने के लिए अपना ईमेल वेरिफ़ाई करें।",
  caseNotFound: "केस नहीं मिला",
  onlyOpenUnmatchedAssignable: "सिर्फ़ खुले, बेमेल पेमेंट ही किसी ग्राहक से जोड़े जा सकते हैं",
  attributeCustomerFirst: "पहले यह पेमेंट किसी ग्राहक से जोड़ें",
  caseAlreadyResolved: "यह केस पहले ही सुलझ चुका है",
  cantChangeCase: "आप इस केस में बदलाव नहीं कर सकते",
  planAlreadyRunning: "यह प्लान पहले से लागू किया जा रहा है",
  confirmRefundWallet: "भेजने से पहले रिफ़ंड वॉलेट से साइन करके उसे कन्फ़र्म करें।",
  tellCustomerWhatToChange: "ग्राहक को बताएँ कि क्या बदलना है।",
  newerVersionReview: "इस प्लान का एक नया वर्ज़न मौजूद है। पहले उसे रिव्यू करें।",
  newerVersionApprove: "इस प्लान का एक नया वर्ज़न मौजूद है। मंज़ूरी देने से पहले उसे रिव्यू करें।",
  versionAlready: "वर्ज़न {version} पहले ही {status} हो चुका है।",
  planIntegrityFailed: "प्लान की इंटीग्रिटी जाँच फ़ेल हो गई",
  planNeedsApproval: "लागू होने से पहले इस प्लान के मौजूदा वर्ज़न को मंज़ूरी चाहिए।",
  currentVersionNotApproved: "मौजूदा वर्ज़न मंज़ूर नहीं है।",
  approvalMismatch: "मंज़ूरी मौजूदा प्लान से मेल नहीं खाती।",
  unresolvedChanged: "अनसुलझी राशि {from} से बदलकर {to} हो गई है। बदला हुआ प्लान माँगें।",
  invoiceNoRoom: "{number} में अब {amount} की गुंजाइश नहीं है। बदला हुआ प्लान माँगें।",
  someInvoiceNoRoom: "एक इनवॉइस में अब {amount} की गुंजाइश नहीं है। बदला हुआ प्लान माँगें।",
  notEnoughUnresolved: "अनसुलझी राशि काफ़ी नहीं है",

  // Proposal validation
  allocationAmountPositive: "हर बँटवारे की राशि शून्य से ज़्यादा होनी चाहिए।",
  allocationRequired: "कम से कम एक बँटवारा जोड़ें।",
  invoiceNotOpenForCustomer: "यह इनवॉइस इस ग्राहक के लिए बकाया नहीं है।",
  invoiceOnlyHasRemaining: "{number} पर सिर्फ़ {remaining} बाकी हैं।",
  invoiceOnce: "हर इनवॉइस सिर्फ़ एक बार आ सकता है।",
  singleCreditLine: "क्रेडिट के लिए सिर्फ़ एक लाइन रखें।",
  singleRefundLine: "रिफ़ंड के लिए सिर्फ़ एक लाइन रखें।",
  refundNeedsDestination: "रिफ़ंड के लिए एक वॉलेट चाहिए।",
  refundDestinationInvalid: "रिफ़ंड वॉलेट का पता मान्य नहीं है।",
  overAllocated: "यह उपलब्ध {available} से {over} ज़्यादा है।",
  stillUnallocated: "{amount} अभी बाँटे नहीं गए हैं।",

  // Refunds
  refundNotFound: "रिफ़ंड नहीं मिला",
  refundAlreadyConfirmed: "यह रिफ़ंड पहले ही कन्फ़र्म हो चुका है।",
  refundInFlight: "एक रिफ़ंड ट्रांज़ैक्शन पहले से जारी है। उसके कन्फ़र्म या एक्सपायर होने का इंतज़ार करें।",
  refundAttemptNotFound: "रिफ़ंड की कोशिश नहीं मिली",
  attemptAlready: "यह कोशिश पहले ही {status} हो चुकी है।",
  signedTxMismatch: "साइन किया गया ट्रांज़ैक्शन तैयार किए गए रिफ़ंड से मेल नहीं खाता।",
  txNotSignedByBusiness: "ट्रांज़ैक्शन बिज़नेस वॉलेट से साइन नहीं किया गया है।",
  attemptAlreadySubmitted: "यह कोशिश पहले ही भेजी जा चुकी है।",
  refundInsufficientFunds: "रिफ़ंड नहीं भेजा गया: बिज़नेस वॉलेट में काफ़ी पैसा या फ़ीस के लिए SOL नहीं है। कोई पैसा नहीं गया; वॉलेट में बैलेंस डालें और फिर से साइन करें।",
  refundRejected: "नेटवर्क ने रिफ़ंड अस्वीकार कर दिया, इसलिए कोई पैसा नहीं गया। आप इसे फिर से साइन कर सकते हैं।",

  // Demo mode and faucet
  demoPaymentsOnly: "डेमो पेमेंट सिर्फ़ डेमो मोड में उपलब्ध हैं।",
  demoWalletsOnly: "डेमो वॉलेट सिर्फ़ डेमो मोड में उपलब्ध हैं।",
  demoOutOfSol: "डेमो में नए वॉलेट के लिए devnet SOL ख़त्म हो गया है। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
  demoCustomerTooPoor:
    "डेमो ग्राहक वॉलेट में सिर्फ़ {balance} टेस्ट USD हैं और हर पेमेंट के लिए इसमें ज़्यादा से ज़्यादा {limit} तक ही टॉप-अप होता है, इसलिए यह {amount} नहीं चुका सकता। कम राशि चुकाएँ।",
  walletKeyNotHeld: "इस वॉलेट की कुंजी PayFix के पास नहीं है। रिफ़ंड उसी वॉलेट में साइन करें।",
  faucetDemoOnly: "फ़ॉसेट सिर्फ़ डेमो मोड में उपलब्ध है।",
  faucetReceivingWallet: "यह किसी कंपनी का रिसीविंग वॉलेट है। वहाँ भेजे गए टेस्ट USD बेमेल पेमेंट के रूप में दिखेंगे, इसलिए किसी ग्राहक वॉलेट का इस्तेमाल करें।",
  faucetPlenty: "इस वॉलेट में पहले से काफ़ी टेस्ट USD हैं।",
  rateFaucetWallet: "इस वॉलेट को अभी-अभी टेस्ट USD मिले हैं। 10 मिनट बाद फिर से कोशिश करें।",
  rateFaucetWalletDay: "यह वॉलेट आज की टेस्ट USD सीमा तक पहुँच गया है।",
  rateFaucetNetwork: "इस नेटवर्क से फ़ॉसेट के बहुत ज़्यादा अनुरोध आए हैं। एक घंटे बाद फिर से कोशिश करें।",
  rateFaucetGlobal: "फ़ॉसेट अभी व्यस्त है। कुछ मिनट बाद फिर से कोशिश करें।",
  feedbackInvalid: "कृपया अपने जवाब जाँचें: कुछ छूट गए हैं या बहुत लंबे हैं।",
  rateFeedback: "आज इस नेटवर्क से बहुत ज़्यादा जवाब आ चुके हैं। धन्यवाद, हमारे पास काफ़ी जवाब हैं!",
  rateFeedbackGlobal: "इस समय बहुत सारे जवाब आ रहे हैं। कुछ मिनट बाद फिर से कोशिश करें।",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "तैयार",
    submitted: "सबमिट",
    approved: "मंज़ूर",
    superseded: "पुराना",
    declined: "अस्वीकार",
    executed: "लागू",
    confirmed: "कन्फ़र्म",
    expired: "एक्सपायर",
    failed: "फ़ेल",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "वॉलेट में इसके लिए काफ़ी पैसा नहीं है। कम राशि चुकाएँ, या सेटिंग्स में फ़ॉसेट से बैलेंस डालें।",
    expired: "नेटवर्क ने कन्फ़र्म करने में बहुत देर लगा दी। कोई पैसा नहीं कटा — फिर से कोशिश करें।",
    busy: "Solana devnet इस समय व्यस्त है। कुछ सेकंड रुककर फिर से कोशिश करें।",
    unreachable: "नेटवर्क से कनेक्ट नहीं हो सका। थोड़ी देर में ट्रांज़ैक्शन का स्टेटस देखें, फिर दोबारा कोशिश करें।",
    generic: "कुछ गड़बड़ हो गई। फिर से कोशिश करें — अगर ऐसा बार-बार हो, तो पेज रीलोड करें।",
  },

  // Route handlers
  exportSignIn: "पहले साइन इन करें",
};

export default errors;
