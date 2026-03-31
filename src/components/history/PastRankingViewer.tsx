// src/components/history/PastRankingViewer.tsx
"use client";

import { useState } from "react";
import { PAST_SEASONS_DATA } from "@/data/history";

export default function PastRankingViewer() {
  const [selectedSeason, setSelectedSeason] = useState<number>(PAST_SEASONS_DATA[0].season);

  const currentData = PAST_SEASONS_DATA.find((d) => d.season === selectedSeason);

  return (
    <div className="space-y-6">
      {/* 연도 선택 탭 */}
      <div className="flex space-x-2 border-b border-gray-200">
        {PAST_SEASONS_DATA.map((data) => (
          <button
            key={data.season}
            onClick={() => setSelectedSeason(data.season)}
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              selectedSeason === data.season
                ? "border-b-2 border-[#CE0E2D] text-[#CE0E2D]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {data.season} 시즌
          </button>
        ))}
      </div>

      {/* 순위 테이블 */}
      {currentData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4 w-24">최종 순위</th>
                <th className="px-6 py-4 text-left">팀명</th>
                <th className="px-6 py-4 text-left">비고 (포스트시즌 결과 등)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.rankings.map((team) => {
                const isSsg = team.teamName === "SSG";
                return (
                  <tr 
                    key={team.teamName}
                    className={`transition-colors hover:bg-gray-50 ${isSsg ? "bg-red-50/50" : ""}`}
                  >
                    <td className={`px-6 py-4 font-bold ${isSsg ? "text-[#CE0E2D]" : "text-gray-700"}`}>
                      {team.rank}위
                    </td>
                    <td className={`px-6 py-4 text-left font-bold ${isSsg ? "text-[#CE0E2D]" : "text-gray-900"}`}>
                      {team.teamName}
                    </td>
                    <td className="px-6 py-4 text-left text-gray-500 text-xs">
                      {team.note || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}