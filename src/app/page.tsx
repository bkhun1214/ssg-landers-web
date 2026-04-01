// src/app/page.tsx
import { getMonthlySchedule } from '@/services/schedule';
import GameCard from '@/components/GameCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const currentYear = parseInt(params.year || '2026');
  const currentMonth = parseInt(params.month || '4');

  // 💡 메인 화면은 무조건 'SSG' 데이터만 가져옵니다!
  const schedules = await getMonthlySchedule(currentYear, currentMonth, 'SSG');

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  return (
    <main className="min-h-screen bg-gray-50 max-w-3xl mx-auto p-3 sm:p-6 pb-10">
      
      <header className="mb-6 flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ⚾ SSG 랜더스 홈
          </h1>
          <p className="text-sm font-bold text-red-600 mt-0.5">
            {currentYear}년 {currentMonth}월
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`?year=${prevYear}&month=${prevMonth}`} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold hover:bg-gray-50">← 이전</Link>
          <Link href={`?year=${nextYear}&month=${nextMonth}`} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold hover:bg-gray-50">다음 →</Link>
        </div>
      </header>

      {/* SSG 일정은 아래로 깔끔하게 나열합니다 (space-y-3) */}
      <div className="space-y-3">
        {schedules.length > 0 ? (
          schedules.map((game) => (
            // 카드를 그릴 때 기준을 무조건 'SSG'로 고정합니다.
            <GameCard key={game.id} game={game} selectedTeam="SSG" />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <span className="text-4xl mb-3">🏟️</span>
            <p className="text-sm font-medium">SSG 랜더스의 해당 월 일정이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}