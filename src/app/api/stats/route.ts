// src/app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { getTeamRankings } from '@/services/stats';

// 24시간(86400초) 주기로 백그라운드 캐시 재검증 (ISR)
export const revalidate = 86400;

export async function GET() {
  try {
    const data = await getTeamRankings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Error] /api/stats:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}