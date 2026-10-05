import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "Omistaja", description: "Kaikki oikeudet sekä tiimi, lompakot ja työtilan asetukset" },
  editor: { label: "Muokkaaja", description: "Laskut, asiakkaat, hyväksynnät ja palautukset" },
  viewer: { label: "Katselija", description: "Vain lukuoikeus ja viennit" },
};

export default roles;
