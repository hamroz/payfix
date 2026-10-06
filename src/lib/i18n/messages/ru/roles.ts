import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "Владелец", description: "Полный доступ, а также команда, кошельки и настройки компании" },
  editor: { label: "Редактор", description: "Счета, клиенты, утверждения и возвраты" },
  viewer: { label: "Наблюдатель", description: "Только просмотр и выгрузки" },
};

export default roles;
