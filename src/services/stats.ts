// src/services/stats.ts
import * as cheerio from 'cheerio';
import { fetchHtml } from './scraper';
import type { TeamRanking } from '@/types/stats';

export async function getTeamRankings(): Promise<TeamRanking[]> {
  // 네이버 스포츠 KBO 팀 순위 페이지
  const targetUrl = `https://sports.news.naver.com/kbaseball/record/index?category=kbo`;
  const html = await fetchHtml(targetUrl);

  if (!html) return [];

  const $ = cheerio.load(html);
  const rankings: TeamRanking[] = [];

  // 네이버 스포츠 팀 순위 테이블 구조에 맞춘 파싱 로직
  $('#regularTeamRecordList_table tbody tr').each((_, element) => {
    try {
      const rankText = $(element).find('th strong').text().trim();
      const teamName = $(element).find('td.tm div span').text().trim();
      
      if (!teamName) return;

      // 네이버 테이블의 td 태그 순서: 0:팀명, 1:경기수, 2:승, 3:패, 4:무, 5:승률 ...
      const tds = $(element).find('td span');
      const gamesPlayed = parseInt($(tds[1]).text().trim(), 10) || 0;
      const wins = parseInt($(tds[2]).text().trim(), 10) || 0;
      const losses = parseInt($(tds[3]).text().trim(), 10) || 0;
      const draws = parseInt($(tds[4]).text().trim(), 10) || 0;
      
      const winRateText = $(element).find('td strong').first().text().trim();
      const winRate = parseFloat(winRateText) || 0.000;

      rankings.push({
        rank: parseInt(rankText, 10) || 0,
        teamName,
        gamesPlayed,
        wins,
        losses,
        draws,
        winRate,
      });
    } catch (error) {
      console.error('[Stats Parse Error] Row parsing failed:', error);
    }
  });

  return rankings;
}