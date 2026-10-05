import type { LegalDoc } from "../types";

const security: LegalDoc = {
  title: "Seguridad",
  description: "Cómo protege PayFix los pagos, las aprobaciones, los reembolsos y las cuentas, y cómo informar de una vulnerabilidad.",
  updated: "2026-10-05",
  intro: [
    "PayFix se ocupa del momento en que un pago sale mal, por eso está diseñado para que cada paso pueda comprobarse. Esta página explica cómo protege PayFix los pagos, las aprobaciones, los reembolsos y las cuentas, y cómo puedes informarnos de un problema de seguridad.",
    "PayFix es un prototipo de hackathon que funciona en redes de prueba y solo con tokens de prueba. No ha pasado una auditoría de seguridad independiente. No lo uses con fondos reales.",
  ],
  sections: [
    {
      id: "payments",
      heading: "Los pagos se verifican y se cuentan una sola vez",
      blocks: [
        {
          list: [
            "PayFix comprueba cada transferencia entrante directamente en la blockchain: el token, la cuenta receptora, el importe y que la transacción esté confirmada. El importe se obtiene de los saldos de las cuentas antes y después de la transacción, y las transacciones fallidas se ignoran.",
            "Cada firma de transacción se registra una sola vez, en la misma transacción de base de datos que contabiliza el pago. Volver a sincronizar, reintentar o reiniciar el servidor no puede hacer que el mismo pago se cuente dos veces.",
            "Una transferencia sin referencia de pago nunca se vincula automáticamente con una factura. Queda sin asignar hasta que la empresa la asigna y el cliente confirma el plan.",
          ],
        },
      ],
    },
    {
      id: "ledger",
      heading: "Un libro mayor que siempre cuadra",
      blocks: [
        "Cada importe se registra en un libro mayor de partida doble, en unidades enteras exactas del token, sin redondeos. Cada asiento suma cero y tiene una clave única, de modo que procesar dos veces el mismo evento no tiene ningún efecto. En todo momento, el total recibido es igual a la suma de lo aplicado a facturas, lo mantenido como saldo a favor, lo reembolsado, lo pendiente de reembolso y lo que aún está sin resolver.",
      ],
    },
    {
      id: "approvals",
      heading: "Las aprobaciones están ligadas al plan exacto",
      blocks: [
        {
          list: [
            "Cada versión de un plan de resolución queda fijada en cuanto se envía. Cualquier cambio crea una nueva versión.",
            "Una aprobación cubre un hash SHA-256 del plan: el caso, la versión, el importe disponible, cada asignación y el destino del reembolso. Si cualquiera de estos elementos cambia, la aprobación anterior deja de ser válida.",
            "Antes de ejecutar un plan, PayFix comprueba el hash, la versión actual, el importe que sigue disponible y el saldo pendiente de cada factura.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "Los reembolsos se preparan, se comprueban y se envían una sola vez",
      blocks: [
        {
          list: [
            "El cliente demuestra que controla la billetera de reembolso firmando un mensaje con ella. Así también se detectan errores al escribir la dirección y direcciones desde las que el cliente no puede firmar.",
            "PayFix prepara la transacción de reembolso exacta y la empresa la firma en su propia billetera. Después, PayFix comprueba que la transacción firmada coincide con la que preparó.",
            "PayFix registra la firma de la transacción antes de enviarla a la red.",
            "Solo puede haber un intento de reembolso en curso a la vez, y la base de datos lo garantiza. Solo se permite un nuevo intento cuando el anterior ha caducado sin llegar a la blockchain o ha fallado.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Billeteras y claves",
      blocks: [
        {
          list: [
            "Una empresa solo puede añadir una billetera de cobro firmando un mensaje con ella, de modo que una dirección mal escrita no pueda recibir los pagos de los clientes.",
            "PayFix nunca pide la clave privada ni la frase de recuperación de una billetera.",
            "En el modo demo, las billeteras de demo son claves de prueba que el servidor guarda cifradas, para que la demo funcione sin una aplicación de billetera. No les envíes nunca fondos reales.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      heading: "Cuentas y acceso",
      blocks: [
        {
          list: [
            "Inicias sesión con un código de 6 dígitos que se envía a tu correo. Cada código es válido durante 10 minutos, se puede usar una sola vez y admite como máximo 5 intentos. Solo guardamos un hash con clave del código.",
            "Los tokens de sesión son aleatorios, nuestro servidor solo los guarda como hash y caducan a los 7 días. Se guardan en cookies que los scripts no pueden leer y que, en los sitios seguros, solo se envían a través de conexiones cifradas.",
            "Los enlaces de resolución contienen un token aleatorio que solo guardamos como hash. Un enlace caduca a los 7 días, y la empresa puede sustituirlo o revocarlo.",
            "Un cliente solo puede actuar sobre el caso al que pertenece su propio enlace. Esto se vuelve a comprobar en cada acción.",
            "Los roles del equipo (propietario, editor, lector) se comprueban en el servidor en cada cambio, y las acciones importantes quedan registradas en el registro de actividad de la empresa.",
          ],
        },
      ],
    },
    {
      id: "abuse",
      heading: "Límites de frecuencia",
      blocks: [
        "PayFix limita cuántos códigos de inicio de sesión se pueden enviar a una misma dirección de correo (5 cada 15 minutos y 20 al día) y cuántos se pueden solicitar desde una misma red (30 por hora). El faucet de tokens de prueba tiene límites por billetera, por red y globales. Estos límites se guardan con identificadores convertidos en hash, no con direcciones de correo ni direcciones IP en texto claro.",
      ],
    },
    {
      id: "web",
      heading: "Protecciones web",
      blocks: [
        {
          list: [
            "Strict Transport Security indica a los navegadores que solo usen conexiones cifradas (HTTPS).",
            "Otros sitios web no pueden mostrar páginas de PayFix dentro de un marco, lo que protege las pantallas de pago y de aprobación frente al clickjacking.",
            "Se indica a los navegadores que no intenten adivinar el tipo de los archivos y que solo envíen información limitada del sitio de origen a otros sitios.",
            "El acceso a la cámara, el micrófono y la ubicación está desactivado.",
            "Los secretos, como las claves del correo y de la base de datos, permanecen en el servidor y nunca se envían al navegador.",
          ],
        },
      ],
    },
    {
      id: "on-chain-privacy",
      heading: "Los datos privados no se escriben en la blockchain",
      blocks: [
        "En la blockchain solo se escriben una clave de referencia aleatoria y un número de reembolso. Los nombres, las direcciones de correo y los datos de las facturas permanecen en la base de datos de PayFix.",
      ],
    },
    {
      id: "limits",
      heading: "Limitaciones conocidas",
      blocks: [
        "PayFix solo puede ver los pagos a las billeteras de cobro de la empresa y los reembolsos que prepara él mismo. No puede ver ni impedir los reembolsos enviados directamente desde una billetera fuera de la aplicación.",
      ],
    },
    {
      id: "staying-safe",
      heading: "Cómo puedes protegerte",
      blocks: [
        {
          list: [
            "Mantén segura tu cuenta de correo, porque ahí se envían los códigos de inicio de sesión.",
            "Comprueba la dirección del sitio web antes de introducir un código o de firmar cualquier cosa.",
            "Lee cada transacción en tu billetera antes de firmarla.",
            "No compartas nunca tu clave privada ni tu frase de recuperación. PayFix nunca te las pedirá.",
            "Cierra sesión en los dispositivos compartidos.",
          ],
        },
      ],
    },
    {
      id: "disclosure",
      heading: "Cómo informar de una vulnerabilidad",
      blocks: [
        "Si crees que has encontrado un problema de seguridad en PayFix, comunícanoslo de forma privada. {contact}",
        "Incluye una descripción del problema, los pasos para reproducirlo, la página o función afectada y el impacto que prevés.",
        "Cuando investigues problemas de seguridad, te pedimos que:",
        {
          list: [
            "uses solo tus propias cuentas y datos de prueba;",
            "no accedas a datos de otras personas ni los modifiques o elimines, y te detengas en cuanto veas datos de ese tipo;",
            "no lances ataques de denegación de servicio, no envíes spam ni uses ingeniería social;",
            "no uses el faucet de tokens de prueba ni las billeteras de demo más allá de lo necesario para demostrar el problema;",
            "nos des un plazo razonable para solucionar el problema antes de compartir los detalles públicamente.",
          ],
        },
        "A cambio, confirmaremos que hemos recibido tu informe, te mantendremos al tanto de nuestros avances y, si lo deseas, te reconoceremos el hallazgo. No emprenderemos acciones legales contra investigaciones realizadas de buena fe que respeten estas normas. No ofrecemos recompensas económicas.",
        "Los problemas en servicios que no controlamos, como la red Solana, las aplicaciones de billetera o nuestros proveedores de alojamiento y de correo, deben comunicarse a esos proveedores.",
      ],
    },
  ],
};

export default security;
