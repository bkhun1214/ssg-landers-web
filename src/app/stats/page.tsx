// src/app/stats/page.tsx
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// 서비스 파일을 따로 안 만들었을 경우 직접 호출
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const currentCategory = params.category || '타자';

  const { data: statsData } = await supabase
    .from('player_stats')
    .select('*')
    .eq('category', currentCategory)
    .order('rank', { ascending: true });

  const players = statsData || [];

  // 표시할 핵심 지표 정의 (순위, 이름, 팀명 제외)
  const mainStats = currentCategory === '타자' 
    ? ['AVG', 'H', 'HR', 'RBI', 'R'] 
    : ['ERA', 'W', 'L', 'SV', 'SO'];

  return (
    <main className="min-h-screen bg-gray-50 max-w-5xl mx-auto p-3 sm:p-6 pb-20">
      <header className="mb-6 px-1 mt-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">🏅 KBO 개인 기록실</h1>
      </header>

      <div className="flex bg-white rounded-xl shadow-sm p-1.5 mb-6 border border-gray-200 max-w-md mx-auto sm:mx-0">
        <Link href="?category=타자" className={`flex-1 text-center py-2 text-sm font-bold rounded-lg ${currentCategory === '타자' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>타자</Link>
        <Link href="?category=투수" className={`flex-1 text-center py-2 text-sm font-bold rounded-lg ${currentCategory === '투수' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>투수</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-4">순위</th>
                <th className="py-4 px-4 text-left">선수명</th>
                <th className="py-4 px-4 text-left">팀명</th>
                {mainStats.map(s => <th key={s} className="py-4 px-3 text-gray-900">{s}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${p.team_name.includes('SSG') ? 'bg-red-50/50' : ''}`}>
                  <td className="py-4 px-4 text-gray-400">{p.rank}</td>
                  <td className="py-4 px-4 text-left font-black text-gray-900">{p.player_name}</td>
                  <td className="py-4 px-4 text-left font-bold text-gray-500">{p.team_name}</td>
                  {mainStats.map(s => (
                    <td key={s} className="py-4 px-3 font-semibold text-gray-700">{p.stats[s] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}