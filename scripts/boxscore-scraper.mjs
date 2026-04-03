// scripts/boxscore-scraper.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const TEAM_CODES = {
  'SSG': 'SK', '키움': 'WO', 'LG': 'LG', 'KT': 'KT', 'NC': 'NC',
  '두산': 'OB', 'KIA': 'HT', '롯데': 'LT', '삼성': 'SS', '한화': 'HH'
};

async function scrapeBoxScores() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const day = kstNow.getDay();

  if (day === 1) {
    console.log("📅 월요일은 경기가 없습니다. 스크립트를 종료합니다.");
    return;
  }

  const hour = kstNow.getHours();
  let targetDateDate = new Date(kstNow);
  if (hour < 23) { 
    targetDateDate.setDate(targetDateDate.getDate() - 1); 
  }
  const targetDate = targetDateDate.toISOString().split('T')[0];

  console.log(`🎯 실행 시간: ${hour}시 | 타겟 날짜: ${targetDate}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const { data: finishedGames } = await supabase
      .from('schedules')
      .select('*')
      .eq('status', 'FINISHED')
      .eq('date', targetDate);

    if (!finishedGames || finishedGames.length === 0) {
      console.log(`💤 ${targetDate}에 종료된 경기가 없습니다.`);
      return;
    }

    for (const game of finishedGames) {
      console.log(`🔍 [${game.id}] 타순/포지션/이름 정밀 수집 시작...`);

      const dateStr = game.date.replace(/-/g, '');
      const awayCode = TEAM_CODES[game.away_team];
      const homeCode = TEAM_CODES[game.home_team];
      const url = `https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx?gameDate=${dateStr}&gameId=${dateStr}${awayCode}${homeCode}0&section=REVIEW`;

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(4000); 

      let targetFrame = page;
      for (const frame of page.frames()) {
        const content = await frame.content();
        if (content.includes('타수') && content.includes('이닝')) {
          targetFrame = frame;
          break;
        }
      }

      const boxData = await targetFrame.evaluate(({ game }) => {
        const allTables = Array.from(document.querySelectorAll('table'));
        
        const nameTables = allTables.filter(t => t.textContent.includes('타자') || t.textContent.includes('선수명'));
        const statTables = allTables.filter(t => t.textContent.includes('타수') && t.textContent.includes('안타'));
        const pitcherTables = allTables.filter(t => t.textContent.includes('이닝') && t.textContent.includes('실점'));
        
        let inningScores = [];
        const inningTables = allTables.filter(t => t.textContent.includes('R') && t.textContent.includes('H'));
        if (inningTables.length > 0) {
           inningScores = Array.from(inningTables[0].querySelectorAll('tbody tr')).map(row => 
             Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
           );
        }

        const getBatters = (teamIndex) => {
          let batters = [];
          const nameTable = nameTables[teamIndex];
          const statTable = statTables[teamIndex];

          if (nameTable && statTable) {
            const nameRows = Array.from(nameTable.querySelectorAll('tbody tr'));
            const statRows = Array.from(statTable.querySelectorAll('tbody tr'));

            const statHeaders = Array.from(statTable.querySelectorAll('th, thead td')).map(h => h.textContent.trim());
            let abIdx = statHeaders.indexOf('타수'); if (abIdx === -1) abIdx = 0; 
            let hitIdx = statHeaders.indexOf('안타'); if (hitIdx === -1) hitIdx = 2;
            let rbiIdx = statHeaders.indexOf('타점'); if (rbiIdx === -1) rbiIdx = 3;

            nameRows.forEach((nameRow, i) => {
              const statRow = statRows[i];
              if (!statRow) return;

              const ths = Array.from(nameRow.querySelectorAll('th'));
              const tds = Array.from(nameRow.querySelectorAll('td'));

              let orderText = '';
              let posText = '-';
              let nameText = '';

              if (ths.length >= 2 && tds.length >= 1) {
                orderText = ths[0].textContent.trim(); // 💡 1번 타자
                posText = ths[1].textContent.trim();   // 💡 중견수
                nameText = tds[0].textContent.trim();  // 💡 김호령
              } else if (tds.length >= 3) {
                orderText = tds[0].textContent.trim();
                posText = tds[1].textContent.trim();
                nameText = tds[2].textContent.trim();
              } else if (tds.length > 0) {
                nameText = tds[0].textContent.trim();
              }

              if (nameText && !nameText.includes('합계') && !nameText.includes('총계')) {
                let cleanName = nameText.replace(/[0-9]/g, '').replace(/\(.*?\)/g, '').trim();
                
                let isStarter = !nameRow.className.includes('sub');
                if (orderText !== '') {
                   isStarter = !isNaN(Number(orderText));
                }

                const statCells = Array.from(statRow.querySelectorAll('td, th')).map(c => c.textContent.trim());
                
                if (cleanName.length > 0 && statCells.length > Math.max(abIdx, hitIdx, rbiIdx)) {
                  batters.push({
                    order: orderText, // 💡 여기에 값을 넣는 걸 빼먹었었네요!
                    pos: posText || '-', 
                    name: cleanName,
                    is_starter: isStarter,
                    stats: `${statCells[abIdx]}타수 ${statCells[hitIdx]}안타 ${statCells[rbiIdx]}타점`
                  });
                }
              }
            });
          }
          return batters;
        };

        const getPitchers = (teamIndex) => {
          let pitchers = [];
          if (pitcherTables[teamIndex]) {
            const table = pitcherTables[teamIndex];
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            
            const headers = Array.from(table.querySelectorAll('th, thead td')).map(h => h.textContent.trim());
            let nameIdx = headers.findIndex(h => h.includes('투수') || h.includes('선수명')); if (nameIdx === -1) nameIdx = 0;
            let innIdx = headers.indexOf('이닝'); if (innIdx === -1) innIdx = 1;
            let runIdx = headers.indexOf('실점'); if (runIdx === -1) runIdx = 13;
            const resIdx = headers.findIndex(h => h.includes('결과'));

            rows.forEach((row, idx) => {
              const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
              
              if (cells.length > Math.max(innIdx, runIdx) && cells[nameIdx]) {
                const rawName = cells[nameIdx];
                if (!rawName.includes('합계') && !rawName.includes('총계')) {
                  let role = idx === 0 ? '선발' : '계투';
                  const res = resIdx !== -1 ? cells[resIdx] : rawName;
                  
                  if (res.includes('승')) role = '승리';
                  else if (res.includes('패')) role = '패전';
                  else if (res.includes('세')) role = '세이브';
                  else if (res.includes('홀')) role = '홀드';

                  const cleanName = rawName.replace(/\(.*?\)/g, '').replace(/[0-9]/g, '').trim();
                  if (cleanName.length > 0) {
                    pitchers.push({
                      name: cleanName,
                      role: role,
                      stats: `${cells[innIdx]}이닝 ${cells[runIdx]}실점`
                    });
                  }
                }
              }
            });
          }
          return pitchers;
        };

        return {
          game_id: game.id,
          home_team: game.home_team,
          away_team: game.away_team,
          away_batters: getBatters(0),
          home_batters: getBatters(1),
          away_pitchers: getPitchers(0),
          home_pitchers: getPitchers(1),
          inning_scores: inningScores
        };
      }, { game });

      const { error } = await supabase.from('box_scores').upsert(boxData);
      if (error) console.error(`❌ [${game.id}] 저장 실패:`, error);
      else console.log(`✅ [${game.id}] 타순(order) 포함 저장 완료!`);
    }

  } catch (err) {
    console.error("❌ 크롤러 에러:", err);
  } finally {
    await browser.close();
  }
}

scrapeBoxScores();