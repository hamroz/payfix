// Emails PayFix sends: sign-in codes, resolution links, change requests, and team invitations.
const emails = {
  signInCode: {
    subject: "{code} is your PayFix code",
    body: "Enter {code} to continue. It expires in 10 minutes. If you didn't ask for this, you can ignore it.",
  },
  resolutionLink: {
    subject: "Let's settle the extra {amount} you sent",
    body: "Hi {name}, we received {amount} more than your invoice needed. Choose how you'd like it handled — applied to another invoice, kept as credit, or refunded. Nothing moves until we both approve the exact plan.",
  },
  changesRequested: {
    subject: "{business} asked for a change to your plan",
    body: "{business} reviewed version {version} and asked: “{note}” Open your resolution link to send a revised plan.",
  },
  memberAdded: {
    subject: "You've been added to {business} on PayFix",
    body: "{invitedBy} added you as {role}. Sign in with this email address to open the workspace.",
  },
};

export default emails;
