import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function scrapePlayerStats() {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--disable-blink-features=AutomationControlled'] 
  });
  const page = await browser.newPage();
  let allData = [];

  try {
    const TARGETS = [
      { category: '타자', url: 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx' },
      { category: '투수', url: 'https://www.koreabaseball.com/Record/Player/PitcherBasic/Basic1.aspx' }
    ];

    for (const target of TARGETS) {
      console.log(`📡 [${target.category}] 접속 및 데이터 패킷 감시 중...`);
      
      // 💡 1. 페이지 접속
      await page.goto(target.url, { waitUntil: 'domcontentloaded' });

      // 💡 2. 강제로 5초간 대기하며 표가 그려지길 기다림
      // (KBO 사이트는 내부적으로 __doPostBack 같은 함수를 호출하여 데이터를 비동기로 채움)
      await page.waitForTimeout(5000);

      // 💡 3. DOM에 직접 접근하여 데이터 추출 (강력한 셀렉터 사용)
      const scrapedData = await page.evaluate((category) => {
        // KBO 기록실의 표는 보통 id가 포함된 div 안에 들어있음
        const table = document.querySelector('.tbl-type06 table') || document.querySelector('table');
        if (!table) return [];

        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());

        return rows.map((row) => {
          const tds = Array.from(row.querySelectorAll('td'));
          if (tds.length < 5 || row.innerText.includes('데이터가 없습니다')) return null;

          let statsObj = {};
          let playerName = '';
          let teamName = '';
          let rank = 0;

          headers.forEach((header, i) => {
            const val = tds[i]?.innerText.trim() || "";
            if (header === '순위') rank = parseInt(val) || 0;
            // 💡 이름 칸에 <a> 태그가 있으면 그 안의 텍스트를 정확히 가져옴
            if (header === '선수명') {
                const aTag = tds[i].querySelector('a');
                playerName = aTag ? aTag.innerText.trim() : val;
            }
            if (header === '팀명') teamName = val;
            statsObj[header] = val;
          });

          if (!playerName) return null;

          return {
            id: `${category}-${playerName}-${teamName}`,
            player_name: playerName,
            team_name: teamName,
            category: category,
            rank: rank,
            stats: statsObj
          };
        }).filter(item => item !== null);
      }, target.category);

      console.log(`📊 [${target.category}] 추출 성공: ${scrapedData.length}건`);
      allData.push(...scrapedData);
    }

    if (allData.length > 0) {
      const { error } = await supabase.from('player_stats').upsert(allData, { onConflict: 'id' });
      if (error) throw error;
      console.log('🎉 모든 선수 기록이 Supabase에 저장되었습니다!');
    } else {
      console.log('⚠️ 수집된 데이터가 없습니다. 셀렉터를 다시 점검해야 합니다.');
    }

  } catch (err) {
    console.error('❌ 에러:', err);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

scrapePlayerStats();