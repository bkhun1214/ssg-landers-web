// src/components/GameCard.tsx
import type { GameSchedule } from '@/types/schedule';

interface GameCardProps {
  // DB에서 온 데이터가 schedule.ts를 거쳐 camelCase로 변환된 상태라고 가정합니다.
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

  // 💡 메인 화면(isSchedulePage: false)이면 SSG 빨간색, 전체일정(true)이면 모두 검정색
  const awayColor = isSchedulePage 
    ? 'text-gray-900' 
    : (game.awayTeam?.includes('SSG') ? 'text-[#CE0E2D]' : 'text-gray-400');

  const homeColor = isSchedulePage 
    ? 'text-gray-900' 
    : (game.homeTeam?.includes('SSG') ? 'text-[#CE0E2D]' : 'text-gray-400');

  // 💡 [핵심 변경] Link 태그를 아예 제거하고 순수 div로만 구성했습니다.
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:p-5 flex items-center justify-between">
      
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
        
        {/* 왼쪽: AWAY 팀 */}
        <div className="text-center w-14 sm:w-16">
          <div className="text-[9px] sm:text-[10px] text-gray-400 mb-0.5 font-extrabold tracking-wider">AWAY</div>
          <div className={`text-base sm:text-2xl font-black tracking-tighter ${awayColor}`}>
            {game.awayTeam}
          </div>
        </div>

        {/* 중앙: 점수 또는 VS */}
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

        {/* 오른쪽: HOME 팀 */}
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
  );
}