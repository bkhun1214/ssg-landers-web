import type { GameSchedule } from '@/types/schedule';

export default function GameCard({ game }: { game: GameSchedule }) {
  // 1. SSG 랜더스 중심 데이터 가공
  const isSsgHome = game.homeTeam === 'SSG';
  const opponentTeam = isSsgHome ? game.awayTeam : game.homeTeam;
  
  // 2. 승패 판정
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
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
      
      {/* 1. 일시 및 장소 */}
      <div className="flex-shrink-0 w-24">
        <div className="text-sm text-gray-600">{game.date.split('-').slice(1).join('/')}</div>
        <div className="text-lg font-bold text-gray-900">{game.time}</div>
        <div className="text-xs text-gray-500">{game.location}</div>
      </div>

      {/* 2. 대진표 (SSG vs 상대팀) */}
      <div className="flex-grow flex items-center justify-center gap-4">
        {/* 왼쪽: 무조건 SSG */}
        <div className="text-center w-16">
          <div className="text-[10px] text-gray-400 mb-1">{isSsgHome ? 'HOME' : 'AWAY'}</div>
          <div className="text-xl font-black text-red-600">SSG</div>
        </div>

        {/* 중앙: VS 또는 점수 */}
        <div className="flex flex-col items-center justify-center w-20">
          {game.status === 'FINISHED' || game.status === 'PROGRESS' ? (
            <div className="text-xl font-bold bg-gray-100 px-3 py-1 rounded-lg tracking-widest">
              {isSsgHome ? `${game.homeScore}:${game.awayScore}` : `${game.awayScore}:${game.homeScore}`}
            </div>
          ) : (
            // 💡 여기에 파트너님이 원하시던 'vs'가 예쁘게 들어갑니다!
            <div className="text-lg font-bold text-gray-300 italic">vs</div>
          )}
          
          <div className="text-[11px] mt-1 font-medium text-gray-500">
            {game.status === 'FINISHED' ? '경기종료' : game.status === 'CANCELLED' ? '경기취소' : '경기예정'}
          </div>
        </div>

        {/* 오른쪽: 무조건 상대팀 */}
        <div className="text-center w-16">
          <div className="text-[10px] text-gray-400 mb-1">{isSsgHome ? 'AWAY' : 'HOME'}</div>
          <div className="text-xl font-bold text-gray-800">{opponentTeam}</div>
        </div>
      </div>

      {/* 3. 경기 결과 뱃지 */}
      <div className="w-14 flex justify-end">
        {resultText && (
          <span className={`text-sm border px-2 py-1 rounded ${resultColor} border-current`}>
            {resultText}
          </span>
        )}
      </div>

    </div>
  );
}