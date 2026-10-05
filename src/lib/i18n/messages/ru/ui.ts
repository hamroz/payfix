import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "Системная тема",
    light: "Светлая тема",
    dark: "Тёмная тема",
    switch: "{current}. Сменить тему",
  },
  toast: {
    dismiss: "Скрыть",
  },
  otp: {
    digit: "Цифра {number}",
  },
};

export default ui;
