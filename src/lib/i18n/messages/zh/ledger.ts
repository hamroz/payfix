import type { Messages } from "../types";

const ledger: Messages["ledger"] = {
  title: "账本",
  eyebrow: "账本",
  heading: "复式记账账本",
  subtitle: "每一笔资金变动，都精确到代币最小单位。每条分录借贷相抵为零，且每个幂等键只写入一次，重试不会重复计数。",
  exportCsv: "导出 CSV",
  emptyTitle: "暂无分录",
  emptyBody: "付款在链上核验后，分录会立即出现在这里。",
  accounts: {
    external: "已收款（链上）",
    unresolved: "待处理",
    invoice: "账单",
    credit: "客户余额",
    refund_pending: "待退款",
    refunded: "已退款",
  },
};

export default ledger;
