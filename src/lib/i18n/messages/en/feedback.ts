// The tester survey at /feedback (after the walkthrough in docs/tester-walkthrough.md).
const feedback = {
  title: "How did it go?",
  intro: "Thanks for trying PayFix. This takes about two minutes. Only the questions marked * are required.",
  anonymous: "Your answers are anonymous unless you choose to attach your PayFix account below.",
  completed: {
    label: "Did you finish the walkthrough?",
    unaided: "Yes, on my own",
    aided: "Yes, with some help",
    no: "No",
  },
  minutes: { label: "About how many minutes did it take?", suffix: "minutes" },
  ease: { label: "How easy was it?", low: "Very hard", high: "Very easy" },
  nps: { label: "How likely are you to recommend PayFix to a business that gets paid in stablecoins?", low: "Not at all likely", high: "Extremely likely" },
  openTitle: "In your own words",
  questions: {
    happened: "What happened to the extra $100, and who decided?",
    hesitated: "Where did you hesitate or feel unsure what to tap next?",
    voidedApproval: "When the refund wallet changed after approval, did you notice the approval was cancelled? Did that feel right?",
    currentProcess: "If you run a business paid in stablecoins: how do you handle an overpayment today, and how often does it happen?",
    receiptTrust: "Would you trust the receipt as a record to send to a client or an accountant? What’s missing?",
    blockers: "What would stop you from using PayFix, and what tool would it replace or sit next to?",
  },
  aboutTitle: "About you",
  about: { label: "What kind of business, and how big?", placeholder: "e.g. design agency, 4 people" },
  device: { label: "What did you use?", phone: "Phone", tablet: "Tablet", computer: "Computer" },
  quoteOk: "You may quote my answers, without my name.",
  attach: "Attach my PayFix account ({email}) to these answers, so the team can see how far I got.",
  submit: "Send feedback",
  sending: "Sending…",
  required: "Please answer the questions marked *.",
  thanks: { title: "Thank you!", body: "Your answers help us decide what to fix next.", back: "Back to PayFix" },
  guidedDemoLink: "Tell us how it went",
};

export default feedback;
