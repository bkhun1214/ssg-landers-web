// src/app/game/[id]/page.tsx
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const gameId = decodeURIComponent(resolvedParams.id);

  const { data: boxScore, error } = await supabase
    .from('box_scores')
    .select('*')
    .eq('game_id', gameId)
    .single();

  if (error || !boxScore) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 font-bold">아직 상세 기록이 수집되지 않았습니다.</p>
        <p className="text-xs text-gray-400 mt-2">ID: {gameId}</p>
        <Link href="/" className="inline-block mt-4 text-blue-500 underline text-sm">홈으로 돌아가기</Link>
      </div>
    );
  }

  const { home_team, away_team, home_batters, away_batters, home_pitchers, away_pitchers, inning_scores } = boxScore;

  const homeStartingPitcher = home_pitchers?.length > 0 ? home_pitchers[0].name : '미등록';
  const awayStartingPitcher = away_pitchers?.length > 0 ? away_pitchers[0].name : '미등록';

  // 💡 JSON 구조로 들어온 스코어보드 데이터
  const scoreboard = inning_scores; 
  const hasScoreboard = scoreboard && scoreboard.away && scoreboard.home;

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 bg-gray-50 min-h-screen">
      <header className="mb-6">
         <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 transition-colors">
           ← 전체 일정으로 돌아가기
         </Link>
      </header>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">경기 상세 기록</h1>
        <p className="text-gray-500 text-sm mt-1">{gameId.replace(/-/g, ' ')}</p>
      </div>

      {/* 💡 1. 경기 기본 정보 (구장, 관중, 시간) */}
      {hasScoreboard && scoreboard.matchInfo && (
        <div className="mb-6 text-center text-[11px] sm:text-xs font-bold text-gray-500 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          {scoreboard.matchInfo}
        </div>
      )}

      {/* ⚾ 2. 분리된 표를 합친 완벽한 이닝 스코어보드 */}
      {hasScoreboard && (
        <section className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm whitespace-nowrap min-w-max">
              <thead className="bg-gray-800 text-white font-bold">
                <tr>
                  <th className="py-3 px-4 text-left sticky left-0 bg-gray-800 z-10 border-r border-gray-700">팀</th>
                  <th className="py-3 px-3 border-r border-gray-700 text-gray-300">결과</th>
                  {scoreboard.inningHeaders.map((inning: string) => (
                    <th key={`header-${inning}`} className="py-3 px-3.5 text-gray-300">{inning}</th>
                  ))}
                  <th className="py-3 px-4 text-red-400 border-l border-gray-700 font-black">R</th>
                  <th className="py-3 px-3 text-gray-300">H</th>
                  <th className="py-3 px-3 text-gray-300">E</th>
                  <th className="py-3 px-3 text-gray-300">B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {/* AWAY 라인 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-left font-black text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">{away_team}</td>
                  <td className={`py-3 px-3 border-r border-gray-100 font-extrabold ${scoreboard.away.result === '승' ? 'text-blue-600' : scoreboard.away.result === '패' ? 'text-red-600' : 'text-gray-500'}`}>
                    {scoreboard.away.result || '-'}
                  </td>
                  {scoreboard.away.innings.map((score: string, i: number) => (
                    <td key={`away-inning-${i}`} className={`py-3 px-3.5 ${score === '0' || score === '-' ? 'text-gray-400' : 'text-gray-800 font-bold'}`}>
                      {score || '-'}
                    </td>
                  ))}
                  <td className="py-3 px-4 font-black text-red-600 border-l border-gray-100 bg-red-50/30 text-base">{scoreboard.away.R}</td>
                  <td className="py-3 px-3 text-gray-700 font-bold">{scoreboard.away.H}</td>
                  <td className="py-3 px-3 text-gray-700">{scoreboard.away.E}</td>
                  <td className="py-3 px-3 text-gray-700">{scoreboard.away.B}</td>
                </tr>
                {/* HOME 라인 */}
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-left font-black text-[#CE0E2D] sticky left-0 bg-white z-10 border-r border-gray-100">{home_team}</td>
                  <td className={`py-3 px-3 border-r border-gray-100 font-extrabold ${scoreboard.home.result === '승' ? 'text-blue-600' : scoreboard.home.result === '패' ? 'text-red-600' : 'text-gray-500'}`}>
                    {scoreboard.home.result || '-'}
                  </td>
                  {scoreboard.home.innings.map((score: string, i: number) => (
                    <td key={`home-inning-${i}`} className={`py-3 px-3.5 ${score === '0' || score === '-' ? 'text-gray-400' : 'text-gray-800 font-bold'}`}>
                      {score || '-'}
                    </td>
                  ))}
                  <td className="py-3 px-4 font-black text-red-600 border-l border-gray-100 bg-red-50/30 text-base">{scoreboard.home.R}</td>
                  <td className="py-3 px-3 text-gray-700 font-bold">{scoreboard.home.H}</td>
                  <td className="py-3 px-3 text-gray-700">{scoreboard.home.E}</td>
                  <td className="py-3 px-3 text-gray-700">{scoreboard.home.B}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 이하 기존 타자/투수 기록 표 유지 */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
          <span className="text-[10px] font-extrabold text-gray-400 mb-1 tracking-wider">AWAY 선발</span>
          <span className="text-xl font-black text-gray-800">{awayStartingPitcher}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
          <span className="text-[10px] font-extrabold text-gray-400 mb-1 tracking-wider">HOME 선발</span>
          <span className="text-xl font-black text-gray-800">{homeStartingPitcher}</span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
              <div className="bg-gray-800 text-white p-3 rounded-xl text-center font-black text-lg shadow-md">
                  {away_team} 타자 기록
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {away_batters?.map((b: any, i: number) => (
                      <div key={i} className={`flex justify-between items-center p-3 border-b border-gray-50 last:border-0 ${b.is_starter ? 'bg-white' : 'bg-gray-50 text-gray-500 text-sm'}`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-5 shrink-0 text-center font-black ${b.is_starter ? 'text-gray-900 text-sm' : 'text-gray-400 text-xs'}`}>
                                {b.order || '-'}
                              </span>
                              {b.pos && b.pos !== '-' && <span className="shrink-0 text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-bold">{b.pos}</span>}
                              <span className="font-bold text-gray-900 whitespace-nowrap overflow-visible">
                                {b.name}
                              </span>
                          </div>
                          <span className="text-sm font-medium tracking-tight text-gray-600 shrink-0 ml-2">
                            {b.stats}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="space-y-4">
              <div className="bg-[#CE0E2D] text-white p-3 rounded-xl text-center font-black text-lg shadow-md">
                  {home_team} 타자 기록
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {home_batters?.map((b: any, i: number) => (
                      <div key={i} className={`flex justify-between items-center p-3 border-b border-gray-50 last:border-0 ${b.is_starter ? 'bg-white' : 'bg-gray-50 text-gray-500 text-sm'}`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-5 shrink-0 text-center font-black ${b.is_starter ? 'text-gray-900 text-sm' : 'text-gray-400 text-xs'}`}>
                                {b.order || '-'}
                              </span>
                              {b.pos && b.pos !== '-' && <span className="shrink-0 text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-bold">{b.pos}</span>}
                              <span className="font-bold text-gray-900 whitespace-nowrap overflow-visible">
                                {b.name}
                              </span>
                          </div>
                          <span className="text-sm font-medium tracking-tight text-gray-600 shrink-0 ml-2">
                            {b.stats}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
              <div className="bg-gray-800 text-white p-3 rounded-xl text-center font-black text-lg shadow-md">
                  {away_team} 투수 기록
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {away_pitchers?.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 bg-white">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-gray-900 whitespace-nowrap">{p.name}</span>
                            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold ${p.role === '승리' || p.role === '세이브' ? 'bg-blue-100 text-blue-600' : p.role === '패전' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{p.role}</span>
                          </div>
                          <span className="text-sm font-medium tracking-tight text-gray-700 shrink-0 ml-2">
                            {p.stats}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="space-y-4">
              <div className="bg-[#CE0E2D] text-white p-3 rounded-xl text-center font-black text-lg shadow-md">
                  {home_team} 투수 기록
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {home_pitchers?.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 bg-white">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-gray-900 whitespace-nowrap">{p.name}</span>
                            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold ${p.role === '승리' || p.role === '세이브' ? 'bg-blue-100 text-blue-600' : p.role === '패전' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{p.role}</span>
                          </div>
                          <span className="text-sm font-medium tracking-tight text-gray-700 shrink-0 ml-2">
                            {p.stats}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </main>
  );
}