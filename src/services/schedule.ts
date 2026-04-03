// src/services/schedule.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function getMonthlySchedule(
  year: number | string, 
  month?: number | string, 
  team?: string
): Promise<any[]> {
  
  // 💡 파라미터가 밀렸을 때의 자동 보정 로직 (03-전체-01 에러 방지)
  let y = Number(year);
  let m = Number(month);
  let t = team || '전체';

  if (typeof month === 'string' && isNaN(Number(month))) {
    t = month;
    m = Number(year);
    y = 2026;
  } else if (!month) {
    m = Number(year);
    y = 2026;
  }

  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  try {
    let query = supabase
      .from('schedules')
      .select('*')
      .gte('date', startDate)
      .lt('date', endDate);

    if (t !== '전체') {
      query = query.or(`home_team.eq.${t},away_team.eq.${t}`);
    }

    const { data, error } = await query
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    // 💡 핵심: GameCard가 건드려지지 않도록, GameCard가 원하는 camelCase 이름으로 완벽 포장!
    return data.map((row) => ({
      id: row.id,
      date: row.date,
      time: row.time,
      homeTeam: row.home_team,    // GameCard가 찾는 이름!
      awayTeam: row.away_team,    // GameCard가 찾는 이름!
      homeScore: row.home_score,
      awayScore: row.away_score,
      location: row.location,
      status: row.status,
      isSsgLanders: row.is_ssg_landers
    }));
  } catch (error) {
    console.error('[Supabase 조회 에러]:', error);
    return [];
  }
}