import type { Messages } from "../types";

const exportCsv: Messages["exportCsv"] = {
  columns: {
    date: "日期",
    entryId: "分录编号",
    kind: "类型",
    memo: "摘要",
    account: "账户",
    amount: "金额",
    invoice: "账单",
    caseId: "工单编号",
  },
  kinds: {
    receipt: "收款",
    apply: "计入",
    credit: "余额",
    refund: "退款",
    resolution: "处理",
  },
  accounts: {
    external: "外部",
    unresolved: "待处理",
    invoice: "账单",
    credit: "客户余额",
    refund_pending: "待退款",
    refunded: "已退款",
  },
};

export default exportCsv;
