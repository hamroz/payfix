import type { LegalDoc } from "../types";

const security: LegalDoc = {
  title: "Tietoturva",
  description: "Miten PayFix suojaa maksut, hyväksynnät, palautukset ja tilit ja miten haavoittuvuudesta voi ilmoittaa.",
  updated: "2026-10-05",
  intro: [
    "PayFix hoitaa tilanteen, jossa maksu menee vikaan, joten se on rakennettu niin, että jokainen vaihe on tarkistettavissa. Tällä sivulla kerrotaan, miten PayFix suojaa maksut, hyväksynnät, palautukset ja tilit ja miten voit ilmoittaa meille tietoturvaongelmasta.",
    "PayFix on hackathon-prototyyppi, joka toimii vain testiverkoissa ja testitokeneilla. Sille ei ole tehty riippumatonta tietoturva-auditointia. Älä käytä sitä oikeiden varojen käsittelyyn.",
  ],
  sections: [
    {
      id: "payments",
      heading: "Maksut vahvistetaan ja lasketaan vain kerran",
      blocks: [
        {
          list: [
            "PayFix tarkistaa jokaisen saapuvan siirron suoraan lohkoketjusta: tokenin, vastaanottavan tilin, summan ja sen, että transaktio on vahvistettu. Summa määritetään tilien saldoista ennen transaktiota ja sen jälkeen, ja epäonnistuneet transaktiot ohitetaan.",
            "Jokainen transaktion allekirjoitus tallennetaan kerran, samassa tietokantatransaktiossa, jossa maksu kirjataan. Uudelleensynkronointi, uudelleenyritys tai palvelimen uudelleenkäynnistys ei voi kirjata samaa maksua kahdesti.",
            "Siirtoa, jossa ei ole maksuviitettä, ei koskaan kohdisteta laskulle automaattisesti. Se pysyy kohdistamattomana, kunnes yritys liittää sen asiakkaaseen ja asiakas vahvistaa suunnitelman.",
          ],
        },
      ],
    },
    {
      id: "ledger",
      heading: "Aina täsmäävä pääkirja",
      blocks: [
        "Jokainen summa kirjataan kahdenkertaiseen pääkirjaan tarkkoina, kokonaisina token-yksikköinä ilman pyöristystä. Jokainen pääkirjan kirjaus summautuu nollaan ja sillä on yksilöllinen avain, joten saman tapahtuman käsittely kahdesti ei vaikuta mihinkään. Vastaanotettu kokonaissumma on aina yhtä suuri kuin laskuille kohdistetut, saldoksi jätetyt, palautetut, palautusta odottavat ja vielä ratkaisemattomat summat yhteensä.",
      ],
    },
    {
      id: "approvals",
      heading: "Hyväksynnät on sidottu täsmälleen tiettyyn suunnitelmaan",
      blocks: [
        {
          list: [
            "Ratkaisusuunnitelman jokainen versio lukitaan, kun se on lähetetty. Mikä tahansa muutos luo uuden version.",
            "Hyväksyntä kattaa suunnitelman SHA-256-tiivisteen: tapauksen, version, käytettävissä olevan summan, jokaisen kohdistuksen ja palautuksen vastaanottajan. Jos jokin näistä muuttuu, aiempi hyväksyntä ei ole enää voimassa.",
            "Ennen suunnitelman toteuttamista PayFix tarkistaa tiivisteen, nykyisen version, yhä käytettävissä olevan summan ja kunkin laskun jäljellä olevan summan.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Palautukset valmistellaan, tarkistetaan ja lähetetään kerran",
      blocks: [
        {
          list: [
            "Asiakas todistaa hallitsevansa palautuslompakkoa allekirjoittamalla sillä viestin. Näin havaitaan myös kirjoitusvirheet ja osoitteet, joista asiakas ei pysty allekirjoittamaan.",
            "PayFix valmistelee täsmällisen palautustransaktion, ja yritys allekirjoittaa sen omassa lompakossaan. Sen jälkeen PayFix tarkistaa, että allekirjoitettu transaktio vastaa valmisteltua.",
            "PayFix tallentaa transaktion allekirjoituksen ennen kuin se lähettää transaktion verkkoon.",
            "Vain yksi palautusyritys voi olla kerrallaan käynnissä; tietokanta valvoo tätä. Uusi yritys sallitaan vasta, kun edellinen on vanhentunut päätymättä lohkoketjuun tai epäonnistunut.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Lompakot ja avaimet",
      blocks: [
        {
          list: [
            "Yritys voi lisätä vastaanottolompakon vain allekirjoittamalla sillä viestin, joten väärin kirjoitettu osoite ei voi vastaanottaa asiakkaiden maksuja.",
            "PayFix ei koskaan pyydä lompakon yksityistä avainta tai siemenlausetta.",
            "Demotilassa demolompakot ovat testiavaimia, joita palvelin säilyttää salattuina, jotta demo toimii ilman lompakkosovellusta. Älä koskaan lähetä niihin oikeita varoja.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      heading: "Tilit ja käyttöoikeudet",
      blocks: [
        {
          list: [
            "Kirjaudut sisään 6-numeroisella koodilla, joka lähetetään sähköpostiisi. Koodi on voimassa 10 minuuttia, sitä voi käyttää kerran ja sen syöttämistä voi yrittää enintään 5 kertaa. Tallennamme koodista vain avaimella lasketun tiivisteen.",
            "Istuntotunnisteet ovat satunnaisia, ne tallennetaan palvelimellemme vain tiivisteenä, ja ne vanhenevat 7 päivän kuluttua. Niitä säilytetään evästeissä, joita skriptit eivät voi lukea ja jotka lähetetään suojatuilla sivustoilla vain salattuja yhteyksiä pitkin.",
            "Ratkaisulinkit sisältävät satunnaisen tunnisteen, jonka tallennamme vain tiivisteenä. Linkki vanhenee 7 päivän kuluttua, ja yritys voi korvata tai perua sen.",
            "Asiakas voi toimia vain siinä tapauksessa, johon hänen oma linkkinsä kuuluu. Tämä tarkistetaan uudelleen jokaisen toiminnon yhteydessä.",
            "Tiimiroolit (omistaja, muokkaaja, katselija) tarkistetaan palvelimella jokaisen muutoksen yhteydessä, ja tärkeät toiminnot kirjataan yrityksen toimintalokiin.",
          ],
        },
      ],
    },
    {
      id: "abuse",
      heading: "Pyyntörajoitukset",
      blocks: [
        "PayFix rajoittaa sitä, kuinka monta kirjautumiskoodia yhteen sähköpostiosoitteeseen voidaan lähettää (5 kappaletta 15 minuutissa ja 20 vuorokaudessa) ja kuinka monta yhdestä verkosta voidaan pyytää (30 tunnissa). Testitoken-faucetilla on lompakkokohtaiset, verkkokohtaiset ja kokonaisrajoitukset. Rajoitukset tallennetaan tiivistettyjen tunnisteiden avulla, eivät selväkielisinä sähköposti- tai IP-osoitteina.",
      ],
    },
    {
      id: "web",
      heading: "Verkkosivuston suojaukset",
      blocks: [
        {
          list: [
            "Strict Transport Security ohjeistaa selaimia käyttämään vain salattuja (HTTPS) yhteyksiä.",
            "Muut verkkosivustot eivät voi näyttää PayFixin sivuja kehyksen sisällä, mikä suojaa maksu- ja hyväksyntänäkymiä klikkauskaappaukselta (clickjacking).",
            "Selaimia kehotetaan olemaan arvaamatta tiedostotyyppejä ja lähettämään muille sivustoille vain rajoitetut viittaustiedot (referrer).",
            "Pääsy kameraan, mikrofoniin ja sijaintiin on estetty.",
            "Salaisuudet, kuten sähköposti- ja tietokanta-avaimet, pysyvät palvelimella eikä niitä koskaan lähetetä selaimeen.",
          ],
        },
      ],
    },
    {
      id: "on-chain-privacy",
      heading: "Yksityiset tiedot pysyvät poissa lohkoketjusta",
      blocks: [
        "Lohkoketjuun kirjoitetaan vain satunnainen viiteavain ja palautusnumero. Nimet, sähköpostiosoitteet ja laskujen tiedot pysyvät PayFixin tietokannassa.",
      ],
    },
    {
      id: "limits",
      heading: "Tunnetut rajoitukset",
      blocks: [
        "PayFix näkee vain yrityksen vastaanottolompakkoihin tulevat maksut ja itse valmistelemansa palautukset. Se ei voi nähdä tai estää palautuksia, jotka lähetetään suoraan lompakosta sovelluksen ulkopuolella.",
      ],
    },
    {
      id: "staying-safe",
      heading: "Näin pysyt turvassa",
      blocks: [
        {
          list: [
            "Pidä sähköpostitilisi suojattuna, sillä kirjautumiskoodit lähetetään sinne.",
            "Tarkista verkkosivuston osoite ennen kuin syötät koodin tai allekirjoitat mitään.",
            "Lue lompakossasi jokainen transaktio ennen kuin allekirjoitat sen.",
            "Älä koskaan jaa yksityistä avaintasi tai siemenlausettasi. PayFix ei koskaan pyydä niitä.",
            "Kirjaudu ulos jaetuilla laitteilla.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      heading: "Haavoittuvuudesta ilmoittaminen",
      blocks: [
        "Jos uskot löytäneesi PayFixista tietoturvaongelman, kerro siitä meille luottamuksellisesti. {contact}",
        "Kerro ilmoituksessa ongelman kuvaus, sen toistamiseen tarvittavat vaiheet, sivu tai toiminto, jota ongelma koskee, sekä sen odotettu vaikutus.",
        "Kun tutkit tietoturvaongelmia:",
        {
          list: [
            "käytä vain omia tilejäsi ja testitietoja;",
            "älä avaa, muuta tai poista muille kuuluvia tietoja, ja lopeta heti, jos näet tällaisia tietoja;",
            "älä tee palvelunestohyökkäyksiä, lähetä roskapostia tai käytä manipulointia (social engineering);",
            "älä käytä testitoken-faucetia tai demolompakoita enempää kuin ongelman osoittamiseen tarvitaan;",
            "anna meille kohtuullisesti aikaa korjata ongelma ennen kuin julkaiset siitä yksityiskohtia.",
          ],
        },
        "Vastineeksi vahvistamme ilmoituksesi vastaanottamisen, kerromme sinulle edistymisestämme ja mainitsemme sinut halutessasi. Emme ryhdy oikeustoimiin vilpittömässä mielessä tehtyä, näitä sääntöjä noudattavaa tutkimusta vastaan. Emme maksa palkkioita.",
        "Ongelmista palveluissa, joita emme hallitse, kuten Solana-verkossa, lompakkosovelluksissa tai palvelin- ja sähköpostipalveluntarjoajissamme, tulee ilmoittaa suoraan kyseisille palveluntarjoajille.",
      ],
    },
  ],
};

export default security;
