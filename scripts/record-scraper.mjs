import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapeRecords() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('KBO 기록실 데이터 수집 시작...');

    // --- 1. 팀 순위 수집 ---
    await page.goto('https://www.koreabaseball.com/Record/Team/Standings/Standings.aspx');
    const teamStandings = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.tbl-type06 tbody tr'));
      return rows.map(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length < 10) return null;
        return {
          rank: parseInt(tds[0].innerText),
          team_name: tds[1].innerText.trim(),
          played: parseInt(tds[2].innerText),
          wins: parseInt(tds[3].innerText),
          losses: parseInt(tds[4].innerText),
          draws: parseInt(tds[5].innerText),
          win_rate: parseFloat(tds[6].innerText),
          game_behind: parseFloat(tds[7].innerText) || 0
        };
      }).filter(i => i !== null);
    });

    console.log('팀 순위 수집 완료. Supabase 저장 중...');
    // 기존 순위를 싹 지우고 새로 넣습니다 (TRUNCATE 후 INSERT 또는 UPSERT)
    await supabase.from('team_standings').delete().neq('id', 0); 
    await supabase.from('team_standings').insert(teamStandings);

    // --- 2. 개인 기록(타자/투수 TOP 5) 수집 ---
    const statsToScrape = [
      { type: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx', category: '타율', selector: '.tbl-type06' },
      { type: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx?sort=HITTER_HR_CN', category: '홈런', selector: '.tbl-type06' },
      { type: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx', category: '평균자책점', selector: '.tbl-type06' },
      { type: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx?sort=PITCHER_W_CN', category: '다승', selector: '.tbl-type06' }
    ];

    let playerStats = [];

    for (const item of statsToScrape) {
      console.log(`${item.type} ${item.category} 순위 수집 중...`);
      await page.goto(item.url);
      const topPlayers = await page.evaluate((info) => {
        const rows = Array.from(document.querySelectorAll('.tbl-type06 tbody tr')).slice(0, 5); // TOP 5만
        return rows.map((row, index) => {
          const tds = row.querySelectorAll('td');
          // 페이지마다 td 인덱스가 다를 수 있으나 보통 1:순위, 2:선수명, 3:팀명, 4:기록값
          return {
            category: info.type,
            stat_name: info.category,
            rank: index + 1,
            player_name: tds[1].innerText.trim(),
            team_name: tds[2].innerText.trim(),
            stat_value: tds[3].innerText.trim()
          };
        });
      }, item);
      playerStats.push(...topPlayers);
    }

    console.log('개인 기록 수집 완료. Supabase 저장 중...');
    await supabase.from('player_stats').delete().neq('id', 0);
    await supabase.from('player_stats').insert(playerStats);

    console.log('✅ 모든 기록 업데이트 완료!');

  } catch (err) {
    console.error('❌ 기록 수집 에러:', err);
  } finally {
    await browser.close();
  }
}

scrapeRecords();