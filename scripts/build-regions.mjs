/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **쏠림**이다. 땅을 네모로 감싸 가운데를 열십자로
 *   가르고 네 자락에 넓이가 어떻게 나뉘는지를 본다.
 *     네 자락   : 북동·북서·남서·남동 자락이 각각 몇 %인가
 *     두꺼운 쪽 : 그 가운데 가장 넓은 자락
 *     북·동 몫  : 가운뎃줄을 기준으로 북쪽이 몇 %, 동쪽이 몇 %
 *     치우침    : 가장 넓은 자락과 가장 좁은 자락의 차(0이면 고르게 퍼진 땅)
 *     무게가 선 자리 : 넓이의 중심이 네모 한가운데에서 어느 쪽으로 몇 m 밀렸나
 *
 *   같은 넓이라도 한쪽 자락에 땅이 몰려 있으면 집들도 그쪽에 몰려 있다. 어느
 *   자락으로 들어가는지에 따라 같은 동 이름 안에서도 걸리는 시간이 달라진다.
 *
 *   ★자락 넓이는 **반평면으로 잘라** 정확히 구한다(서덜랜드–호지먼). 점을 뿌려
 *     세면 작은 칸에서 숫자가 거칠어진다.
 *   ★구멍(안쪽 고리)은 음수로 빼서 더한다.
 *   앞선 열네 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리·테두리의 결·다리 수·누운 방향·테두리 분담을 썼다. 넓이가 어느
 *   자락으로 쏠렸는지를 재는 축은 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

function signedArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}
/**
 * 반평면으로 자르기 — 서덜랜드–호지먼.
 * axis 0=가로(동서), 1=세로(남북). side 1 이면 c 보다 큰 쪽만 남긴다.
 */
function clipHalf(pts, axis, side, c) {
  if (!pts.length) return pts;
  const keep = (p) => (side > 0 ? p[axis] >= c : p[axis] <= c);
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ka = keep(a), kb = keep(b);
    if (ka) out.push(a);
    if (ka !== kb) {
      const d = b[axis] - a[axis];
      const t = d === 0 ? 0 : (c - a[axis]) / d;
      out.push(axis === 0
        ? [c, a[1] + (b[1] - a[1]) * t]
        : [a[0] + (b[0] - a[0]) * t, c]);
    }
  }
  return out;
}
const quadArea = (pts, ex, ey, cx, cy) =>
  Math.abs(signedArea(clipHalf(clipHalf(pts, 0, ex, cx), 1, ey, cy)));

const DIR8 = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
function dirOf(dx, dy) {           // dx 동쪽(+), dy 북쪽(+)
  let b = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (b < 0) b += 360;
  return DIR8[Math.round(b / 45) % 8];
}

/**
 * 고리 묶음(바깥 +, 구멍 −)에서 쏠림을 잰다.
 * 반환: 넓이(km²) · 중심 · 네 자락 몫 · 북·동 몫 · 치우침 · 무게가 선 자리
 */
function tiltOf(rings) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const r of rings) if (r.outer) for (const p of r.pts) {
    if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
  }
  if (!isFinite(minX)) return null;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  let A = 0, X = 0, Y = 0;
  const q = [0, 0, 0, 0];          // 북동 · 북서 · 남서 · 남동
  for (const r of rings) {
    const sgn = r.outer ? 1 : -1;
    const a = Math.abs(signedArea(r.pts));
    if (!a) continue;
    let sx = 0, sy = 0;
    for (let i = 0, n = r.pts.length; i < n; i++) {
      const p = r.pts[i], o = r.pts[(i + 1) % n];
      const f = p[0] * o[1] - o[0] * p[1];
      sx += (p[0] + o[0]) * f; sy += (p[1] + o[1]) * f;
    }
    const sa = signedArea(r.pts);
    A += sgn * a; X += sgn * a * (sx / (6 * sa)); Y += sgn * a * (sy / (6 * sa));
    q[0] += sgn * quadArea(r.pts, 1, 1, cx, cy);
    q[1] += sgn * quadArea(r.pts, -1, 1, cx, cy);
    q[2] += sgn * quadArea(r.pts, -1, -1, cx, cy);
    q[3] += sgn * quadArea(r.pts, 1, -1, cx, cy);
  }
  if (A <= 0) return null;
  const gx = X / A, gy = Y / A;
  const pct = q.map((v) => Math.max(0, (v / A) * 100));
  const sum = pct.reduce((s, v) => s + v, 0) || 1;
  const p4 = pct.map((v) => (v / sum) * 100);
  const dx = gx - cx, dy = gy - cy;
  return {
    area: A / 1e6,
    gx, gy,
    quad: p4.map((v) => Math.round(v)),
    north: Math.round(p4[0] + p4[1]),
    east: Math.round(p4[0] + p4[3]),
    tilt: Math.round(Math.max(...p4) - Math.min(...p4)),
    offM: Math.round(Math.hypot(dx, dy)),
    offDir: dirOf(dx, dy),
    boxW: maxX - minX, boxH: maxY - minY,
  };
}
const QUAD = ['북동', '북서', '남서', '남동'];

