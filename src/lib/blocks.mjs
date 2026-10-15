import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { frame, callBox } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 네 자락 몫을 2×2 네모 진하기로 그린다. */
export function quadGlyph(q) {
  const mx = Math.max(...q, 1);
  const op = (v) => (0.14 + 0.86 * (v / mx)).toFixed(2);
  // 화면 차례는 북서 · 북동 / 남서 · 남동
  return `<span class="qg" aria-hidden="true"><i style="opacity:${op(q[1])}"></i><i style="opacity:${op(q[0])}"></i><i style="opacity:${op(q[2])}"></i><i style="opacity:${op(q[3])}"></i></span>`;
}

/** 한글 첫소리 — 동 이름을 묶을 때 쓴다. */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MERGE = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };
export function choOf(name) {
  const c = name.codePointAt(0) - 0xac00;
  if (c < 0 || c >= 11172) return '#';
  const k = CHO[Math.floor(c / 588)];
  return MERGE[k] || k;
}

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function hailStrip(cfg, place, seedKey) {
  const h = hash(seedKey, 'hs');
  const lines = [
    `${place}까지라고만 하셔도 괜찮습니다. 남은 주소는 저희가 되짚으며 채워 갑니다.`,
    `${place}에 지금 나갈 수 있는지 통화하는 사이에 확인해 드립니다.`,
    `${place}${josa(place, '으로/로')} 가는 데 쓰는 것은 코스와 시각, 주소 셋입니다.`,
    `${place} 접수를 받는 곳은 이 번호뿐입니다. 다른 통로를 만들지 않았습니다.`,
  ];
  return `<section class="hail" aria-label="${esc(place)} 예약 문의">
  <p class="hail-p">${esc(at(h, lines))}</p>
  ${callBox(cfg, { size: 'l' })}
  <p class="hail-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 = 번호 목록 ───────────────────────────────────────────
   ★★안내문마다 아홉 가지를 통째로 되풀이하면 그 덩어리가 본문에서 가장 커지고
     동 안내문끼리 겹침이 올라간다. 동·시군구에서는 **시드로 고른 셋만** 보이고
     나머지는 코스 안내문으로 보낸다. 허브·시도에서만 전체를 편다. */
export function courseRoll(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'cr');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="n-n">${esc(c.ko)}</span>
      <span class="n-w">${won(c.price)}원</span>
      <span class="n-s">${c.min}분 · 세기 ${esc(c.pressure)} · ${c.oil ? '기름 씀' : '기름 안 씀'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="n-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  const short = [
    `${esc(place)}에도 아홉 가지를 그대로 들고 갑니다. 남은 여섯은 <a href="/course/">코스 안내문</a>에, 숫자는 <a href="/price/">비용</a>에 있습니다.`,
    `${esc(place)}에서 걸려 오는 통화에 가장 자주 오르는 셋입니다. <a href="/course/">아홉 가지 전부</a>와 <a href="/price/">숫자만 추린 쪽</a>을 따로 두었습니다.`,
    `${esc(place)}이라 해서 고르실 폭이 좁아지지 않습니다. <a href="/course/">남은 여섯</a>과 <a href="/price/">비용 전체</a>를 함께 걸었습니다.`,
    `세기나 길이가 맞지 않으시면 <a href="/course/">아홉 가지</a>를 펼쳐 보십시오. 구역이 달라도 <a href="/price/">쓰는 표는 하나</a>입니다.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return frame('course', 'courses', full ? `${esc(place)}까지 들고 가는 아홉 가지` : `${esc(place)}에서 자주 고르시는 셋`,
    `<ol class="numlist">\n${list}\n</ol>
     <p class="frame-x">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 = 두 칸 표 ─────────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepTable(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return frame('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<table class="steps"><tbody>\n${steps.map((s, i) => `<tr><th scope="row"><small>${String(i + 1).padStart(2, '0')}</small>${esc(s.t)}</th><td>${esc(s.d)}</td></tr>`).join('\n')}\n</tbody></table>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factBook(rows) {
  return `<table class="book"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'fq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = frame('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="asks">\n${qa.map((x) => `<div><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return frame('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="heed">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return frame('longtail', label, heading, `<ul class="pills">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 롱테일 주제 묶음 ──────────────────────────────────────────
   ★★'다른 지역' 한 덩어리로만 링크를 걸면 코스 이름·비용 같은 말로 들어오는 길이
     없다. 주제별로 갈라 묶고 묶음마다 앵커 틀을 달리 둔다. */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('\n');
    return `<div>
      <p class="route-h">${esc(g.label)}</p>
      <ul class="pills">\n${li}\n</ul>
    </div>`;
  }).join('\n');
  return frame('topic', 'ways in', heading, `<div class="routes">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/** 코스 묶음 — 시도별 코스 안내문으로 가는 롱테일. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 같은 자락으로 쏠린 구역 ───────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리가 아니라 **두꺼운 자락이
     같은지**로 먼저 묶고, 그 안에서 북·동 몫 차이가 작은 차례로 세운다. */
export function leanKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const gap = (o) => Math.abs(o.north - s.north) + Math.abs(o.east - s.east);
  const sorted = pool.slice().sort((a, b) => (a.heavy === s.heavy ? 0 : 1) - (b.heavy === s.heavy ? 0 : 1) || gap(a) - gap(b) || a.name.localeCompare(b.name, 'ko'));
  const pick = sorted.slice(0, 8);
  return frame('kin', 'same lean', `${esc(g.name)}에서 ${esc(s.name)}${josa(s.name, '과/와')} 비슷하게 쏠린 구역`,
    `<ul class="cells">\n${pick.map((x) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="c-n">${esc(x.name)}</span><span class="c-s">${esc(x.heavy)} ${x.tilt}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'lk'), SEC.kinSub)), num);
}

