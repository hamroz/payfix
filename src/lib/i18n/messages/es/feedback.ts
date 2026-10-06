import type { Messages } from "../types";

const feedback: Messages["feedback"] = {
  title: "¿Qué tal ha ido?",
  intro: "Gracias por probar PayFix. Te llevará unos dos minutos. Solo son obligatorias las preguntas marcadas con *.",
  anonymous: "Tus respuestas son anónimas, salvo que decidas vincular tu cuenta de PayFix más abajo.",
  completed: {
    label: "¿Has terminado la demo guiada?",
    unaided: "Sí, por mi cuenta",
    aided: "Sí, con algo de ayuda",
    no: "No",
  },
  minutes: { label: "¿Cuántos minutos te ha llevado, más o menos?", suffix: "minutos" },
  ease: { label: "¿Te ha resultado fácil?", low: "Muy difícil", high: "Muy fácil" },
  nps: { label: "¿Qué probabilidad hay de que recomiendes PayFix a una empresa que cobra en stablecoins?", low: "Ninguna probabilidad", high: "Muy probable" },
  openTitle: "Con tus propias palabras",
  questions: {
    happened: "¿Qué pasó con los $100 de más y quién lo decidió?",
    hesitated: "¿En qué momento dudaste o no tenías claro qué tocar después?",
    voidedApproval: "Cuando la billetera de reembolso cambió después de la aprobación, ¿te diste cuenta de que la aprobación se había anulado? ¿Te pareció lo correcto?",
    currentProcess: "Si tienes un negocio que cobra en stablecoins: ¿cómo gestionas hoy un sobrepago y con qué frecuencia ocurre?",
    receiptTrust: "¿Confiarías en el comprobante como registro para enviarlo a un cliente o a tu gestor? ¿Qué le falta?",
    blockers: "¿Qué te impediría usar PayFix y qué herramienta sustituiría o complementaría?",
  },
  aboutTitle: "Sobre ti",
  about: { label: "¿Qué tipo de negocio tienes y de qué tamaño es?", placeholder: "p. ej., agencia de diseño, 4 personas" },
  device: { label: "¿Qué has usado?", phone: "Móvil", tablet: "Tableta", computer: "Ordenador" },
  quoteOk: "Se pueden citar mis respuestas, sin mi nombre.",
  attach: "Vincular mi cuenta de PayFix ({email}) a estas respuestas, para que el equipo vea hasta dónde llegué.",
  submit: "Enviar comentarios",
  sending: "Enviando…",
  required: "Responde a las preguntas marcadas con *.",
  thanks: { title: "¡Gracias!", body: "Tus respuestas nos ayudan a decidir qué mejorar a continuación.", back: "Volver a PayFix" },
  guidedDemoLink: "Cuéntanos qué tal te ha ido",
};

export default feedback;
