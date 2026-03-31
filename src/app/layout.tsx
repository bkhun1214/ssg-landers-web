// src/app/layout.tsx 일부 (설계 방향)
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSG 랜더스 경기 일정 관리",
  description: "KBO SSG 랜더스 경기 일정 및 기록 관리 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <header className="bg-[#CE0E2D] text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">SSG LANDERS MGR</h1>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="/" className="hover:underline">홈 (SSG 일정)</a></li>
                <li><a href="/schedule" className="hover:underline">전체 일정</a></li>
                <li><a href="/stats" className="hover:underline">기록실</a></li>
                <li><a href="/history" className="hover:underline">과거 기록</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}