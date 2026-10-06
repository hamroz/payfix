import type { Messages } from "../types";

const feedback: Messages["feedback"] = {
  title: "体验如何？",
  intro: "感谢试用 PayFix。填写大约需要两分钟，只有标 * 的问题是必答的。",
  anonymous: "你的回答是匿名的，除非你选择在下方关联自己的 PayFix 账号。",
  completed: {
    label: "你完成引导流程了吗？",
    unaided: "完成了，靠自己",
    aided: "完成了，但需要一些帮助",
    no: "没有",
  },
  minutes: { label: "大约用了多少分钟？", suffix: "分钟" },
  ease: { label: "操作起来容易吗？", low: "非常困难", high: "非常容易" },
  nps: { label: "你有多大可能把 PayFix 推荐给收取稳定币付款的商家？", low: "完全不可能", high: "非常可能" },
  openTitle: "说说你的想法",
  questions: {
    happened: "多付的 $100 最后怎么处理了？由谁决定的？",
    hesitated: "哪些地方让你犹豫，或者不确定下一步该点哪里？",
    voidedApproval: "批准之后退款钱包被修改时，你注意到批准被取消了吗？你觉得这样合理吗？",
    currentProcess: "如果你经营的业务收取稳定币：你现在怎么处理超额付款？这种情况多久发生一次？",
    receiptTrust: "你会把这张收据当作正式记录发给客户或会计吗？还缺少什么？",
    blockers: "有什么会让你不使用 PayFix？它会取代你现在的哪个工具，或者和哪个工具搭配使用？",
  },
  aboutTitle: "关于你",
  about: { label: "你经营什么类型的业务，规模多大？", placeholder: "例如：设计工作室，4 人" },
  device: { label: "你用的是什么设备？", phone: "手机", tablet: "平板", computer: "电脑" },
  quoteOk: "你们可以匿名引用我的回答。",
  attach: "将我的 PayFix 账号（{email}）关联到这些回答，方便团队了解我进行到了哪一步。",
  submit: "提交反馈",
  sending: "正在提交…",
  required: "请回答标 * 的问题。",
  thanks: { title: "谢谢你！", body: "你的回答能帮助我们决定接下来优先修复什么。", back: "返回 PayFix" },
  guidedDemoLink: "告诉我们你的体验",
};

export default feedback;
