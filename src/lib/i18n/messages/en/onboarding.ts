// Creating a company after first sign-in, or opening an existing one.
const onboarding = {
  title: "Create your company",
  createAnother: "Create another company",
  signedInAs: "Signed in as <email>{email}</email>. You’ll be its owner and can invite your team later.",
  companyName: "Company name",
  sampleData: {
    title: "Add the demo customer and invoices",
    body: "{customer} with a {first} and a {second} invoice, ready for the guided demo. Your company gets its own devnet test wallet.",
  },
  wallet: {
    label: "Receiving wallet",
    hint: "Payments land here and refunds are signed from here. You’ll sign a message to prove it’s yours; nothing is charged. You can add more wallets later.",
    didNotSign: "The wallet didn’t sign.",
  },
  settingUpWallet: "Setting up your wallet…",
  waitingForWallet: "Waiting for your wallet…",
  create: "Create company",
  openExisting: "Or open one of yours",
};

export default onboarding;
