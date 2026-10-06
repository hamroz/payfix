import type { Messages } from "../types";

const legal: Messages["legal"] = {
  footer: {
    disclaimer: "黑客松原型。仅限测试代币，请勿用于客户资金。PayFix 无法看到在应用之外发送的退款。",
    legalHeading: "法律信息",
    productHeading: "产品",
    howItWorks: "运作方式",
    signIn: "登录",
    rights: "© {year} PayFix。保留所有权利。",
  },
  docs: {
    privacy: "隐私政策",
    terms: "使用条款",
    cookies: "Cookie 政策",
    security: "安全",
  },
  page: {
    updated: "最后更新：{date}",
    onThisPage: "本页内容",
    otherDocuments: "其他文件",
    backHome: "返回首页",
    translationNote: "本译文仅为方便阅读而提供。如与英文版本不一致，以英文版本为准。",
    fallbackNote: "本文件暂无您所选语言的版本，因此以英文显示。",
    home: "PayFix 首页",
    contactEmail: "您可以发送邮件至 <link>{email}</link> 联系我们。",
    contactFallback: "本服务尚未公布联系邮箱。在此之前，请联系向您提供此 PayFix 服务的个人或团队。",
  },
};

export default legal;
