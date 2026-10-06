import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "Прототип, созданный на хакатоне. Только тестовые токены — не для средств клиентов. PayFix не видит возвраты, отправленные в обход приложения.",
    legalHeading: "Документы",
    productHeading: "Продукт",
    howItWorks: "Как это работает",
    signIn: "Войти",
    rights: "© {year} PayFix. Все права защищены.",
  },
  docs: {
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    cookies: "Политика в отношении cookie",
    security: "Безопасность",
  },
  page: {
    updated: "Обновлено {date}",
    onThisPage: "На этой странице",
    otherDocuments: "Другие документы",
    backHome: "На главную",
    translationNote: "Перевод приведён для удобства. Если он расходится с английской версией, действует английская версия.",
    fallbackNote: "Этот документ пока недоступен на вашем языке, поэтому он показан на английском.",
    home: "Главная PayFix",
    contactEmail: "Написать нам можно на <link>{email}</link>.",
    contactFallback: "Этот сервис пока не опубликовал контактный адрес. До тех пор обращайтесь к человеку или команде, которые поделились с вами этим сервисом PayFix.",
  },
};

export default legal;
