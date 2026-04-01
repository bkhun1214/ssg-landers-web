// src/app/stats/page.tsx
import { getTeamStandings, getPlayerStats } from '@/services/record';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StatsPage({ searchParams }: Props) {
  const params = await searchParams;
  // 현재 탭 (기본값: 'team')
  const currentTab = params.tab || 'team';

  // 1. Supabase에서 데이터 가져오기
  const teamStandings = await getTeamStandings();
  const pitcherStats = await getPlayerStats('투수');
  const batterStats = await getPlayerStats('타자');

  // 2. 선수 기록을 세부 지표(타율, 홈런 등)별로 예쁘게 묶어주기
  const groupStats = (stats: any[]) => {
    return stats.reduce((acc, stat) => {
      if (!acc[stat.stat_name]) acc[stat.stat_name] = [];
      acc[stat.stat_name].push(stat);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const groupedPitchers = groupStats(pitcherStats);
  const groupedBatters = groupStats(batterStats);

  return (
    <main className="min-h-screen bg-gray-50 max-w-4xl mx-auto p-3 sm:p-6 pb-20">
      <header className="mb-6 px-1 mt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">📊 KBO 기록실</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">2026 정규시즌 순위 및 기록</p>
      </header>

      {/* 🔘 탭 네비게이션 */}
      <div className="flex bg-white rounded-lg shadow-sm p-1 mb-4 border border-gray-200">
        <Link href="?tab=team" className={`flex-1 text-center py-2.5 text-sm font-bold rounded-md transition-colors ${currentTab === 'team' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
          팀 순위
        </Link>
        <Link href="?tab=batter" className={`flex-1 text-center py-2.5 text-sm font-bold rounded-md transition-colors ${currentTab === 'batter' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
          타자 순위
        </Link>
        <Link href="?tab=pitcher" className={`flex-1 text-center py-2.5 text-sm font-bold rounded-md transition-colors ${currentTab === 'pitcher' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
          투수 순위
        </Link>
      </div>

      {/* 🏆 팀 순위 탭 */}
      {currentTab === 'team' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-center text-sm sm:text-base whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3">순위</th>
                  <th className="py-3 px-4 text-left">팀명</th>
                  <th className="py-3 px-3">경기</th>
                  <th className="py-3 px-3 text-red-600">승</th>
                  <th className="py-3 px-3 text-gray-400">무</th>
                  <th className="py-3 px-3 text-blue-600">패</th>
                  <th className="py-3 px-3 font-black">승률</th>
                  <th className="py-3 px-3">게임차</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamStandings.length > 0 ? teamStandings.map((team) => (
                  <tr key={team.id} className={`hover:bg-gray-50 ${team.team_name.includes('SSG') ? 'bg-red-50 font-bold text-gray-900' : 'text-gray-700'}`}>
                    <td className="py-3 px-3">{team.rank}</td>
                    <td className="py-3 px-4 text-left font-black">{team.team_name}</td>
                    <td className="py-3 px-3">{team.played}</td>
                    <td className="py-3 px-3 text-red-600">{team.wins}</td>
                    <td className="py-3 px-3 text-gray-400">{team.draws}</td>
                    <td className="py-3 px-3 text-blue-600">{team.losses}</td>
                    <td className="py-3 px-3 font-black">{team.win_rate.toFixed(3)}</td>
                    <td className="py-3 px-3">{team.game_behind}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="py-10 text-gray-400">데이터가 없습니다. 크롤러를 실행해주세요.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🏏 타자 & ⚾ 투수 개인 기록 탭 */}
      {(currentTab === 'batter' || currentTab === 'pitcher') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(currentTab === 'batter' ? groupedBatters : groupedPitchers).length > 0 ? (
            Object.entries(currentTab === 'batter' ? groupedBatters : groupedPitchers).map(([statName, players]) => (
              <div key={statName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                <h3 className="text-lg font-black text-gray-900 mb-4 border-b pb-2 px-1">
                  {currentTab === 'batter' ? '🏏' : '⚾'} {statName} TOP 5
                </h3>
                <ul className="space-y-3">
                  {players.map((player) => (
                    <li key={player.id} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-4">
                        <span className={`w-5 text-center font-black ${player.rank === 1 ? 'text-red-600' : 'text-gray-400'}`}>{player.rank}</span>
                        <div>
                          <p className="text-base font-bold text-gray-800">{player.player_name}</p>
                          <p className="text-[11px] font-semibold text-gray-500">{player.team_name}</p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-gray-900 tracking-tight">{player.stat_value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
              기록 데이터가 없습니다. 크롤러를 실행해주세요.
            </div>
          )}
        </div>
      )}

    </main>
  );
}