import type { LegalDoc } from "../types";

const privacy: LegalDoc = {
  title: "Tietosuojaseloste",
  description: "Mitä henkilötietoja PayFix kerää, miksi, kenelle niitä luovutetaan, kuinka kauan niitä säilytetään ja mitä oikeuksia sinulla on.",
  updated: "2026-10-06",
  intro: [
    "Tässä selosteessa kerrotaan, mitä henkilötietoja PayFix-palvelu kerää, miksi keräämme niitä, kenelle niitä luovutetaan, kuinka kauan säilytämme niitä ja mitä oikeuksia sinulla on. Tässä selosteessa ”me” tarkoittaa tämän PayFix-palvelun ylläpitäjää.",
    "PayFix on hackathon-prototyyppi. Se toimii Solana devnet -testiverkossa tai simuloidussa ketjussa testitokeneilla, joilla ei ole rahallista arvoa. Käytä mahdollisuuksien mukaan testitietoja äläkä käytä PayFixia oikeiden asiakasvarojen käsittelyyn.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Rekisterinpitäjä",
      blocks: [
        "Tämän PayFix-palvelun ylläpitäjä vastaa tässä selosteessa kuvatuista henkilötiedoista. {contact}",
        "Jos yritys lähettää sinulle PayFixin kautta laskun tai ratkaisulinkin, yritys päättää, mitä tietojasi se syöttää palveluun. Yrityksen omia rekistereitä koskevissa kysymyksissä voit ottaa yhteyttä myös suoraan kyseiseen yritykseen.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "Mitä tietoja keräämme",
      blocks: [
        {
          list: [
            "<b>Tilitiedot:</b> sähköpostiosoite, jolla kirjaudut sisään. Kun pyydät kirjautumiskoodin, luomme osoitteelle tilitietueen.",
            "<b>Yritys- ja tiimitiedot:</b> yritysten nimet, kunkin yrityksen luoneen henkilön sähköpostiosoite, tiimin jäsenten sähköpostiosoitteet ja roolit sekä kunkin jäsenen ilmoitusasetukset.",
            "<b>Asiakas- ja laskutiedot,</b> joita yritykset syöttävät: asiakkaiden nimet ja sähköpostiosoitteet sekä laskujen numerot, otsikot, summat ja eräpäivät.",
            "<b>Ratkaisutiedot:</b> asiakkaiden ja yritysten ehdottamat suunnitelmat, niihin kirjoitetut viestit, hyväksynnät ja asiakkaan valitseman palautuslompakon osoite sekä allekirjoitettu viesti, joka todistaa, että lompakko on asiakkaan hallinnassa.",
            "<b>Lompakko- ja maksutiedot:</b> lompakko-osoitteet, transaktioiden allekirjoitukset, summat ja ajankohdat, jotka PayFix lukee lohkoketjusta tai luo palautuksia varten.",
            "<b>Tietoturvatiedot:</b> kirjautumiskoodit ja istuntotunnisteet (tallennetaan vain tiivistettyinä), kunkin yrityksen toimintaloki sekä pyyntörajoitusten tietueet. Pyyntörajoitusten tietueet sisältävät sähköpostiosoitteesi tai IP-osoitteesi lyhennetyn tiivisteen, eivät itse osoitetta.",
            "<b>Sähköpostiloki:</b> PayFixin lähettämien sähköpostien vastaanottaja, aihe, teksti ja toimitustila.",
            "<b>Palaute:</b> jos täytät vapaaehtoisen palautekyselymme, vastauksesi ja käyttämäsi kieli. Vastaukset ovat nimettömiä, ellet itse päätä liittää niihin PayFix-tiliäsi.",
            "<b>Tekniset tiedot:</b> IP-osoitteesi ja selaimesi perustiedot, joita palveluntarjoajamme käsittelee, kun selaimesi muodostaa yhteyden palveluun.",
          ],
        },
        "Emme pyydä kotiosoitettasi, puhelinnumeroasi, syntymäaikaasi, henkilöllisyystodistuksiasi, pankkitietojasi tai lompakkojesi yksityisiä avaimia.",
      ],
    },
    {
      id: "how-we-use-data",
      heading: "Miten käytämme tietojasi",
      blocks: [
        {
          list: [
            "Palvelun tarjoamiseen: sisäänkirjautumiseen, maksujen kohdistamiseen laskuille, ratkaisujen ja palautusten toteuttamiseen sekä kuittien laatimiseen.",
            "Palvelun edellyttämien sähköpostien lähettämiseen: kirjautumiskoodit, ratkaisulinkit, tiimikutsut ja suunnitelmien muutospyynnöt.",
            "PayFixin turvallisuuden ylläpitämiseen ja väärinkäytösten estämiseen, esimerkiksi rajoittamalla pyydettävien kirjautumiskoodien tai testitokenien määrää.",
            "Täydellisten ja oikeiden maksutietojen ylläpitämiseen, jotta jokainen vastaanotettu summa voidaan selittää.",
            "Palvelun ylläpitämiseen: PayFixin ylläpitäjät näkevät tilien sähköpostiosoitteet, yritysten nimet, tiimien jäsenet ja heidän roolinsa, sen, onko tili tai yritys jäädytetty, sekä koko palvelun toiminnan lukumäärät ja kokonaissummat. Ylläpitotyökalumme eivät näytä heille yrityksen asiakkaita, laskuja, summia tai lompakoita. Jokainen ylläpitotoimi kirjataan.",
            "Petosten ja väärinkäytösten estämiseen: ylläpitäjät voivat jäädyttää tilin tai yrityksen, kirjata tilin ulos tai estää kirjautumiskoodien tai testitokenien lähettämisen tiettyyn osoitteeseen. Jokainen tällainen toimi kirjataan perusteluineen.",
            "PayFixin kehittämiseen testaajien meille vapaaehtoisesti antaman palautteen perusteella.",
          ],
        },
        "Emme myy tietojasi. Emme käytä niitä mainontaan tai profilointiin, eikä PayFix käytä analytiikka- tai seurantatyökaluja.",
      ],
    },
    {
      id: "legal-bases",
      heading: "Käsittelyn oikeusperusteet",
      blocks: [
        "Jos sovelletaan tietosuojalainsäädäntöä, kuten EU:n yleistä tietosuoja-asetusta (GDPR), käsittelemme tietojasi seuraavilla oikeusperusteilla:",
        {
          list: [
            "<b>Sopimuksen täytäntöönpano:</b> sinun tai yrityksesi pyytämän palvelun tarjoaminen.",
            "<b>Oikeutettu etu:</b> palvelun turvallisuuden ylläpitäminen, väärinkäytösten estäminen ja luotettavien tietojen säilyttäminen. Vetoamme tähän perusteeseen vain silloin, kun oikeutesi eivät syrjäytä näitä etuja.",
            "<b>Lakisääteiset velvoitteet:</b> kun laki velvoittaa meidät säilyttämään tai luovuttamaan tietoja.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Julkisen lohkoketjun tiedot",
      blocks: [
        "Maksut ja palautukset ovat transaktioita julkisessa lohkoketjussa. Kuka tahansa voi nähdä näiden transaktioiden lompakko-osoitteet, summat ja ajankohdat, eikä niitä voi muuttaa tai poistaa – emme me eikä kukaan muukaan.",
        "PayFix ei tallenna lohkoketjuun nimiä, sähköpostiosoitteita tai laskujen tietoja. Se lisää maksupyyntöihin vain satunnaisen viiteavaimen ja palautuksiin palautusnumeron.",
      ],
    },
    {
      id: "sharing",
      heading: "Kenelle tietojasi luovutetaan",
      blocks: [
        "Luovutamme tietoja vain palveluntarjoajille, joita tarvitsemme PayFixin ylläpitämiseen:",
        {
          list: [
            "<b>Palvelin- ja tietokantapalvelujen tarjoajat,</b> jotka ajavat sovellusta ja tallentavat sen tiedot. Julkinen demo käyttää palvelimena Verceliä ja tietokantana Neonia.",
            "<b>Resend</b>, joka toimittaa sähköpostimme. Se saa kunkin sähköpostin vastaanottajan osoitteen ja sisällön.",
            "<b>Solana-verkon palveluntarjoajat (RPC-solmut),</b> joihin selaimesi ja palvelimemme ottavat yhteyttä lukeakseen ja lähettääkseen transaktioita. Ne näkevät IP-osoitteesi ja pyydetyt lompakko-osoitteet.",
            "<b>Lompakkosovellukset,</b> jotka päätät yhdistää, kuten Phantom tai Solflare. Ne käsittelevät tietoja omien tietosuojakäytäntöjensä mukaisesti.",
          ],
        },
        "PayFixissa yrityksen jäsenet näkevät yrityksen asiakkaat, laskut, maksut ja toiminnan. Asiakas näkee vain oman ratkaisulinkkinsä tapauksen ja siihen liittyvät laskut.",
        "Voimme myös luovuttaa tietoja, kun laki sitä edellyttää, tai käyttäjien ja palvelun oikeuksien ja turvallisuuden suojaamiseksi.",
      ],
    },
    {
      id: "international-transfers",
      heading: "Kansainväliset tiedonsiirrot",
      blocks: [
        "Palveluntarjoajamme voivat käsitellä tietoja muissa maissa kuin asuinmaassasi, myös Yhdysvalloissa. Kun tietosuojalainsäädäntö edellyttää näille siirroille suojatoimia, nojaamme palveluntarjoajien tarjoamiin suojatoimiin, kuten vakiosopimuslausekkeisiin.",
      ],
    },
    {
      id: "retention",
      heading: "Kuinka kauan säilytämme tietoja",
      blocks: [
        {
          list: [
            "Kirjautumiskoodit ovat voimassa 10 minuuttia, ja niitä voi käyttää vain kerran.",
            "Istunnot päättyvät 7 päivän kuluttua tai aiemmin, kun kirjaudut ulos.",
            "Ratkaisulinkit vanhenevat 7 päivän kuluttua tai aiemmin, jos yritys korvaa tai peruu ne.",
            "Pyyntörajoitusten tietueet poistetaan yleensä noin kahden päivän kuluttua.",
            "Palautevastauksia säilytetään testin arvioinnin ajan, ja ne poistetaan testiasennuksen mukana tai aiemmin, jos pyydät sitä.",
            "Kun sähköposti on toimitettu, sen sisältämä linkki poistetaan sähköpostilokistamme. Demotilassa sähköposteja ei lähetetä: ne jäävät tietokantaan ja näkyvät vain demopostilaatikossa.",
            "Tili-, yritys-, lasku-, maksu- ja toimintatietoja säilytetään niin kauan kuin tili tai yritys on olemassa, koska maksutietojen on pysyttävä täydellisinä. Demotilassa yrityksen omistajat voivat milloin tahansa nollata yrityksensä tiedot.",
            "Palveluntarjoajamme säilyttää palvelinlokeja rajoitetun ajan. Demotilassa nämä lokit sisältävät myös kirjautumiskoodeja pyytävien sähköpostiosoitteet ja itse koodit.",
          ],
        },
        "PayFixin testiasennukset voidaan nollata tai sulkea, jolloin niiden tiedot poistetaan. Julkisen lohkoketjun tiedot ovat pysyviä.",
      ],
    },
    {
      id: "security",
      heading: "Tietoturva",
      blocks: [
        "Suojaamme tietojasi esimerkiksi tiivistetyillä koodeilla ja istuntotunnisteilla, evästeillä, joita skriptit eivät voi lukea, salatuilla yhteyksillä, jokaisen muutoksen roolitarkistuksilla ja pyyntörajoituksilla. Tietoturvasivullamme kuvataan nämä toimet tarkemmin. Mikään järjestelmä ei ole täysin turvallinen, joten ilmoitathan meille havaitsemistasi heikkouksista.",
      ],
    },
    {
      id: "your-rights",
      heading: "Oikeutesi",
      blocks: [
        "Asuinpaikastasi riippuen sinulla voi olla oikeus:",
        {
          list: [
            "saada pääsy sinusta säilyttämiimme henkilötietoihin ja saada niistä jäljennös;",
            "oikaista virheelliset tai puutteelliset tiedot;",
            "pyytää tietojesi poistamista;",
            "pyytää tietojesi käsittelyn rajoittamista tai vastustaa niiden käsittelyä;",
            "saada tietosi jäsennellyssä, koneellisesti luettavassa muodossa (oikeus siirtää tiedot järjestelmästä toiseen);",
            "tehdä valitus tietosuojavalvontaviranomaiselle, erityisesti siinä maassa, jossa asut tai työskentelet.",
          ],
        },
        "Jos haluat käyttää näitä oikeuksia, ota meihin yhteyttä. {contact} Voimme pyytää sinua vahvistamaan, että sähköpostiosoite on sinun, ennen kuin käsittelemme pyynnön. Emme voi poistaa tai muuttaa julkisen lohkoketjun tietoja, ja voimme säilyttää tietoja, joita tarvitsemme maksutietojen pitämiseksi täydellisinä tai lakisääteisten velvoitteiden täyttämiseksi.",
      ],
    },
    {
      id: "children",
      heading: "Lapset",
      blocks: ["PayFix on yrityskäyttöön tarkoitettu työkalu, eikä sitä ole tarkoitettu lapsille. Älä käytä sitä, jos olet alle 18-vuotias."],
    },
    {
      id: "changes",
      heading: "Muutokset tähän selosteeseen",
      blocks: [
        "Voimme päivittää tätä selostetta, kun palvelu tai lainsäädäntö muuttuu. Sivun yläosassa oleva päivämäärä kertoo, milloin selostetta on viimeksi päivitetty. Jos muutos on merkittävä, tuomme sen selvästi esiin tällä sivulla.",
      ],
    },
  ],
};

export default privacy;
