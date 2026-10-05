import type { Messages } from "../types";

const categories: Messages["categories"] = {
  payments: { label: "付款", description: "收到的付款、未带付款标识的转账，以及从你钱包转出的资金。" },
  exceptions: { label: "异常", description: "需要决策的超额付款和重复付款，以及它们何时得到解决。" },
  resolutions: { label: "处理流程", description: "处理链接、客户提交的方案、批准，以及已执行的方案。" },
  refunds: { label: "退款", description: "退款已签名、已在链上确认、失败或过期。" },
  invoices: { label: "账单", description: "新账单、已付清或已逾期的账单，以及余额抵扣。" },
  customers: { label: "客户", description: "这家公司新添加的客户。" },
  team: { label: "团队与钱包", description: "成员加入、角色变更或离开，以及收款钱包的变更。" },
};

export default categories;
