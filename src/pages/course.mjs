import { layout, frame } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factBook, faqBlock, stepTable, stepSet, noticeBlock, hailStrip, courseRoll, topicLinks, courseTopic } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, quadTalk } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 9 이면 만 쪽을 넘는데 구역이 바뀌어도
   코스 설명이 같아 전부 얇은 조합 안내문이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름이 들어갑니다. 마치고 씻으실 수 있는 시각인지만 한 번 보고 고르십시오.',
  false: '기름이 빠집니다. 옷을 그대로 두고 받으며 마치면 곧장 움직이셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 받으시는 사이에 맞춰 갑니다. 십 분쯤 지나면 어느 선이 맞는지 둘 다 알게 됩니다.',
  '표의 등급은 출발점입니다. 아프시면 참지 마시고 그 자리에서 짚어 주십시오.',
  '같은 힘이라도 받아들이는 정도가 사람마다 다릅니다. 표의 글자보다 그날 컨디션이 앞섭니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분들은 주로 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 쓰시라고 맞춘 코스입니다. 상황이 다르면 통화 중에 다른 쪽으로 돌려 드립니다.`,
  (c) => `${c.for} 이쪽이 맞습니다. 정하셨다가 바꾸셔도 되고 셈은 끝에 받으신 코스로 합니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '계신 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="brief">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(c.ko)} 간추림`,
    factBook([
      ['기본 길이', `${c.min}분`],
      ['비용', `${won(c.price)}원 — 지역을 보고 바꾸지 않음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['준비물', c.oil ? '수건 두 장에 누우실 데' : '누우실 공간 하나 — 수건은 한 장이면 넉넉합니다'],
      ['여는 시각', `접수 ${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = frame('cmp', 'compare', '나머지와 한 표에 놓으면',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">비용</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="me"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '길게 받는 것과 깊이 받는 것은 서로 다른 축입니다. 두 칸을 따로 보십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${c.ko}${josa(c.ko, '을/를')} 지역에서`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '다른 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구로 바로', items: guList, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '06', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, c.ko, seed),
    compare,
    stepTable(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="hdline-s">기본 ${c.min}분 · ${won(c.price)}원 · 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const openLines = [
    `${sd.name}에서 ${c.ko}에 매기는 비용은 한 가지입니다. ${c.min}분에 ${won(c.price)}원이고 가깝다고 깎거나 멀다고 올리지 않습니다.`,
    `${sd.name} 어느 구역에서 부르셔도 ${c.ko}에 들어가는 내용이 같습니다. 바뀌는 것은 문 앞까지 걸리는 시간뿐입니다.`,
    `${sd.name}에서 들어오는 ${c.ko} 문의도 한 번호에서 받습니다. ${c.min}분에 ${won(c.price)}원입니다.`,
  ];
  const second = sd.main
    ? `${sd.name}에는 동 ${sd.spotCount}구역이 저마다 안내문을 가집니다. 계신 구역을 누르시면 그 땅이 어느 자락으로 쏠렸는지, 무게 중심이 어디로 밀렸는지가 나옵니다. 번지를 어디까지 불러야 할지 가늠하실 때 쓰시면 됩니다.`
    : `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳까지만 파고 멈췄습니다. 동 이름은 그 안 목록에 들어 있으니 전화로 불러 주시면 됩니다.`;

  const open = `<div class="brief">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(sd.name)}에서 고르는 ${esc(c.ko)}`,
    factBook([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['안내문을 낸 겹', sd.main ? `시군구 ${sd.gu.length}곳 밑에 동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳`],
      ['기본 길이', `${c.min}분`],
      ['비용', `${won(c.price)}원 — ${esc(sd.name)} 어디나 같음`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['이 지역 두꺼운 자락', `${esc(sd.heavy)} — ${esc(quadTalk(sd.heavy))}`],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '03');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 안내문을 함께 걸어 얇은 안내문이 생기지 않게 한다. */
  const guHere = sd.gu.map((g) => ({ label: `${g.name}`, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug)
    .map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug)
    .map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name}에서 받는 다른 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko}${josa(c.ko, '을/를')} 다른 지역에서`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: `${sd.name} 시군구`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동으로 바로`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '05', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, `${sd.name} ${c.ko}`, seed),
    courseRoll(courses, seed, sd.name, '02', { full: false }),
    faqHtml,
    stepTable(seed, '04'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="hdline-s">${c.min}분 ${won(c.price)}원 · 출장마사지 홈타이 방문</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
