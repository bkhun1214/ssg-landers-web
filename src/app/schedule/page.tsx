// src/app/schedule/page.tsx
import { getMonthlySchedule } from '@/services/schedule'; // 💡 이름 수정 완료!
import GameCard from '@/components/GameCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ team?: string; month?: string }>;
}

export default async function SchedulePage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedTeam = params.team || '전체';
  const selectedMonth = params.month || '04';

  // 💡 함수 이름 수정 완료!
  const schedules = await getMonthlySchedule('2026', selectedMonth, selectedTeam);

  const teams = ['전체', 'SSG', 'LG', 'KT', 'NC', '두산', 'KIA', '롯데', '삼성', '한화', '키움'];
  const months = ['03', '04', '05', '06', '07', '08', '09', '10'];

  return (
    <main className="min-h-screen bg-gray-50 max-w-4xl mx-auto p-3 sm:p-6 pb-20">
      <header className="mb-6 px-1 mt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">🗓️ KBO 전체 일정</h1>
      </header>

      {/* 🔘 월 선택 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide px-1">
        {months.map((m) => (
          <Link key={m} href={`?month=${m}&team=${selectedTeam}`} className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-sm transition-colors border ${selectedMonth === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {m}월
          </Link>
        ))}
      </div>

      {/* 🔘 팀 선택 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide px-1">
        {teams.map((t) => (
          <Link key={t} href={`?month=${selectedMonth}&team=${t}`} className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-sm transition-colors border ${selectedTeam === t ? (t === 'SSG' ? 'bg-[#CE0E2D] text-white border-[#CE0E2D]' : 'bg-gray-900 text-white border-gray-900') : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {t}
          </Link>
        ))}
      </div>

      {/* 📋 일정 리스트 */}
      <div className="space-y-3 sm:space-y-4">
        {schedules.length > 0 ? (
          schedules.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              selectedTeam={selectedTeam}
              isSchedulePage={true} // 💡 스위치 ON! SSG도 까맣게 나옵니다.
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-bold">해당 조건의 경기 일정이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}