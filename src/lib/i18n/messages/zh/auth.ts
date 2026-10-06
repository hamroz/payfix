import type { Messages } from "../types";

const auth: Messages["auth"] = {
  title: "登录",
  homeLink: "PayFix 首页",
  email: {
    title: "登录或创建账户",
    subtitle: "我们会通过邮件发送 6 位验证码，无需密码。",
    label: "工作邮箱",
    placeholder: "you@agency.com",
    demo: "<b>在线演示。</b>任意邮箱均可使用。你会得到一家专属的私有公司，并附带一个 devnet 测试钱包。验证码会显示在左下角的演示收件箱中。",
  },
  code: {
    title: "查收邮件",
    sent: "我们已向 <email>{email}</email> 发送了 6 位验证码。",
    verifying: "验证中…",
    resend: "重新发送验证码",
  },
};

export default auth;
