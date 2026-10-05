import type { Messages } from "../types";

const emails: Messages["emails"] = {
  signInCode: {
    subject: "{code} ist Ihr PayFix-Code",
    body: "Geben Sie {code} ein, um fortzufahren. Der Code ist 10 Minuten gültig. Falls Sie ihn nicht angefordert haben, können Sie diese E-Mail ignorieren.",
  },
  resolutionLink: {
    subject: "Ihre Zahlung: Wie sollen wir mit den zusätzlichen {amount} verfahren?",
    body: "Hallo {name}, wir haben {amount} mehr erhalten, als Ihre Rechnung erforderte. Bitte wählen Sie, wie wir damit umgehen sollen: auf eine andere Rechnung verrechnen, als Guthaben behalten oder erstatten. Es wird nichts bewegt, bis wir beide genau diesen Plan freigegeben haben.",
  },
  changesRequested: {
    subject: "{business} bittet um eine Änderung an Ihrem Plan",
    body: "{business} hat Version {version} geprüft und schreibt: „{note}“ Öffnen Sie Ihren Klärungslink, um einen überarbeiteten Plan zu senden.",
  },
  memberAdded: {
    subject: "Sie wurden bei PayFix zu {business} hinzugefügt",
    body: "{invitedBy} hat Sie als {role} hinzugefügt. Melden Sie sich mit dieser E-Mail-Adresse an, um den Workspace zu öffnen.",
  },
};

export default emails;
