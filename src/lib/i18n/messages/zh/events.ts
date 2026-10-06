import type { Messages } from "../types";

const events: Messages["events"] = {
  invoice: {
    created: "已为 {customer} 创建 {number}：{amount}",
    paid: "{number} 已全额付清",
    overdue: "{number} 已逾期：剩余 {remaining}",
  },
  customer: {
    created: "已添加客户 {name}（{email}）",
    verified: "客户已验证邮箱并打开处理链接",
  },
  payment: {
    received: {
      settled: "{customer} 为 {number} 支付 {amount} — 账单已结清",
      settledLate: "{customer} 为 {number} 支付 {amount} — 账单已结清（逾期）",
      partial: "{customer} 为 {number} 支付 {amount} — 剩余 {remaining}",
      partialLate: "{customer} 为 {number} 支付 {amount} — 剩余 {remaining}（逾期）",
    },
  },
  transfer: {
    out: "{amount} 已发送至 {address}",
    unmatched: "{amount} 从 {address} 转入，未带账单标识",
  },
  case: {
    opened: {
      duplicate: "疑似重复付款：{number} 已结清后又收到 {amount}",
      overpayment: "超出 {number} 应付余额的 {amount} 待处理",
    },
    assigned: "付款已归属到 {customer}",
    resolved: {
      settled: "异常已解决：{amount} 已按约定结清",
      refunded: "异常已解决：{amount} 已退款",
    },
  },
  link: {
    sent: "处理链接已发送至 {email}",
  },
  proposal: {
    submitted: {
      first: "客户提出了方案（v{version}）：{lines}",
      revised: "客户修改了方案（v{version}）：{changes}",
      unchanged: "客户重新提交了方案（v{version}）：无改动",
    },
    approved: "商家批准了方案 v{version}（{shortHash}）",
    declined: "商家要求修改 v{version}：“{note}”",
  },
  approval: {
    invalidated: {
      changed: "v{previous} 的批准已失效 — {changes}。在 v{version} 获批之前，暂停执行。",
      resubmitted: "v{previous} 的批准已失效 — 方案已重新提交。在 v{version} 获批之前，暂停执行。",
    },
  },
  plan: {
    executed: {
      refundReserved: "各项分配已记入。{amount} 退款已预留，等待商家钱包签名。",
      resolved: "各项分配已记入。工单已解决。",
    },
  },
  refund: {
    submitted: "商家已签名 {amount} 退款，发送至 {destination}",
    confirmed: "{amount} 退款已在链上确认。工单已解决。",
    failed: "退款交易失败，资金没有变动。可以重试。",
    expired: "退款交易已过期，未能上链。资金没有变动，可以放心重新签名。",
  },
  credit: {
    applied: "{amount} 客户余额已计入 {number}",
  },
  member: {
    added: "{email} 已加入，角色为{role}",
    roleChanged: "{email} 的角色已改为{role}",
    removed: "{email} 已被移出团队",
  },
  wallet: {
    added: "已添加收款钱包：{label}（{address}）",
    activated: "新付款现在进入 {label}（{address}）",
    removed: "已移除收款钱包：{label}（{address}）",
  },

  // Stand-ins when a name is unknown
  fallbacks: {
    customer: "客户",
    member: "某位成员",
    invoice: "账单",
  },

  // One line of a plan ({lines} above), joined with `separator`
  planLines: {
    invoice: "{amount} 计入 {number}",
    credit: "{amount} 留作余额",
    refund: "{amount} 退款",
    separator: "，",
  },

  // What changed between two versions of a plan ({changes} above), joined with `separator`
  changes: {
    allocationAdded: "新增计入 {number}：{amount}",
    allocationRemoved: "取消计入 {number}（原为 {amount}）",
    allocationChanged: "计入 {number} 的金额从 {from} 改为 {to}",
    creditAdded: "新增余额：{amount}",
    creditRemoved: "取消余额（原为 {amount}）",
    creditChanged: "余额从 {from} 改为 {to}",
    refundAdded: "新增退款：{amount}",
    refundRemoved: "取消退款（原为 {amount}）",
    refundChanged: "退款从 {from} 改为 {to}",
    destinationChanged: "退款去向从 {from} 改为 {to}",
    destinationSet: "退款去向设为 {to}",
    destinationRemoved: "已移除退款去向",
    separator: "；",
  },

  // Ledger journal-entry memos
  memos: {
    received: "收到 {amount}",
    applied: "计入 {number}",
    creditApplied: "余额计入 {number}",
    refundConfirmed: "{amount} 退款已确认",
    plan: "方案 v{version}：{lines}",
  },

  // Why an approval no longer applies
  approvalReasons: {
    superseded: "已被 v{version} 取代：{changes}",
    resubmitted: "已被 v{version} 取代：方案已重新提交",
    changesRequested: "商家要求修改：{note}",
  },
};

export default events;
