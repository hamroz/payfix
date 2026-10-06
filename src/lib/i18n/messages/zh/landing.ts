import type { Messages } from "../types";

const landing: Messages["landing"] = {
  nav: {
    howItWorks: "运作方式",
    signIn: "登录",
    dashboard: "控制台",
  },
  hero: {
    simulatedChain: "模拟链",
    cluster: "Solana {cluster}",
    tagline: "面向服务机构的 USDC 付款纠错",
    titleLead: "付错的款，",
    titleAccent: "一一理清。",
    body: "客户多付了、重复付了，或者转来 USDC 却没带付款标识？PayFix 通过一条双方都信得过的共享链接，把它变成双方认可、已经完成的结算。",
    tryDemo: "体验在线演示",
    getStarted: "立即开始",
    seeHow: "了解运作方式",
    signIn: "登录",
    testNote: "演示使用明确标注的测试代币，绝不涉及真实资金。",
    equation: "已收 {received} = {invoice} + {applied} + {refunded}。",
  },
  how: {
    eyebrow: "处理闭环",
    title: "从“你多付了”到结清，只需四步。",
  },
  steps: {
    detect: {
      title: "识别",
      body: "转入你钱包的每一笔款项都会在 Solana 上逐项核验——代币、金额、收款方、确认状态——并匹配到对应账单。超额付款、重复付款和未带标识的转账，都汇集到同一个收件箱。",
    },
    propose: {
      title: "提议",
      body: "客户会收到一条安全链接，由他们决定多出的钱去哪儿：另一张账单、余额、退款，或者拆分处理。退款钱包需通过签名证明归属。",
    },
    approve: {
      title: "批准",
      body: "你批准的是确切的那个版本。金额、账单或去向任何一项有改动，批准即失效，需要你重新批准。",
    },
    settle: {
      title: "结算",
      body: "你用自己的钱包签名退款。各项分配入账，退款在链上确认，双方拿到同一份收据。",
    },
  },
  film: {
    eyebrow: "看它如何运行",
    title: "一笔超额付款，从头到尾。",
    note: "49 秒 · 与在线演示相同的场景，使用测试资金",
  },
  controls: {
    eyebrow: "为资金而设计",
    title: "财务团队也会点头的管控。",
    body: "Solana 让收款可验证、退款由商家签名。PayFix 补上中间这一环：双方达成一致、获得授权，以及一本永远平衡的账。",
  },
  guarantees: {
    neverDoubleCounted: {
      title: "绝不重复计数",
      body: "每个链上签名只会被认领一次。重新同步、重试或重启，都不会虚增你的收款。",
    },
    hashBound: {
      title: "批准与哈希绑定",
      body: "批准涵盖金额、账单和去向。任何修改都会生成新版本，需要单独批准。",
    },
    oneRefund: {
      title: "同一时间只有一笔退款",
      body: "PayFix 在广播前先记录退款签名，只有在区块哈希过期且交易未上链后，才允许重试。",
    },
    everyDollar: {
      title: "每一美元都有交代",
      body: "复式记账，精确到代币最小单位。已收款始终等于 已计入 + 余额 + 已退款 + 待退款 + 待处理。",
    },
  },
  heroDemo: {
    invoiceCount: { other: "{count} 张账单" },
    incomingTransfer: "收到转账",
    received: "已收 {amount}",
    reconciled: "已对账",
    needsResolution: "{amount} 待处理",
    verifying: "核验中…",
    refunded: "已退款",
    unresolved: "待处理",
    stages: {
      arrive: { title: "款项到账", note: "两笔转账已在 Solana 上核验" },
      excess: { title: "账单已结清，多出 {amount}", note: "多出的部分会被标记，绝不擅自猜测" },
      propose: { title: "客户提出拆分方案", note: "{applied} → {invoice} · 退款 {refund}" },
      approve: { title: "商家批准 {version}", note: "确切方案，批准与哈希绑定" },
      settled: { title: "每一美元都有去处", note: "退款已确认 · {amount} 待处理" },
    },
  },
};

export default landing;
