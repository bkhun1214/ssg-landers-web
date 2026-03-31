// src/components/schedule/FullScheduleList.tsx
"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { GameSchedule } from "@/types/schedule";

const KBO_TEAMS = ["전체", "SSG", "LG", "KT", "삼성", "두산", "KIA", "롯데", "한화", "NC", "키움"];

export default function FullScheduleList() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedTeam, setSelectedTeam] = useState("전체");
  const [schedules, setSchedules] = useState<GameSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const year = currentDate.year();
        const month = currentDate.month() + 1;
        const res = await fetch(`/api/schedule?year=${year}&month=${month}`);
        const result = await res.json();
        
        if (result.success) {
          setSchedules(result.data);
        }
      } catch (error) {
        console.error("일정 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, [currentDate]);

  // 팀 필터링 로직
  const filteredSchedules = selectedTeam === "전체" 
    ? schedules 
    : schedules.filter(s => s.homeTeam.includes(selectedTeam) || s.awayTeam.includes(selectedTeam));

  // 날짜별 그룹화
  const groupedSchedules = filteredSchedules.reduce((acc, game) => {
    const date = game.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {} as Record<string, GameSchedule[]>);

  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <div className="space-y-4">
      {/* 컨트롤러: 월 선택 및 팀 필터 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold w-32 text-center">{currentDate.format("YYYY년 MM월")}</span>
          <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CE0E2D]"
          >
            {KBO_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
          </select>
        </div>
      </div>

      {/* 일정 리스트 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
        ) : sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-bold text-gray-500 ml-1">{dayjs(date).format("MM월 DD일 (ddd)")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedSchedules[date].map(game => (
                  <div 
                    key={game.id} 
                    className={`p-4 rounded-lg border bg-white shadow-sm flex flex-col justify-between transition-all ${game.isSsgLanders ? "border-[#CE0E2D] ring-1 ring-[#CE0E2D]/10" : "border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-400">{game.time} | {game.location}</span>
                      {game.status === "CANCELLED" && <span className="text-xs font-bold text-red-500">우천취소</span>}
                    </div>
                    <div className="flex items-center justify-around py-2">
                      <div className="flex flex-col items-center w-1/3">
                        <span className={`text-sm font-bold ${game.awayTeam.includes("SSG") ? "text-[#CE0E2D]" : "text-gray-700"}`}>{game.awayTeam}</span>
                      </div>
                      <span className="text-xs text-gray-300 font-bold">VS</span>
                      <div className="flex flex-col items-center w-1/3">
                        <span className={`text-sm font-bold ${game.homeTeam.includes("SSG") ? "text-[#CE0E2D]" : "text-gray-700"}`}>{game.homeTeam}</span>
                      </div>
                    </div>
                    {game.isSsgLanders && (
                      <div className="mt-2 pt-2 border-t border-gray-50 flex justify-center">
                        <span className="text-[10px] bg-[#CE0E2D] text-white px-2 py-0.5 rounded-full uppercase font-bold">My Team</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">해당 조건의 경기 일정이 없습니다.</div>
        )}
      </div>
    </div>
  );
}