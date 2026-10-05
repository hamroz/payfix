import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "Właściciel", description: "Pełny dostęp, w tym zespół, portfele i ustawienia przestrzeni roboczej" },
  editor: { label: "Edytujący", description: "Faktury, klienci, zatwierdzenia i zwroty" },
  viewer: { label: "Przeglądający", description: "Tylko podgląd i eksport danych" },
};

export default roles;
