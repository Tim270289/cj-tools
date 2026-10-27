// 網站上的小工具清單，首頁卡片、導覽列、footer 共用
export const TOOLS = [
  {
    href: "/cleaning",
    name: "打掃抽籤",
    title: "打掃區域抽籤",
    description: "轉一下轉盤，公平分配今天每個人負責的打掃區域。",
    features: ["轉盤公平分配打掃區域", "點名牌切換今日在不在倉庫", "一鍵把抽籤結果存成圖片"],
    icon: "wheel",
  },
  {
    href: "/plan",
    name: "今日計劃",
    title: "今日計劃與番茄鐘",
    description: "排好 8:30–17:30 的時間表，用番茄鐘一段一段完成。",
    features: ["番茄鐘專注計時、自動切換休息", "每 30 分鐘一格的時間表，自動保存", "一鍵截圖今日計劃"],
    icon: "timer",
  },
  {
    href: "/qa",
    name: "工務Q&A",
    title: "工務 Q&A",
    description: "歷年塗料施工常見問題整理，輸入關鍵字馬上查到答案。",
    features: ["關鍵字搜尋，例如「工時」「起泡」", "依施工分類快速瀏覽", "搜尋結果自動標示關鍵字"],
    icon: "book",
  },
] as const;

export type ToolIconName = (typeof TOOLS)[number]["icon"];
