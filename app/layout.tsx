import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '简历工坊 · 把经历，写成机会', description: '面向大学生的简历编辑器。实时预览、AI 润色、A4 PDF 导出。' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
