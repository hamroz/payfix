import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "Primero inicia sesión.",
  invalidEmail: "Introduce una dirección de correo válida.",
  emailSendFailed: "Ahora mismo no hemos podido enviar el correo. Vuelve a intentarlo en un minuto.",
  codeExpired: "Ese código ha caducado. Pide uno nuevo.",
  codeTooManyAttempts: "Demasiados intentos. Pide un código nuevo.",
  codeWrong: "Ese código no es correcto. Revísalo y vuelve a intentarlo.",
  rateCodes: "Se han enviado demasiados códigos a esta dirección. Espera 15 minutos y vuelve a intentarlo.",
  rateCodesDay: "Hoy se han enviado demasiados códigos a esta dirección. Vuelve a intentarlo mañana.",
  rateSignInNetwork: "Demasiados intentos de inicio de sesión desde esta red. Vuelve a intentarlo dentro de una hora.",

  // Workspaces and team
  companyNameRequired: "Introduce el nombre de tu empresa.",
  noTestToken: "Este despliegue no tiene configurado ningún token de prueba.",
  notMemberOfThatCompany: "No eres miembro de esa empresa.",
  notMemberOfThisCompany: "No eres miembro de esta empresa.",
  roleForbidden: "Tu rol ({role}) no permite hacer esto. Pide acceso a un propietario.",
  alreadyOnTeam: "Esa persona ya está en el equipo.",
  notOnTeam: "Esa persona no está en el equipo.",
  lastOwner: "Una empresa necesita al menos un propietario.",
  resetDemoOnly: "El restablecimiento solo está disponible en el modo demo.",
  rateDemoCompanies: "Hoy ya has creado varias empresas de demo. Reutiliza una desde el menú de empresas o vuelve a intentarlo mañana.",
  rateDemoCompaniesGlobal: "Ahora mismo hay mucha gente probando la demo. Vuelve a intentarlo en unos minutos.",

  // Customers and invoices
  customerNameRequired: "Introduce el nombre del cliente.",
  customerEmailExists: "Ya existe un cliente con ese correo.",
  customerNotFound: "No se ha encontrado el cliente",
  chooseCustomer: "Elige un cliente.",
  invoiceAmountPositive: "El importe debe ser mayor que cero.",
  invoiceTitleRequired: "Describe el concepto de esta factura.",
  invoiceAmountFormat: "Introduce un importe como 1000 o 49,99.",
  invoiceAmountMax: "Las facturas tienen un límite de $1,000,000,000.",
  dueDateRequired: "Elige una fecha de vencimiento.",
  invoiceNotFound: "No se ha encontrado la factura.",
  paymentAmountPositive: "Introduce un importe mayor que cero.",
  paymentAmountFormat: "Introduce un importe como 400 o 49,99.",
  paymentCodeInvalid: "Este código de pago no es válido. Recarga la página de la factura para obtener uno nuevo.",
  paymentAccountMissing: "La billetera no indicó qué cuenta paga. Vuelve a escanear el código.",
  ratePaymentNetwork: "Demasiados intentos de pago desde esta red. Inténtalo de nuevo en un minuto.",
  noCreditLeft: "A este cliente no le queda saldo a favor.",
  invoiceAlreadyPaid: "Esta factura ya está pagada.",

  // Notifications
  notificationNotFound: "No se ha encontrado la notificación.",
  chooseNotificationCategories: "Elige las categorías de notificaciones.",
  unknownNotificationCategory: "Categoría de notificaciones desconocida: {categories}",

  // Wallets
  invalidWalletAddress: "Esa no es una dirección de billetera de Solana válida.",
  receivingWalletRequired: "Introduce la dirección de la billetera de Solana a la que deben llegar los pagos.",
  walletProofRequired: "Conecta la billetera y firma el mensaje para demostrar que es tuya.",
  walletProofStale: "Esa firma corresponde a otra billetera o ha caducado. Vuelve a firmar.",
  walletSignatureMismatch: "La firma no coincide con esta billetera.",
  walletAlreadyAdded: "Esa billetera ya está añadida.",
  walletAddBeforeActivating: "Añade la billetera antes de activarla.",
  walletActiveCantRemove: "Activa otra billetera antes de quitar esta.",
  walletHasPayments: "Esta billetera ha recibido pagos, así que PayFix sigue vigilándola. No se puede quitar.",

  // Resolution links and cases
  linkInvalid: "Este enlace no es válido.",
  linkReplaced: "Este enlace se ha sustituido por otro más reciente. Busca el último enlace en tu correo.",
  linkExpired: "Este enlace ha caducado. Pide a la empresa que te envíe uno nuevo.",
  verifyEmailToContinue: "Verifica tu correo para continuar.",
  caseNotFound: "No se ha encontrado el caso",
  onlyOpenUnmatchedAssignable: "Solo se pueden asignar pagos sin referencia que sigan abiertos",
  attributeCustomerFirst: "Primero asigna este pago a un cliente",
  caseAlreadyResolved: "Este caso ya está resuelto",
  cantChangeCase: "No puedes modificar este caso",
  planAlreadyRunning: "Este plan ya se está ejecutando",
  confirmRefundWallet: "Antes de enviar, confirma la billetera de reembolso firmando con ella.",
  tellCustomerWhatToChange: "Indica al cliente qué debe cambiar.",
  newerVersionReview: "Hay una versión más reciente de este plan. Revísala primero.",
  newerVersionApprove: "Hay una versión más reciente de este plan. Revísala antes de aprobar.",
  versionAlready: "La versión {version} ya tiene el estado «{status}».",
  planIntegrityFailed: "Ha fallado la comprobación de integridad del plan",
  planNeedsApproval: "Este plan necesita la aprobación de su versión actual antes de poder ejecutarse.",
  currentVersionNotApproved: "La versión actual no está aprobada.",
  approvalMismatch: "La aprobación no coincide con el plan actual.",
  unresolvedChanged: "El importe sin resolver ha cambiado de {from} a {to}. Pide un plan revisado.",
  invoiceNoRoom: "En {number} ya no caben {amount}. Pide un plan revisado.",
  someInvoiceNoRoom: "En una de las facturas ya no caben {amount}. Pide un plan revisado.",
  notEnoughUnresolved: "No hay suficientes fondos sin resolver",

  // Proposal validation
  allocationAmountPositive: "Cada asignación necesita un importe positivo.",
  allocationRequired: "Añade al menos una asignación.",
  invoiceNotOpenForCustomer: "Esa factura no está abierta para este cliente.",
  invoiceOnlyHasRemaining: "A {number} solo le quedan {remaining} pendientes.",
  invoiceOnce: "Cada factura solo puede aparecer una vez.",
  singleCreditLine: "Usa una sola línea de saldo a favor.",
  singleRefundLine: "Usa una sola línea de reembolso.",
  refundNeedsDestination: "Un reembolso necesita una billetera de destino.",
  refundDestinationInvalid: "El destino del reembolso no es una dirección de billetera válida.",
  overAllocated: "Son {over} más de los {available} disponibles.",
  stillUnallocated: "Aún quedan {amount} sin asignar.",

  // Refunds
  refundNotFound: "No se ha encontrado el reembolso",
  refundAlreadyConfirmed: "Este reembolso ya está confirmado.",
  refundInFlight: "Ya hay una transacción de reembolso en curso. Espera a que se confirme o caduque.",
  refundAttemptNotFound: "No se ha encontrado el intento de reembolso",
  attemptAlready: "Este intento ya tiene el estado «{status}».",
  signedTxMismatch: "La transacción firmada no coincide con el reembolso preparado.",
  txNotSignedByBusiness: "La transacción no está firmada por la billetera de la empresa.",
  attemptAlreadySubmitted: "Este intento ya se envió.",
  refundInsufficientFunds: "El reembolso no se ha enviado: la billetera de la empresa no tiene fondos suficientes o SOL para las comisiones. No se ha movido nada; recárgala y vuelve a firmar.",
  refundRejected: "La red ha rechazado el reembolso, así que no se ha movido nada. Puedes volver a firmarlo.",

  // Demo mode and faucet
  demoPaymentsOnly: "Los pagos de demo solo están disponibles en el modo demo.",
  demoWalletsOnly: "Las billeteras de demo solo están disponibles en el modo demo.",
  demoOutOfSol: "La demo se ha quedado sin SOL de devnet para nuevas billeteras. Vuelve a intentarlo más tarde.",
  demoCustomerTooPoor:
    "La billetera del cliente de demo solo tiene {balance} USD de prueba y se recarga como máximo hasta {limit} por pago, así que no puede pagar {amount}. Paga un importe menor.",
  walletKeyNotHeld: "PayFix no guarda la clave de esta billetera. Firma el reembolso en esa billetera.",
  faucetDemoOnly: "El faucet solo está disponible en el modo demo.",
  faucetReceivingWallet: "Esa es la billetera de cobro de una empresa. Los USD de prueba enviados allí aparecerían como un pago sin referencia, así que usa una billetera de cliente.",
  faucetPlenty: "Esta billetera ya tiene USD de prueba de sobra.",
  rateFaucetWallet: "Esta billetera acaba de recibir USD de prueba. Vuelve a intentarlo dentro de 10 minutos.",
  rateFaucetWalletDay: "Esta billetera ha alcanzado el límite diario de USD de prueba.",
  rateFaucetNetwork: "Demasiadas solicitudes al faucet desde esta red. Vuelve a intentarlo dentro de una hora.",
  rateFaucetGlobal: "El faucet está saturado. Vuelve a intentarlo en unos minutos.",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "preparado",
    submitted: "enviado",
    approved: "aprobado",
    superseded: "sustituido",
    declined: "rechazado",
    executed: "ejecutado",
    confirmed: "confirmado",
    expired: "caducado",
    failed: "fallido",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "La billetera no tiene fondos suficientes para esto. Paga un importe menor o recárgala con el faucet de Ajustes.",
    expired: "La red ha tardado demasiado en confirmar. No se ha cobrado nada; vuelve a intentarlo.",
    busy: "La devnet de Solana está saturada ahora mismo. Espera unos segundos y vuelve a intentarlo.",
    unreachable: "No se ha podido conectar con la red. Comprueba el estado de la transacción dentro de un momento y vuelve a intentarlo.",
    generic: "Algo ha salido mal. Vuelve a intentarlo; si sigue pasando, recarga la página.",
  },

  // Route handlers
  exportSignIn: "Primero inicia sesión",
};

export default errors;
