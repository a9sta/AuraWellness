import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **네모 테두리 머리표**와 **2×2 격자 글리프**다. 제목 앞에 네 칸짜리
 *   작은 네모를 두고, 머리표를 가는 테두리로 감싼다. 이 사이트가 재는 값(네 자락)
 *   그대로다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *     레스토라럭스 가는 겹줄 액자 · 어두운 남보라 바탕 · 남보라+황동
 *     리쥬베나     덩어리 없음 · 흰 바탕 · 굵은 풀빛 밑줄
 *     바이탈리티럽 18도 기울여 자른 머리표 · 짙은 청록 바탕+호박
 *     힐펄스       왼쪽 세로 굵은 막대 · 밝은 회백 바탕+자주
 *   ★여기는 **중간 명도 카키빛 종이**에 짙은 남색이다. 밝은 바탕도 어두운 바탕도
 *     아닌 중간 명도를 쓴 곳이 아직 없었고, 2×2 격자 글리프도 처음이다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#E7E3D6', card: '#F2EFE6', soft: '#DAD5C4',
  ink: '#23251E', dim: '#5E6052',
  acc: '#1F3A5F', accDk: '#14273F', accSoft: '#C9D2DE',
  line: '#C6C0AC', clay: '#B4612F',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--clay:${t.clay};
  --w:1000px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.84;font-size:16.5px;letter-spacing:-.006em;padding-bottom:84px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--clay);font-weight:700}
.hop{position:absolute;left:-9999px}
.hop:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#fff;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.brow{border-bottom:2px solid var(--ink)}
.brow-in{max-width:var(--w);margin:0 auto;padding:17px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.emb{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.emb:hover{text-decoration:none}
.qmk{width:30px;height:30px;flex:none}
.emb-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.035em;line-height:1.12}
.emb-t i{display:block;font-style:normal;font-family:var(--mono);font-size:9.5px;letter-spacing:.2em;color:var(--clay)}
.brow-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.brow-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.brow-run span{display:block}
.rowmenu{border-bottom:1px solid var(--line)}
.rowmenu ul{max-width:var(--w);margin:0 auto;padding:0 20px;list-style:none;display:flex;gap:10px;overflow-x:auto}
.rowmenu a{display:block;padding:9px 12px;font-size:13.5px;font-weight:700;color:var(--dim);white-space:nowrap;
  border:1px solid transparent}
.rowmenu a:hover{color:var(--ink);text-decoration:none;border-color:var(--line)}
.rowmenu a[aria-current]{border-color:var(--ink);color:var(--ink);background:var(--card)}

/* ── 지나온 길 ─────────────────────────────────────── */
.walkway{max-width:var(--w);margin:0 auto;padding:14px 20px 0}
.walkway ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.walkway li+li::before{content:"·";margin-right:8px;color:var(--line)}
.walkway a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:22px 20px 62px}
.hdline{font-size:26px;font-weight:800;letter-spacing:-.04em;line-height:1.27;margin:16px 0 0}
@media (min-width:720px){.hdline{font-size:35px}}
.hdline-s{display:block;margin-top:11px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.008em}
.hdline::after{content:"";display:block;width:34px;height:34px;margin:18px 0 22px;
  background:
    linear-gradient(var(--acc),var(--acc)) 0 0/15px 15px no-repeat,
    linear-gradient(var(--clay),var(--clay)) 19px 0/15px 15px no-repeat,
    linear-gradient(var(--line),var(--line)) 0 19px/15px 15px no-repeat,
    linear-gradient(var(--acc),var(--acc)) 19px 19px/15px 15px no-repeat}
.brief{margin:0 0 32px;max-width:51rem;font-size:17px}
.brief p{margin:0 0 .95em}
.brief p:last-child{margin-bottom:0}

/* ── 칸 = 테두리 머리표 ───────────────────────────── */
.frame{margin:0 0 34px}
.frame-h{margin:0 0 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.frame-no{display:inline-block;padding:3px 10px;border:1px solid var(--ink);
  font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--ink);white-space:nowrap}
