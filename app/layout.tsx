import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大学生求职准备站 · 查岗位 · 找项目 · 选竞赛 · 整理简历",
  description: "查岗位 · 找项目 · 选竞赛 · 整理简历。从招聘需求出发，积累真实项目与竞赛经历。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
