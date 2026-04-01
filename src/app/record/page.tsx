'use client'; // 탭 클릭 같은 동작이 들어가므로 클라이언트 컴포넌트로 선언합니다.

import { useState } from 'react';

export default function RecordPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'pitcher' | 'batter'>('team');

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 pb-20 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black text-gray-900 mb-4">📊 KBO 기록실</h1>

      {/* 탭 버튼 영역 */}
      <div className="flex bg-white rounded-lg shadow-sm p-1 mb-6">
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab === 'team' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
        >
          팀 순위
        </button>
        <button 
          onClick={() => setActiveTab('pitcher')}
          className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab === 'pitcher' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
        >
          투수 순위
        </button>
        <button 
          onClick={() => setActiveTab('batter')}
          className={`flex-1 py-2 text-sm font-bold rounded-md ${activeTab === 'batter' ? 'bg-red-600 text-white' : 'text-gray-500'}`}
        >
          타자 순위
        </button>
      </div>

      {/* 탭 내용 영역 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {activeTab === 'team' && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">🏆 2026 정규시즌 팀 순위</h2>
            {/* 여기에 Supabase에서 가져온 team_standings 데이터를 표(Table)로 뿌려줍니다 */}
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {activeTab === 'pitcher' && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">⚾ 투수 TOP 5 (다승, 평균자책점 등)</h2>
            {/* 여기에 player_stats (category='투수') 데이터를 렌더링합니다 */}
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {activeTab === 'batter' && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">🏏 타자 TOP 5 (타율, 홈런, 타점 등)</h2>
            {/* 여기에 player_stats (category='타자') 데이터를 렌더링합니다 */}
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </main>
  );
}