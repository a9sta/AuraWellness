/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 열네 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *     솔레이스바디 `{동} 출장마사지 홈타이 : {구} {코스어} {행동어} | 솔레이스바디`
 *     레스토라럭스 `{동} 출장마사지 | {구} 홈타이 {코스어} {행동어} · 레스토라럭스`
 *     리쥬베나     `{동} 출장마사지 홈타이 · {코스어} · {구} {행동어} 리쥬베나`
 *     바이탈리티럽 `{동} {코스어} 출장마사지 홈타이 — {구} {행동어} — 바이탈리티럽`
 *     힐펄스       `[{구}] {동} 출장마사지 홈타이 · {코스어} {행동어} | 힐펄스`
 *   ★**꺾쇠(›)로 세 토막을 잇는** 모양은 여기서 처음 쓴다. 다른 곳은 세로줄·줄표·
 *     가운뎃점·쌍점·쉼표·슬래시·괄호·대괄호를 썼다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (네 자락 몫, 두꺼운 자락, 북·동 몫, 치우침, 무게가 선 자리)으로 채운다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '아우라웰니스';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 아홉 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '딥티슈', '타이', '경락', '건식', '림프', '지압', '스포츠'];
/** 제목 꼬리 행동어 */
const ACT = ['오늘 방문', '비용 보기', '늦은 밤도', '바로 통화', '시각 조율'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} › 서울 인천 경기 부산 동 방문 › 24시 후불 접수`,
  areaHub: (c) => `${KEY} 방문 지역 › 동 ${c.spot}구역 시군구 ${c.gu}곳 › ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} › ${sd.main ? `동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳`} › ${at(hash(sd.name, 'sdt'), ACT)} · ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}구역` : g.main ? `읍면 ${g.ruralCount}구역` : `행정동 ${g.dongCount}구역`;
    return `${g.name} ${KEY} › ${sd.name} ${unit} › ${at(h, ACT, 0)} · ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} › ${g.name} ${at(h, COURSE_WORD, 0)} › ${at(h, ACT, 1)} · ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} › ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 › 세기 ${c.pressure} · ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} › ${sd.name} 방문 › ${at(hash(sd.name, c.slug), ACT)} · ${BRAND}`,
  page: (t) => `${t} · ${BRAND} ${KEY}`,
  post: (p) => `${p.title} · ${BRAND} 쏠림 메모`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 쏠림에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `네 자락 가운데 ${s.heavy} 쪽이 ${s.quad[['북동', '북서', '남서', '남동'].indexOf(s.heavy)]}%로 가장 두툼합니다`,
    () => `북쪽 몫 ${s.north}%, 동쪽 몫 ${s.east}%에 치우침은 ${s.tilt}입니다`,
    () => `무게 중심이 가운데에서 ${s.offDir}쪽으로 ${s.offM}m 밀려 있습니다`,
    () => `두꺼운 자락은 ${s.heavy}, 얇은 자락은 ${s.thin}입니다`,
    () => `치우침으로 ${g.name}에서 ${s.guTiltRank}번째입니다`,
    () => `땅 ${km2(s.area)}가 ${s.heavy} 자락으로 쏠려 있습니다`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '비용은 마치고 치릅니다',
  '선입금을 받지 않습니다',
  '거리로 비용표를 바꾸지 않습니다',
  '늦은 밤에도 같은 비용입니다',
  '셈은 끝에 한 번뿐입니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 땅이 어느 자락으로 쏠렸는지를 구역마다 구해 두었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이로 찾아가는 동 ${c.spot}구역과 시군구 ${c.gu}곳. 구역마다 두꺼운 자락과 치우침을 적었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}구역에 안내문이 있고 치우침 평균이 ${sd.avgTilt}입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}구역에 안내문이 있고 ${g.heavy} 자락이 가장 두툼합니다`,
        `가장 크게 쏠린 구역은 ${g.tiltSpot}, 가장 고른 구역은 ${g.evenSpot}입니다`,
        `북쪽 몫 ${g.north}%에 동쪽 몫 ${g.east}%, 치우침은 ${g.tilt}입니다`,
        `무게 중심이 가장 멀리 밀린 구역은 ${g.offSpot}${josa(g.offSpot, '으로/로')} ${g.offSpotM}m입니다`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}구역이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}구역과 면 ${g.myeonCount}구역을 이름으로 올렸습니다`,
          `땅 ${km2(g.area)}가 ${g.heavy} 자락으로 쏠려 있습니다`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}구역이 들어 있고 두꺼운 자락은 ${g.heavy}입니다`,
          `치우침 ${g.tilt}에 넓이 ${km2(g.area)}짜리 땅입니다`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}구역 모두 찾아갑니다` : `동 ${g.dongNames.length}구역 어디나 한 번호로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
