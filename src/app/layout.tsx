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
        <header className="bg-[#CE0E2D] text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            
            {/* 💡 제목 부분: 모바일에서 작게, 줄바꿈 방지 */}
            <h1 className="text-lg sm:text-2xl font-black tracking-tighter whitespace-nowrap">
              <a href="/">SSG LANDERS <span className="opacity-80">MGR</span></a>
            </h1>

            {/* 💡 네비게이션: 모바일에서 글자가 깨지지 않도록 간격 조정 및 스크롤 허용 */}
            <nav className="w-full sm:w-auto overflow-x-auto scrollbar-hide">
              <ul className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-6 text-[13px] sm:text-base font-bold whitespace-nowrap pb-1 sm:pb-0">
                <li><a href="/" className="hover:text-gray-200 transition-colors">홈</a></li>
                <li><a href="/schedule" className="hover:text-gray-200 transition-colors">전체일정</a></li>
                <li><a href="/stats" className="hover:text-gray-200 transition-colors">기록실</a></li>
                <li><a href="/history" className="hover:text-gray-200 transition-colors">과거기록</a></li>
              </ul>
            </nav>

          </div>
        </header>

        {/* 메인 컨텐츠 영역도 모바일 패딩 최적화 */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}