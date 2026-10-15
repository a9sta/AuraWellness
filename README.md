# 아우라웰니스 (AuraWellness)

출장마사지·홈타이 방문 안내 정적 사이트. 외부 의존성 없이 Node 20 표준 라이브러리만 쓴다.

## 돌리는 법

```bash
npm run regions   # 행정동 경계 → data/regions.json (원본 geojson 필요)
npm run build     # dist/ 생성
npm run check     # 빌드 결과 자체 검사 16종
npm run simil     # 동 안내문끼리 본문 겹침 측정
npm run serve     # dist/ 를 로컬에서 띄워 보기
```

## 호스팅 — Cloudflare (Workers Builds, 정적 자산)

대시보드에서 저장소를 연결하면 빌드 뒤에 `npx wrangler deploy` 가 돈다. 이 저장소는
`wrangler.jsonc` 에 **main 없는 자산 전용 워커**로 적어 두었으므로 `dist/` 가 그대로 올라간다.

| 칸 | 값 |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` (기본값 그대로) |
| Root directory | (비움) |
| 환경 변수 | `NODE_VERSION` = `20` |

- Node 버전은 `.nvmrc` 와 `.node-version` 에도 `20` 으로 적어 두었다.
- ★`wrangler.jsonc` 가 없으면 `error occurred while running deploy command` 로 끝난다.
  ★`pages_build_output_dir` 가 든 `wrangler.toml` 은 `wrangler deploy` 와 충돌하므로 쓰지 않는다.
- 기준 주소는 `data/site.config.json` 의 `siteUrl`(`https://aurawellness-care.yovip77.workers.dev`).
  Workers Builds 는 `CF_PAGES_URL` 을 주지 않으므로, 실제 주소가 다르면 이 값을 고치고 다시 올린다.
- `_headers` 와 `_redirects` 는 `dist/` 에 그대로 떨어진다. `301!` 는 Netlify 주소일 때만 붙는다.

## 이 사이트가 구하는 값 — 쏠림

땅을 네모로 감싸고 그 네모의 **한가운데를 지나는 가로줄과 세로줄로 잘라** 북동·북서·
남서·남동 네 자락의 넓이를 그대로 구한다. 점을 뿌려 세지 않고 경계선을 반평면으로
자른다(서덜랜드–호지먼). 안쪽 구멍은 음수로 빼서 더한다.

| 값 | 뜻 |
|---|---|
| 네 자락 | 북동·북서·남서·남동이 각각 몇 % |
| 두꺼운 자락·얇은 자락 | 가장 넓은 쪽과 가장 좁은 쪽 |
| 북쪽 몫·동쪽 몫 | 가운뎃줄 기준 위·오른쪽 비율 |
| 치우침 | 가장 넓은 자락 − 가장 좁은 자락 |
| 무게가 선 자리 | 넓이 중심이 네모 한가운데에서 밀린 거리와 방향 |

## 커버리지

- **동까지** 서울·인천·경기·부산 — 1,232구역
- **시군구까지** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군
- 읍과 면은 안내문을 내지 않고 시군구 목록에 이름만 적는다(접수와 방문은 동일).

## 꼭 지킬 것

- `data/lastmod.json` 을 **반드시 커밋**한다. 없으면 깃 빌드에서 전 안내문이 '오늘 수정'으로 밀린다.
- 전화번호는 `callBox()` 으로만 찍는다. 맨 번호가 본문에 남으면 `npm run check` 가 잡는다.
- 무작위를 쓰지 않는다. 모든 변형은 md5 시드 고정이라 같은 주소면 언제나 같은 HTML 이 나온다.
- 후기·체험담·평점·인물 사진을 싣지 않는다.
