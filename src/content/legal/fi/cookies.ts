import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Evästekäytäntö",
  description: "PayFixin käyttämät harvat evästeet ja selaimen tallennustiedot, mitä kukin niistä tekee ja kuinka kauan se säilyy. Ei analytiikka- eikä mainosevästeitä.",
  updated: "2026-10-05",
  intro: [
    "Tässä käytännössä kerrotaan, mitä evästeitä ja vastaavia selaimen tallennustietoja PayFix käyttää ja miksi. Lyhyesti: PayFix käyttää vain sitä, mitä se tarvitsee sisäänkirjautumiseen ja tekemiesi valintojen muistamiseen. Se ei käytä analytiikka-, mainos- tai seurantaevästeitä.",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "Mitä evästeet ja paikallinen tallennustila ovat",
      blocks: [
        "Eväste on pieni tekstitiedosto, jonka verkkosivusto pyytää selainta tallentamaan ja lähettämään takaisin myöhemmillä käynneillä. Paikallinen tallennustila (local storage) on vastaava ominaisuus, jonka avulla verkkosivusto voi säilyttää pieniä arvoja selaimessasi. Kumpikaan ei ole ohjelma, eikä kumpikaan voi lukea laitteesi muita tiedostoja.",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "Käyttämämme evästeet",
      blocks: [
        "PayFix asettaa kaikki nämä evästeet itse (ensimmäisen osapuolen evästeet). Mitään niistä ei jaeta muille verkkosivustoille.",
        {
          list: [
            "<b>pf_b</b> pitää sinut kirjautuneena yritystiliisi. Se sisältää satunnaisen istuntotunnisteen. Se vanhenee 7 päivän kuluttua tai kun kirjaudut ulos.",
            "<b>pf_c</b> pitää sinut vahvistettuna ratkaisulinkin asiakkaana, kun olet syöttänyt sähköpostitse lähettämämme koodin. Se sisältää satunnaisen istuntotunnisteen ja vanhenee 7 päivän kuluttua.",
            "<b>pf_ws</b> muistaa, missä yrityksessä työskentelet, jos kuulut useampaan kuin yhteen. Se sisältää yrityksen sisäisen tunnisteen ja vanhenee 30 päivän kuluttua.",
            "<b>pf_inbox</b> on käytössä vain demotilassa. Se muistaa sähköpostiosoitteen (ja asiakkaiden kohdalla yrityksen), jolle pyysit kirjautumiskoodin, jotta demopostilaatikko näyttää vain sinun viestisi eikä muiden. Se vanhenee 1 päivän kuluttua.",
            "<b>pf-locale</b> muistaa valitsemasi kielen. Se asetetaan vain, kun valitset kielen, ja se vanhenee 1 vuoden kuluttua. Ilman sitä PayFix käyttää selaimesi kieltä.",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Käyttämämme paikallinen tallennustila",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> muistaa, valitsitko vaalean teeman, tumman teeman vai järjestelmäasetuksesi. Se asetetaan vain, kun vaihdat teemaa, ja se säilyy, kunnes tyhjennät sen.",
            "<b>walletName</b> muistaa, minkä selainlompakon (esimerkiksi Phantomin tai Solflaren) yhdistit maksu-, ratkaisu- tai asetussivulla, jotta sivu voi yhdistää siihen uudelleen seuraavalla kerralla. Se säilyy, kunnes tyhjennät sen tai katkaiset yhteyden.",
          ],
        },
        "Myös lompakkosovelluksesi voi tallentaa tietoja selaimeesi. Se tekee niin omien käytäntöjensä, ei meidän käytäntöjemme mukaisesti.",
      ],
    },
    {
      id: "no-tracking",
      heading: "Ei analytiikkaa eikä mainontaa",
      blocks: [
        "PayFix ei käytä analytiikkatyökaluja, mainosverkostoja, sosiaalisen median laajennuksia tai seurantapikseleitä. Fonttimme ladataan omalta sivustoltamme, joten sivun lataaminen ei ota yhteyttä muihin fonttipalveluihin.",
        "Jotkin linkit vievät muille verkkosivustoille, kuten Solana Exploreriin tai lompakkopalvelun tarjoajan sivuille. Nämä sivustot voivat asettaa omia evästeitään omien käytäntöjensä mukaisesti.",
      ],
    },
    {
      id: "why-no-banner",
      heading: "Miksi emme pyydä suostumusta",
      blocks: [
        "Istunto-, yritys- ja demopostilaatikkoevästeet ovat välttämättömiä pyytämäsi palvelun kannalta: ilman niitä et pysyisi kirjautuneena. Kieli- ja teema-asetukset tallennetaan vain, kun valitset ne, jotta valintasi muistetaan. Koska emme käytä muita evästeitä tai tallennustietoja, emme näytä evästebanneria.",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "Miten suojaamme evästeet",
      blocks: [
        {
          list: [
            "Istunto-, yritys- ja demopostilaatikkoevästeet on merkitty HttpOnly-määreellä, joten sivun skriptit eivät voi lukea niitä.",
            "Suojatuilla (HTTPS) sivustoilla evästeet on merkitty Secure-määreellä, joten ne lähetetään vain salattuja yhteyksiä pitkin.",
            "Evästeissä on SameSite=Lax-asetus, joka estää useimpia muiden verkkosivustojen pyyntöjä käyttämästä niitä.",
            "Palvelimemme tallentaa kustakin istuntotunnisteesta vain tiivisteen, joten tietokantamme kopiolla ei voi kirjautua sisään sinuna.",
          ],
        },
        "Kielieväste ei ole HttpOnly-eväste, koska kielivalikko lukee sen. Se sisältää vain kielikoodin.",
      ],
    },
    {
      id: "managing",
      heading: "Evästeiden hallinta ja poistaminen",
      blocks: [
        "Voit tarkastella ja poistaa evästeitä ja paikallisen tallennustilan tietoja selaimesi asetuksista, yleensä tietosuoja- tai sivustotietojen kohdasta. Voit myös estää evästeet tältä sivustolta.",
        "Jos poistat tai estät istuntoevästeet, sinut kirjataan ulos, etkä voi kirjautua uudelleen sisään ennen kuin sallit ne. Jos poistat kieli- tai teema-asetukset, PayFix palaa käyttämään selaimesi kieltä ja järjestelmäsi teemaa.",
      ],
    },
    {
      id: "changes",
      heading: "Muutokset tähän käytäntöön",
      blocks: [
        "Jos lisäämme, muutamme tai poistamme evästeen, päivitämme tämän sivun ja sen yläosassa olevan päivämäärän. Jos sinulla on kysyttävää, ota meihin yhteyttä. {contact}",
      ],
    },
  ],
};

export default cookies;
