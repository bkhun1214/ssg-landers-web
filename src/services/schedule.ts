// src/services/schedule.ts
import { createClient } from '@supabase/supabase-js';
import type { GameSchedule } from '@/types/schedule';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 💡 매개변수에 team을 추가합니다. (기본값은 'SSG')
export async function getMonthlySchedule(year: number, month: number, team: string = 'SSG'): Promise<GameSchedule[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  try {
    // 1. 기본적으로 해당 월의 데이터를 가져옵니다. (is_ssg_landers 필터 삭제!)
    let query = supabase
      .from('schedules')
      .select('*')
      .gte('date', startDate)
      .lt('date', endDate);

    // 2. 💡 핵심: '전체'가 아니면, 선택한 팀(team)이 홈이거나 원정인 경기만 가져옵니다!
    if (team !== '전체') {
      query = query.or(`home_team.eq.${team},away_team.eq.${team}`);
    }

    // 3. 날짜 및 시간순으로 정렬해서 가져오기
    const { data, error } = await query
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

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