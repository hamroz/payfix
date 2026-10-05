import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "Вход",
  homeLink: "Главная PayFix",
  email: {
    title: "Войдите или создайте аккаунт",
    subtitle: "Мы пришлём 6-значный код на почту. Без паролей.",
    label: "Рабочая почта",
    placeholder: "you@agency.com",
    demo: "<b>Живое демо.</b> Подойдёт любой email. Вы получите собственную закрытую компанию с тестовым кошельком в devnet. Коды приходят в демо-почту в левом нижнем углу.",
  },
  code: {
    title: "Проверьте почту",
    sent: "Мы отправили 6-значный код на <email>{email}</email>.",
    verifying: "Проверяем…",
    resend: "Отправить код ещё раз",
  },
};

export default auth;
