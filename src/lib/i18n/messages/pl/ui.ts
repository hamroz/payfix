import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "Motyw systemowy",
    light: "Motyw jasny",
    dark: "Motyw ciemny",
    switch: "{current}. Zmień motyw",
  },
  toast: {
    dismiss: "Zamknij",
  },
  otp: {
    digit: "Cyfra {number}",
  },
};

export default ui;
