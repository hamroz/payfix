// Business sign-in: the email step and the one-time code step.
const auth = {
  title: "Sign in",
  homeLink: "PayFix home",
  email: {
    title: "Sign in or create an account",
    subtitle: "We’ll email you a 6-digit code. No passwords.",
    label: "Work email",
    placeholder: "you@agency.com",
    demo: "<b>Live demo.</b> Use any email. You’ll get your own private company with a devnet test wallet. Codes appear in the demo inbox at the bottom left.",
  },
  code: {
    title: "Check your email",
    sent: "We sent a 6-digit code to <email>{email}</email>.",
    verifying: "Verifying…",
    resend: "Resend code",
  },
};

export default auth;
