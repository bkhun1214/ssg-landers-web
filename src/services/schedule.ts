// src/services/schedule.ts
import { createClient } from '@supabase/supabase-js';
import type { GameSchedule } from '@/types/schedule';

// 1. .env.local에 적어둔 환경변수를 가져와서 Supabase와 연결합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getMonthlySchedule(year: number, month: number): Promise<GameSchedule[]> {
  // 2. 검색할 날짜 범위 설정 (예: 2026-04-01 ~ 2026-04-30)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  try {
    // 3. Supabase 창고에서 해당 월의 데이터를 모두 가져옵니다. (날짜/시간순 정렬)
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .gte('date', startDate)
      .lt('date', endDate)
      .eq('is_ssg_landers', true)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    // 4. 프론트엔드 UI에 맞게 이름표(key)만 살짝 바꿔서 던져줍니다.
    return data.map((row) => ({
      id: row.id,
      date: row.date,
      time: row.time,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      homeScore: row.home_score,
      awayScore: row.away_score,
      location: row.location,
      status: row.status as any,
      isSsgLanders: row.is_ssg_landers
    }));
  } catch (error) {
    console.error('[Supabase 조회 에러]:', error);
    return [];
  }
}