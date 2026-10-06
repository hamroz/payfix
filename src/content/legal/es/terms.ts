import type { LegalDoc } from "../types";

const terms: LegalDoc = {
  title: "Condiciones de uso",
  description: "Las normas para usar PayFix: un prototipo solo para pruebas, que no es un servicio financiero y se ofrece sin garantías.",
  updated: "2026-10-06",
  intro: [
    "Estas condiciones se aplican cuando usas el servicio PayFix, ya sea como empresa, como miembro de un equipo o como cliente que ha recibido un enlace de resolución. En estas condiciones, «nosotros» se refiere al operador de este servicio PayFix y «tú», a la persona que lo usa. Al usar PayFix, aceptas estas condiciones. Si no estás de acuerdo con ellas, no uses el servicio.",
  ],
  sections: [
    {
      id: "about",
      heading: "Qué es PayFix",
      blocks: [
        "PayFix es un software que ayuda a una empresa y a su cliente a acordar qué hacer con un pago en stablecoins que no coincide con una factura, por ejemplo, un sobrepago o un pago duplicado. Vincula los pagos con las facturas, permite que ambas partes acuerden un plan y registra el resultado.",
        "PayFix es un prototipo de hackathon. Todavía está en desarrollo, puede contener errores y puede cambiar o dejar de funcionar en cualquier momento.",
      ],
    },
    {
      id: "test-only",
      heading: "Solo para pruebas",
      blocks: [
        "PayFix funciona en la red de pruebas devnet de Solana o en una cadena simulada. Solo opera con tokens de prueba, que no tienen valor monetario y no pueden canjearse por dinero.",
        {
          list: [
            "No envíes fondos reales, como USDC en la red principal de Solana, a ninguna dirección de billetera que muestre PayFix, incluidas las billeteras de demo.",
            "No uses PayFix para gestionar pagos reales de clientes ni registros reales de una empresa.",
            "Las billeteras de demo están controladas por nuestro servidor y existen solo para hacer pruebas. Cualquier cosa que se envíe a ellas puede perderse.",
            "Podemos restablecer los datos de prueba en cualquier momento y sin previo aviso.",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      heading: "Quién puede usar PayFix",
      blocks: [
        "Debes tener al menos 18 años y capacidad para celebrar un acuerdo vinculante. Si usas PayFix en nombre de una empresa u otra organización, confirmas que estás autorizado para aceptar estas condiciones en su nombre.",
      ],
    },
    {
      id: "not-financial-service",
      heading: "No es un servicio financiero",
      blocks: [
        "PayFix no es un banco, un servicio de pago, un exchange ni un custodio. No guarda, mueve ni controla tus fondos. Los pagos y reembolsos se realizan desde billeteras que controlas tú o la otra parte, y se firman en ellas.",
        "PayFix no ofrece asesoramiento financiero, jurídico, fiscal ni contable. Las empresas y los clientes son responsables de sus propios acuerdos entre sí, y de comprobar que cada plan, factura y reembolso es correcto antes de aprobarlo o firmarlo.",
      ],
    },
    {
      id: "accounts",
      heading: "Tu cuenta",
      blocks: [
        {
          list: [
            "Inicias sesión con un código de un solo uso que se envía a tu dirección de correo. Mantén segura tu cuenta de correo, porque cualquiera que pueda leer tu correo puede iniciar sesión como tú.",
            "Eres responsable de lo que ocurra en tu cuenta. Cierra sesión en los dispositivos compartidos.",
            "Los propietarios de una empresa deciden quién forma parte de su equipo y qué rol tiene cada persona. Los propietarios son responsables de retirar el acceso a quienes ya no deban tenerlo.",
            "Avísanos lo antes posible si crees que alguien ha usado tu cuenta sin permiso.",
          ],
        },
      ],
    },
    {
      id: "wallets",
      heading: "Billeteras y transacciones",
      blocks: [
        {
          list: [
            "Eres el único responsable de tu billetera, de su clave privada y de su frase de recuperación. Nunca te las pediremos. No las compartas nunca con nadie.",
            "Revisa cada transacción en tu billetera antes de firmarla: el importe, el token y el destinatario.",
            "Las transacciones en la blockchain no se pueden revertir. No podemos recuperar tokens enviados a una dirección equivocada.",
            "PayFix solo conoce los pagos que puede ver en las billeteras de cobro de la empresa y los reembolsos que prepara. No puede ver los reembolsos ni los pagos realizados fuera de la aplicación.",
          ],
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "Uso aceptable",
      blocks: [
        "Cuando uses PayFix, no debes:",
        {
          list: [
            "infringir ninguna ley, ni usar PayFix para cometer fraude o engañar a otras personas;",
            "introducir datos personales de otras personas salvo que tengas derecho a hacerlo;",
            "hacerte pasar por otra persona, empresa o cliente;",
            "intentar acceder a cuentas, empresas o datos que no son tuyos;",
            "atacar, sobrecargar o perturbar el servicio, ni intentar eludir sus límites de frecuencia o los límites del faucet de tokens de prueba;",
            "subir ni enviar malware o código dañino;",
            "probar la seguridad de PayFix de formas que no permita nuestra página de Seguridad.",
          ],
        },
      ],
    },
    {
      id: "your-content",
      heading: "Tus datos",
      blocks: [
        "Conservas todos los derechos sobre los datos que introduces. Nos permites almacenarlos y tratarlos únicamente para prestarte el servicio, tal como se describe en nuestra Política de privacidad. Si introduces datos de tus clientes, confirmas que estás autorizado para hacerlo y que les has informado de cómo se usarán sus datos.",
      ],
    },
    {
      id: "availability",
      heading: "Cambios en el servicio",
      blocks: [
        "Podemos modificar, pausar o interrumpir cualquier parte de PayFix en cualquier momento. No garantizamos que el servicio esté siempre disponible, que esté libre de errores ni que se conserven los datos.",
      ],
    },
    {
      id: "no-warranty",
      heading: "Sin garantías",
      blocks: [
        "PayFix se ofrece «tal cual» y «según disponibilidad», sin ninguna garantía. En la medida en que lo permita la ley, no garantizamos que el servicio sea exacto, fiable, seguro ni adecuado para un fin concreto.",
      ],
    },
    {
      id: "liability",
      heading: "Límites de nuestra responsabilidad",
      blocks: [
        "En la medida en que lo permita la ley, no somos responsables de:",
        {
          list: [
            "pérdidas indirectas o consecuentes, como el lucro cesante, la pérdida de negocio o la pérdida de datos;",
            "pérdidas causadas por transacciones en la blockchain, por billeteras o por redes y servicios que no controlamos;",
            "pérdidas causadas por enviar fondos reales a PayFix o a cualquier dirección que muestre, en contra de lo que indican estas condiciones.",
          ],
        },
        "Si fuéramos responsables ante ti por cualquier otro motivo, nuestra responsabilidad total se limita al importe que nos hayas pagado por usar PayFix en los 12 meses anteriores a la reclamación.",
        "Nada de lo dispuesto en estas condiciones limita la responsabilidad que no pueda limitarse por ley, como la responsabilidad por fraude o por muerte o lesiones personales causadas por negligencia. Nada de lo dispuesto en estas condiciones afecta a los derechos que te correspondan como consumidor y que no puedan modificarse mediante un acuerdo.",
      ],
    },
    {
      id: "third-parties",
      heading: "Otros servicios",
      blocks: [
        "PayFix funciona con servicios que no controlamos, como la red Solana, las aplicaciones de billetera y la entrega de correos. El uso que hagas de esos servicios está sujeto a sus propias condiciones.",
      ],
    },
    {
      id: "termination",
      heading: "Fin del uso",
      blocks: [
        "Puedes dejar de usar PayFix en cualquier momento y pedirnos que eliminemos tus datos, tal como se describe en nuestra Política de privacidad.",
        "Podemos suspender o cancelar tu acceso, o suspender una empresa, si incumples estas condiciones, si detectamos indicios de fraude o abuso, si tu uso pone en riesgo a otros usuarios o al servicio, o si dejamos de prestar el servicio. Las secciones sobre billeteras, ausencia de garantías y límites de nuestra responsabilidad seguirán aplicándose después de que finalice tu acceso.",
      ],
    },
    {
      id: "changes",
      heading: "Cambios en estas condiciones",
      blocks: [
        "Podemos actualizar estas condiciones. La fecha que figura al principio de esta página indica cuándo se actualizaron por última vez. Si sigues usando PayFix después de un cambio, se te aplicarán las condiciones actualizadas.",
      ],
    },
    {
      id: "general",
      heading: "Disposiciones generales",
      blocks: [
        "Si alguna parte de estas condiciones no pudiera hacerse cumplir, el resto seguirá siendo aplicable. Si no exigimos el cumplimiento de alguna parte de estas condiciones, no renunciamos a nuestro derecho a exigirlo más adelante. Las leyes imperativas que te protegen en tu país siguen siendo aplicables.",
      ],
    },
    {
      id: "contact",
      heading: "Contacto",
      blocks: ["Si tienes preguntas sobre estas condiciones, ponte en contacto con nosotros. {contact}"],
    },
  ],
};

export default terms;
