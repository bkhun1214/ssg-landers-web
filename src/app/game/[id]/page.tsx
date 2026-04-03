// src/app/game/[id]/page.tsx
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

  const { home_team, away_team, home_batters, away_batters, home_pitchers, away_pitchers } = boxScore;

  const homeStartingPitcher = home_pitchers?.length > 0 ? home_pitchers[0].name : '미등록';
  const awayStartingPitcher = away_pitchers?.length > 0 ? away_pitchers[0].name : '미등록';

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 bg-gray-50 min-h-screen">
      <header className="mb-6">
         <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 transition-colors">
           ← 전체 일정으로 돌아가기
         </Link>
      </header>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">경기 상세 기록</h1>
        <p className="text-gray-500 text-sm mt-1">{gameId.replace(/-/g, ' ')}</p>
      </div>

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

      {/* ⚾ 1단: 타자 구역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AWAY 타자 */}
          <div className="space-y-4">
              <div className="bg-gray-800 text-white p-3 rounded-xl text-center font-black text-lg shadow-md">
                  {away_team} 타자 기록
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {away_batters?.map((b: any, i: number) => (
                      <div key={i} className={`flex justify-between items-center p-3 border-b border-gray-50 last:border-0 ${b.is_starter ? 'bg-white' : 'bg-gray-50 text-gray-500 text-sm'}`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* 타순 */}
                              <span className={`w-5 shrink-0 text-center font-black ${b.is_starter ? 'text-gray-900 text-sm' : 'text-gray-400 text-xs'}`}>
                                {b.order || '-'}
                              </span>
                              {/* 포지션 뱃지 */}
                              {b.pos && b.pos !== '-' && <span className="shrink-0 text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-bold">{b.pos}</span>}
                              {/* 💡 이름: truncate 제거, whitespace-nowrap 적용하여 긴 이름 보호 */}
                              <span className="font-bold text-gray-900 whitespace-nowrap overflow-visible">
                                {b.name}
                              </span>
                          </div>
                          {/* 💡 기록: shrink-0으로 이름이 길어져도 밀리지 않게 고정 */}
                          <span className="text-sm font-medium tracking-tight text-gray-600 shrink-0 ml-2">
                            {b.stats}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          {/* HOME 타자 */}
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

      {/* ⚾ 2단: 투수 구역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AWAY 투수 */}
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

          {/* HOME 투수 */}
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