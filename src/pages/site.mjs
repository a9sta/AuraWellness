import { layout, frame, callBox } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepTable, stepSet, factBook, faqBlock, noticeBlock,
  longtail, hailStrip, siteLinks, topicLinks, courseTopic, docTopics, quadGlyph,
} from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="porch" aria-label="첫 안내">
  <p class="porch-sl">${esc(cfg.brand.slogan)}</p>
  <p class="porch-p">찾아오실 가게가 없습니다. 연락 주시면 관리사가 가방을 들고 그 주소로 갑니다. 수도권과 부산은 동마다 안내문을 냈고, 대전·대구·울산과 지정한 시·군은 시군구에서 겹을 끊었습니다.</p>
  ${callBox(cfg, { size: 'l' })}
  <dl class="porch-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>쉬는 시각이 없습니다</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>끝에 한 번 치릅니다</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>대개 이만큼입니다</dd></div>
    <div><dt>동 ${counts.spot}구역</dt><dd>시군구 ${counts.gu}곳 안쪽</dd></div>
  </dl>
</section>`;

  /* ★지역 고르기 — 이름을 두 칸으로 늘어놓지 않는다. 시도마다 네 자락 넓이를
     2×2 네모의 진하기로 그리고 이름을 옆에 둔다. 쏠린 쪽이 한눈에 보인다. */
  const cells = [...main, ...sub].map((r) => `<li class="${r.main ? 'deep' : 'thin'}"><a href="/${r.slug}/">
    ${quadGlyph(r.quad)}
    <span class="qinfo"><b>${esc(r.name)}</b><span>${r.main ? `동 ${r.spotCount}구역` : `시군구 ${r.gu.length}곳`} · 두꺼운 자락 ${esc(r.heavy)}</span></span>
  </a></li>`).join('\n');
  const areaBlock = frame('area', 'where', '어느 자락에 계십니까',
    `<ul class="quads">${cells}</ul>
     <p class="quads-key">네모 넷은 그 지역이 받는 땅을 북서·북동·남서·남동으로 가른 것입니다. 진할수록 그 자락에 땅이 많습니다.
       테두리가 또렷한 쪽은 동까지 내려간 지역이고, 옅은 쪽은 시군구에서 겹을 끊은 지역입니다. 겹이 달라도 번호와 비용은 하나입니다.
       <a href="/area/">방문 지역을 한 장에</a> 펼쳐 두었습니다.</p>`,
    '겹이 둘인 것은 적어 둔 깊이가 다를 뿐입니다. 찾아가는 지역을 줄인 것이 아닙니다.', '01');

  const whyBlock = frame('why', 'method', '왜 자락을 갈라 두나요?',
    `<div class="brief">
      <p>지역 안내문을 열면 그 땅이 <strong>네 자락에 어떻게 나뉘는지</strong>가 적혀 있습니다. 가장 크게 쏠린 구역은 ${esc(counts.tiltName)}이고 가장 고르게 퍼진 구역은 ${esc(counts.evenName)}입니다. 안내문을 낸 ${counts.spot}구역의 치우침 한가운데 값은 ${counts.tiltMid}입니다.</p>
      <p>이 수를 적어 두는 까닭은 하나입니다. 한 자락에 땅이 몰려 있으면 집도 그쪽에 몰려 있습니다. 그러면 비어 있는 자락 쪽 주소가 들어왔을 때 <strong>평소 잡아 두던 길이 그대로 어긋납니다.</strong> 무게 중심이 가운데에서 가장 멀리 밀린 구역은 ${esc(counts.offName)}로 ${counts.offMax}m입니다.</p>
      <p>전국 행정동 ${counts.featAll}곳의 경계를 반평면으로 잘라 넓이를 그대로 구한 값이고, 같은 절차로 다시 돌리면 같은 수가 나옵니다. 어떻게 갈랐는지는 <a href="/magazine/four-quarters/">이 메모에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = frame('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="slips">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="frame-x"><a href="/magazine/">메모 전부 보기</a></p>`,
    '체험담이 아닙니다. 먼저 보시면 통화가 짧아지는 것만 골랐습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 구역'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseRoll(courses, seed, '부르시는 구역', '03'),
    stepTable(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    topics,
    hailStrip(cfg, '지금 계신 구역', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="hdline-s">서울·인천·경기·부산 동 ${counts.spot}구역 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="brief">
  <p>안내문을 낸 구역을 한 화면에 모았습니다. 시군구 ${counts.gu}곳에 동 ${counts.spot}구역이 들어 있습니다. 읍·면 ${counts.rural}구역은 안내문만 없고 받는 것도 찾아가는 것도 같습니다.</p>
  <p>수도권과 부산에서는 동을 하나씩 눌러 들어가실 수 있고, 나머지는 시군구 안내문 안에 동 이름을 적어 두었습니다. 겹이 둘로 갈린 것은 문의가 많은 쪽만 한 칸 더 파 두었기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => frame(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}구역` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="cells">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="c-n">${esc(g.name)}</span><span class="c-s">${esc(g.heavy)} ${g.tilt}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서는 시군구를 하나 짚으셔야 그 안의 동이 드러납니다. 오른쪽은 그 시군구의 두꺼운 자락과 치우침입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구에서 겹이 끝납니다. 행정동 ${r.dongCount}구역의 이름은 각 시군구 안내문에 적어 두었습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 구역'), 4, '90');

  const body = [open, hailStrip(cfg, '계신 구역', seed), blocks, faqHtml, stepTable(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `방문 지역 <span class="hdline-s">시군구 ${counts.gu}곳과 동 ${counts.spot}구역을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '방문 지역', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 찾아가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '계신 구역에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="brief">
  <p>아홉 가지입니다. 정하실 것은 셋뿐입니다 — 세기, 길이, 기름 여부. 나머지는 통화에서 맞춥니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는 것과 깊이 받는 것은 다르고, 비싸다고 더 나은 것도 아닙니다.</p>
</div>`;

  const table = frame('all', 'table', '아홉 가지를 한 표에',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">비용</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '비용이 낮은 것부터 세웠습니다. 어느 구역에서 부르셔도 같은 표를 씁니다.', '01');

  const pickBy = frame('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="slips">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '정하신 뒤에 바꾸셔도 됩니다. 비용은 마지막에 받으신 코스로 매깁니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 구역'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, hailStrip(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한 표에 모았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="hdline-s">세기 · 길이 · 기름 여부를 한 표에</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`), desc: clampDesc(`코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한 표에 모았습니다.`), listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 비용 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="brief">
  <p>표 한 장이 전부입니다. 여기 올리지 않은 돈은 어떤 이름으로도 받지 않습니다.</p>
  <p>길 하나 건너든 한 시간을 달리는 읍내든 코스가 같으면 비용이 같습니다. 멀리 움직이는 부담은 저희 쪽에서 떠안습니다.</p>
</div>`;

  const table = frame('tbl', 'prices', '코스별 기본 길이와 비용',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">비용</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 서로 대 보시라고 넣은 것입니다. 분을 쪼개어 받는 일은 없습니다.', '01');

  const noExtra = frame('nox', 'never', '붙지 않는 것',
    `<ul class="heed">
      <li>차비 — 거리가 얼마든 셈에 넣지 않습니다.</li>
      <li>심야 할증 — 동트기 전에 부르셔도 표가 같습니다.</li>
      <li>명절·휴일 할증 — 날짜를 보고 비용을 올리지 않습니다.</li>
      <li>선금 — 예약금도 보증금도 항목 자체가 없습니다.</li>
      <li>취소 수수료 — 미루시거나 없던 일로 하셔도 받지 않습니다.</li>
      <li>주차비 — 저희가 냅니다.</li>
    </ul>`,
    '입금부터 요구하는 연락이라면 저희 쪽이 아닙니다.', '02');

  const pay = frame('how', 'payment', '비용은 어떻게 내나요?',
    factBook([
      ['내는 때', '마치고 그 자리에서'],
      ['수단', '현금과 카드 — 어느 쪽이든 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받으실 때', '미리 정하시면 늘어난 분만큼만 더합니다'],
      ['두 분이 받으실 때', '사람 수대로 셉니다. 묶음 할인은 없습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 구역'), 4, '04');

  const body = [open, table, noExtra, pay, hailStrip(cfg, '비용 확인', seed), faqHtml, docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`비용 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 비용입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `비용 <span class="hdline-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '비용', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 비용`, desc: clampDesc(`코스별 기본 길이와 비용입니다. ${won(sorted[0].price)}원부터입니다.`), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 시작하기 전에 ──────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="brief">
  <p>처음 불러 보시는 분을 두고 적었습니다. 전화 한 통으로 끝나는 일이라 오래 읽으실 것이 없습니다.</p>
</div>`;

  const what = frame('need', 'ready', '무엇을 두고 기다리면 되나요?',
    `<ul class="heed">
      <li>누우실 공간 — 바닥도 침대도 괜찮습니다.</li>
      <li>수건 두 장 — 집에 있는 것이면 되고 기름 없는 코스는 한 장이면 넉넉합니다.</li>
      <li>방 하나 — 문이 닫히면 식구가 계셔도 됩니다.</li>
    </ul>
    <p class="frame-x">접이식 매트와 기름, 향은 관리사 쪽에서 챙겨 갑니다. 장을 보실 것이 없습니다.</p>`,
    null, '01');

  const timing = frame('when', 'hours', '언제 부를 수 있나요?',
    factBook([
      ['접수', `${esc(cfg.hours)} — 거시는 시각을 따지지 않습니다`],
      ['문 앞까지', `대개 ${esc(cfg.arrive)}, 안쪽 골목이면 더 걸립니다`],
      ['시간 옮기기', '언제든 됩니다. 비용이 붙지 않습니다'],
      ['취소', '이미 문 앞이라면 그 사실만 알려 주십시오'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['한가한 때', '주중 낮 — 기다림이 거의 없습니다'],
    ]), null, '02');

  const refuse = frame('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="heed">
      <li>성적인 말이 끼어들 때 — 그 자리에서 통화를 마칩니다.</li>
      <li>열이 오르거나 상처가 부어 있을 때 — 날짜를 다시 잡아 드립니다.</li>
      <li>주소 끝자리를 주지 않으실 때 — 누구를 어느 길로 보낼지 정할 수 없습니다.</li>
      <li>관리사에게 따로 연락할 번호를 달라 하실 때.</li>
      <li>병원을 먼저 가 보셔야 할 상태로 보일 때.</li>
      <li>만 19세 미만이실 때.</li>
    </ul>`,
    '받지 못하게 된 건에는 어떤 비용도 매기지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 구역'), 6, '05');

  const body = [open, what, timing, stepTable(seed, '04'), refuse, hailStrip(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('시작하기 전에 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 시각, 못 받는 경우, 비용 내는 법을 차례로 적었습니다.'),
      h1: `시작하기 전에 <span class="hdline-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '시작하기 전에', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부르실 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다.'), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const open = `<div class="brief">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳입니다. 업소를 늘어놓고 이어 주는 중개가 아니라 저희가 받고 저희가 찾아갑니다.</p>
  <p>이름은 사람 둘레에 도는 기운(aura)과 안녕(wellness)을 붙인 것입니다. 손이 닿는 데까지만 하겠다는 뜻으로 지었습니다.</p>
</div>`;

  const line = frame('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="heed">
      <li>합니다 — 손으로 굳은 데를 풀어 드리는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 형태로도 두지 않습니다.</li>
      <li>안 합니다 — 진단과 치료. 의료기관이 할 일입니다.</li>
      <li>안 받습니다 — 만 19세를 넘기지 않은 분.</li>
      <li>안 싣습니다 — 후기와 별점. 지어서 쓴 글을 가려낼 길이 없습니다.</li>
      <li>안 올립니다 — 인물 사진. 보신 사진과 다른 사람이 가는 일이 생깁니다.</li>
      <li>안 받습니다 — 선금. 앞서 받는 돈이 없습니다.</li>
    </ul>`, null, '01');

  const how = frame('data', 'sources', '네 자락은 어떻게 구한 건가요?',
    `<div class="brief">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어, 각 땅의 바깥 테두리로 네모를 잡았습니다. 그 네모의 <strong>한가운데를 지나는 가로줄과 세로줄로 땅을 잘라</strong> 북동·북서·남서·남동 네 조각의 넓이를 그대로 구했습니다.</p>
      <p>점을 뿌려 세면 작은 구역에서 숫자가 거칠어집니다. 그래서 경계선을 반평면으로 잘라 넓이를 바로 계산했고, 안쪽 구멍은 음수로 빼서 더했습니다. 가장 넓은 자락과 가장 좁은 자락의 차가 치우침인데, ${counts.tiltMin}에서 ${counts.tiltMax}까지 벌어지고 한가운데가 ${counts.tiltMid}입니다.</p>
      <p>두꺼운 자락을 세어 보면 북동 ${counts.heavyCount[0]}곳, 북서 ${counts.heavyCount[1]}곳, 남서 ${counts.heavyCount[2]}곳, 남동 ${counts.heavyCount[3]}곳으로 네 쪽이 고르게 나뉩니다. 넓이 중심이 네모 한가운데에서 밀린 거리는 한가운데가 ${counts.offMid}m이고 가장 먼 곳이 ${esc(counts.offName)}의 ${counts.offMax}m입니다.</p>
      <p>이 값은 행정 경계의 모양일 뿐 집이 실제로 어디에 서 있는지는 보지 않습니다. 쏠린 자락이라고 반드시 사람이 많이 사는 것은 아닙니다. 그 점을 알고 읽어 주십시오.</p>
    </div>
    ${factBook([
      ['밑자료', esc(data.source)],
      ['원자료 이름', esc(data.version)],
      ['구하는 값', esc(data.axis)],
      ['셈하는 절차', esc(data.method)],
      ['안내문을 내는 기준', esc(data.coverageFrom)],
      ['안내문을 낸 단위', `시도 ${counts.sido} · 시군구 ${counts.gu} · 동 ${counts.spot}`],
      ['안내문이 없는 단위', `읍 ${counts.eup}구역 · 면 ${counts.myeon}구역 — 목록에 이름으로만`],
      ['가장 크게 쏠린 구역', `${esc(counts.tiltName)} ${counts.tiltMax}`],
      ['가장 고르게 퍼진 구역', `${esc(counts.evenName)} ${counts.tiltMin}`],
      ['무게가 가장 멀리 밀린 구역', `${esc(counts.offName)} ${counts.offMax}m`],
    ])}`, null, '02');

  const body = [open, line, how, hailStrip(cfg, '문의', seed), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}가 어떤 곳인지`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 안내문의 네 자락을 어떤 자료로 어떻게 구했는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="hdline-s">지키는 선과 셈하는 절차</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (약관의 목적)', '이 약관은 아우라웰니스(아래 "회사")가 손님이 계신 곳으로 찾아가 제공하는 방문 관리에 관하여, 이용 조건과 절차 및 회사와 손님이 각각 부담하는 책임을 정하는 데 목적이 있습니다.'],
  ['제2조 (접수를 받는 길)', '접수는 화면에 적힌 번호로 걸어 주시는 통화로만 받습니다. 이 번호는 중계되는 번호여서 손님 번호가 관리사 쪽에 그대로 전해지지 않습니다. 채팅창이나 게시판, 전자우편을 통한 접수는 받지 않습니다.'],
  ['제3조 (제공하는 일의 범위)', '회사는 손님이 정하신 장소로 관리사를 보내 손으로 뭉친 근육을 풀어 드립니다. 질병을 가려내거나 고치는 행위를 하지 않으며 성적인 서비스 또한 제공하지 않습니다.'],
  ['제4조 (나이 제한)', '만 19세를 넘긴 분만 이용하실 수 있습니다. 나이가 모자라면 보호자가 함께 계시더라도 접수가 되지 않습니다.'],
  ['제5조 (쏠림 수치의 성격)', '화면에 적힌 네 자락 몫, 두꺼운 자락, 북·동쪽 몫, 치우침, 무게가 선 자리는 공개된 행정동 경계를 반평면으로 잘라 계산한 값입니다. 도로 사정이나 실제 이동 시간을 보장하지 않으며, 어느 자락으로 들어가면 좋을지 가늠해 보시는 참고 자료입니다.'],
  ['제6조 (비용과 결제)', '비용은 비용표와 같으며 지역에 따라 오르내리지 않습니다. 셈은 관리가 끝난 자리에서 현금이나 카드로 치릅니다. 예약금·보증금처럼 앞서 받아 두는 돈은 어떤 이름으로도 두지 않습니다.'],
  ['제7조 (일정 변경과 취소)', '관리사가 출발하기 전까지는 언제든 시간을 바꾸시거나 취소하실 수 있고 위약금이 없습니다. 이미 문 앞에 도착한 뒤라면 그 사실만 바로 알려 주시면 됩니다.'],
  ['제8조 (접수를 거절하거나 중단하는 경우)', '다음 가운데 하나에 해당하면 회사는 접수를 거절하거나 진행 중인 관리를 중단할 수 있습니다. 1. 성적인 서비스를 바라시는 경우. 2. 관리사에게 거친 말이나 물리력을 쓰거나 사적인 연락처를 요구하시는 경우. 3. 찾아갈 주소를 끝자리까지 주지 않으시는 경우. 4. 발열이나 아물지 않은 상처가 있어 관리가 알맞지 않은 경우.'],
  ['제9조 (손님이 갖춰 주실 것)', '관리를 받으실 공간과 수건을 마련해 주시고, 진행에 영향을 줄 수 있는 건강 상태를 접수 통화에서 알려 주셔야 합니다. 멍이 쉽게 드는 체질이시라면 경락을 고르시기 전에 먼저 말씀해 주시기 바랍니다.'],
  ['제10조 (후기와 평점을 두지 않음)', '회사는 후기와 평점을 모으지 않으며 화면에 올리지도 않습니다. 이 화면의 어떤 문장도 특정한 손님의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (중단된 경우의 비용)', '손님의 요청이나 건강 상태로 중단한 경우에는 지나간 시간만큼만 셉니다. 시작하고 10분이 지나지 않았다면 받지 않습니다. 제8조 제1호를 이유로 중단한 경우에는 그 시점까지 셉니다.'],
  ['제12조 (책임의 한계)', '관리 과정에서 회사의 과실로 손해가 생기면 회사가 배상합니다. 미리 알려 주지 않으신 건강 상태에서 비롯된 손해와, 천재지변이나 통신 장애로 늦어진 일에 대해서는 책임지지 않습니다.'],
  ['제13조 (약관의 개정)', '약관을 고칠 때에는 화면에 먼저 올리고 올린 날부터 적용합니다. 개정 뒤에 접수하시면 바뀐 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="brief"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 거신 때에 아래 내용에 따르기로 하신 것으로 봅니다.</p></div>`,
    frame('terms', 'terms', '전문', `<div class="code">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '약관 문의', 'terms'),
    docTopics(ctx, 'terms', '11', esc(at(hash('terms', 'dt'), SEC.topicHead, 8)), esc(at(hash('terms', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 경로와 제공 범위, 비용과 결제, 변경과 취소를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="hdline-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 적어 두는 항목', '접수 통화에서 적는 것은 넷입니다 — 찾아갈 주소, 연락 닿는 번호, 고르신 코스, 원하시는 시각. 이름과 태어난 날, 주민등록번호는 받아 두지 않습니다.'],
  ['2. 어디에 쓰는가', '적어 둔 내용은 관리사를 정하고 출발과 도착을 알려 드리는 데에만 씁니다. 그 뒤에 광고 문자를 보내거나 저희가 먼저 연락드리는 일이 없습니다.'],
  ['3. 번호를 다루는 방법', '화면의 번호는 중계되는 번호입니다. 그래서 손님 번호가 관리사 쪽 화면에 그대로 뜨지 않습니다.'],
  ['4. 얼마나 두는가', '방문이 탈 없이 끝나면 그날 안에 지웁니다. 다툼이 있었던 건만 마무리될 때까지 따로 둡니다.'],
  ['5. 남에게 넘기는가', '외부 사업자에게 넘기거나 맡기지 않습니다. 법령에 근거한 수사기관의 적법한 요청이 있을 때만 예외로 합니다.'],
  ['6. 자동으로 모으는 장치', '이 사이트는 미리 만들어 둔 파일을 내보내기만 합니다. 로그인도 장바구니도 댓글도 없고 광고 추적이나 방문자 분석 스크립트를 넣지 않았으며 쿠키도 쓰지 않습니다.'],
  ['7. 손님이 가지는 권리', '저희가 가진 내용을 보여 달라거나 지워 달라고 요청하실 수 있습니다. 화면에 적힌 번호로 연락 주시면 그 통화에서 바로 처리합니다.'],
  ['8. 담당자 표기', '사업자 정보가 정해지면 이 항목과 화면 맨 아래에 함께 올립니다. 그전까지는 화면의 번호가 창구를 대신합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="brief"><p>길지 않습니다. 받아 적는 항목 자체가 네 가지밖에 되지 않기 때문입니다.</p></div>`,
    frame('pp', 'privacy', '전문', `<div class="code">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '개인정보 문의', 'privacy'),
    docTopics(ctx, 'privacy', '11', esc(at(hash('privacy', 'dt'), SEC.topicHead, 8)), esc(at(hash('privacy', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적어 두는 항목과 쓰임새, 보관 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="hdline-s">받아 적는 항목은 네 가지입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 메모 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="brief"><p>부르시기 전에 알아 두면 통화가 줄어드는 것만 적어 둡니다. 소감이나 평점은 싣지 않습니다.</p></div>`,
    frame('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="slips">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 나갑니다.', '01'),
    hailStrip(cfg, '접수', 'magazine'),
    docTopics(ctx, 'magazine', '11', esc(at(hash('magazine', 'dt'), SEC.topicHead, 8)), esc(at(hash('magazine', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('쏠림 메모'),
      desc: clampDesc(`부르시기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `쏠림 메모 <span class="hdline-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '메모', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('쏠림 메모'), desc: clampDesc(`부르시기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다.`), listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '쏠림 메모', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="dated"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 쏠림 메모</p>`,
    `<article class="piece">${html}</article>`,
    hailStrip(cfg, '접수', p.slug),
    frame('more', 'next', '함께 읽을 글',
      `<ul class="slips">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    docTopics(ctx, p.slug, '11', esc(at(hash(p.slug, 'dt'), SEC.topicHead, 8)), esc(at(hash(p.slug, 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '메모', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="brief"><p>그 주소에 안내문이 없습니다. 주소가 바뀌었거나 처음부터 없던 곳입니다. 아래에서 다시 골라 주십시오.</p></div>`,
    frame('back', 'back', '여기서 다시',
      `<ul class="pills">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">방문 지역</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">비용</a></li>
        <li><a href="/guide/">시작하기 전에</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    hailStrip(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 안내문이 없습니다. 아래에서 다시 골라 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
