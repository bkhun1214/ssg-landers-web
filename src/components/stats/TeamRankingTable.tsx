// src/components/stats/TeamRankingTable.tsx
"use client";

import { useState, useEffect } from "react";
import type { TeamRanking } from "@/types/stats";

export default function TeamRankingTable() {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/stats');
        const result = await res.json();
        
        if (result.success) {
          setRankings(result.data);
        }
      } catch (error) {
        console.error("순위 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500">순위 데이터를 불러오는 중입니다...</div>;
  }

  if (rankings.length === 0) {
    return <div className="py-20 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">순위 데이터가 없습니다.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-3 w-16">순위</th>
              <th className="px-4 py-3 text-left">팀명</th>
              <th className="px-4 py-3 w-20">경기</th>
              <th className="px-4 py-3 w-20">승</th>
              <th className="px-4 py-3 w-20">패</th>
              <th className="px-4 py-3 w-20">무</th>
              <th className="px-4 py-3 w-24">승률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rankings.map((team) => {
              const isSsg = team.teamName.includes("SSG");
              return (
                <tr 
                  key={team.teamName} 
                  className={`transition-colors hover:bg-gray-50 ${isSsg ? "bg-red-50/50" : ""}`}
                >
                  <td className={`px-4 py-3 font-bold ${isSsg ? "text-[#CE0E2D]" : "text-gray-700"}`}>
                    {team.rank}
                  </td>
                  <td className={`px-4 py-3 text-left font-bold ${isSsg ? "text-[#CE0E2D]" : "text-gray-900"}`}>
                    {team.teamName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{team.gamesPlayed}</td>
                  <td className="px-4 py-3 text-gray-600">{team.wins}</td>
                  <td className="px-4 py-3 text-gray-600">{team.losses}</td>
                  <td className="px-4 py-3 text-gray-600">{team.draws}</td>
                  <td className={`px-4 py-3 font-semibold ${isSsg ? "text-[#CE0E2D]" : "text-gray-800"}`}>
                    {team.winRate.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}