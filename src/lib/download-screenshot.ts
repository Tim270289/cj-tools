import { domToPng } from "modern-screenshot";

export function todayString(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 把網頁上的區塊直接截圖成 PNG 並下載，畫面與網頁完全一致
// 加上 data-screenshot-ignore 的元素（例如按鈕）不會出現在圖片裡
export async function downloadScreenshot(element: HTMLElement, filePrefix: string) {
  const dataUrl = await domToPng(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    filter: (node) => !(node instanceof HTMLElement && "screenshotIgnore" in node.dataset),
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filePrefix}-${todayString()}.png`;
  link.click();
}
