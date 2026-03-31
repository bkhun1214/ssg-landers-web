// src/app/stats/page.tsx
import TeamRankingTable from "@/components/stats/TeamRankingTable";

export default function StatsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">KBO 정규시즌 기록실</h2>
        <p className="text-sm text-gray-500 mt-1">현재 정규시즌의 구단 순위 및 주요 지표를 확인합니다.</p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#CE0E2D] pl-3">팀 순위</h3>
        <TeamRankingTable />
      </section>

      {/* 추후 타자/투수 개인 기록 컴포넌트가 추가될 자리입니다. */}
      <section className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-gray-800 pl-3">선수 기록 (TOP 5)</h3>
        <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
          선수 개인 기록 데이터 연동은 추후 확장 예정입니다.
        </div>
      </section>
    </div>
  );
}