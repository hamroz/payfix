import type { Messages } from "../types";

const errors: Messages["errors"] = {
  // Sign-in and sessions
  signInFirst: "请先登录。",
  invalidEmail: "请输入有效的邮箱地址。",
  emailSendFailed: "邮件暂时无法发送，请稍后再试。",
  codeExpired: "验证码已过期，请重新发送。",
  codeTooManyAttempts: "尝试次数过多，请重新发送验证码。",
  codeWrong: "验证码不正确，请检查后重试。",
  rateCodes: "发送到这个邮箱的验证码过多，请 15 分钟后再试。",
  rateCodesDay: "今天发送到这个邮箱的验证码过多，请明天再试。",
  rateSignInNetwork: "当前网络的登录尝试过多，请一小时后再试。",

  // Workspaces and team
  companyNameRequired: "请输入公司名称。",
  noTestToken: "当前部署未配置测试代币。",
  notMemberOfThatCompany: "你不是那家公司的成员。",
  notMemberOfThisCompany: "你不是这家公司的成员。",
  roleForbidden: "你的角色（{role}）无法执行此操作，请向所有者申请权限。",
  alreadyOnTeam: "此人已在团队中。",
  notOnTeam: "此人不在团队中。",
  lastOwner: "每家公司至少需要一位所有者。",
  resetDemoOnly: "只有演示模式下才能重置。",
  rateDemoCompanies: "你今天已经创建了好几家演示公司。请从公司菜单中选择一家继续使用，或明天再试。",
  rateDemoCompaniesGlobal: "现在体验演示的人很多，请几分钟后再试。",

  // Customers and invoices
  customerNameRequired: "请输入客户名称。",
  customerEmailExists: "使用该邮箱的客户已存在。",
  customerNotFound: "未找到该客户",
  chooseCustomer: "请选择客户。",
  invoiceAmountPositive: "金额必须大于零。",
  invoiceTitleRequired: "请说明这张账单的用途。",
  invoiceAmountFormat: "请输入类似 1000 或 49.99 的金额。",
  invoiceAmountMax: "单张账单金额上限为 $1,000,000,000。",
  dueDateRequired: "请选择到期日。",
  invoiceNotFound: "未找到该账单。",
  paymentAmountPositive: "请输入大于零的金额。",
  paymentAmountFormat: "请输入类似 400 或 49.99 的金额。",
  paymentCodeInvalid: "此付款码无效。请刷新发票页面以获取新的付款码。",
  paymentAccountMissing: "钱包未提供付款账户。请重新扫描付款码。",
  ratePaymentNetwork: "此网络的付款尝试过多，请一分钟后再试。",
  noCreditLeft: "该客户已没有可用余额。",
  invoiceAlreadyPaid: "这张账单已付清。",

  // Notifications
  notificationNotFound: "未找到该通知。",
  chooseNotificationCategories: "请选择通知类别。",
  unknownNotificationCategory: "未知的通知类别：{categories}",

  // Wallets
  invalidWalletAddress: "这不是有效的 Solana 钱包地址。",
  receivingWalletRequired: "请输入接收付款的 Solana 钱包地址。",
  walletProofRequired: "请连接钱包并签名消息，证明它属于你。",
  walletProofStale: "该签名属于其他钱包或已过期，请重新签名。",
  walletSignatureMismatch: "签名与此钱包不匹配。",
  walletAlreadyAdded: "该钱包已添加。",
  walletAddBeforeActivating: "请先添加钱包，再将其设为当前钱包。",
  walletActiveCantRemove: "请先将另一个钱包设为当前钱包，再移除这个。",
  walletHasPayments: "这个钱包已收到过付款，PayFix 会持续监听它，因此无法移除。",

  // Resolution links and cases
  linkInvalid: "此链接无效。",
  linkReplaced: "此链接已被新链接取代，请在邮箱中查看最新链接。",
  linkExpired: "此链接已过期，请让商家重新发送。",
  verifyEmailToContinue: "请先验证邮箱再继续。",
  caseNotFound: "未找到该工单",
  onlyOpenUnmatchedAssignable: "只有未结的未匹配付款才能归属",
  attributeCustomerFirst: "请先把这笔付款归属到某位客户",
  caseAlreadyResolved: "该工单已解决",
  cantChangeCase: "你无法修改该工单",
  planAlreadyRunning: "该方案已在执行中",
  confirmRefundWallet: "提交前，请先用退款钱包签名进行确认。",
  tellCustomerWhatToChange: "请告诉客户需要修改什么。",
  newerVersionReview: "该方案已有更新的版本，请先审核。",
  newerVersionApprove: "该方案已有更新的版本，请先审核再批准。",
  versionAlready: "第 {version} 版已{status}。",
  planIntegrityFailed: "方案完整性校验失败",
  planNeedsApproval: "该方案的当前版本需要先获得批准才能执行。",
  currentVersionNotApproved: "当前版本尚未获得批准。",
  approvalMismatch: "批准与当前方案不一致。",
  unresolvedChanged: "待处理金额已从 {from} 变为 {to}，请让客户提交修改后的方案。",
  invoiceNoRoom: "{number} 已容纳不下 {amount}，请让客户提交修改后的方案。",
  someInvoiceNoRoom: "有一张账单已容纳不下 {amount}，请让客户提交修改后的方案。",
  notEnoughUnresolved: "待处理资金不足",

  // Proposal validation
  allocationAmountPositive: "每项分配的金额都必须大于零。",
  allocationRequired: "请至少添加一项分配。",
  invoiceNotOpenForCustomer: "该账单不是此客户的未付账单。",
  invoiceOnlyHasRemaining: "{number} 只剩 {remaining} 未付。",
  invoiceOnce: "每张账单只能出现一次。",
  singleCreditLine: "余额只能填写一项。",
  singleRefundLine: "退款只能填写一项。",
  refundNeedsDestination: "退款需要指定接收钱包。",
  refundDestinationInvalid: "退款接收地址不是有效的钱包地址。",
  overAllocated: "比可分配的 {available} 多了 {over}。",
  stillUnallocated: "还有 {amount} 未分配。",

  // Refunds
  refundNotFound: "未找到该退款",
  refundAlreadyConfirmed: "该退款已确认。",
  refundInFlight: "已有一笔退款交易在处理中，请等待其确认或过期。",
  refundAttemptNotFound: "未找到该退款尝试",
  attemptAlready: "该次尝试已{status}。",
  signedTxMismatch: "已签名的交易与准备好的退款不一致。",
  txNotSignedByBusiness: "该交易未经商家钱包签名。",
  attemptAlreadySubmitted: "该次尝试已经提交过。",
  refundInsufficientFunds: "退款未发送：商家钱包的资金或用于手续费的 SOL 不足。资金没有变动，请充值后重新签名。",
  refundRejected: "网络拒绝了这笔退款，资金没有变动。你可以重新签名。",

  // Demo mode and faucet
  demoPaymentsOnly: "演示付款仅在演示模式下可用。",
  demoWalletsOnly: "演示钱包仅在演示模式下可用。",
  demoOutOfSol: "演示用于新钱包的 devnet SOL 已用完，请稍后再试。",
  demoCustomerTooPoor:
    "演示客户钱包只有 {balance} 测试 USD，每次付款最多补充到 {limit}，因此无法支付 {amount}。请减少支付金额。",
  walletKeyNotHeld: "PayFix 没有保管此钱包的密钥，请在该钱包中签名退款。",
  faucetDemoOnly: "水龙头仅在演示模式下可用。",
  faucetReceivingWallet: "这是公司的收款钱包。发送到这里的测试 USD 会显示为未匹配付款，请改用客户钱包。",
  faucetPlenty: "这个钱包里的测试 USD 已经足够了。",
  rateFaucetWallet: "这个钱包刚刚领取过测试 USD，请 10 分钟后再试。",
  rateFaucetWalletDay: "这个钱包已达到今天的测试 USD 领取上限。",
  rateFaucetNetwork: "当前网络的水龙头请求过多，请一小时后再试。",
  rateFaucetGlobal: "水龙头繁忙，请几分钟后再试。",

  // Statuses named inside the messages above ({status})
  statuses: {
    prepared: "准备",
    submitted: "提交",
    approved: "批准",
    superseded: "被取代",
    declined: "退回修改",
    executed: "执行",
    confirmed: "确认",
    expired: "过期",
    failed: "失败",
  },

  // Unexpected failures, rewritten into one sentence a person can act on
  network: {
    insufficientFunds: "钱包资金不足。请减少支付金额，或在“设置”中用水龙头充值。",
    expired: "网络确认超时，没有扣款——请重试。",
    busy: "Solana devnet 目前比较繁忙，请等几秒后重试。",
    unreachable: "无法连接网络。请稍后查看交易状态，然后重试。",
    generic: "出了点问题，请重试——如果问题持续出现，请刷新页面。",
  },

  // Route handlers
  exportSignIn: "请先登录",
};

export default errors;
