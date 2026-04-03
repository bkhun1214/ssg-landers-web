// src/app/page.tsx
import { getMonthlySchedule } from '@/services/schedule';
import GameCard from '@/components/GameCard';
import AutoScroller from '@/components/AutoScroller';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  
  // 한국 시간(KST) 기준으로 '오늘 날짜' 구하기
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayStr = kstNow.toISOString().split('T')[0]; // "2026-04-03" 형태

  const currentYear = parseInt(params.year || String(kstNow.getFullYear()));
  const currentMonth = parseInt(params.month || String(kstNow.getMonth() + 1));

  // 💡 메인 화면은 무조건 'SSG' 데이터만 가져옵니다!
  const schedules = await getMonthlySchedule(currentYear, currentMonth, 'SSG');

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  // 🎯 어디로 스크롤할지 목표 경기(Target Game) 찾기
  let targetGameId: string | null = null;
  
  if (schedules.length > 0) {
    // 1순위: 오늘 경기가 있으면 오늘 경기로
    let target = schedules.find(g => g.date === todayStr);

    // 2순위: 오늘 경기가 없다면, 이미 지나간 가장 최근 경기로 (배열이 날짜순 정렬이므로 필터링 후 마지막 요소)
    if (!target) {
      const pastGames = schedules.filter(g => g.date < todayStr);
      if (pastGames.length > 0) target = pastGames[pastGames.length - 1];
    }

    // 3순위: 과거 경기도 없다면, 앞으로 다가올 가장 가까운 첫 경기로
    if (!target) {
      target = schedules.find(g => g.date > todayStr);
    }

    if (target) {
      targetGameId = `game-${target.id}`; // 예: "game-2026-04-03-SSG-KT"
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-3xl mx-auto p-3 sm:p-6 pb-10 relative">
      
      {/* 💡 목표 위치로 부드럽게 스크롤을 쏴주는 투명 컴포넌트 삽입 */}
      <AutoScroller targetId={targetGameId} />

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
            // 💡 여기에 id를 달아주어 AutoScroller가 찾아올 수 있게 합니다!
            <div id={`game-${game.id}`} key={game.id} className="scroll-mt-4">
              <GameCard game={game} selectedTeam="SSG" />
            </div>
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