import type { LegalDoc } from "../types";

const privacy: LegalDoc = {
  title: "Política de privacidad",
  description: "Qué datos personales recopila PayFix, para qué, quién los recibe, cuánto tiempo se conservan y qué derechos tienes.",
  updated: "2026-10-05",
  intro: [
    "Esta política explica qué datos personales recopila el servicio PayFix, por qué los recopilamos, quién los recibe, cuánto tiempo los conservamos y qué derechos tienes. En esta política, «nosotros» se refiere al operador de este servicio PayFix.",
    "PayFix es un prototipo de hackathon. Funciona en la red de pruebas devnet de Solana o en una cadena simulada, con tokens de prueba que no tienen valor monetario. Usa datos de prueba siempre que puedas y no utilices PayFix para fondos reales de clientes.",
  ],
  sections: [
    {
      id: "who-we-are",
      heading: "Quién es el responsable",
      blocks: [
        "El operador de este servicio PayFix es el responsable de los datos personales que se describen en esta política. {contact}",
        "Si una empresa usa PayFix para enviarte una factura o un enlace de resolución, esa empresa decide qué datos tuyos introduce. Si tienes preguntas sobre los registros propios de esa empresa, también puedes ponerte en contacto directamente con ella.",
      ],
    },
    {
      id: "data-we-collect",
      heading: "Qué datos recopilamos",
      blocks: [
        {
          list: [
            "<b>Datos de la cuenta:</b> la dirección de correo con la que inicias sesión. Cuando solicitas un código de inicio de sesión, creamos un registro de cuenta para esa dirección.",
            "<b>Datos de la empresa y del equipo:</b> los nombres de las empresas, la dirección de correo de la persona que creó cada empresa, las direcciones de correo y los roles de los miembros del equipo, y los ajustes de notificaciones de cada miembro.",
            "<b>Datos de clientes y facturas</b> que introducen las empresas: nombres y direcciones de correo de los clientes, y números, conceptos, importes y fechas de vencimiento de las facturas.",
            "<b>Datos de resolución:</b> los planes que proponen clientes y empresas, las notas que escriben, las aprobaciones y la dirección de la billetera de reembolso que elige el cliente, junto con el mensaje firmado que demuestra que el cliente controla esa billetera.",
            "<b>Datos de billeteras y pagos:</b> direcciones de billeteras, firmas de transacciones, importes y horas que PayFix lee de la blockchain o genera para los reembolsos.",
            "<b>Datos de seguridad:</b> códigos de inicio de sesión y tokens de sesión (guardados solo en forma de hash), un registro de actividad de las acciones realizadas en cada empresa y registros de límite de frecuencia. Estos últimos contienen un hash abreviado de tu dirección de correo o de tu dirección IP, no la dirección en sí.",
            "<b>Registro de correos:</b> el destinatario, el asunto, el texto y el estado de entrega de los correos que envía PayFix.",
            "<b>Datos técnicos:</b> tu dirección IP e información básica del navegador, que nuestro proveedor de alojamiento trata cuando tu navegador se conecta al servicio.",
          ],
        },
        "No te pedimos tu domicilio, número de teléfono, fecha de nacimiento, documentos de identidad oficiales, datos bancarios ni las claves privadas de tu billetera.",
      ],
    },
    {
      id: "how-we-use-data",
      heading: "Cómo usamos tus datos",
      blocks: [
        {
          list: [
            "Para prestar el servicio: iniciar tu sesión, vincular pagos con facturas, gestionar resoluciones y reembolsos, y generar comprobantes.",
            "Para enviar los correos que el servicio necesita: códigos de inicio de sesión, enlaces de resolución, invitaciones al equipo y solicitudes de cambio de un plan.",
            "Para mantener PayFix seguro y evitar abusos, por ejemplo, limitando cuántos códigos de inicio de sesión o tokens de prueba se pueden solicitar.",
            "Para llevar registros de pagos completos y exactos, de modo que cada importe recibido pueda explicarse.",
          ],
        },
        "No vendemos tus datos. No los usamos para publicidad ni para elaborar perfiles, y PayFix no utiliza herramientas de analítica ni de seguimiento.",
      ],
    },
    {
      id: "legal-bases",
      heading: "Bases jurídicas",
      blocks: [
        "Cuando se aplican leyes de protección de datos como el Reglamento General de Protección de Datos de la UE (RGPD), tratamos tus datos con las siguientes bases jurídicas:",
        {
          list: [
            "<b>Ejecución de un contrato:</b> para prestar el servicio solicitado por ti o por tu empresa.",
            "<b>Interés legítimo:</b> para mantener el servicio seguro, evitar abusos y llevar registros fiables. Solo nos basamos en él cuando tus derechos no prevalecen sobre estos intereses.",
            "<b>Obligaciones legales:</b> cuando una ley nos exige conservar o comunicar datos.",
          ],
        },
      ],
    },
    {
      id: "blockchain",
      heading: "Datos públicos en la blockchain",
      blocks: [
        "Los pagos y reembolsos son transacciones en una blockchain pública. Cualquiera puede ver las direcciones de billetera, los importes y las horas de esas transacciones, y ni nosotros ni nadie puede modificarlos ni eliminarlos.",
        "PayFix no incluye nombres, direcciones de correo ni datos de facturas en la blockchain. Solo añade una clave de referencia aleatoria a las solicitudes de pago y un número de reembolso a los reembolsos.",
      ],
    },
    {
      id: "sharing",
      heading: "Quién recibe tus datos",
      blocks: [
        "Solo compartimos datos con los proveedores de servicios que necesitamos para hacer funcionar PayFix:",
        {
          list: [
            "<b>Proveedores de alojamiento y de bases de datos</b> que ejecutan la aplicación y almacenan sus datos. La demo pública usa Vercel para el alojamiento y Neon para la base de datos.",
            "<b>Resend</b>, que entrega nuestros correos. Recibe la dirección del destinatario y el contenido de cada correo.",
            "<b>Proveedores de la red Solana (nodos RPC)</b>, a los que tu navegador y nuestro servidor se conectan para leer y enviar transacciones. Pueden ver tu dirección IP y las direcciones de billetera que se consultan.",
            "<b>Aplicaciones de billetera</b> que decidas conectar, como Phantom o Solflare. Tratan los datos conforme a sus propias políticas de privacidad.",
          ],
        },
        "Dentro de PayFix, los miembros de una empresa pueden ver los clientes, las facturas, los pagos y la actividad de esa empresa. Un cliente solo puede ver el caso y las facturas vinculados a su propio enlace de resolución.",
        "También podemos comunicar datos cuando la ley lo exija, o para proteger los derechos y la seguridad de los usuarios y del servicio.",
      ],
    },
    {
      id: "international-transfers",
      heading: "Transferencias internacionales",
      blocks: [
        "Nuestros proveedores de servicios pueden tratar datos en países distintos del tuyo, incluidos los Estados Unidos. Cuando la normativa de protección de datos exige garantías para estas transferencias, nos basamos en las garantías que ofrecen los proveedores, como las cláusulas contractuales tipo.",
      ],
    },
    {
      id: "retention",
      heading: "Cuánto tiempo conservamos los datos",
      blocks: [
        {
          list: [
            "Los códigos de inicio de sesión son válidos durante 10 minutos y solo se pueden usar una vez.",
            "Las sesiones finalizan a los 7 días, o antes si cierras sesión.",
            "Los enlaces de resolución caducan a los 7 días, o antes si la empresa los sustituye o los revoca.",
            "Los registros de límite de frecuencia suelen eliminarse al cabo de unos dos días.",
            "Una vez entregado un correo, el enlace que contenía se elimina de nuestro registro de correos. En el modo demo, los correos no se envían: se quedan en la base de datos y solo se muestran en la bandeja de la demo.",
            "Los registros de cuentas, empresas, facturas, pagos y actividad se conservan mientras exista la cuenta o la empresa, porque los registros de pagos deben estar completos. En el modo demo, los propietarios de una empresa pueden restablecer sus datos en cualquier momento.",
            "Nuestro proveedor de alojamiento conserva los registros del servidor durante un tiempo limitado. En el modo demo, estos registros también contienen las direcciones de correo que solicitan códigos de inicio de sesión y los propios códigos.",
          ],
        },
        "Los despliegues de prueba de PayFix pueden restablecerse o cerrarse, lo que elimina sus datos. Los datos de la blockchain pública son permanentes.",
      ],
    },
    {
      id: "security",
      heading: "Seguridad",
      blocks: [
        "Protegemos tus datos con medidas como códigos y tokens de sesión guardados como hash, cookies que los scripts no pueden leer, conexiones cifradas, comprobaciones de rol en cada cambio y límites de frecuencia. Nuestra página de Seguridad describe estas medidas con más detalle. Ningún sistema es completamente seguro, así que te pedimos que nos informes de cualquier vulnerabilidad que encuentres.",
      ],
    },
    {
      id: "your-rights",
      heading: "Tus derechos",
      blocks: [
        "Según dónde vivas, puedes tener derecho a:",
        {
          list: [
            "acceder a los datos personales que tenemos sobre ti y recibir una copia;",
            "rectificar los datos que sean incorrectos o estén incompletos;",
            "pedirnos que eliminemos tus datos;",
            "pedirnos que limitemos el uso que hacemos de tus datos, u oponerte a dicho uso;",
            "recibir tus datos en un formato estructurado y de lectura mecánica (portabilidad de los datos);",
            "presentar una reclamación ante una autoridad de control de protección de datos, en especial la del país donde vives o trabajas.",
          ],
        },
        "Para ejercer estos derechos, ponte en contacto con nosotros. {contact} Es posible que te pidamos que confirmes que la dirección de correo es tuya antes de atender una solicitud. No podemos eliminar ni modificar datos de la blockchain pública, y podemos conservar los registros necesarios para mantener completos los registros de pagos o para cumplir obligaciones legales.",
      ],
    },
    {
      id: "children",
      heading: "Menores",
      blocks: ["PayFix es una herramienta profesional y no está pensada para menores. No la uses si tienes menos de 18 años."],
    },
    {
      id: "changes",
      heading: "Cambios en esta política",
      blocks: [
        "Podemos actualizar esta política cuando cambien el servicio o la ley. La fecha que figura al principio de esta página indica cuándo se actualizó por última vez. Si un cambio es importante, lo indicaremos claramente en esta página.",
      ],
    },
  ],
};

export default privacy;
