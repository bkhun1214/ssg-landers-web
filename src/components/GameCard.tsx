import type { GameSchedule } from '@/types/schedule';

export default function GameCard({ game }: { game: GameSchedule }) {
  const isSsgHome = game.homeTeam === 'SSG';
  const opponentTeam = isSsgHome ? game.awayTeam : game.homeTeam;
  
  let resultText = '';
  let resultColor = 'text-gray-400';

  const ssgScore = isSsgHome ? game.homeScore : game.awayScore;
  const oppScore = isSsgHome ? game.awayScore : game.homeScore;

  if (game.status === 'FINISHED' && typeof ssgScore === 'number' && typeof oppScore === 'number') {
    if (ssgScore > oppScore) {
      resultText = '승리';
      resultColor = 'text-red-600 bg-red-50'; // 💡 텍스트 색상과 어울리는 옅은 배경색 추가
    } else if (ssgScore < oppScore) {
      resultText = '패배';
      resultColor = 'text-blue-600 bg-blue-50';
    } else {
      resultText = '무승부';
      resultColor = 'text-gray-600 bg-gray-100';
    }
  }

  return (
    // 💡 테두리를 더 둥글게(rounded-xl) 하고, 모바일 패딩을 p-3으로 아담하게 조절
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:p-5 flex items-center justify-between">
      
      {/* 1. 일시 및 장소 */}
      <div className="flex-shrink-0 w-16 sm:w-20">
        <div className="text-[11px] sm:text-sm text-gray-500 font-medium">
          {game.date.split('-').slice(1).join('/')}
        </div>
        {/* 💡 모바일 시간 글자 크기를 text-sm으로 확 줄여서 세련되게! */}
        <div className="text-sm sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
          {game.time}
        </div>
        <div className="text-[9px] sm:text-xs text-gray-400 mt-0.5">
          {game.location}
        </div>
      </div>

      {/* 2. 대진표 (SSG vs 상대팀) */}
      <div className="flex-grow flex items-center justify-center gap-2 sm:gap-6">
        
        {/* 왼쪽: SSG */}
        <div className="text-center w-12 sm:w-16">
          <div className="text-base sm:text-2xl font-black text-red-600 tracking-tighter">SSG</div>
        </div>

        {/* 중앙: VS 또는 점수 */}
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[5rem]">
          {game.status === 'FINISHED' || game.status === 'PROGRESS' ? (
            // 💡 점수판 박스 디자인을 모바일에 맞게 타이트하게 조절
            <div className="text-sm sm:text-2xl font-black bg-gray-50 border border-gray-100 px-2 sm:px-4 py-1 rounded-md tracking-wider text-gray-800">
              {isSsgHome ? `${game.homeScore}:${game.awayScore}` : `${game.awayScore}:${game.homeScore}`}
            </div>
          ) : (
            <div className="text-xs sm:text-lg font-bold text-gray-300 italic">vs</div>
          )}
          <div className="text-[8px] sm:text-[11px] mt-1 font-semibold text-gray-400 whitespace-nowrap">
            {game.status === 'FINISHED' ? '경기종료' : game.status === 'CANCELLED' ? '취소' : '예정'}
          </div>
        </div>

        {/* 오른쪽: 상대팀 */}
        <div className="text-center w-12 sm:w-16">
          <div className="text-base sm:text-2xl font-bold text-gray-800 tracking-tighter">{opponentTeam}</div>
        </div>
      </div>

      {/* 3. 경기 결과 뱃지 */}
      <div className="w-10 sm:w-14 flex justify-end">
        {resultText && (
          // 💡 뱃지 폰트를 아주 작게(text-[9px]) 하고 둥글기를 주어 네이티브 앱처럼 표현
          <span className={`text-[9px] sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-bold whitespace-nowrap ${resultColor}`}>
            {resultText}
          </span>
        )}
      </div>

    </div>
  );
}