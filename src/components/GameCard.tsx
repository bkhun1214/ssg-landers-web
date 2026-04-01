import type { GameSchedule } from '@/types/schedule';

export default function GameCard({ game }: { game: GameSchedule }) {
  const isSsgHome = game.homeTeam === 'SSG';
  const opponentTeam = isSsgHome ? game.awayTeam : game.homeTeam;
  
  let resultText = '';
  let resultColor = 'text-gray-400';

  if (game.status === 'FINISHED' && game.homeScore !== null && game.awayScore !== null) {
    const ssgScore = isSsgHome ? game.homeScore : game.awayScore;
    const oppScore = isSsgHome ? game.awayScore : game.homeScore;

    if (ssgScore > oppScore) {
      resultText = '승리';
      resultColor = 'text-red-600 font-bold';
    } else if (ssgScore < oppScore) {
      resultText = '패배';
      resultColor = 'text-blue-600';
    } else {
      resultText = '무승부';
      resultColor = 'text-gray-600';
    }
  }

  return (
    // 💡 p-3(모바일 패딩) sm:p-4(PC 패딩)으로 여백을 자동 조절합니다.
    <div className="bg-white border rounded-lg shadow-sm p-3 sm:p-4 mb-3 flex items-center justify-between">
      
      {/* 1. 일시 및 장소 */}
      <div className="flex-shrink-0 w-16 sm:w-24">
        {/* 모바일에서는 글자를 작게(text-xs), PC에서는 크게(sm:text-sm) */}
        <div className="text-xs sm:text-sm text-gray-600">{game.date.split('-').slice(1).join('/')}</div>
        <div className="text-base sm:text-lg font-bold text-gray-900">{game.time}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">{game.location}</div>
      </div>

      {/* 2. 대진표 (SSG vs 상대팀) */}
      {/* gap-1(모바일 간격 좁게) sm:gap-4(PC 간격 넓게) */}
      <div className="flex-grow flex items-center justify-center gap-1 sm:gap-4">
        
        {/* 왼쪽: SSG */}
        <div className="text-center w-12 sm:w-16">
          {/* 공간이 부족한 모바일에서는 HOME/AWAY 글자를 숨깁니다(hidden) */}
          <div className="hidden sm:block text-[10px] text-gray-400 mb-1">{isSsgHome ? 'HOME' : 'AWAY'}</div>
          <div className="text-lg sm:text-xl font-black text-red-600">SSG</div>
        </div>

        {/* 중앙: VS 또는 점수 */}
        <div className="flex flex-col items-center justify-center w-16 sm:w-20">
          {game.status === 'FINISHED' || game.status === 'PROGRESS' ? (
            <div className="text-sm sm:text-xl font-bold bg-gray-100 px-2 sm:px-3 py-1 rounded-lg tracking-widest">
              {isSsgHome ? `${game.homeScore}:${game.awayScore}` : `${game.awayScore}:${game.homeScore}`}
            </div>
          ) : (
            <div className="text-sm sm:text-lg font-bold text-gray-300 italic">vs</div>
          )}
          
          <div className="text-[9px] sm:text-[11px] mt-1 font-medium text-gray-500 whitespace-nowrap">
            {game.status === 'FINISHED' ? '경기종료' : game.status === 'CANCELLED' ? '경기취소' : '경기예정'}
          </div>
        </div>

        {/* 오른쪽: 상대팀 */}
        <div className="text-center w-12 sm:w-16">
          <div className="hidden sm:block text-[10px] text-gray-400 mb-1">{isSsgHome ? 'AWAY' : 'HOME'}</div>
          <div className="text-lg sm:text-xl font-bold text-gray-800">{opponentTeam}</div>
        </div>
      </div>

      {/* 3. 경기 결과 뱃지 */}
      <div className="w-10 sm:w-14 flex justify-end">
        {resultText && (
          // 모바일에서는 뱃지도 아담하게 줄입니다.
          <span className={`text-[10px] sm:text-sm border px-1.5 py-0.5 sm:px-2 sm:py-1 rounded ${resultColor} border-current whitespace-nowrap`}>
            {resultText}
          </span>
        )}
      </div>

    </div>
  );
}