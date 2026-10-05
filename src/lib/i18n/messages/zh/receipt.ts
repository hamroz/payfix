import type { Messages } from "../types";

const receipt: Messages["receipt"] = {
  title: "结算收据",
  saveAsPdf: "保存为 PDF",
  private: {
    title: "这份收据不公开",
    body: "请以商家身份登录，或在验证邮箱后通过你的处理链接打开。",
  },
  eyebrow: "结算收据",
  settled: "已结清",
  inProgress: "处理中",
  withCustomer: "客户：{customer}",
  withUnknownSender: "付款方：未识别",
  resolvedAt: "解决于 {date}",
  openedAt: "创建于 {date}",
  everyDollarInvoice: "为 {invoice}（{amount}）支付的每一美元",
  everyDollar: "收到的每一美元",
  parts: {
    otherInvoices: "其他账单",
    credit: "余额",
    refunded: "已退款",
    refundPending: "待退款",
    unresolved: "待处理",
  },
  incoming: "转入款项",
  incomingFrom: "来自 {address} · {date}",
  unknownAddress: "未知",
  agreedPlan: "商定方案 · 第 {version} 版",
  approvals: "批准记录",
  approved: "v{version} 已批准",
  approvalVoided: "v{version} 的批准已失效",
  approvedBy: "由 {name} 批准 · {date}",
  noApprovals: "暂无批准。",
  refund: "退款",
  refundStatus: {
    awaiting_signature: "等待商家签名",
    submitted: "已发送，等待确认",
    confirmed: "已确认",
    failed: "上次尝试失败，资金仍处于预留状态",
  },
  refundLine: "{amount} · {status}",
  refundTo: "至 {address}",
  refundToAt: "至 {address} · {date}",
  notOnChain: "尚未上链",
  footnoteSimulated:
    "金额为模拟链上 {token} 的精确代币单位——测试资金，并非客户资金。本记录涵盖 PayFix 观察到的转账及其发起的退款；在 PayFix 之外进行的付款不包含在内。",
  footnote:
    "金额为 Solana {cluster} 上 {token} 的精确代币单位——测试资金，并非客户资金。本记录涵盖 PayFix 观察到的转账及其发起的退款；在 PayFix 之外进行的付款不包含在内。",
};

export default receipt;
