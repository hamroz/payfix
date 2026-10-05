import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Política de cookies",
  description: "Las pocas cookies y elementos de almacenamiento del navegador que usa PayFix, para qué sirve cada uno y cuánto dura. Sin cookies de analítica ni de publicidad.",
  updated: "2026-10-05",
  intro: [
    "Esta política explica qué cookies y tecnologías similares de almacenamiento en el navegador usa PayFix, y por qué. En resumen: PayFix solo usa lo que necesita para iniciar tu sesión y recordar las opciones que eliges. No usa cookies de analítica, de publicidad ni de seguimiento.",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "Qué son las cookies y el almacenamiento local",
      blocks: [
        "Una cookie es un pequeño fragmento de texto que un sitio web pide a tu navegador que guarde y le devuelva en visitas posteriores. El almacenamiento local es una función similar que permite a un sitio web guardar pequeños valores en tu navegador. Ninguno de los dos es un programa, y ninguno puede leer otros archivos de tu dispositivo.",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "Cookies que usamos",
      blocks: [
        "Todas estas cookies las establece el propio PayFix (cookies propias). Ninguna se comparte con otros sitios web.",
        {
          list: [
            "<b>pf_b</b> mantiene tu sesión iniciada en tu cuenta de empresa. Contiene un token de sesión aleatorio. Caduca a los 7 días o cuando cierras sesión.",
            "<b>pf_c</b> te mantiene verificado como cliente en un enlace de resolución, después de que introduzcas el código que te enviamos por correo. Contiene un token de sesión aleatorio y caduca a los 7 días.",
            "<b>pf_ws</b> recuerda en qué empresa estás trabajando, si perteneces a más de una. Contiene el identificador interno de la empresa y caduca a los 30 días.",
            "<b>pf_inbox</b> solo se usa en el modo demo. Recuerda la dirección de correo (y, en el caso de los clientes, la empresa) para la que solicitaste un código de inicio de sesión, de modo que la bandeja de la demo muestre tus mensajes y no los de otras personas. Caduca al cabo de 1 día.",
            "<b>pf-locale</b> recuerda el idioma que has elegido. Solo se establece cuando eliges un idioma y caduca al cabo de 1 año. Sin ella, PayFix usa el idioma de tu navegador.",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "Almacenamiento local que usamos",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> recuerda si has elegido el tema claro, el tema oscuro o el ajuste del sistema. Solo se guarda cuando cambias el tema y permanece hasta que lo borres.",
            "<b>walletName</b> recuerda qué billetera del navegador (por ejemplo, Phantom o Solflare) conectaste en una página de pago, de resolución o de ajustes, para que la página pueda volver a conectarse a ella la próxima vez. Permanece hasta que lo borres o desconectes la billetera.",
          ],
        },
        "Tu aplicación de billetera también puede guardar datos en tu navegador. Lo hace conforme a sus propias políticas, no a las nuestras.",
      ],
    },
    {
      id: "no-tracking",
      heading: "Sin analítica ni publicidad",
      blocks: [
        "PayFix no usa herramientas de analítica, redes publicitarias, plugins de redes sociales ni píxeles de seguimiento. Nuestras fuentes se sirven desde nuestro propio sitio, así que cargar una página no implica conectarse a otros servicios de fuentes.",
        "Algunos enlaces llevan a otros sitios web, como Solana Explorer o el de un proveedor de billeteras. Esos sitios pueden establecer sus propias cookies conforme a sus propias políticas.",
      ],
    },
    {
      id: "why-no-banner",
      heading: "Por qué no pedimos tu consentimiento",
      blocks: [
        "Las cookies de sesión, de empresa y de la bandeja de la demo son estrictamente necesarias para el servicio que solicitas: sin ellas, no podrías mantener la sesión iniciada. Los ajustes de idioma y de tema solo se guardan cuando los eliges, para recordar esa elección. Como no usamos ninguna otra cookie ni otro tipo de almacenamiento, no mostramos un banner de cookies.",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "Cómo protegemos las cookies",
      blocks: [
        {
          list: [
            "Las cookies de sesión, de empresa y de la bandeja de la demo llevan el atributo HttpOnly, por lo que los scripts de la página no pueden leerlas.",
            "En los sitios seguros (HTTPS), las cookies llevan el atributo Secure, por lo que solo se envían a través de conexiones cifradas.",
            "Las cookies usan el ajuste SameSite=Lax, que impide que la mayoría de las solicitudes de otros sitios web las utilicen.",
            "Nuestro servidor solo guarda un hash de cada token de sesión, de modo que una copia de nuestra base de datos no sirve para iniciar sesión como tú.",
          ],
        },
        "La cookie de idioma no lleva el atributo HttpOnly porque el menú de idioma la lee. Solo contiene un código de idioma.",
      ],
    },
    {
      id: "managing",
      heading: "Cómo controlarlas o eliminarlas",
      blocks: [
        "Puedes ver y eliminar las cookies y el almacenamiento local en los ajustes de tu navegador, normalmente en el apartado de privacidad o de datos de sitios. También puedes bloquear las cookies de este sitio.",
        "Si eliminas o bloqueas las cookies de sesión, se cerrará tu sesión y no podrás volver a iniciarla hasta que las permitas. Si eliminas los ajustes de idioma o de tema, PayFix volverá al idioma de tu navegador y al tema de tu sistema.",
      ],
    },
    {
      id: "changes",
      heading: "Cambios en esta política",
      blocks: [
        "Si añadimos, modificamos o eliminamos una cookie, actualizaremos esta página y la fecha que figura al principio. Si tienes preguntas, ponte en contacto con nosotros. {contact}",
      ],
    },
  ],
};

export default cookies;
