import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "Prototipo de hackathon. Solo tokens de prueba; no apto para fondos de clientes. PayFix no puede ver los reembolsos enviados fuera de la aplicación.",
    legalHeading: "Legal",
    productHeading: "Producto",
    howItWorks: "Cómo funciona",
    signIn: "Iniciar sesión",
    rights: "© {year} PayFix. Todos los derechos reservados.",
  },
  docs: {
    privacy: "Política de privacidad",
    terms: "Condiciones de uso",
    cookies: "Política de cookies",
    security: "Seguridad",
  },
  page: {
    updated: "Última actualización: {date}",
    onThisPage: "En esta página",
    otherDocuments: "Otros documentos",
    backHome: "Volver al inicio",
    translationNote: "Esta traducción se ofrece por comodidad. Si difiere de la versión en inglés, prevalece la versión en inglés.",
    fallbackNote: "Este documento aún no está disponible en tu idioma, por lo que se muestra en inglés.",
    home: "Inicio de PayFix",
    contactEmail: "Puedes escribirnos a <link>{email}</link>.",
    contactFallback: "Este servicio aún no ha publicado una dirección de correo de contacto. Mientras tanto, ponte en contacto con la persona o el equipo que compartió contigo este servicio de PayFix.",
  },
};

export default legal;
