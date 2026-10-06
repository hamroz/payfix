import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "Tema del sistema",
    light: "Tema claro",
    dark: "Tema oscuro",
    switch: "{current}. Cambiar tema",
  },
  toast: {
    dismiss: "Descartar",
  },
  otp: {
    digit: "Dígito {number}",
  },
};

export default ui;
