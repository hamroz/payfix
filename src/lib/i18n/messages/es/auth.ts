import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "Iniciar sesión",
  homeLink: "Inicio de PayFix",
  email: {
    title: "Inicia sesión o crea una cuenta",
    subtitle: "Te enviaremos un código de 6 dígitos por correo. Sin contraseñas.",
    label: "Correo del trabajo",
    placeholder: "tu@agencia.com",
    demo: "<b>Demo en vivo.</b> Usa cualquier correo. Tendrás tu propia empresa privada con una billetera de prueba en devnet. Los códigos aparecen en la bandeja de la demo, abajo a la izquierda.",
  },
  code: {
    title: "Revisa tu correo",
    sent: "Hemos enviado un código de 6 dígitos a <email>{email}</email>.",
    verifying: "Verificando…",
    resend: "Reenviar código",
  },
};

export default auth;
