import { layout, frame } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepTable, stepSet, factBook, faqBlock, noticeBlock,
  leanKin, spotIndex, ruralList, dongNameList, guIndex, kinList, hailStrip,
  topicLinks, courseTopic, quadGlyph,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  tiltWord, offWord, northWord, eastWord, quadTalk,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const QUAD = ['북동', '북서', '남서', '남동'];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 반평면으로 잘라 구한 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  const sameN = g.sameHeavy ? g.sameHeavy[QUAD.indexOf(s.heavy)] : 0;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    q0: s.quad[0], q1: s.quad[1], q2: s.quad[2], q3: s.quad[3],
    north: s.north, east: s.east, tilt: s.tilt,
    heavy: s.heavy, thin: s.thin, heavyPct: s.quad[QUAD.indexOf(s.heavy)],
    offM: s.offM, offDir: s.offDir,
    guTiltRank: s.guTiltRank, tiltRank: s.tiltRank, offRank: s.offRank,
    tiltSpot: g.tiltSpot, tiltSpotV: g.tiltSpotV, evenSpot: g.evenSpot, evenSpotV: g.evenSpotV,
    northSpot: g.northSpot, northSpotV: g.northSpotV,
    offSpot: g.offSpot, offSpotM: g.offSpotM,
    guHeavy: g.heavy, guNorth: g.north, guEast: g.east, guTilt: g.tilt, guOffM: g.offM,
    sameNote: sameN > 1
      ? `${g.name}에서 ${s.heavy} 자락으로 쏠린 구역이 ${sameN}곳 있습니다.`
      : `${g.name}에서 ${s.heavy} 자락으로 쏠린 구역은 하나뿐입니다.`,
    allSpots: counts.spot, guSpotCount: g.spotCount,
    heavyNote: quadTalk(s.heavy), tiltNote: tiltWord(s.tilt),
    offNote: offWord(s.offM), northNote: northWord(s.north), eastNote: eastWord(s.east),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 안내문 — 메인 네 시도에서만 낸다 ─────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="brief">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = frame('fact', 'measured', `${esc(s.name)} 땅을 넷으로 가르면`,
    factBook([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['네 자락', `북동 ${s.quad[0]}% · 북서 ${s.quad[1]}% · 남서 ${s.quad[2]}% · 남동 ${s.quad[3]}%`],
      ['두꺼운 자락', `${esc(s.heavy)} — ${esc(quadTalk(s.heavy))}`],
      ['얇은 자락', `${esc(s.thin)}`],
      ['북쪽 몫', `${s.north}% — ${esc(northWord(s.north))}`],
      ['동쪽 몫', `${s.east}% — ${esc(eastWord(s.east))}`],
      ['치우침', `${s.tilt} — ${esc(tiltWord(s.tilt))}`],
      ['무게가 선 자리', s.offM ? `가운데에서 ${esc(s.offDir)}쪽으로 ${s.offM}m — ${esc(offWord(s.offM))}` : '네모 한가운데와 거의 겹칩니다'],
      ['땅', km2(s.area)],
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '07');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 구역`, items: sameSido, pick: 18, anchor: ANCHOR },
    { label: '자락이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, `${g.name} ${s.name}`, seed),
    courseRoll(courses, seed, s.name, '02', { full: false }),
    leanKin(sd, g, s, seed, '03'),
    spotIndex(sd, g, seed, s.slug, '04'),
    stepTable(seed, '05'),
    guIndex(sd, seed, g.slug, '06', { pick: 12 }),
    faqHtml,
    noticeBlock(seed, '08'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="hdline-s">출장마사지 홈타이 · ${esc(s.heavy)} 자락이 ${s.quad[QUAD.indexOf(s.heavy)]}%로 가장 두툼한 땅</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 안내문 ────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 안내문에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     안내문을 낼 구역이 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const big = g.spotCount ? Math.max(...g.sameHeavy) : 0;
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    guHeavy: g.heavy, guThin: g.thin, guNorth: g.north, guEast: g.east, guTilt: g.tilt, guOffM: g.offM,
    guNorthNote: northWord(g.north),
    tiltSpot: g.tiltSpot || '', tiltSpotV: g.tiltSpotV || 0,
    evenSpot: g.evenSpot || '', evenSpotV: g.evenSpotV || 0,
    offSpot: g.offSpot || '', offSpotM: g.offSpotM || 0,
    sameNote: g.spotCount
      ? `${g.name}에서 같은 자락으로 쏠린 구역이 가장 많은 묶음은 ${QUAD[g.sameHeavy.indexOf(big)]} 쪽으로 ${big}곳입니다.`
      : `${g.name}${josa(g.name, '은/는')} 안내문을 낸 구역이 없어 한 장에서 받습니다.`,
    kinCount: g.kinCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="brief">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}구역`],
    mode === 'spot' ? ['안내문을 낸 동', `${g.spotCount}구역`]
      : mode === 'rural' ? ['안내문을 낸 동', '없음 — 읍·면만 있는 군입니다']
        : ['끊은 겹', '시군구 — 동 이름은 아래 목록에 있습니다'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}구역 — 이름으로만 적음(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['구 전체 네 자락', `북동 ${g.quad[0]}% · 북서 ${g.quad[1]}% · 남서 ${g.quad[2]}% · 남동 ${g.quad[3]}%`],
    ['두꺼운 자락', `${esc(g.heavy)} — ${esc(quadTalk(g.heavy))}`],
    ['북쪽·동쪽 몫', `${g.north}% · ${g.east}% (치우침 ${g.tilt})`],
    ['자락이 닮은 시군구', g.kin.length ? `${esc(g.kin[0].gu)}(${esc(g.kin[0].heavy)}) · ${esc(g.kin[1].gu)}(${esc(g.kin[1].heavy)}) 외 ${g.kinCount - 2}곳` : '없음'],
    ['땅', km2(g.area)],
  ];
  if (mode === 'spot' && g.tiltSpot) {
    rows.splice(7, 0,
      ['가장 크게 쏠린 구역', `<a href="/${sd.slug}/${g.slug}/${g.tiltSpotSlug}/">${esc(g.tiltSpot)}</a> ${g.tiltSpotV} · 가장 고른 구역 <a href="/${sd.slug}/${g.slug}/${g.evenSpotSlug}/">${esc(g.evenSpot)}</a> ${g.evenSpotV}`],
      ['무게가 가장 멀리 밀린 구역', `<a href="/${sd.slug}/${g.slug}/${g.offSpotSlug}/">${esc(g.offSpot)}</a> ${g.offSpotM}m`]);
  }
  const facts = frame('fact', 'measured', `${esc(g.name)} 자락 장부`, factBook(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const sidoDeep = [];
  for (const x of sd.gu) for (const y of x.spots) if (x.slug !== g.slug) sidoDeep.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '자락이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    ...(sidoDeep.length ? [{ label: `${sd.name} 동으로 바로`, items: sidoDeep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    courseRoll(courses, seed, g.name, '04', { full: false }),
    kinList(sd, g, seed, '05'),
    faqHtml,
    stepTable(seed, '07'),
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09', { pick: 20 }),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="hdline-s">출장마사지 홈타이 · ${mode === 'spot' ? `동 ${g.spotCount}구역에 안내문이 있습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}구역까지 찾아갑니다` : `행정동 ${g.dongCount}구역 전부 찾아갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 부르는 다섯 걸음`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 안내문 ──────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    avgTilt: sd.avgTilt, heavy: sd.heavy, tilt: sd.tilt, north: sd.north, east: sd.east,
    tiltSpot: sd.tiltSpot, evenSpot: sd.evenSpot,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="brief"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = frame('fact', 'measured', `${esc(sd.name)} 자락 장부`,
    factBook([
      ['행정 명칭', esc(sd.full)],
      ['안내문을 낸 겹', sd.main ? '시군구 밑에 동까지' : '시군구에서 끊음'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}구역`],
      sd.main ? ['안내문을 낸 동', `${sd.spotCount}구역`] : ['동 이름', '시군구 안내문 안 목록에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}구역 — 시군구 안내문에 이름으로만` : '없음'],
      ['받는 땅의 네 자락', `북동 ${sd.quad[0]}% · 북서 ${sd.quad[1]}% · 남서 ${sd.quad[2]}% · 남동 ${sd.quad[3]}%`],
      ['두꺼운 자락', `${esc(sd.heavy)} (치우침 ${sd.tilt})`],
      sd.main ? ['치우침 평균', `${sd.avgTilt}`] : ['여는 시각', `받는 시각 ${esc(cfg.hours)} · ${esc(cfg.pay)}`],
      sd.main && sd.tiltSpot ? ['가장 크게 쏠린 동', `${esc(sd.tiltSpot)} ${sd.tiltV}`] : ['받는 땅', km2(sd.area)],
      sd.main && sd.evenSpot ? ['가장 고른 동', `${esc(sd.evenSpot)} ${sd.evenV}`] : ['북쪽·동쪽 몫', `${sd.north}% · ${sd.east}%`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = frame('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="pills">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스가 달라지면 손이 길게 머무는 자리도 달라집니다. 비용표는 ${esc(sd.name)} 전체가 한 장입니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.tilt - a.s.tilt || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = frame('tilted', 'most tilted', `${esc(sd.name)}에서 가장 크게 쏠린 동`,
      `<ul class="pills">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${x.s.heavy} ${x.s.tilt}</a></li>`).join('\n')}\n</ul>`,
      '한 자락에 땅이 크게 몰린 구역입니다. 반대편 자락 주소가 들어오면 평소보다 몇 분 더 걸립니다. 여기 없는 구역은 시군구를 거쳐 들어가 주십시오.', '03');
  } else {
    pickBlock = frame('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="pills">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}구역</a></li>`).join('\n')}\n</ul>`,
      '행정동 수가 많다는 것은 같은 땅에 이름을 더 잘게 붙였다는 뜻입니다.', '03');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} + 코스로`, items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseRoll(courses, seed, sd.name, '05', { full: false }),
    faqHtml,
    stepTable(seed, '07'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="hdline-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳`} · 두꺼운 자락 ${esc(sd.heavy)}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#courselist`, `${sd.name} 코스`, courses.map((c) => ({ name: `${sd.name} ${c.ko}`, url: `${siteUrl}/${sd.slug}/course/${c.slug}/` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