function ringsOf(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  const rings = [];
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const pts = ring.slice(0, -1).map((c) => [c[0] * kx, c[1] * ky]);
      if (pts.length >= 3) rings.push({ pts, outer: idx === 0 });
    });
  }
  return { rings, kx, ky };
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const { rings, kx, ky } = ringsOf(ft.geometry);
  const t = tiltOf(rings);
  if (!t) continue;
  const rec = {
    code: String(p.adm_cd2), name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm,
    lat: r6(t.gy / ky), lng: r6(t.gx / kx), area: r2(t.area),
    quad: t.quad, north: t.north, east: t.east, tilt: t.tilt,
    offM: t.offM, offDir: t.offDir,
    heavy: QUAD[t.quad.indexOf(Math.max(...t.quad))],
    thin: QUAD[t.quad.indexOf(Math.min(...t.quad))],
    rings,
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  /* 시군구 땅 전체를 하나로 보고 다시 잰다 */
  const allRings = [];
  for (const d of list) for (const r of d.rings) allRings.push(r);
  const gt = tiltOf(allRings) || { area: 0, quad: [25, 25, 25, 25], north: 50, east: 50, tilt: 0, offM: 0, offDir: '북', gx: 0, gy: 0 };
  const lat0 = list[0].lat;
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(gt.gy / ky || list[0].lat), lng: r6(gt.gx / kx || list[0].lng),
    area: r1(gt.area),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    quad: gt.quad, north: gt.north, east: gt.east, tilt: gt.tilt,
    offM: gt.offM, offDir: gt.offDir,
    heavy: QUAD[gt.quad.indexOf(Math.max(...gt.quad))],
    thin: QUAD[gt.quad.indexOf(Math.min(...gt.quad))],
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        quad: d.quad, north: d.north, east: d.east, tilt: d.tilt,
        offM: d.offM, offDir: d.offDir, heavy: d.heavy, thin: d.thin,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  g._list = list;
  guAll.push(g);
}

/* ── 시군구 안 차례 ───────────────────────────────────────── */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byTilt = g.spots.slice().sort((a, b) => b.tilt - a.tilt || a.name.localeCompare(b.name, 'ko'));
  byTilt.forEach((s, i) => { s.guTiltRank = i + 1; });
  g.tiltSpot = byTilt[0].name; g.tiltSpotSlug = byTilt[0].slug; g.tiltSpotV = byTilt[0].tilt;
  g.evenSpot = byTilt[byTilt.length - 1].name; g.evenSpotSlug = byTilt[byTilt.length - 1].slug; g.evenSpotV = byTilt[byTilt.length - 1].tilt;
  const byNorth = g.spots.slice().sort((a, b) => b.north - a.north);
  g.northSpot = byNorth[0].name; g.northSpotSlug = byNorth[0].slug; g.northSpotV = byNorth[0].north;
  g.southSpot = byNorth[byNorth.length - 1].name; g.southSpotSlug = byNorth[byNorth.length - 1].slug; g.southSpotV = 100 - byNorth[byNorth.length - 1].north;
  const byOff = g.spots.slice().sort((a, b) => b.offM - a.offM);
  g.offSpot = byOff[0].name; g.offSpotSlug = byOff[0].slug; g.offSpotM = byOff[0].offM;
  /* 같은 자락으로 쏠린 칸이 몇이나 되는가 */
  const cnt = {};
  for (const s of g.spots) cnt[s.heavy] = (cnt[s.heavy] || 0) + 1;
  g.heavyCount = cnt;
  g.sameHeavy = QUAD.map((q) => cnt[q] || 0);
}

/* ── 쏠린 자락이 같은 시군구 — 이 사이트의 '옆 동네' ──────── */
{
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const pool = guAll.filter((o) => o !== g).map((o) => ({
      o,
      same: o.sidoKey === g.sidoKey,
      hit: o.heavy === g.heavy ? 0 : 1,
      gap: Math.abs(o.north - g.north) + Math.abs(o.east - g.east),
    }));
    pool.sort((a, b) => (a.same === b.same ? (a.hit - b.hit || a.gap - b.gap) : a.same ? -1 : 1));
    g.kin = pool.slice(0, 8).map(({ o, same, gap }) => ({
      sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same, gap, heavy: o.heavy,
    }));
    g.kinCount = g.kin.length;
  }
}

