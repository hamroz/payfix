import type { Messages } from "../types";

const landing: Messages["landing"] = {
  nav: {
    howItWorks: "Näin se toimii",
    signIn: "Kirjaudu sisään",
    dashboard: "Hallintapaneeli",
  },
  hero: {
    simulatedChain: "Simuloitu ketju",
    cluster: "Solana {cluster}",
    tagline: "USDC-maksujen selvitys toimistoille",
    titleLead: "Väärin menneet maksut",
    titleAccent: "kuntoon.",
    body: "Kun asiakas maksaa liikaa, maksaa kahdesti tai lähettää USDC:tä ilman viitettä, PayFix muuttaa tilanteen sovituksi ja loppuun viedyksi selvitykseksi – yhden yhteisen linkin kautta, johon molemmat osapuolet voivat luottaa.",
    tryDemo: "Kokeile live-demoa",
    getStarted: "Aloita",
    seeHow: "Katso, miten se toimii",
    signIn: "Kirjaudu sisään",
    testNote: "Demossa käytetään selvästi merkittyä testitokenia, ei koskaan oikeaa rahaa.",
    equation: "{received} vastaanotettu = {invoice} + {applied} + {refunded}.",
  },
  how: {
    eyebrow: "Ratkaisun kulku",
    title: "Viestistä ”maksoit liikaa” selvitettyyn asiaan neljässä vaiheessa.",
  },
  steps: {
    detect: {
      title: "Havaitse",
      body: "Jokainen lompakkoosi saapuva siirto vahvistetaan Solanassa – mint, summa, vastaanottaja ja vahvistus – ja kohdistetaan oikealle laskulle. Ylimaksut, kaksoismaksut ja viitteettömät siirrot kootaan yhteen jonoon.",
    },
    propose: {
      title: "Ehdota",
      body: "Asiakkaasi saa yhden suojatun linkin. Hän valitsee, minne ylimenevä osa menee: toiselle laskulle, saldoksi, palautukseksi tai näiden yhdistelmänä. Palautuslompakot todistetaan allekirjoituksella.",
    },
    approve: {
      title: "Hyväksy",
      body: "Hyväksyt täsmälleen tietyn version. Jos summa, lasku tai vastaanottaja muuttuu, hyväksyntä mitätöityy, kunnes hyväksyt uudelleen.",
    },
    settle: {
      title: "Selvitä",
      body: "Allekirjoitat palautuksen omasta lompakostasi. Kohdistukset kirjataan, palautus vahvistuu ketjussa ja molemmat osapuolet saavat saman kuitin.",
    },
  },
  film: {
    eyebrow: "Katso käytännössä",
    title: "Yksi ylimaksu alusta loppuun.",
    note: "49 sekuntia · live-demon skenaario testirahalla",
  },
  controls: {
    eyebrow: "Tehty rahan käsittelyyn",
    title: "Kontrollit, jotka talousosastokin hyväksyisi.",
    body: "Solana tarjoaa todennettavat saapuvat maksut ja kauppiaan allekirjoittamat palautukset. PayFix tuo väliin puuttuvan osan: sopimisen, valtuutuksen ja pääkirjan, joka täsmää aina.",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "Ei koskaan kahteen kertaan",
      body: "Jokainen ketjun allekirjoitus huomioidaan vain kerran. Uudelleensynkronoinnit, uudelleenyritykset ja uudelleenkäynnistykset eivät voi kasvattaa vastaanotettua summaa.",
    },
    hashBound: {
      title: "Hyväksyntä sidottu tiivisteeseen",
      body: "Hyväksyntä kattaa summat, laskut ja vastaanottajan. Jokainen muutos luo uuden version, joka on hyväksyttävä erikseen.",
    },
    oneRefund: {
      title: "Vain yksi palautus kerrallaan",
      body: "PayFix tallentaa palautuksen allekirjoituksen ennen lähettämistä ja sallii uuden yrityksen vasta, kun blockhash on vanhentunut eikä transaktio ole mennyt läpi.",
    },
    everyDollar: {
      title: "Jokainen dollari selitetty",
      body: "Kahdenkertainen pääkirja tarkkoina token-yksikköinä. Vastaanotettu on aina kohdistettu + saldo + palautettu + odottava + ratkaisematon.",
    },
  },
  heroDemo: {
    invoiceCount: { one: "{count} lasku", other: "{count} laskua" },
    incomingTransfer: "Saapuva siirto",
    received: "{amount} vastaanotettu",
    reconciled: "Täsmäytetty",
    needsResolution: "{amount} vaatii ratkaisun",
    verifying: "Vahvistetaan…",
    refunded: "Palautettu",
    unresolved: "Ratkaisematta",
    stages: {
      arrive: { title: "Maksut saapuvat", note: "Kaksi siirtoa vahvistettu Solanassa" },
      excess: { title: "Lasku maksettu, ylimaksua {amount}", note: "Ylimenevä osa merkitään – sitä ei arvata" },
      propose: { title: "Asiakas ehdottaa jakoa", note: "{applied} → {invoice} · palautus {refund}" },
      approve: { title: "Yritys hyväksyy version {version}", note: "Täsmällinen suunnitelma, tiivisteeseen sidottu hyväksyntä" },
      settled: { title: "Jokaisella dollarilla on paikkansa", note: "Palautus vahvistettu · ratkaisematta {amount}" },
    },
  },
};

export default landing;
