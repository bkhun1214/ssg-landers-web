// src/app/api/schedule/route.ts
import { NextResponse } from 'next/server';
import { getMonthlySchedule } from '@/services/schedule';

// 24시간(86400초) 주기로 백그라운드 캐시 재검증 (ISR)
export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 파라미터가 없을 경우 현재 날짜를 기준으로 기본값 설정
  const currentDate = new Date();
  const year = parseInt(searchParams.get('year') || String(currentDate.getFullYear()), 10);
  const month = parseInt(searchParams.get('month') || String(currentDate.getMonth() + 1), 10);

  try {
    const data = await getMonthlySchedule(year, month);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[API Error] /api/schedule (year: ${year}, month: ${month}):`, error);
    // 장애 발생 시 프론트엔드 크래시를 막기 위해 빈 배열 반환 및 500 상태 코드
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}