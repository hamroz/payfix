import type { Messages } from "../types";

const roles: Messages["roles"] = {
  owner: { label: "所有者", description: "全部权限，另可管理团队、钱包和工作区设置" },
  editor: { label: "编辑者", description: "账单、客户、批准和退款" },
  viewer: { label: "查看者", description: "只读访问和导出" },
};

export default roles;
