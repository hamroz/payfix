import type { Messages } from "../types";

const ui: Messages["ui"] = {
  theme: {
    system: "跟随系统",
    light: "浅色主题",
    dark: "深色主题",
    switch: "{current}。切换主题",
  },
  toast: {
    dismiss: "关闭",
  },
  otp: {
    digit: "第 {number} 位",
  },
};

export default ui;
