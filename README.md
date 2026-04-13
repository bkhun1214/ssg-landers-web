# ⚾ SSG 랜더스 & KBO 일정/기록 플랫폼 (KBO Stats Tracker)

🌐 **Live Demo (배포 주소):** [https://ssg-landers-web.vercel.app/](https://ssg-landers-web.vercel.app/)

KBO 프로야구 SSG 랜더스의 팬들을 위한 전용 메인 화면부터, KBO 전체 10개 구단의 경기 일정, 상세 박스스코어, 그리고 선수 개인 기록까지 한눈에 확인할 수 있는 풀스택 웹 애플리케이션입니다. 

실제 KBO 공식 홈페이지의 복잡한 구조(투명 IFRAME 등)를 뚫고 데이터를 목적에 맞게 수집하는 3개의 자동화 크롤러 파이프라인을 구축하였으며, 수집된 데이터를 바탕으로 빠르고 쾌적한 사용자 친화적 UI/UX를 제공합니다.

---

## 🚀 주요 기능 (Key Features)

### 1. 메인 화면: SSG 랜더스 홈 (SSG Schedule & Results)
- 선택한 연도/월에 해당하는 **SSG 랜더스만의 경기 일정과 승패 결과**를 직관적인 카드 형태로 제공합니다.
- 카드 클릭 시 해당 경기의 상세 기록(박스스코어) 페이지로 이동합니다.
- **Auto-Scroll UX:** 페이지 접속 시 현재 시간(KST)을 기준으로 가장 가까운 다가오는 경기 또는 오늘 경기 위치로 화면이 부드럽게 자동 스크롤됩니다.

### 2. 전체 경기 일정 탭 (KBO All Teams Schedule)
- SSG 랜더스뿐만 아니라, **KBO 10개 구단 전체의 월별 경기 일정과 결과**를 확인할 수 있는 통합 일정 페이지입니다.

### 3. KBO 개인 기록실 탭 (Player Statistics)
- 타자와 투수 카테고리를 분리하여 핵심 지표(타율, 평균자책점 등)를 강조(Highlight)하여 보여줍니다.
- **실시간 검색 (URL Query 연동):** 클라이언트 상태(State) 대신 HTML `<form method="GET">`과 Next.js 서버 컴포넌트를 활용하여, URL 파라미터(`?q=선수명`) 기반의 빠르고 가벼운 선수명 검색 기능을 구현했습니다.

### 4. 완벽한 경기 상세 기록 (Detailed Box Score)
- **이닝별 스코어보드:** 단순 결과(R, H, E, B)뿐만 아니라, 1회부터 연장전(12회)까지의 이닝별 득점 상황을 동적으로 렌더링합니다.
- **선수별 상세 기록:** 양 팀의 출장 타자(타순, 포지션, 타수/안타/타점) 및 투수(승/패/세/홀, 이닝, 실점) 기록을 직관적인 표 형태로 제공합니다.

### 5. 목적별로 세분화된 Playwright 데이터 파이프라인
- 일반적인 HTML 파싱(Cheerio 등)으로는 접근할 수 없는 KBO 사이트의 구조를 뚫기 위해 **3개의 Playwright 크롤러**를 목적에 맞게 분리하여 운용합니다.
  1. `scraper.mjs`: KBO 전체 경기 일정 및 기본 결과 수집
  2. `boxscore-scraper.mjs`: 각 경기의 상세 박스스코어(이닝 점수, 개인 기록) 수집
  3. `record-scraper.mjs`: KBO 개인 기록실(타자/투수 스탯) 수집
- 수집된 데이터는 관계형 데이터베이스인 Supabase에 테이블 형태로 정규화되어 적재됩니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework:** Next.js (App Router, v16.x Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Backend & Database
- **BaaS (Database):** Supabase (PostgreSQL)
- **Data Fetching:** `@supabase/supabase-js`

### Data Pipeline (Scraping)
- **Crawler:** Node.js, Playwright
- **Environment:** `dotenv`

### Deployment
- **Hosting / CI & CD:** Vercel

---

## 📁 프로젝트 주요 구조 (Directory Structure)

```text
├── src/
│   ├── app/               # Next.js App Router (메인, 일정, 기록실, 상세 박스스코어 라우팅)
│   ├── components/        # 공통 UI 컴포넌트 (GameCard, AutoScroller 등)
│   ├── services/          # Supabase DB 통신 및 데이터 패치 로직
│   └── types/             # TypeScript 인터페이스 및 타입 정의
├── scripts/
│   ├── scraper.mjs              # 🕸️ 전체 경기 일정 수집 크롤러
│   ├── boxscore-scraper.mjs     # 🕸️ 상세 박스스코어 수집 크롤러
│   └── record-scraper.mjs       # 🕸️ 타자/투수 개인 기록 수집 크롤러
└── .env.local             # 환경 변수 (Git 제외)
```

---

## ⚙️ 설치 및 실행 방법 (Getting Started)

### 1. 패키지 설치
```bash
npm install
# or
yarn install
```

### 2. 환경 변수 설정
프로젝트 루트 경로에 `.env.local` 파일을 생성하고 아래의 값을 입력합니다. (Supabase 프로젝트 API 설정에서 확인 가능)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 크롤러 실행 (초기 데이터 적재)
개발 서버를 띄우기 전, 크롤러를 실행하여 Supabase DB에 경기 및 박스스코어 데이터를 적재합니다.
```bash
node scripts/scraper.mjs            # 일정 데이터 세팅
node scripts/boxscore-scraper.mjs   # 박스스코어 데이터 세팅
node scripts/record-scraper.mjs     # 선수 기록 데이터 세팅
```

### 4. 로컬 개발 서버 실행
```bash
npm run dev
# or
yarn dev
```
브라우저에서 `http://localhost:3000` 으로 접속하여 결과를 확인합니다.

---

## 💡 트러블슈팅 (Troubleshooting & Learnings)

- **Vercel 빌드 타임 환경변수 에러 (`supabaseUrl is required`):**
  - **문제:** 빌드 시점에 Supabase 초기화 코드가 Top-level에서 평가되면서 환경변수(`undefined`) 에러로 인해 전체 배포가 실패하는 문제 발생.
  - **해결:** `src/lib/supabase.ts` 공통 파일을 생성하여 모듈화하고, `|| ''` 안전장치 도입 및 Vercel Dashboard의 Environment Variables 타겟팅(Production/Preview/Development)을 정확히 일치시켜 빌드 환경과 런타임 환경의 격차를 해결함.

- **KBO 박스스코어 데이터 누락 문제:**
  - **문제:** 크롤링 시 상세 이닝(1~12회) 점수가 빈 배열(`[]`)로 수집되는 현상 발생.
  - **해결:** KBO 스코어보드가 메인 DOM이 아닌 여러 개의 `<iframe>` 요소에 쪼개져 렌더링됨을 파악함. `page.frames()`를 순회하며 경기 정보, 승패, 이닝 점수, RHEB 3단 표를 각각 찾아 하나의 완벽한 JSON 객체로 병합하여 DB에 적재하는 방식으로 파이프라인을 고도화함.
