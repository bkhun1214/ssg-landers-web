// src/services/record.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function getTeamStandings() {
  const { data } = await supabase.from('team_standings').select('*').order('rank', { ascending: true });
  return data || [];
}

export async function getPlayerStats(category: '투수' | '타자') {
  const { data } = await supabase.from('player_stats').select('*').eq('category', category).order('stat_name', { ascending: true }).order('rank', { ascending: true });
  return data || [];
}