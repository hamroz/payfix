import type { Messages } from "../types";

const emails: Messages["emails"] = {
  signInCode: {
    subject: "{code} 是您的 PayFix 验证码",
    body: "请输入 {code} 继续操作。验证码 10 分钟内有效。如果这不是您本人的请求，请忽略此邮件。",
  },
  resolutionLink: {
    subject: "一起处理您多付的 {amount}",
    body: "{name}，您好！我们收到的款项比您的账单应付金额多了 {amount}。请选择您希望的处理方式：计入另一张账单、留作余额，或者退款。在双方批准确切方案之前，资金不会有任何变动。",
  },
  changesRequested: {
    subject: "{business} 请您修改方案",
    body: "{business} 审核了第 {version} 版，并提出：“{note}” 请打开您的处理链接，提交修改后的方案。",
  },
  memberAdded: {
    subject: "您已加入 PayFix 上的 {business}",
    body: "{invitedBy} 已将您添加为{role}。请使用此邮箱地址登录，打开该工作区。",
  },
};

export default emails;
