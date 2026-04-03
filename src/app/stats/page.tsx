// src/app/stats/page.tsx
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// 서비스 파일을 따로 안 만들었을 경우 직접 호출
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams;
  const currentCategory = params.category || '타자';
  const searchQuery = params.q || '';

  let query = supabase
    .from('player_stats')
    .select('*')
    .eq('category', currentCategory)
    .order('rank', { ascending: true });

  if (searchQuery) {
    query = query.ilike('player_name', `%${searchQuery}%`);
  }

  const { data: statsData } = await query;
  const players = statsData || [];

  // 💡 영어 약자 대신 한글 명칭 매핑 및 강조(strong) 여부 설정
  const batterStats = [
    { id: 'AVG', name: '타율', strong: true },
    { id: 'G', name: '경기' },
    { id: 'AB', name: '타수' },
    { id: 'H', name: '안타' },
    { id: 'HR', name: '홈런' },
    { id: '2B', name: '2루타' },
    { id: '3B', name: '3루타' },
    { id: 'RBI', name: '타점' },
    { id: 'R', name: '득점' }
  ];

  const pitcherStats = [
    { id: 'ERA', name: '평균자책', strong: true },
    { id: 'G', name: '경기' },
    { id: 'W', name: '승' },
    { id: 'L', name: '패' },
    { id: 'SV', name: '세이브' },
    { id: 'HLD', name: '홀드' },
    { id: 'IP', name: '이닝' },
    { id: 'SO', name: '탈삼진' },
    { id: 'H', name: '피안타' },
    { id: 'HR', name: '피홈런' },
    { id: 'R', name: '실점' },
    { id: 'ER', name: '자책점' },
    { id: 'BB', name: '볼넷' },
    { id: 'WPCT', name: '승률' },
    { id: 'WHIP', name: 'WHIP' }
  ];

  // 현재 탭에 맞게 표시할 지표 목록 선택
  const displayStats = currentCategory === '타자' ? batterStats : pitcherStats;

  return (
    <main className="min-h-screen bg-gray-50 max-w-5xl mx-auto p-3 sm:p-6 pb-20">
      <header className="mb-6 px-1 mt-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">🏅 KBO 개인 기록실</h1>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex bg-white rounded-xl shadow-sm p-1.5 border border-gray-200 w-full sm:max-w-xs">
          <Link href={`?category=타자${searchQuery ? `&q=${searchQuery}` : ''}`} className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition-colors ${currentCategory === '타자' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>타자</Link>
          <Link href={`?category=투수${searchQuery ? `&q=${searchQuery}` : ''}`} className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition-colors ${currentCategory === '투수' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>투수</Link>
        </div>

        <form method="GET" className="flex flex-1 gap-2">
          <input type="hidden" name="category" value={currentCategory} />
          <input 
            type="text" 
            name="q" 
            defaultValue={searchQuery}
            placeholder="선수 이름 검색 (예: 최정)" 
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm font-medium"
          />
          <button type="submit" className="px-5 py-2 bg-gray-800 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-gray-900 transition-colors">
            검색
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm whitespace-nowrap min-w-max">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-4 sticky left-0 bg-gray-50 z-10">순위</th>
                <th className="py-4 px-4 text-left sticky left-[60px] bg-gray-50 z-10 border-r border-gray-100">선수명</th>
                <th className="py-4 px-4 text-left">팀명</th>
                {displayStats.map(s => (
                  <th key={s.id} className={`py-4 px-3 ${s.strong ? 'text-red-600 font-extrabold' : 'text-gray-900'}`}>
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length > 0 ? (
                players.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.team_name.includes('SSG') ? 'bg-red-50/30' : 'bg-white'}`}>
                    {/* 순위와 선수명은 가로 스크롤 시에도 왼쪽에 고정되도록 sticky 적용 */}
                    <td className="py-4 px-4 text-gray-400 sticky left-0 bg-inherit z-10">{p.rank}</td>
                    <td className="py-4 px-4 text-left font-black text-gray-900 sticky left-[60px] bg-inherit z-10 border-r border-gray-50">
                      {p.player_name}
                    </td>
                    <td className="py-4 px-4 text-left font-bold text-gray-500">{p.team_name}</td>
                    
                    {displayStats.map(s => {
                      let value = p.stats[s.id];
                      
                      // 💡 승률(WPCT)이 '-'이거나 없을 경우 0.000으로 강제 변환
                      if (s.id === 'WPCT' && (!value || value === '-')) {
                        value = '0.000';
                      } else if (!value) {
                        value = '-';
                      }

                      return (
                        <td key={s.id} className={`py-4 px-3 ${s.strong ? 'font-black text-red-600 bg-red-50/50' : 'font-semibold text-gray-700'}`}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={displayStats.length + 3} className="py-12 text-gray-400 font-medium text-center">
                    "{searchQuery}" 검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}