// src/app/stats/page.tsx
import { getAdvancedStats } from '@/services/record';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ type?: string; category?: string }>;
}

export default async function StatsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentType = params.type || '팀'; // '팀' 또는 '선수'
  const currentCategory = params.category || '순위'; // '순위', '타자', '투수' 등

  // DB에서 데이터 호출
  const statsData = await getAdvancedStats(currentType, currentCategory);

  // 💡 JSON 데이터에서 표의 머리글(컬럼)들을 자동으로 추출합니다.
  let tableHeaders: string[] = [];
  if (statsData.length > 0) {
    tableHeaders = Object.keys(statsData[0].stats);
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-5xl mx-auto p-3 sm:p-6 pb-20">
      <header className="mb-6 px-1 mt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">📊 종합 기록실</h1>
      </header>

      {/* 1차 필터: 팀 vs 선수 */}
      <div className="flex gap-2 mb-4">
        {['팀', '선수'].map(type => (
          <Link key={type} href={`?type=${type}&category=${currentCategory === '순위' && type === '선수' ? '타자' : currentCategory}`}
            className={`px-6 py-2 rounded-full font-bold text-sm border ${currentType === type ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
            {type} 기록
          </Link>
        ))}
      </div>

      {/* 2차 필터: 세부 카테고리 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(currentType === '팀' ? ['순위', '타자', '투수'] : ['타자', '투수']).map(cat => (
          <Link key={cat} href={`?type=${currentType}&category=${cat}`}
            className={`shrink-0 px-4 py-1.5 rounded-md font-bold text-sm ${currentCategory === cat ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {cat}
          </Link>
        ))}
      </div>

      {/* 동적 데이터 표 렌더링 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-center text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">이름</th>
                {tableHeaders.map(header => (
                  <th key={header} className="py-3 px-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statsData.length > 0 ? statsData.map((row) => (
                <tr key={row.id} className={`hover:bg-gray-50 ${row.name.includes('SSG') || row.team_name?.includes('SSG') ? 'bg-red-50 font-bold text-gray-900' : 'text-gray-700'}`}>
                  <td className="py-3 px-4 font-black">{row.name}</td>
                  {/* JSON 데이터를 순회하며 칸을 채웁니다 */}
                  {tableHeaders.map(header => (
                     <td key={header} className="py-3 px-3">{row.stats[header]}</td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan={10} className="py-10 text-gray-400">데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}