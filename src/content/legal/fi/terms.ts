import type { LegalDoc } from "../types";

const terms: LegalDoc = {
  title: "Käyttöehdot",
  description: "PayFixin käyttöä koskevat säännöt: pelkästään testikäyttöön tarkoitettu prototyyppi, ei rahoituspalvelu, tarjotaan ilman takuuta.",
  updated: "2026-10-06",
  intro: [
    "Näitä ehtoja sovelletaan, kun käytät PayFix-palvelua yrityksenä, tiimin jäsenenä tai asiakkaana, joka on saanut ratkaisulinkin. Näissä ehdoissa ”me” tarkoittaa tämän PayFix-palvelun ylläpitäjää ja ”sinä” palvelun käyttäjää. Käyttämällä PayFixia hyväksyt nämä ehdot. Jos et hyväksy niitä, älä käytä palvelua.",
  ],
  sections: [
    {
      id: "about",
      heading: "Mikä PayFix on",
      blocks: [
        "PayFix on ohjelmisto, jonka avulla yritys ja sen asiakas voivat sopia, mitä tehdään stablecoin-maksulle, joka ei vastaa laskua – esimerkiksi ylimaksulle tai kaksoismaksulle. Se kohdistaa maksut laskuille, antaa molempien osapuolten sopia suunnitelmasta ja kirjaa lopputuloksen.",
        "PayFix on hackathon-prototyyppi. Sen kehitys on yhä kesken, se voi sisältää virheitä, ja se voi muuttua tai lakata milloin tahansa.",
      ],
    },
    {
      id: "test-only",
      heading: "Vain testikäyttöön",
      blocks: [
        "PayFix toimii Solana devnet -testiverkossa tai simuloidussa ketjussa. Se toimii vain testitokeneilla, joilla ei ole rahallista arvoa ja joita ei voi vaihtaa rahaksi.",
        {
          list: [
            "Älä lähetä oikeita varoja, kuten USDC:tä Solanan pääverkossa, mihinkään PayFixin näyttämään lompakko-osoitteeseen, demolompakot mukaan lukien.",
            "Älä käytä PayFixia oikeiden asiakasmaksujen tai oikeiden liiketoimintatietojen käsittelyyn.",
            "Demolompakot ovat palvelimemme hallinnassa ja olemassa vain testausta varten. Kaikki niihin lähetetty voi kadota.",
            "Voimme nollata testitiedot milloin tahansa ilman ennakkoilmoitusta.",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      heading: "Kuka voi käyttää PayFixia",
      blocks: [
        "Sinun on oltava vähintään 18-vuotias ja kelpoinen tekemään sitova sopimus. Jos käytät PayFixia yrityksen tai muun organisaation puolesta, vahvistat, että sinulla on oikeus hyväksyä nämä ehdot sen puolesta.",
      ],
    },
    {
      id: "not-financial-service",
      heading: "Ei rahoituspalvelu",
      blocks: [
        "PayFix ei ole pankki, maksupalvelu, kryptovaluuttapörssi eikä säilytyspalvelu. Se ei säilytä, siirrä eikä hallitse varojasi. Maksut ja palautukset tehdään lompakoista, joita sinä tai toinen osapuoli hallitsee, ja ne myös allekirjoitetaan niissä.",
        "PayFix ei anna rahoitukseen, juridiikkaan, verotukseen tai kirjanpitoon liittyviä neuvoja. Yritykset ja asiakkaat vastaavat itse keskinäisistä sopimuksistaan ja siitä, että jokainen suunnitelma, lasku ja palautus tarkistetaan ennen hyväksymistä tai allekirjoittamista.",
      ],
    },
    {
      id: "accounts",
      heading: "Tilisi",
      blocks: [
        {
          list: [
            "Kirjaudut sisään kertakäyttöisellä koodilla, joka lähetetään sähköpostiosoitteeseesi. Pidä sähköpostitilisi suojattuna, sillä kuka tahansa, joka pystyy lukemaan sähköpostiasi, voi kirjautua sisään sinuna.",
            "Vastaat siitä, mitä tililläsi tapahtuu. Kirjaudu ulos jaetuilla laitteilla.",
            "Yrityksen omistajat päättävät, ketkä kuuluvat tiimiin ja mikä rooli kullakin on. Omistajat vastaavat siitä, että henkilöt, joilla ei enää kuulu olla pääsyä, poistetaan.",
            "Ilmoita meille mahdollisimman pian, jos epäilet, että joku on käyttänyt tiliäsi luvatta.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Lompakot ja transaktiot",
      blocks: [
        {
          list: [
            "Vastaat yksin lompakostasi, sen yksityisestä avaimesta ja siemenlauseesta. Emme koskaan pyydä niitä. Älä koskaan jaa niitä kenellekään.",
            "Tarkista lompakossasi jokainen transaktio ennen kuin allekirjoitat sen: summa, token ja vastaanottaja.",
            "Lohkoketjutransaktioita ei voi perua. Emme pysty palauttamaan väärään osoitteeseen lähetettyjä tokeneita.",
            "PayFix tietää vain maksuista, jotka se näkee yrityksen vastaanottolompakoissa, ja palautuksista, jotka se valmistelee. Se ei näe sovelluksen ulkopuolella tehtyjä palautuksia tai maksuja.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Sallittu käyttö",
      blocks: [
        "Kun käytät PayFixia, et saa:",
        {
          list: [
            "rikkoa lakia tai käyttää PayFixia petokseen tai muiden harhaanjohtamiseen;",
            "syöttää muita henkilöitä koskevia henkilötietoja, ellei sinulla ole siihen oikeutta;",
            "esiintyä toisena henkilönä, yrityksenä tai asiakkaana;",
            "yrittää päästä tileihin, yrityksiin tai tietoihin, jotka eivät ole sinun;",
            "hyökätä palveluun, ylikuormittaa tai häiritä sitä tai yrittää kiertää sen pyyntörajoituksia tai testitoken-faucetin rajoituksia;",
            "ladata tai lähettää haittaohjelmia tai vahingollista koodia;",
            "testata PayFixin tietoturvaa tavoilla, joita Tietoturva-sivumme ei salli.",
          ],
        },
      ],
    },
    {
      id: "your-content",
      heading: "Tietosi",
      blocks: [
        "Säilytät kaikki oikeudet syöttämiisi tietoihin. Annat meille luvan tallentaa ja käsitellä niitä vain palvelun tuottamiseksi sinulle tietosuojaselosteessamme kuvatulla tavalla. Jos syötät asiakkaitasi koskevia tietoja, vahvistat, että sinulla on siihen oikeus ja että olet kertonut heille, miten heidän tietojaan käytetään.",
      ],
    },
    {
      id: "availability",
      heading: "Muutokset palveluun",
      blocks: [
        "Voimme muuttaa, keskeyttää tai lopettaa minkä tahansa PayFixin osan milloin tahansa. Emme lupaa, että palvelu on aina saatavilla, että se on virheetön tai että tiedot säilyvät.",
      ],
    },
    {
      id: "no-warranty",
      heading: "Ei takuuta",
      blocks: [
        "PayFix tarjotaan sellaisenaan ja sen mukaan kuin se on saatavilla, ilman minkäänlaista takuuta. Siinä määrin kuin laki sallii, emme lupaa, että palvelu on täsmällinen, luotettava, turvallinen tai sopiva mihinkään tiettyyn tarkoitukseen.",
      ],
    },
    {
      id: "liability",
      heading: "Vastuumme rajoitukset",
      blocks: [
        "Siinä määrin kuin laki sallii, emme vastaa:",
        {
          list: [
            "välillisistä vahingoista tai seurannaisvahingoista, kuten saamatta jääneistä voitoista, menetetystä liiketoiminnasta tai menetetyistä tiedoista;",
            "vahingoista, jotka aiheutuvat lohkoketjutransaktioista, lompakoista tai verkoista ja palveluista, joita emme hallitse;",
            "vahingoista, jotka aiheutuvat oikeiden varojen lähettämisestä PayFixiin tai mihin tahansa sen näyttämään osoitteeseen näistä ehdoista huolimatta.",
          ],
        },
        "Jos olemme sinulle muulla tavoin vastuussa, kokonaisvastuumme rajoittuu summaan, jonka olet maksanut meille PayFixin käytöstä vaatimusta edeltäneiden 12 kuukauden aikana.",
        "Mikään näissä ehdoissa ei rajoita vastuuta, jota ei voi lain mukaan rajoittaa, kuten vastuuta petoksesta tai huolimattomuudesta aiheutuneesta kuolemasta tai henkilövahingosta. Mikään näissä ehdoissa ei vaikuta kuluttajan oikeuksiisi, joista ei voi sopimuksella poiketa.",
      ],
    },
    {
      id: "third-parties",
      heading: "Muut palvelut",
      blocks: [
        "PayFix toimii yhdessä palvelujen kanssa, joita emme hallitse, kuten Solana-verkon, lompakkosovellusten ja sähköpostin toimituspalvelun. Näiden palvelujen käyttöösi sovelletaan niiden omia ehtoja.",
      ],
    },
    {
      id: "termination",
      heading: "Käytön päättyminen",
      blocks: [
        "Voit lopettaa PayFixin käytön milloin tahansa ja pyytää meitä poistamaan tietosi tietosuojaselosteessamme kuvatulla tavalla.",
        "Voimme keskeyttää tai lopettaa pääsysi tai jäädyttää yrityksen, jos rikot näitä ehtoja, jos havaitsemme merkkejä petoksesta tai väärinkäytöstä, jos käyttösi vaarantaa muita käyttäjiä tai palvelua tai jos lopetamme palvelun. Lompakoita, takuun puuttumista ja vastuumme rajoituksia koskevia kohtia sovelletaan myös pääsysi päättymisen jälkeen.",
      ],
    },
    {
      id: "changes",
      heading: "Muutokset näihin ehtoihin",
      blocks: [
        "Voimme päivittää näitä ehtoja. Sivun yläosassa oleva päivämäärä kertoo, milloin niitä on viimeksi päivitetty. Jos jatkat PayFixin käyttöä muutoksen jälkeen, sinuun sovelletaan päivitettyjä ehtoja.",
      ],
    },
    {
      id: "general",
      heading: "Yleistä",
      blocks: [
        "Jos jotakin näiden ehtojen osaa ei voida panna täytäntöön, muut osat ovat edelleen voimassa. Jos emme vaadi jonkin ehtojen osan noudattamista, emme ole luopuneet oikeudestamme vaatia sitä myöhemmin. Asuinmaasi pakottava lainsäädäntö, joka suojaa sinua, on edelleen voimassa.",
      ],
    },
    {
      id: "contact",
      heading: "Yhteystiedot",
      blocks: ["Jos sinulla on kysyttävää näistä ehdoista, ota meihin yhteyttä. {contact}"],
    },
  ],
};

export default terms;
