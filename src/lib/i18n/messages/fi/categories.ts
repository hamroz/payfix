import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "Maksut", description: "Saapuvat maksut, siirrot ilman laskuviitettä ja lompakostasi lähtevät varat." },
  exceptions: { label: "Poikkeamat", description: "Päätöstä vaativat ylimaksut ja kaksoismaksut sekä niiden ratkeaminen." },
  resolutions: { label: "Ratkaisut", description: "Ratkaisulinkit, asiakkaiden ehdotukset, hyväksynnät ja toteutetut suunnitelmat." },
  refunds: { label: "Palautukset", description: "Allekirjoitetut, ketjussa vahvistetut, epäonnistuneet ja vanhentuneet palautukset." },
  invoices: { label: "Laskut", description: "Uudet laskut, kokonaan maksetut ja erääntyneet laskut sekä käytetty saldo." },
  customers: { label: "Asiakkaat", description: "Tähän yritykseen lisätyt uudet asiakkaat." },
  team: { label: "Tiimi ja lompakot", description: "Liittyvät ja lähtevät henkilöt, roolimuutokset sekä vastaanottolompakoiden muutokset." },
};

export default categories;
