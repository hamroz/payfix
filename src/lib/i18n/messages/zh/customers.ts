import type { Messages } from "../types";

const customers: Messages["customers"] = {
  title: "客户",
  eyebrow: "客户",
  heading: "客户",
  subtitle: "长期合作的客户、他们的账目情况，以及他们选择留在你这里的余额。",
  emptyTitle: "还没有客户",
  emptyBody: "添加一位客户，即可开始开账单。",
  stats: {
    paid: "已付",
    outstanding: "未付",
    credit: "余额",
  },
  add: {
    button: "添加客户",
    title: "添加客户",
    name: "名称",
    email: "账单邮箱",
    emailHint: "处理链接的验证码只会发送到这个邮箱。",
    submit: "添加客户",
    added: "已添加 {name}",
  },
};

export default customers;