/* ── 전국 차례 ────────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.tilt - a.tilt).forEach((s, i) => { s.tiltRank = i + 1; });
spotAll.slice().sort((a, b) => b.offM - a.offM).forEach((s, i) => { s.offRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  const allRings = [];
  for (const g of gus) for (const d of g._list) for (const r of d.rings) allRings.push(r);
  const st = tiltOf(allRings) || { area: 0, quad: [25, 25, 25, 25], north: 50, east: 50, tilt: 0, offM: 0, offDir: '북', gx: 0, gy: 0 };
  const lat0 = gus[0].lat;
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g._list;
  }
  const cnt = {};
  for (const s of allSpots) cnt[s.heavy] = (cnt[s.heavy] || 0) + 1;
  const most = allSpots.slice().sort((a, b) => b.tilt - a.tilt)[0];
  const even = allSpots.slice().sort((a, b) => a.tilt - b.tilt)[0];
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(st.gy / ky || gus[0].lat), lng: r6(st.gx / kx || gus[0].lng),
    area: r1(st.area),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    quad: st.quad, north: st.north, east: st.east, tilt: st.tilt,
    offM: st.offM, offDir: st.offDir,
    heavy: QUAD[st.quad.indexOf(Math.max(...st.quad))],
    thin: QUAD[st.quad.indexOf(Math.min(...st.quad))],
    sameHeavy: QUAD.map((q) => cnt[q] || 0),
    avgTilt: allSpots.length ? Math.round(allSpots.reduce((s, x) => s + x.tilt, 0) / allSpots.length) : 0,
    tiltSpot: most ? most.name : '', tiltV: most ? most.tilt : 0,
    evenSpot: even ? even.name : '', evenV: even ? even.tilt : 0,
    gu: gus,
  });
}

const tt = spotAll.map((s) => s.tilt).sort((a, b) => a - b);
const oo = spotAll.map((s) => s.offM).sort((a, b) => a - b);
const cntAll = {};
for (const s of spotAll) cntAll[s.heavy] = (cntAll[s.heavy] || 0) + 1;
const out = {
  version: VERSION,
  source: 'admdongkor 행정동 경계(CC BY 4.0). 원자료는 국가공간정보포털에서, 배포본은 github.com/vuski/admdongkor 에서 가져왔다.',
  built: new Date().toISOString().slice(0, 10),
  axis: '쏠림 — 감싼 네모를 열십자로 갈랐을 때 네 자락에 넓이가 어떻게 나뉘는가',
  method: '행정동 경계를 그 자리 기준 미터 평면으로 옮기고 바깥 테두리로 네모를 잡았다. 그 네모의 가운데를 지나는 가로줄과 세로줄로 땅을 반평면씩 잘라(서덜랜드–호지먼) 북동·북서·남서·남동 네 자락의 넓이를 그대로 구했다. 구멍은 음수로 빼서 더했다. 가장 넓은 자락과 가장 좁은 자락의 차를 치우침으로 삼고, 넓이 중심이 네모 한가운데에서 밀린 거리와 방향을 따로 적었다.',
  coverageFrom: '서울·인천·경기·부산에서는 동 하나마다 안내문을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구에서 끊는다. 읍과 면은 안내문 없이 시군구 목록에 이름으로만 적는다.',
  quadNames: QUAD,
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    tiltMin: tt[0], tiltMid: tt[tt.length >> 1], tiltMax: tt[tt.length - 1],
    offMid: oo[oo.length >> 1], offMax: oo[oo.length - 1],
    tiltName: spotAll.slice().sort((a, b) => b.tilt - a.tilt)[0].name,
    evenName: spotAll.slice().sort((a, b) => a.tilt - b.tilt)[0].name,
    offName: spotAll.slice().sort((a, b) => b.offM - a.offM)[0].name,
    heavyCount: QUAD.map((q) => cntAll[q] || 0),
    topQuad: QUAD[QUAD.map((q) => cntAll[q] || 0).indexOf(Math.max(...QUAD.map((q) => cntAll[q] || 0)))],
    featAll: geo.features.length,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'rings' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`치우침 min ${C.tiltMin} · 중앙 ${C.tiltMid} · max ${C.tiltMax}(${C.tiltName}) · 가장 고른 칸 ${C.evenName}`);
console.log(`무게가 선 자리 중앙 ${C.offMid}m · 최대 ${C.offMax}m(${C.offName})`);
console.log(`두꺼운 자락 ${QUAD.map((q, i) => `${q} ${C.heavyCount[i]}`).join(' · ')} → 가장 흔한 쪽 ${C.topQuad}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 네 자락 ${s.quad.join('/')} · 북 ${String(s.north).padStart(2)}% 동 ${String(s.east).padStart(2)}% · 치우침 ${s.tilt}`);
