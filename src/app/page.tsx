// src/app/page.tsx
import { getMonthlySchedule } from '@/services/schedule';
import GameCard from '@/components/GameCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Home({ searchParams }: Props) {
  // 1. 주소창에서 연도와 월을 읽어옵니다. 없으면 기본값(2026년 4월)을 씁니다.
  const params = await searchParams;
  const currentYear = parseInt(params.year || '2026');
  const currentMonth = parseInt(params.month || '4');

  // 2. 해당 월의 모든 데이터를 가져옵니다. (지난 경기 포함)
  const schedules = await getMonthlySchedule(currentYear, currentMonth);

  // 3. 이전 달, 다음 달 계산 로직
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  return (
    <main className="min-h-screen bg-gray-50 max-w-3xl mx-auto p-3 sm:p-6 pb-10">
      
      {/* 📅 월 선택 내비게이션 영역 */}
      <header className="mb-6 flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ⚾ SSG 랜더스 일정
          </h1>
          <p className="text-sm font-bold text-red-600">
            {currentYear}년 {currentMonth}월
          </p>
        </div>

        <div className="flex gap-2">
          {/* 이전 달 버튼 */}
          <Link 
            href={`?year=${prevYear}&month=${prevMonth}`}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold shadow-sm hover:bg-gray-50"
          >
            ← 이전 달
          </Link>
          {/* 다음 달 버튼 */}
          <Link 
            href={`?year=${nextYear}&month=${nextMonth}`}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold shadow-sm hover:bg-gray-50"
          >
            다음 달 →
          </Link>
        </div>
      </header>

      {/* 일정 리스트 */}
      <div className="space-y-3">
        {schedules.length > 0 ? (
          schedules.map((game) => (
            <GameCard key={game.id} game={game} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <span className="text-4xl mb-3">🏟️</span>
            <p className="text-sm font-medium">해당 월의 경기 일정이 없습니다.</p>
            <p className="text-xs mt-1">크롤러를 통해 데이터를 확인해 보세요.</p>
          </div>
        )}
      </div>
    </main>
  );
}