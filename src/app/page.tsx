// src/app/page.tsx (또는 src/app/(tabs)/page.tsx)
import SsgCalendar from "@/components/calendar/SsgCalendar";

export default function Home() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">SSG 랜더스 경기 일정</h2>
        {/* 커스텀 캘린더 컴포넌트 렌더링 */}
        <SsgCalendar />
      </section>

      {/* 추후 구현할 Google Calendar API 영역을 위한 자리 표시자 */}
      <section className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">공식 일정 동기화 (Google Calendar)</h3>
        <p className="text-sm text-gray-500">
          * 이 영역은 향후 Google Calendar API를 연동하여 공식 일정을 리스트 형태로 제공할 예정입니다.
        </p>
      </section>
    </div>
  );
}