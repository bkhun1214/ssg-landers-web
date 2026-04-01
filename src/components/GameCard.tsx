import type { GameSchedule } from '@/types/schedule';

interface GameCardProps {
  game: GameSchedule;
  selectedTeam?: string; // 💡 상위 화면에서 어떤 팀을 선택했는지 전달받습니다.
}

export default function GameCard({ game, selectedTeam = '전체' }: GameCardProps) {
  // 1. 기준 팀 설정 ('전체'를 선택했거나, 선택한 팀의 경기가 아니면 홈팀을 왼쪽에 배치)
  const isSelectedTeamGame = selectedTeam !== '전체' && (game.homeTeam === selectedTeam || game.awayTeam === selectedTeam);
  
  // 💡 핵심: 필터로 선택한 팀이 있으면 무조건 그 팀을 왼쪽(primary)에 배치합니다!
  const primaryTeam = isSelectedTeamGame ? selectedTeam : game.homeTeam;
  const opponentTeam = primaryTeam === game.homeTeam ? game.awayTeam : game.homeTeam;
  const isPrimaryHome = primaryTeam === game.homeTeam;

  // 2. 승패 판정 (이제 SSG 기준이 아니라 primaryTeam 기준입니다)
  let resultText = '';
  let resultColor = 'text-gray-400';

  const primaryScore = isPrimaryHome ? game.homeScore : game.awayScore;
  const oppScore = isPrimaryHome ? game.awayScore : game.homeScore;

  if (game.status === 'FINISHED' && typeof primaryScore === 'number' && typeof oppScore === 'number') {
    if (primaryScore > oppScore) {
      resultText = '승리';
      resultColor = 'text-red-600 bg-red-50';
    } else if (primaryScore < oppScore) {
      resultText = '패배';
      resultColor = 'text-blue-600 bg-blue-50';
    } else {
      resultText = '무승부';
      resultColor = 'text-gray-600 bg-gray-100';
    }
  }

  // '전체' 보기일 때는 특정 팀을 편애하는 승/패 뱃지를 숨기고 깔끔하게 점수만 보여줍니다.
  const showBadge = isSelectedTeamGame && resultText !== '';

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:p-5 flex items-center justify-between">
      
      {/* 1. 일시 및 장소 */}
      <div className="flex-shrink-0 w-16 sm:w-20">
        <div className="text-[11px] sm:text-sm text-gray-500 font-medium">
          {game.date.split('-').slice(1).join('/')}
        </div>
        <div className="text-sm sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
          {game.time}
        </div>
        <div className="text-[9px] sm:text-xs text-gray-400 mt-0.5">
          {game.location}
        </div>
      </div>

      {/* 2. 대진표 (선택한 기준팀 vs 상대팀) */}
      <div className="flex-grow flex items-center justify-center gap-2 sm:gap-6">
        
        {/* 왼쪽: 내가 선택한 기준팀 */}
        <div className="text-center w-12 sm:w-16">
          <div className="hidden sm:block text-[10px] text-gray-400 mb-1">{isPrimaryHome ? 'HOME' : 'AWAY'}</div>
          {/* 💡 선택한 팀이 빨간색/진하게 강조됩니다 */}
          <div className="text-base sm:text-2xl font-black text-red-600 tracking-tighter">{primaryTeam}</div>
        </div>

        {/* 중앙: VS 또는 점수 */}
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[5rem]">
          {game.status === 'FINISHED' || game.status === 'PROGRESS' ? (
            <div className="text-sm sm:text-2xl font-black bg-gray-50 border border-gray-100 px-2 sm:px-4 py-1 rounded-md tracking-wider text-gray-800">
              {isPrimaryHome ? `${game.homeScore}:${game.awayScore}` : `${game.awayScore}:${game.homeScore}`}
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
          <div className="hidden sm:block text-[10px] text-gray-400 mb-1">{isPrimaryHome ? 'AWAY' : 'HOME'}</div>
          <div className="text-base sm:text-2xl font-bold text-gray-500 tracking-tighter">{opponentTeam}</div>
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