.frame-no::before{content:attr(data-eyebrow)}
.frame h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.032em;line-height:1.36;flex:1 1 14em}
@media (min-width:720px){.frame h2{font-size:23px}}
.frame-s{margin:0;flex:1 1 100%;font-size:14px;color:var(--dim)}
.frame-x{margin:16px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.book{width:100%;border-collapse:collapse;font-size:15px;border:1px solid var(--line)}
.book th,.book td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.book th{width:44%;font-weight:700;color:var(--acc);font-size:12.5px;border-right:1px solid var(--line)}
@media (min-width:600px){.book th{width:28%}}

/* ── 코스 = 번호 목록 ──────────────────────────────── */
.numlist{list-style:none;margin:0;padding:0;counter-reset:nl}
.numlist>li{padding:13px 0 13px 42px;position:relative;border-bottom:1px solid var(--line)}
.numlist>li:last-child{border-bottom:0}
.numlist>li::before{content:counter(nl,decimal-leading-zero);counter-increment:nl;position:absolute;left:0;top:15px;
  font-family:var(--mono);font-size:12px;color:var(--clay);font-weight:700}
.numlist a{display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;color:var(--ink)}
.numlist a:hover{text-decoration:none;color:var(--acc)}
.n-n{font-size:17px;font-weight:800;letter-spacing:-.028em}
.n-w{font-family:var(--mono);font-size:15.5px;color:var(--acc);font-weight:700;white-space:nowrap}
.n-s{display:block;width:100%;margin-top:4px;font-size:12px;color:var(--dim)}
.n-t{margin:8px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 접수 = 두 칸 표 ───────────────────────────────── */
.steps{width:100%;border-collapse:collapse;font-size:14.5px;border-top:2px solid var(--ink)}
.steps th,.steps td{padding:12px 12px 12px 0;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.steps th{width:34%;font-weight:800;font-size:15px;color:var(--ink)}
.steps th small{display:block;font-family:var(--mono);font-size:10px;color:var(--clay);font-weight:400;letter-spacing:.14em}
.steps td{color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.asks{margin:0;counter-reset:ak}
.asks>div{padding:15px 0 15px 36px;border-bottom:1px solid var(--line);position:relative}
.asks>div:last-child{border-bottom:0}
.asks>div::before{content:counter(ak,decimal-leading-zero);counter-increment:ak;position:absolute;left:0;top:18px;
  font-family:var(--mono);font-size:11px;color:var(--clay)}
.asks h3{margin:0 0 6px;font-size:16.5px;font-weight:800;letter-spacing:-.025em}
.asks p{margin:0;font-size:15px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.heed{list-style:none;margin:0;padding:0;display:grid;gap:9px}
@media (min-width:720px){.heed{grid-template-columns:1fr 1fr}}
.heed li{background:var(--card);border:1px solid var(--line);padding:11px 13px;font-size:14px;color:var(--dim)}

/* ── 목록·링크 ─────────────────────────────────────── */
.pills{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.pills a{display:inline-block;font-size:13.5px;color:var(--ink);border:1px solid var(--line);padding:4px 11px;background:var(--card)}
.pills a:hover{border-color:var(--acc);color:var(--acc);text-decoration:none}
.cells{list-style:none;margin:0;padding:0;display:grid;gap:0;border:1px solid var(--line)}
@media (min-width:560px){.cells{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.cells{grid-template-columns:1fr 1fr 1fr}}
.cells li{border-bottom:1px solid var(--line)}
.cells a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;padding:9px 12px;color:var(--ink)}
.cells a:hover{text-decoration:none;color:var(--acc);background:var(--card)}
.cells .at a,.cells a[aria-current]{background:var(--accSoft);font-weight:700}
.c-n{font-weight:600;font-size:14.5px}
.c-s{font-family:var(--mono);font-size:10.5px;color:var(--dim);white-space:nowrap}
.jamo{margin:0}
.jamo section{margin:0 0 12px;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;
  border-bottom:1px dotted var(--line);padding-bottom:10px}
.jamo h3{margin:0;flex:0 0 2.2em;font-family:var(--mono);font-size:14px;font-weight:700;color:var(--clay)}
.jamo ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:3px 13px;flex:1 1 20em}
.jamo li{font-size:13.5px;color:var(--dim)}
.jamo a{color:var(--ink)}

/* ── 견주기 ────────────────────────────────────────── */
.vs{width:100%;border-collapse:collapse;font-size:14.5px;border:1px solid var(--line)}
.vs th,.vs td{padding:10px;text-align:left;border-bottom:1px solid var(--line)}
.vs thead th{font-size:12px;color:var(--ink);background:var(--soft);font-weight:700;border-bottom:2px solid var(--ink)}
.vs tbody th{font-weight:700}
.vs tbody tr.me th,.vs tbody tr.me td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.callbox{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#fff;
  padding:11px 22px;text-decoration:none;border:2px solid var(--accDk)}
.callbox:hover{background:var(--accDk);text-decoration:none}
.callbox-i{flex:none;display:block;width:12px;height:12px;background:#fff;
  box-shadow:5px 5px 0 0 rgba(255,255,255,.45)}
.callbox-t{display:flex;flex-direction:column;line-height:1.24;min-width:0}
.callbox-k{font-size:9.5px;letter-spacing:.22em;font-family:var(--mono);opacity:.88}
.callbox-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.callbox-s .callbox-v{font-size:15px}
.callbox-m .callbox-v{font-size:18px}
.callbox-l .callbox-v{font-size:21px}
.callbox-l{padding:13px 26px}
.callbox-b{display:flex;width:100%;justify-content:center}
.hail{border:2px solid var(--ink);background:var(--card);padding:22px;margin:0 0 34px}
.hail-p{margin:0 0 15px;font-size:16px;max-width:47rem}
.hail-s{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.porch{padding:6px 0 30px;margin:0 0 34px;border-bottom:2px solid var(--ink)}
.porch-sl{margin:0 0 15px;font-size:23px;font-weight:800;letter-spacing:-.04em;max-width:21em;line-height:1.36}
@media (min-width:720px){.porch-sl{font-size:30px}}
.porch-p{margin:0 0 22px;color:var(--dim);font-size:16px;max-width:45rem}
.porch-f{display:grid;gap:0;margin:24px 0 0;border:1px solid var(--line)}
@media (min-width:640px){.porch-f{grid-template-columns:repeat(4,1fr)}}
.porch-f div{padding:12px 14px;border-right:1px solid var(--line)}
.porch-f div:last-child{border-right:0}
.porch-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--acc)}
.porch-f dd{margin:4px 0 0;font-size:12.5px;color:var(--dim)}

/* ── 지역 고르기 = 사분면 글리프 ───────────────────
   ★이름을 두 칸으로 늘어놓지 않는다. 시도마다 네 자락 넓이를 2×2 네모의 진하기로
     그리고 그 옆에 이름을 둔다. 쏠린 쪽이 눈으로 바로 보인다. */
.quads{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:560px){.quads{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.quads{grid-template-columns:1fr 1fr 1fr}}
.quads li{border:1px solid var(--line);background:var(--card)}
.quads a{display:flex;align-items:center;gap:13px;padding:12px 14px;color:var(--ink)}
.quads a:hover{text-decoration:none;border-color:var(--acc)}
.qg{flex:none;width:44px;height:44px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px}
.qg i{display:block;background:var(--acc)}
.qinfo b{display:block;font-size:16.5px;font-weight:800;letter-spacing:-.03em}
.quads a:hover .qinfo b{color:var(--acc)}
.qinfo span{display:block;font-family:var(--mono);font-size:10.5px;color:var(--dim);margin-top:2px}
.quads li.thin{background:transparent}
.quads li.thin .qinfo b{font-weight:600;color:var(--dim)}
.quads-key{margin:16px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:13px}

/* ── 주제 묶음 링크 ────────────────────────────────── */
.routes{display:grid;gap:22px}
@media (min-width:720px){.routes{grid-template-columns:1fr 1fr}}
.route-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--clay);
  border-bottom:1px solid var(--line);padding-bottom:5px}

/* ── 글 ────────────────────────────────────────────── */
.piece{max-width:45rem;font-size:17px}
.piece h2{margin:32px 0 13px;font-size:19px;font-weight:800;display:inline-block;border:1px solid var(--ink);padding:3px 11px}
.piece p{margin:0 0 1.05em}
.piece ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.slips{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:680px){.slips{grid-template-columns:1fr 1fr}}
.slips li{border:1px solid var(--line);background:var(--card)}
.slips a{display:block;padding:14px 15px;color:var(--ink)}
.slips a:hover{text-decoration:none}
.slips b{display:block;font-size:16.5px;font-weight:800;margin-bottom:6px}
.slips a:hover b{color:var(--acc)}
.slips p{margin:0;font-size:13.5px;color:var(--dim)}
.slips time{display:block;margin-top:8px;font-family:var(--mono);font-size:10.5px;color:var(--clay)}
.code h2{margin:24px 0 9px;font-size:16.5px;font-weight:800;display:inline-block;border-bottom:2px solid var(--acc)}
.code p,.code li{font-size:15px;color:var(--dim)}
.dated{margin:0 0 16px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.sole{border-top:2px solid var(--ink);margin-top:26px;background:var(--card)}
.sole-in{max-width:var(--w);margin:0 auto;padding:30px 20px 22px;display:grid;gap:26px}
@media (min-width:860px){.sole-in{grid-template-columns:1.3fr 1fr 1fr}}
.s-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--clay)}
.s-nm{margin:0 0 8px;font-size:19px;font-weight:800;letter-spacing:-.025em}
.s-say{margin:0 0 14px;font-size:14px;color:var(--dim)}
.s-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.s-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
.s-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.s-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.sole-end div{max-width:var(--w);margin:0 auto;padding:0 20px 24px;border-top:1px solid var(--line);padding-top:18px}
.s-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.s-pale{opacity:.7}
.s-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.72}
.s-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.footbar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:2px solid var(--ink);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.footbar.down{transform:translateY(130%)}
.footbar-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.footbar{display:none}}
@media print{.footbar,.rowmenu,.hail{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.footbar'),ft=document.querySelector('.sole');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('down',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 네 칸으로 나뉜 네모 — 이 사이트가 재는 네 자락 그대로 */
const QUADMARK = (a, b, c) => `<rect x="4" y="4" width="11" height="11" fill="${a}"/>
<rect x="17" y="4" width="11" height="11" fill="${b}"/>
<rect x="4" y="17" width="11" height="11" fill="${c}"/>
<rect x="17" y="17" width="11" height="11" fill="${a}"/>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.paper}"/>${QUADMARK(t.acc, t.clay, t.line)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48"><rect width="270" height="48" fill="${t.paper}"/><g transform="translate(8,8)">${QUADMARK(t.acc, t.clay, t.line)}</g><text x="48" y="26" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${t.ink}">아우라웰니스</text><text x="48" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.clay}">AURAWELLNESS</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<g transform="translate(92,72) scale(3.2)">${QUADMARK(t.acc, t.clay, t.line)}</g>
<text x="96" y="320" font-family="system-ui,sans-serif" font-size="48" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="96" y="382" font-family="system-ui,sans-serif" font-size="25" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="96" y="430" font-family="ui-monospace,monospace" font-size="20" fill="${t.clay}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="96" y="466" width="400" height="70" fill="${t.acc}" stroke="${t.accDk}" stroke-width="4"/>
<text x="130" y="494" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${t.accSoft}">${cfg.telLabel}</text>
<text x="130" y="524" font-family="ui-monospace,monospace" font-size="26" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'awn.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'awn.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const QUADLOGO = (t = THEME) => `<svg class="qmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${QUADMARK(t.acc, t.clay, t.line)}</svg>`;
