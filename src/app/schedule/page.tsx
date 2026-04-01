// src/app/schedule/page.tsx
import { getMonthlySchedule } from '@/services/schedule';
import GameCard from '@/components/GameCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ month?: string; year?: string; team?: string }>;
}

const KBO_TEAMS = ['전체', 'SSG', 'KIA', '삼성', 'LG', '두산', 'KT', '롯데', '한화', 'NC', '키움'];

export default async function SchedulePage({ searchParams }: Props) {
  const params = await searchParams;
  const currentYear = parseInt(params.year || '2026');
  const currentMonth = parseInt(params.month || '4');
  
  // 💡 전체 일정 화면의 기본값은 '전체'로 세팅합니다.
  const currentTeam = params.team || '전체';

  const schedules = await getMonthlySchedule(currentYear, currentMonth, currentTeam);

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  return (
    <main className="min-h-screen bg-gray-50 max-w-4xl mx-auto p-3 sm:p-6 pb-20">
      
      <header className="mb-4 flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">KBO 전체 일정</h1>
          <p className="text-sm font-bold text-gray-500 mt-0.5">{currentYear}년 {currentMonth}월</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/schedule?year=${prevYear}&month=${prevMonth}&team=${currentTeam}`} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold hover:bg-gray-50">← 이전</Link>
          <Link href={`/schedule?year=${nextYear}&month=${nextMonth}&team=${currentTeam}`} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold hover:bg-gray-50">다음 →</Link>
        </div>
      </header>

      {/* 🏟️ 10개 구단 스와이프 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide px-1">
        {KBO_TEAMS.map(team => (
          <Link
            key={team}
            href={`/schedule?year=${currentYear}&month=${currentMonth}&team=${team}`}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${
              currentTeam === team 
                ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {team}
          </Link>
        ))}
      </div>

      {/* 💡 일정 리스트 (바둑판 배열 Grid 적용) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {schedules.length > 0 ? (
          schedules.map((game) => (
            <GameCard key={game.id} game={game} selectedTeam={currentTeam} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <span className="text-4xl mb-3">🏟️</span>
            <p className="text-sm font-medium">해당 조건의 경기 일정이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}