/* ── 시군구 안의 구역 목록 — 첫소리로 묶는다 ──────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const groups = new Map();
  for (const s of g.spots) {
    const k = choOf(s.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s);
  }
  const body = [...groups.entries()].map(([k, list]) => `<section><h3>${esc(k)}</h3><ul>${list
    .map((s) => `<li><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>${esc(s.name)}</a></li>`).join('')}</ul></section>`).join('\n');
  return frame('spotidx', 'places', `${esc(g.name)}에서 안내문을 낸 ${g.spotCount}구역`,
    `<div class="jamo">${body}</div>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 안내문을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return frame('rural', 'rural', `${esc(g.name)} 안의 ${esc(label)}구역`,
    `<ul class="pills">\n${g.rural.map((m) => `<li><span>${esc(m.name)}</span></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  const groups = new Map();
  for (const d of g.dongNames) {
    const k = choOf(d);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(d);
  }
  const body = [...groups.entries()].map(([k, list]) =>
    `<section><h3>${esc(k)}</h3><ul>${list.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>`).join('\n');
  return frame('dongidx', 'dong', `${esc(g.name)}에 든 동 ${g.dongNames.length}구역`,
    `<div class="jamo">${body}</div>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ──────────────────────────────────────
   ★★동 안내문에서 시군구를 통째로 되풀이하면(경기는 47곳) 그 목록이 본문에서
     가장 큰 덩어리가 되어 안내문끼리 겹침이 올라간다. 깊이 들어온 쪽에서는 시드로
     고른 일부만 걸고 나머지는 시도 안내문으로 보낸다. */
export function guIndex(sd, seedKey, currentSlug, num, { pick = 0 } = {}) {
  let list = sd.gu;
  if (pick && sd.gu.length > pick) {
    const keep = new Set(shuffle(sd.gu.map((g) => g.slug), hash(seedKey, 'gi')).slice(0, pick));
    if (currentSlug) keep.add(currentSlug);
    list = sd.gu.filter((g) => keep.has(g.slug));
  }
  const items = list.map((g) => `<li${g.slug === currentSlug ? ' class="at"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="c-n">${esc(g.name)}</span><span class="c-s">${esc(g.heavy)}</span></a></li>`).join('\n');
  const partial = list.length < sd.gu.length;
  return frame('guidx', 'districts', partial ? `${esc(sd.name)} 시군구 중 ${list.length}곳` : `${esc(sd.name)} 아래 시군구 ${sd.gu.length}곳`,
    `<ul class="cells">\n${items}\n</ul>${partial ? `\n<p class="frame-x">${esc(sd.name)}에 든 시군구는 모두 ${sd.gu.length}곳입니다. <a href="/${sd.slug}/">${esc(sd.name)} 한 장</a>에 전부 펼쳐 두었습니다.</p>` : ''}`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 쏠린 자락이 같은 시군구 (길을 거는 용도) ───────────────── */
export function kinList(sd, g, seedKey, num) {
  if (!g.kinCount) return '';
  const items = g.kin.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="c-n">${esc(t.gu)}</span><span class="c-s">${esc(t.heavy)}${t.same ? '' : ' · 시도 밖'}</span></a></li>`).join('\n');
  return frame('kin2', 'alike', `${esc(g.name)}${josa(g.name, '과/와')} 쏠린 자락이 같은 시군구`,
    `<ul class="cells">\n${items}\n</ul>`,
    `${esc(g.name)}의 두꺼운 자락은 ${esc(g.heavy)}입니다. 같은 자락으로 쏠린 곳은 사람이 모여 사는 쪽도 대체로 닮습니다.`, num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 안내문용) ─────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return frame('also', 'more', '이어서 볼 곳',
    `<ul class="pills">
      <li><a href="/area/">방문 지역 전부</a></li>
      <li><a href="/guide/">시작하기 전에</a></li>
      <li><a href="/price/">비용</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">메모</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도 밑으로 시군구가 들어가고 수도권과 부산에만 동이 한 겹 더 붙습니다. 읍·면과 나머지 지역의 동은 이름으로만 목록에 있습니다.');
}

/** 문서·글 안내문에 다는 주제 묶음. 지역 목록 대신 찾는 말로 갈라 건다. */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
