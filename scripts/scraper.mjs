// scripts/scraper.mjs
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapeKbo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('KBO 공식 홈페이지 접속 중...');
    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx');
    
    const targetYear = '2026';
    // 💡 정규시즌이 열리는 3월부터 10월까지 배열로 준비합니다.
    const months = ['03', '04', '05', '06', '07', '08', '09', '10'];
    
    let allSchedules = []; // 1년 치 데이터를 모두 담을 큰 바구니

    // 각 월별로 페이지를 변경하며 데이터를 긁어옵니다.
    for (const month of months) {
      console.log(`${targetYear}년 ${month}월 데이터 수집 중...`);
      
      await page.selectOption('select[id$="ddlYear"]', targetYear);
      await page.selectOption('select[id$="ddlMonth"]', month);
      
      // 페이지가 로딩될 때까지 충분히 기다려줍니다 (3초)
      await page.waitForTimeout(3000);

      const monthData = await page.evaluate(({ targetYear }) => {
        const rows = Array.from(document.querySelectorAll('.tbl-type06 tbody tr'));
        let currentDate = '';
        
        return rows.map(row => {
          if (row.innerText.includes('데이터가 없습니다')) return null;

          const dayCell = row.querySelector('.day');
          if (dayCell) {
            const match = dayCell.innerText.match(/(\d{2})\.(\d{2})/);
            if (match) currentDate = `${targetYear}-${match[1]}-${match[2]}`;
          }

          const playCell = row.querySelector('.play');
          if (!playCell || !currentDate) return null;

          const teams = Array.from(playCell.querySelectorAll('span'))
            .map(s => s.innerText.trim())
            .filter(t => t !== 'vs' && t !== '');

          if (teams.length < 2) return null;

          const awayTeam = teams[0];
          const homeTeam = teams[1];
          
          const scoreText = playCell.querySelector('em')?.innerText.trim() || "";
          let awayScore = null;
          let homeScore = null;
          if (scoreText.includes(':')) {
            const scores = scoreText.split(':').map(Number);
            awayScore = scores[0];
            homeScore = scores[1];
          }

          const time = row.querySelector('.time')?.innerText.trim() || '18:30';
          const tds = Array.from(row.querySelectorAll('td'));
          const location = tds[tds.length - 2]?.innerText.trim() || '미정';

          let status = 'SCHEDULED';
          if (row.innerText.includes('종료')) status = 'FINISHED';
          else if (row.innerText.includes('취소')) status = 'CANCELLED';
          else if (scoreText.includes(':')) status = 'PROGRESS';

          return {
            id: `${currentDate}-${homeTeam}-${awayTeam}`,
            date: currentDate,
            time: time,
            away_team: awayTeam,
            home_team: homeTeam,
            away_score: awayScore,
            home_score: homeScore,
            location: location,
            status: status,
            is_ssg_landers: awayTeam.includes('SSG') || homeTeam.includes('SSG')
          };
        }).filter(i => i !== null);
      }, { targetYear });

      allSchedules.push(...monthData); // 이번 달 데이터를 큰 바구니에 합칩니다.
    }

    console.log(`[크롤링 완료] 1년 치 총 ${allSchedules.length}개의 경기를 찾았습니다.`);
    
    if (allSchedules.length > 0) {
      console.log('Supabase 창고에 데이터를 저장합니다...');
      const { error } = await supabase.from('schedules').upsert(allSchedules);
      if (error) throw error;
      console.log('✅ 전체 데이터 저장 완료!');
    }

  } catch (err) {
    console.error('❌ 에러 발생:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrapeKbo();