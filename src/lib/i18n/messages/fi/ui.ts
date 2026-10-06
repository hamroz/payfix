import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "Järjestelmän teema",
    light: "Vaalea teema",
    dark: "Tumma teema",
    switch: "{current}. Vaihda teemaa",
  },
  toast: {
    dismiss: "Sulje",
  },
  otp: {
    digit: "Numero {number}",
  },
};

export default ui;
