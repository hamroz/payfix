import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "Systemdesign",
    light: "Helles Design",
    dark: "Dunkles Design",
    switch: "{current}. Design wechseln",
  },
  toast: {
    dismiss: "Ausblenden",
  },
  otp: {
    digit: "Ziffer {number}",
  },
};

export default ui;
