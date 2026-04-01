// src/services/record.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function getAdvancedStats(recordType: string, category: string) {
  const { data, error } = await supabase
    .from('kbo_advanced_stats')
    .select('*')
    .eq('record_type', recordType)
    .eq('category', category);

  if (error) {
    console.error('조회 에러:', error);
    return [];
  }
  return data || [];
}