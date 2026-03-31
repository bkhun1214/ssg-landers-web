// src/components/calendar/SsgCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GameSchedule } from "@/types/schedule";

export default function SsgCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [schedules, setSchedules] = useState<GameSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 기준 월의 경기 일정을 API에서 조회
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const year = currentDate.year();
        const month = currentDate.month() + 1; // dayjs month는 0부터 시작
        const res = await fetch(`/api/schedule?year=${year}&month=${month}`);
        const result = await res.json();
        
        if (result.success) {
          setSchedules(result.data);
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [currentDate]);

  // 달력 이동 핸들러
  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  // 달력 그리드 계산 로직
  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfWeek = startOfMonth.day(); // 0(일) ~ 6(토)

  // 빈 칸 배열 (첫째 날 이전)
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  // 날짜 배열
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // // 특정 날짜의 경기 데이터 찾기
  // const getScheduleForDay = (day: number) => {
  //   const targetDateStr = currentDate.date(day).format("YYYY-MM-DD");
  //   // 실제 환경에서는 날짜 포맷팅(MM.DD 형태 등)이 크롤링 데이터와 일치하도록 가공 필요
  //   // 여기서는 예시로 포함 관계를 확인합니다.
  //   return schedules.find((s) => s.date.includes(targetDateStr) || s.date.includes(`${currentDate.month() + 1}.${day}`));
  // };

  // src/components/calendar/SsgCalendar.tsx 내의 getScheduleForDay 함수 수정
  const getScheduleForDay = (day: number) => {
    const targetDateStr = currentDate.date(day).format("YYYY-MM-DD");
  // 날짜 문자열이 정확히 일치하는 데이터를 찾습니다.
  return schedules.find((s) => s.date === targetDateStr);
};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#CE0E2D] text-white">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/20 rounded-full transition">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.format("YYYY년 MM월")}
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-white/20 rounded-full transition">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
          <div key={day} className={`py-2 text-center text-sm font-semibold ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 바디 (날짜 그리드) */}
      <div className="grid grid-cols-7 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-gray-500 font-medium">일정을 불러오는 중입니다...</span>
          </div>
        )}

        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="min-h-[120px] border-b border-r border-gray-100 bg-gray-50/50"></div>
        ))}

        {days.map((day) => {
          const schedule = getScheduleForDay(day);
          const isToday = dayjs().isSame(currentDate.date(day), "day");

          return (
            <div key={day} className={`min-h-[120px] border-b border-r border-gray-100 p-2 relative transition hover:bg-gray-50 ${isToday ? "bg-red-50" : ""}`}>
              <span className={`text-sm font-medium ${isToday ? "text-[#CE0E2D]" : "text-gray-700"}`}>
                {day}
              </span>

              {schedule && (
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  <div className={`p-1 rounded font-semibold text-center ${schedule.isSsgLanders ? "bg-[#CE0E2D] text-white" : "bg-gray-200 text-gray-800"}`}>
                    {schedule.awayTeam} vs {schedule.homeTeam}
                  </div>
                  <div className="text-gray-500 text-center">{schedule.time}</div>
                  <div className="text-gray-500 text-center truncate">{schedule.location}</div>
                  {schedule.status === "CANCELLED" && (
                    <div className="text-red-500 font-bold text-center mt-1">우천취소</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}