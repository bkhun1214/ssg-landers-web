// src/components/GameCard.tsx
import type { GameSchedule } from '@/types/schedule';
import Link from 'next/link'; // 💡 Link 컴포넌트 추가

interface GameCardProps {
  game: any; 
  selectedTeam?: string;
  isSchedulePage?: boolean;
}

export default function GameCard({ game, selectedTeam = '전체', isSchedulePage = false }: GameCardProps) {
  const isSelectedTeamGame = selectedTeam !== '전체' && (game.homeTeam === selectedTeam || game.awayTeam === selectedTeam);

  let resultText = '';
  let resultColor = 'text-gray-400';

  if (game.status === 'FINISHED' && typeof game.homeScore === 'number' && typeof game.awayScore === 'number') {
    if (isSelectedTeamGame) {
      const myScore = game.homeTeam === selectedTeam ? game.homeScore : game.awayScore;
      const oppScore = game.homeTeam === selectedTeam ? game.awayScore : game.homeScore;

      if (myScore > oppScore) {
        resultText = '승리';
        resultColor = 'text-red-600 bg-red-50';
      } else if (myScore < oppScore) {
        resultText = '패배';
        resultColor = 'text-blue-600 bg-blue-50';
      } else {
        resultText = '무승부';
        resultColor = 'text-gray-600 bg-gray-100';
      }
    }
  }

  const showBadge = isSelectedTeamGame && resultText !== '';

  const awayColor = isSchedulePage 
    ? 'text-gray-900' 
    : (game.awayTeam?.includes('SSG') ? 'text-[#CE0E2D]' : 'text-gray-400');

  const homeColor = isSchedulePage 
    ? 'text-gray-900' 
    : (game.homeTeam?.includes('SSG') ? 'text-[#CE0E2D]' : 'text-gray-400');

  return (
    // 💡 변경: flex-col을 주어서 상단(경기정보)과 하단(버튼)이 위아래로 나뉘게 했습니다.
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all">
      
      {/* 🔹 상단: 기존 경기 정보 영역 */}
      <div className="flex items-center justify-between w-full">
        {/* 1. 일시 및 장소 */}
        <div className="flex-shrink-0 w-16 sm:w-20">
          <div className="text-[11px] sm:text-sm text-gray-500 font-medium">
            {game.date?.split('-').slice(1).join('/')}
          </div>
          <div className="text-sm sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
            {game.time}
          </div>
          <div className="text-[9px] sm:text-xs text-gray-400 mt-0.5">
            {game.location}
          </div>
        </div>

        {/* 2. 대진표 (AWAY vs HOME) */}
        <div className="flex-grow flex items-center justify-center gap-1 sm:gap-6">
          <div className="text-center w-14 sm:w-16">
            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 font-extrabold tracking-wider">AWAY</div>
            <div className={`text-base sm:text-2xl font-black tracking-tighter ${awayColor}`}>
              {game.awayTeam}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-w-[4rem] sm:min-w-[5rem]">
            {game.status === 'FINISHED' || game.status === 'PROGRESS' ? (
              <div className="text-sm sm:text-2xl font-black bg-gray-50 border border-gray-100 px-2 sm:px-4 py-1 rounded-md tracking-wider text-gray-800">
                {game.awayScore}:{game.homeScore}
              </div>
            ) : (
              <div className="text-xs sm:text-lg font-bold text-gray-300 italic">vs</div>
            )}
            <div className="text-[8px] sm:text-[11px] mt-1 font-semibold text-gray-400 whitespace-nowrap">
              {game.status === 'FINISHED' ? '경기종료' : 
               game.status === 'PROGRESS' ? '경기중' :
               game.status === 'CANCELLED' ? '취소' : '예정'}
            </div>
          </div>

          <div className="text-center w-14 sm:w-16">
            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 font-extrabold tracking-wider">HOME</div>
            <div className={`text-base sm:text-2xl font-black tracking-tighter ${homeColor}`}>
              {game.homeTeam}
            </div>
          </div>
        </div>

        {/* 3. 경기 결과 뱃지 */}
        <div className="w-10 sm:w-14 flex justify-end">
          {showBadge && (
            <span className={`text-[9px] sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-bold whitespace-nowrap ${resultColor}`}>
              {resultText}
            </span>
          )}
        </div>
      </div>

      {/* 🔹 하단: 경기 결과 보기 버튼 (FINISHED 상태일 때만 등장!) */}
      {game.status === 'FINISHED' && (
        <Link 
          href={`/game/${game.id}`}
          className="w-full mt-1 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-[11px] sm:text-sm font-bold rounded-lg border border-gray-200 text-center transition-colors flex items-center justify-center gap-1"
        >
          경기 결과 보기 (박스스코어)
          <span className="text-[10px] sm:text-xs">→</span>
        </Link>
      )}

    </div>
  );
}