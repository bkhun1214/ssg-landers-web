// src/app/history/page.tsx
import PastRankingViewer from "@/components/history/PastRankingViewer";

export default function HistoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">과거 시즌 기록</h2>
        <p className="text-sm text-gray-500 mt-1">이전 KBO 정규시즌의 최종 팀 순위와 결과를 확인합니다.</p>
      </div>

      <section>
        <PastRankingViewer />
      </section>
    </div>
  );
}