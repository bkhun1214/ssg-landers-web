// src/services/schedule.ts
import * as cheerio from 'cheerio';
import type { GameSchedule, GameStatus } from '@/types/schedule';

export async function getMonthlySchedule(year: number, month: number): Promise<GameSchedule[]> {
  const url = 'https://www.koreabaseball.com/Schedule/Schedule.aspx';
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;

  try {
    // 1단계: KBO 웹페이지에 그냥 접속해서 (GET) 보안 토큰(VIEWSTATE)과 쿠키를 훔쳐옵니다.
    const getRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      cache: 'no-store'
    });
    
    const getHtml = await getRes.text();
    const $get = cheerio.load(getHtml);

    // ASP.NET 필수 보안 토큰 추출
    const viewState = $get('#__VIEWSTATE').val() || '';
    const viewStateGenerator = $get('#__VIEWSTATEGENERATOR').val() || '';
    const eventValidation = $get('#__EVENTVALIDATION').val() || '';
    
    // KBO 콤보박스의 실제 name 속성 추출
    const ddlYear = $get('select[id$="ddlYear"]').attr('name') || 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlYear';
    const ddlMonth = $get('select[id$="ddlMonth"]').attr('name') || 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlMonth';
    const ddlSeries = $get('select[id$="ddlSeries"]').attr('name') || 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlSeries';

    // 세션 쿠키 추출
    const cookies = getRes.headers.get('set-cookie')?.split(',').map(c => c.split(';')[0]).join('; ') || '';

    // 2단계: 훔친 토큰과 함께 우리가 원하는 연도/월(2026년 4월 등)을 서버에 POST로 전송합니다.
    const params = new URLSearchParams();
    params.append('__EVENTTARGET', ddlMonth); // "나 월(Month) 바꿨어!" 라고 서버에 알림
    params.append('__EVENTARGUMENT', '');
    params.append('__VIEWSTATE', viewState as string);
    params.append('__VIEWSTATEGENERATOR', viewStateGenerator as string);
    params.append('__EVENTVALIDATION', eventValidation as string);
    params.append(ddlYear, year.toString());
    params.append(ddlMonth, formattedMonth);
    params.append(ddlSeries, '0,9,6'); // 0,9,6 = KBO 정규시즌 코드

    const postRes = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': url,
        'Cookie': cookies
      },
      body: params.toString(),
      cache: 'no-store'
    });

    const postHtml = await postRes.text();
    const $ = cheerio.load(postHtml);

    const schedules: GameSchedule[] = [];
    let currentDate = '';

    // 3단계: 화면에 렌더링된 테이블(표)을 직접 파싱합니다.
    $('.tbl-type06 tbody tr').each((_, row) => {
      const $row = $(row);
      
      // 데이터가 없는 빈 줄은 무시
      if ($row.text().includes('데이터가 없습니다')) return;

      // KBO 테이블은 첫 줄에만 날짜가 있고(rowspan), 다음 줄부터는 날짜 칸이 없는 구조입니다.
      const dayCell = $row.find('td.day');
      if (dayCell.length > 0) {
        const dayText = dayCell.text().trim(); // 예: "04.02(목)"
        const dateMatch = dayText.match(/(\d{2})\.(\d{2})/);
        if (dateMatch) {
          currentDate = `${year}-${dateMatch[1]}-${dateMatch[2]}`; // "2026-04-02"
        }
      }

      if (!currentDate) return;

      const playCell = $row.find('td.play');
      if (playCell.length === 0) return;

      const awayTeam = playCell.find('span').eq(0).text().trim();
      // 홈 팀은 구조상 두 번째나 세 번째 span에 걸릴 수 있음
      const homeTeam = playCell.find('span').eq(1).text().trim() || playCell.find('span').eq(2).text().trim();
      const scoreText = playCell.find('em').text().trim();
      const time = $row.find('td.time').text().trim() || '18:30';

      if (!homeTeam || !awayTeam) return;

      // 구장 정보 파싱 (행 병합 때문에 인덱스가 계속 바뀌므로 텍스트 기반으로 탐색)
      let location = '미정';
      $row.find('td').each((_, td) => {
        const text = $(td).text().trim();
        if (['잠실', '문학', '사직', '대전', '광주', '창원', '고척', '수원', '대구', '포항', '울산', '청주', '제주'].includes(text)) {
          location = text;
        }
      });

      // 경기 상태 매핑
      let status: GameStatus = 'SCHEDULED';
      if ($row.text().includes('취소')) status = 'CANCELLED';
      else if (scoreText.includes(':')) status = 'FINISHED';

      const isSsgLanders = homeTeam.includes('SSG') || awayTeam.includes('SSG');

      schedules.push({
        id: `${currentDate}-${homeTeam}-${awayTeam}`,
        date: currentDate,
        time,
        homeTeam,
        awayTeam,
        location,
        status,
        isSsgLanders
      });
    });

    console.log(`\n[KBO Web Scraper] ${year}년 ${month}월 KBO 공식 홈페이지 파싱 성공! (총 ${schedules.length}건)\n`);
    return schedules;

  } catch (error) {
    console.error('[KBO Web Scraper Error]:', error);
    return [];
  }
}