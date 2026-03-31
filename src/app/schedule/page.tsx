// src/app/schedule/page.tsx
import FullScheduleList from "@/components/schedule/FullScheduleList";

export default function SchedulePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">KBO 전체 일정</h2>
          <p className="text-sm text-gray-500 mt-1">리그의 모든 경기 일정을 확인하고 팀별로 필터링할 수 있습니다.</p>
        </div>
      </div>
      
      {/* 전체 일정 리스트 컴포넌트 */}
      <FullScheduleList />
    </div>
  );
}