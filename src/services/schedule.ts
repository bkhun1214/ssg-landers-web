// src/services/schedule.ts
import * as cheerio from 'cheerio';
import { fetchHtml } from './scraper';
import type { GameSchedule, GameStatus } from '@/types/schedule';

export async function getMonthlySchedule(year: number, month: number): Promise<GameSchedule[]> {
  // 네이버 스포츠 KBO 일정 페이지 (예시 구조이며, 실제 경로 확인 후 적용)
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const targetUrl = `https://sports.news.naver.com/kbaseball/schedule/index?month=${formattedMonth}&year=${year}`;
  
  const html = await fetchHtml(targetUrl);
  if (!html) return [];

  const $ = cheerio.load(html);
  const schedules: GameSchedule[] = [];

  // 네이버 스포츠 일정 테이블 구조에 맞춘 선택자 (구조 변경 시 이 부분만 수정)
  $('.tb_scroll table tbody tr').each((_, element) => {
    try {
      const dateText = $(element).find('.td_date strong').text().trim(); // 예: 03.23(토)
      const timeText = $(element).find('.td_hour').text().trim(); // 예: 14:00
      const homeTeam = $(element).find('.team_lft').text().trim();
      const awayTeam = $(element).find('.team_rgt').text().trim();
      const location = $(element).find('.td_stadium').text().trim();
      const statusText = $(element).find('.td_state').text().trim();

      if (!homeTeam || !awayTeam) return;

      const fullDate = `${year}-${dateText.split('(')[0].replace('.', '-')}`; // YYYY-MM-DD 변환
      let status: GameStatus = 'SCHEDULED';
      
      if (statusText.includes('종료')) status = 'FINISHED';
      else if (statusText.includes('취소')) status = 'CANCELLED';
      else if (statusText.includes(':') === false && statusText !== '') status = 'PROGRESS';

      const isSsgLanders = homeTeam.includes('SSG') || awayTeam.includes('SSG');

      schedules.push({
        id: `${fullDate}-${homeTeam}-${awayTeam}`,
        date: fullDate,
        time: timeText || '18:30',
        homeTeam,
        awayTeam,
        location: location || '미정',
        status,
        isSsgLanders,
      });
    } catch (e) {
      console.error('Parsing error on row:', e);
    }
  });

  return schedules;
}