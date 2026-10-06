import type { LegalDoc } from "../types";

const cookies: LegalDoc = {
  title: "Cookie 政策",
  description: "PayFix 使用的少量 Cookie 和浏览器存储项、各自的用途以及保存时长。不使用分析或广告 Cookie。",
  updated: "2026-10-05",
  intro: [
    "本政策说明 PayFix 使用哪些 Cookie 及类似的浏览器存储，以及使用的原因。简而言之：PayFix 只使用让您保持登录和记住您所做选择所必需的内容，不使用分析、广告或追踪 Cookie。",
  ],
  sections: [
    {
      id: "what-are-cookies",
      heading: "什么是 Cookie 和本地存储",
      blocks: [
        "Cookie 是网站请求您的浏览器保存、并在之后访问时回传的一小段文本。本地存储是一项类似的功能，允许网站在您的浏览器中保存少量数值。两者都不是程序，也都无法读取您设备上的其他文件。",
      ],
    },
    {
      id: "cookies-we-use",
      heading: "我们使用的 Cookie",
      blocks: [
        "以下 Cookie 均由 PayFix 自身设置（第一方 Cookie），不会与其他网站共享。",
        {
          list: [
            "<b>pf_b</b> 让您保持商家账户的登录状态。它包含一个随机会话令牌，在 7 天后或您退出登录时失效。",
            "<b>pf_c</b> 在您输入我们通过邮件发送的验证码后，使您在处理链接上保持客户身份的已验证状态。它包含一个随机会话令牌，在 7 天后失效。",
            "<b>pf_ws</b> 在您属于多家公司时，记住您当前正在使用哪家公司。它包含该公司的内部 ID，在 30 天后失效。",
            "<b>pf_inbox</b> 仅在演示模式下使用。它记住您申请登录验证码时使用的邮箱地址（对于客户，还包括对应的公司），以便演示收件箱只显示您的邮件，而不显示他人的邮件。它在 1 天后失效。",
            "<b>pf-locale</b> 记住您选择的语言。它仅在您选择语言时设置，1 年后失效。如果没有该 Cookie，PayFix 会使用您浏览器的语言。",
          ],
        },
      ],
    },
    {
      id: "local-storage",
      heading: "我们使用的本地存储",
      blocks: [
        {
          list: [
            "<b>pf-theme</b> 记住您选择的是浅色主题、深色主题还是跟随系统设置。它仅在您更改主题时设置，并一直保留，直到您将其清除。",
            "<b>walletName</b> 记住您在付款、处理或设置页面连接的浏览器钱包（例如 Phantom 或 Solflare），以便下次页面可以重新连接。它会一直保留，直到您将其清除或断开钱包。",
          ],
        },
        "您的钱包应用也可能在您的浏览器中存储数据。这受其自身政策约束，而非本政策。",
      ],
    },
    {
      id: "no-tracking",
      heading: "不做分析，不投广告",
      blocks: [
        "PayFix 不使用分析工具、广告网络、社交媒体插件或追踪像素。我们的字体由本站自行提供，因此加载页面时不会连接其他字体服务。",
        "部分链接会指向其他网站，例如 Solana Explorer 或钱包服务商。这些网站可能会依据其自身政策设置它们自己的 Cookie。",
      ],
    },
    {
      id: "why-no-banner",
      heading: "为什么我们不征求您的同意",
      blocks: [
        "会话、公司和演示收件箱 Cookie 是提供您所请求服务的严格必需项：没有它们，您将无法保持登录。语言和主题设置仅在您做出选择时保存，用于记住该选择。由于我们不使用任何其他 Cookie 或存储，因此不显示 Cookie 横幅。",
      ],
    },
    {
      id: "how-we-protect-cookies",
      heading: "我们如何保护 Cookie",
      blocks: [
        {
          list: [
            "会话、公司和演示收件箱 Cookie 均标记为 HttpOnly，页面上的脚本无法读取。",
            "在安全（HTTPS）站点上，Cookie 标记为 Secure，因此只会通过加密连接发送。",
            "Cookie 使用 SameSite=Lax 设置，可阻止大多数来自其他网站的请求使用它们。",
            "我们的服务器只存储每个会话令牌的哈希值，因此即使有人拿到我们数据库的副本，也无法用它冒充您登录。",
          ],
        },
        "语言 Cookie 不是 HttpOnly，因为语言菜单需要读取它。它只包含一个语言代码。",
      ],
    },
    {
      id: "managing",
      heading: "如何管理或删除",
      blocks: [
        "您可以在浏览器设置中查看和删除 Cookie 及本地存储，通常位于“隐私”或“网站数据”下。您也可以阻止本站的 Cookie。",
        "如果您删除或阻止会话 Cookie，您将被退出登录，并且在重新允许之前无法再次登录。如果您删除语言或主题设置，PayFix 会恢复使用您浏览器的语言和系统的主题。",
      ],
    },
    {
      id: "changes",
      heading: "本政策的变更",
      blocks: [
        "如果我们新增、更改或移除某个 Cookie，我们会更新本页及顶部的日期。如有疑问，请联系我们。{contact}",
      ],
    },
  ],
};

export default cookies;
