import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "Hackathon-prototyyppi. Vain testitokeneita – ei asiakasvaroille. PayFix ei näe palautuksia, jotka lähetetään sovelluksen ulkopuolella.",
    legalHeading: "Juridiset tiedot",
    productHeading: "Tuote",
    howItWorks: "Näin se toimii",
    signIn: "Kirjaudu sisään",
    rights: "© {year} PayFix. Kaikki oikeudet pidätetään.",
  },
  docs: {
    privacy: "Tietosuojaseloste",
    terms: "Käyttöehdot",
    cookies: "Evästekäytäntö",
    security: "Tietoturva",
  },
  page: {
    updated: "Päivitetty viimeksi {date}",
    onThisPage: "Tällä sivulla",
    otherDocuments: "Muut asiakirjat",
    backHome: "Takaisin etusivulle",
    translationNote: "Tämä käännös on tarkoitettu helpottamaan lukemista. Jos se poikkeaa englanninkielisestä versiosta, englanninkielinen versio on ratkaiseva.",
    fallbackNote: "Tätä asiakirjaa ei ole vielä saatavilla kielelläsi, joten se näytetään englanniksi.",
    home: "PayFixin etusivu",
    contactEmail: "Voit kirjoittaa meille osoitteeseen <link>{email}</link>.",
    contactFallback: "Tämä palvelu ei ole vielä julkaissut yhteydenottoon tarkoitettua sähköpostiosoitetta. Siihen asti ota yhteyttä henkilöön tai tiimiin, joka jakoi tämän PayFix-palvelun kanssasi.",
  },
};

export default legal;
