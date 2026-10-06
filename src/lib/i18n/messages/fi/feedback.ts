import type { Messages } from "../types";

const feedback: Messages["feedback"] = {
  title: "Miten meni?",
  intro: "Kiitos, että kokeilit PayFixia. Vastaamiseen menee noin kaksi minuuttia. Vain tähdellä * merkityt kysymykset ovat pakollisia.",
  anonymous: "Vastauksesi ovat nimettömiä, ellet päätä liittää niihin PayFix-tiliäsi alla.",
  completed: {
    label: "Saitko opastetun demon tehtyä loppuun?",
    unaided: "Kyllä, itsenäisesti",
    aided: "Kyllä, hieman avustettuna",
    no: "En",
  },
  minutes: { label: "Noin montako minuuttia siihen meni?", suffix: "minuuttia" },
  ease: { label: "Kuinka helppoa se oli?", low: "Todella vaikeaa", high: "Todella helppoa" },
  nps: { label: "Kuinka todennäköisesti suosittelisit PayFixia yritykselle, joka saa maksunsa stablecoineina?", low: "Erittäin epätodennäköisesti", high: "Erittäin todennäköisesti" },
  openTitle: "Omin sanoin",
  questions: {
    happened: "Mitä ylimääräiselle $100:lle tapahtui, ja kuka sen päätti?",
    hesitated: "Missä kohdassa epäröit tai et ollut varma, mitä napauttaa seuraavaksi?",
    voidedApproval: "Kun palautuslompakko vaihtui hyväksynnän jälkeen, huomasitko, että hyväksyntä peruuntui? Tuntuiko se oikealta?",
    currentProcess: "Jos yrityksesi saa maksunsa stablecoineina: miten hoidat ylimaksun nykyään, ja kuinka usein niitä sattuu?",
    receiptTrust: "Luottaisitko kuittiin tositteena, jonka voi lähettää asiakkaalle tai kirjanpitäjälle? Mitä siitä puuttuu?",
    blockers: "Mikä estäisi sinua käyttämästä PayFixia, ja minkä työkalun se korvaisi tai minkä rinnalla sitä käyttäisit?",
  },
  aboutTitle: "Sinusta",
  about: { label: "Millainen yritys, ja kuinka suuri?", placeholder: "esim. suunnittelutoimisto, 4 henkeä" },
  device: { label: "Mitä laitetta käytit?", phone: "Puhelin", tablet: "Tabletti", computer: "Tietokone" },
  quoteOk: "Vastauksiani saa lainata ilman nimeäni.",
  attach: "Liitä PayFix-tilini ({email}) näihin vastauksiin, jotta tiimi näkee, kuinka pitkälle pääsin.",
  submit: "Lähetä palaute",
  sending: "Lähetetään…",
  required: "Vastaa tähdellä * merkittyihin kysymyksiin.",
  thanks: { title: "Kiitos!", body: "Vastauksesi auttavat meitä päättämään, mitä korjaamme seuraavaksi.", back: "Takaisin PayFixiin" },
  guidedDemoLink: "Kerro, miten meni",
};

export default feedback;
