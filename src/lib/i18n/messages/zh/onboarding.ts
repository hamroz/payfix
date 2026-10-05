import type { Messages } from "../types";

const onboarding: Messages["onboarding"] = {
  title: "创建你的公司",
  createAnother: "再创建一家公司",
  signedInAs: "当前登录账号：<email>{email}</email>。你将成为这家公司的所有者，之后可以邀请团队成员。",
  companyName: "公司名称",
  sampleData: {
    title: "添加演示客户和账单",
    body: "{customer}，附带一张 {first} 和一张 {second} 的账单，可直接用于引导演示。你的公司会拥有专属的 devnet 测试钱包。",
  },
  wallet: {
    label: "收款钱包",
    hint: "付款会进入这个钱包，退款也由它签名。你需要签名一条消息来证明钱包属于你，不会产生任何费用。之后还可以添加更多钱包。",
    didNotSign: "钱包未签名。",
  },
  settingUpWallet: "正在设置钱包…",
  waitingForWallet: "等待钱包确认…",
  create: "创建公司",
  openExisting: "或打开你已有的公司",
};

export default onboarding;
