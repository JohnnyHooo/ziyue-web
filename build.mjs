// 紫月塔罗官网 + 法务站构建。
// 落地页 6 语(zh/en/ja/ko/it/th)+ 法务页(zh、en);产物 dist/,部署 ziyue.app(GitHub Pages)。
// 运行:npm i && npm run build。改文案改本文件或 content/*.md → npm run build → ./deploy.sh。

import MarkdownIt from 'markdown-it'
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: false })
const YEAR = 2026
const APPSTORE = 'https://apps.apple.com/app/id6784248226'

// —— 落地页多语言文案 ——
// path:该语言落地页 URL 前缀('' = 根 /);legal:该语言法务链接前缀(zh 用中文法务 /terms;其余用英文 /en/terms)
const LOCALES = {
  zh: { lang: 'zh-Hans', name: '紫月塔罗', label: '中文', path: '', legal: '',
        title: '紫月塔罗 · AI 塔罗占卜', desc: '紫月塔罗——你的 AI 塔罗占卜师。心里有事，就问问塔罗。仅供娱乐。',
        terms: '用户协议', privacy: '隐私政策',
        ent: '本应用仅供娱乐，占卜内容不构成任何专业建议，不能替代医疗、心理、法律、财务等专业意见，请勿作为决策依据。',
        headlines: ['心里有事，就问问塔罗', '此刻，你最想问什么', '把心里的事，轻轻放下来', '有什么，正悬在你心上', '今天，想为自己问点什么', '让塔罗，陪你理清思绪', '想问的事，从这里开始', '静下心，问问此刻的自己'] },
  en: { lang: 'en', name: 'Ziyue Tarot', label: 'English', path: 'en/', legal: '/en',
        title: 'Ziyue Tarot · AI Tarot Reading', desc: 'Ziyue Tarot — your AI tarot reader. Something on your mind? Ask the cards. For entertainment only.',
        terms: 'Terms', privacy: 'Privacy',
        ent: 'This app is for entertainment only. Divination content is not professional advice and cannot replace medical, psychological, legal, financial or other professional opinions — please do not rely on it for decisions.',
        headlines: ['Something on your mind? Ask the cards', 'What do you most want to ask right now?', 'Set down what weighs on you', "What's lingering in your heart?", 'What would you ask for yourself today?', 'Let tarot help you clear your mind', 'Whatever you wish to ask, start here', 'Settle in, ask yourself now'] },
  ja: { lang: 'ja', name: '紫月タロット', label: '日本語', path: 'ja/', legal: '/en',
        title: '紫月タロット · AIタロット占い', desc: '紫月タロット — あなたのAIタロット占い師。カードを引き、読み解く。娯楽用。',
        terms: '利用規約', privacy: 'プライバシー',
        ent: '本アプリは娯楽のみを目的としています。占いの内容はいかなる専門的助言でもなく、医療・心理・法律・金融などの専門的意見に代わるものではありません。意思決定の根拠にしないでください。',
        headlines: ['心に何かあるなら、タロットに尋ねて', '今、いちばん聞きたいことは？', '心の重みを、そっと下ろして', '心に引っかかっていることは？', '今日は自分のために何を聞きたい？', 'タロットと一緒に、思いを整理しよう', '聞きたいことは、ここから始めて', '心を静めて、今の自分に尋ねて'] },
  ko: { lang: 'ko', name: '자월 타로', label: '한국어', path: 'ko/', legal: '/en',
        title: '자월 타로 · AI 타로 리딩', desc: '자월 타로 — 당신의 AI 타로 리더. 카드를 뽑고 해석해 드려요. 오락용.',
        terms: '이용약관', privacy: '개인정보',
        ent: '이 앱은 오락 목적으로만 제공됩니다. 점술 내용은 어떠한 전문적 조언도 아니며 의료·심리·법률·금융 등 전문가의 의견을 대신할 수 없습니다. 의사 결정의 근거로 삼지 마세요.',
        headlines: ['마음에 걸리는 게 있다면, 타로에게 물어보세요', '지금, 가장 묻고 싶은 건 무엇인가요', '마음속 일을, 살며시 내려놓아 보세요', '무엇이 마음에 걸려 있나요', '오늘, 자신을 위해 무엇을 물어볼까요', '타로가, 생각을 정리하도록 함께할게요', '묻고 싶은 일을, 여기서 시작하세요', '마음을 가라앉히고, 지금의 자신에게 물어보세요'] },
  it: { lang: 'it', name: 'Ziyue Tarot', label: 'Italiano', path: 'it/', legal: '/en',
        title: 'Ziyue Tarot · Lettura dei tarocchi con IA', desc: 'Ziyue Tarot — il tuo lettore di tarocchi con IA. Solo a scopo di intrattenimento.',
        terms: 'Termini', privacy: 'Privacy',
        ent: 'Questa app è solo a scopo di intrattenimento. I contenuti divinatori non costituiscono alcun parere professionale e non possono sostituire pareri medici, psicologici, legali o finanziari — non usarli come base per le tue decisioni.',
        headlines: ['Hai qualcosa nel cuore? Chiedi ai tarocchi', 'In questo momento, cosa vuoi chiedere', 'Posa dolcemente ciò che hai nel cuore', 'Cosa ti pesa sul cuore', 'Oggi, cosa vuoi chiedere per te', 'Lascia che i tarocchi ti aiutino a riordinare i pensieri', 'Ciò che vuoi chiedere inizia da qui', 'Calmati e interroga il tuo io di adesso'] },
  th: { lang: 'th', name: 'Ziyue Tarot', label: 'ไทย', path: 'th/', legal: '/en',
        title: 'Ziyue Tarot · ดูไพ่ทาโรต์ด้วย AI', desc: 'Ziyue Tarot — นักอ่านไพ่ทาโรต์ AI ของคุณ เพื่อความบันเทิงเท่านั้น',
        terms: 'ข้อกำหนด', privacy: 'ความเป็นส่วนตัว',
        ent: 'แอปนี้มีไว้เพื่อความบันเทิงเท่านั้น เนื้อหาการทำนายไม่ถือเป็นคำแนะนำจากผู้เชี่ยวชาญ และไม่สามารถใช้แทนความเห็นทางการแพทย์ จิตวิทยา กฎหมาย หรือการเงินได้ โปรดอย่าใช้เป็นเกณฑ์ในการตัดสินใจ',
        headlines: ['มีอะไรในใจ ก็ลองถามทาโรต์', 'ตอนนี้ คุณอยากถามอะไรที่สุด', 'เรื่องในใจ ค่อย ๆ วางลงเถอะ', 'มีอะไรค้างคาอยู่ในใจคุณ', 'วันนี้ อยากถามอะไรเพื่อตัวเอง', 'ให้ทาโรต์ช่วยคุณเรียบเรียงความคิด', 'เรื่องที่อยากถาม เริ่มต้นจากตรงนี้', 'สงบใจ ลองถามตัวเองในตอนนี้'] },
}
const ORDER = ['zh', 'en', 'ja', 'ko', 'it', 'th']

// 构建期用 qrcode-generator(仅构建依赖,不下发)生成 App Store 链接的二维码 SVG,内联到页面
const qrLib = readFileSync(new URL('./vendor/qrcode.js', import.meta.url), 'utf8')
const qrcode = new Function(qrLib + '\nreturn qrcode;')()
const _qr = qrcode(0, 'M'); _qr.addData(APPSTORE); _qr.make()
const qrSvg = _qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true })

const appleLogo = `<svg viewBox="0 0 384 512" width="17" height="21" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`
const appstoreBtn = `<a class="appstore" href="${APPSTORE}" target="_blank" rel="noopener">${appleLogo}<span class="as-txt"><small>Download on the</small><b>App Store</b></span></a>`

const STYLE = `
:root{
  --bg:#FAFAF8; --card:#FFFFFF; --ink:#231F2A; --muted:#6E687A; --hair:#ECE8E2;
  --accent:#6E52A6; --accent-soft:#F1EDF7; --maxw:720px;
  --serif:"Songti SC","Noto Serif SC","SimSun",ui-serif,serif;
  --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans","Apple SD Gothic Neo","Microsoft YaHei",system-ui,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{ --bg:#0F0E15; --card:#17161F; --ink:#ECEAF2; --muted:#938DA6; --hair:#26232F; --accent:#B9A7EC; --accent-soft:#1D1B27; }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.8;font-size:16px;
  -webkit-font-smoothing:antialiased;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);}
a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
/* 法务文档正文(纯单页) */
.wrap{max-width:var(--maxw);margin:0 auto;padding:20px 24px 72px}
.doc h1{font-family:var(--serif);font-size:27px;line-height:1.35;font-weight:700;margin:8px 0 2px}
.doc h2{font-family:var(--serif);font-size:20px;font-weight:700;margin:38px 0 12px;padding-left:12px;border-left:3px solid var(--accent)}
.doc h3{font-size:16px;font-weight:700;margin:24px 0 8px;color:var(--ink)}
.doc p{margin:12px 0;color:var(--ink)} .doc strong{font-weight:700;color:var(--ink)}
.doc ul,.doc ol{margin:12px 0;padding-left:22px} .doc li{margin:7px 0}
.doc blockquote{margin:16px 0;padding:12px 16px;background:var(--accent-soft);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;color:var(--muted);font-size:14.5px}
.doc blockquote p{margin:4px 0}
.doc hr{border:0;border-top:1px solid var(--hair);margin:32px 0}
.doc em{color:var(--muted);font-style:normal}
.doc > p:first-of-type,.doc > p:nth-of-type(2){color:var(--muted);font-size:13.5px;margin:2px 0}

/* 官网首页:仿 App 首页 Banner(黑底 + 紫微光 + 底部发光 + 星点 + 紫月球) */
body.home-page{ --ink:#F4F0FB; --muted:rgba(240,236,250,.55); --hair:rgba(255,255,255,.14); --card:#191521; --accent:#C6A8FF;
  color:#fff; background:#050409;
  background-image:radial-gradient(640px 500px at 50% 20%, rgba(139,91,214,.24), transparent 62%), radial-gradient(1000px 360px at 50% 118%, rgba(139,91,214,.42), transparent 72%);
  background-attachment:fixed; }
body.home-page::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    radial-gradient(1.3px 1.3px at 12% 22%, rgba(255,255,255,.55), transparent),
    radial-gradient(1px 1px at 82% 16%, rgba(255,255,255,.42), transparent),
    radial-gradient(1px 1px at 67% 33%, rgba(255,255,255,.36), transparent),
    radial-gradient(1.4px 1.4px at 25% 60%, rgba(255,255,255,.32), transparent),
    radial-gradient(1px 1px at 90% 56%, rgba(255,255,255,.36), transparent),
    radial-gradient(1px 1px at 41% 12%, rgba(255,255,255,.3), transparent),
    radial-gradient(1px 1px at 57% 74%, rgba(255,255,255,.28), transparent),
    radial-gradient(1.2px 1.2px at 8% 46%, rgba(255,255,255,.32), transparent),
    radial-gradient(1px 1px at 74% 82%, rgba(255,255,255,.26), transparent);}
body.home-page .appstore{background:#fff;color:#141018}
.lp{position:relative;z-index:1;min-height:100dvh;display:flex;flex-direction:column;max-width:600px;margin:0 auto;padding:0 30px}
/* 右上角语言下拉(details/summary,免 JS 展开) */
.langsw{position:fixed;top:14px;right:16px;z-index:20}
.langsw summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
  padding:7px 12px;border-radius:999px;font-size:13px;color:var(--ink);
  background:rgba(255,255,255,.07);border:1px solid var(--hair);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.langsw summary::-webkit-details-marker{display:none} .langsw summary::marker{content:""}
.langsw .globe{width:15px;height:15px;opacity:.85} .langsw .cur{opacity:.95}
.langsw .chev{width:11px;height:11px;opacity:.6;transition:transform .2s}
.langsw[open] .chev{transform:rotate(180deg)}
.langmenu{position:absolute;top:calc(100% + 8px);right:0;min-width:134px;
  background:var(--card);border:1px solid var(--hair);border-radius:14px;padding:6px;
  box-shadow:0 18px 44px rgba(0,0,0,.35);display:flex;flex-direction:column}
.langmenu a{padding:9px 12px;border-radius:9px;color:var(--muted);font-size:13.5px}
.langmenu a:hover{background:rgba(255,255,255,.08);color:var(--ink);text-decoration:none}
.langmenu a.on{color:var(--ink);font-weight:600}
.lp-hero{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 0 44px}
.orb{width:min(300px,74vw);height:min(320px,78vw);display:block;margin:0 auto 4px;pointer-events:none}
.lp-title{font-family:var(--serif);font-size:27px;font-weight:600;line-height:1.4;letter-spacing:.02em;margin:6px 0 0;color:var(--ink);transition:opacity .38s ease;min-height:2.6em;display:flex;align-items:center;max-width:520px}
.lp-cta{margin:34px 0 0}
.lp-foot{text-align:center;padding:22px 24px 34px;color:var(--muted);font-size:13px}
.lp-foot .lp-ent{margin:0 auto 14px;font-size:11.5px;line-height:1.85;letter-spacing:.01em;opacity:.5;max-width:440px}
.lp-foot .foot-nav{margin-bottom:10px} .lp-foot a{color:var(--muted)} .lp-foot .sep{margin:0 12px;opacity:.4}
.lp-foot .cr{opacity:.6;font-size:12px;letter-spacing:.02em}

/* App Store 按钮 */
.appstore{display:inline-flex;align-items:center;gap:9px;background:var(--ink);color:var(--bg);padding:11px 20px 11px 16px;border-radius:14px;text-decoration:none}
.appstore:hover{text-decoration:none;opacity:.9} .appstore svg{flex:none}
.as-txt{display:flex;flex-direction:column;line-height:1.12;text-align:left}
.as-txt small{font-size:10px;opacity:.9;font-weight:400} .as-txt b{font-size:17px;font-weight:600;letter-spacing:.2px}
/* hover 二维码浮窗(构建期内联 SVG) */
.dl{position:relative;display:inline-block}
.qrpop{position:absolute;bottom:calc(100% + 12px);left:50%;z-index:5;transform:translateX(-50%) translateY(6px) scale(.96);transform-origin:bottom center;
  background:var(--card);border:1px solid var(--hair);border-radius:16px;padding:12px;box-shadow:0 16px 44px rgba(40,28,72,.18);
  opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s ease, transform .2s ease, visibility .2s}
.dl:hover .qrpop, .dl:focus-within .qrpop{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0) scale(1)}
.qrpop::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-top-color:var(--card)}
.qr{width:132px;height:132px;background:#fff;border-radius:9px;padding:9px;box-sizing:border-box} .qr svg{display:block;width:100%;height:100%}
@media (hover:none){ .qrpop{display:none} }`

function shell({ lang, title, desc, body, home = false }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index,follow">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/icon.jpg">
<link rel="apple-touch-icon" href="/icon.jpg">
<style>${STYLE}</style>
</head>
<body class="${home ? 'home-page' : 'doc-page'}">
${body}
</body>
</html>`
}

// 右上角语言下拉切换
function switcher(cur) {
  const globe = `<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/></svg>`
  const chev = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`
  const items = ORDER.map(k => {
    const L = LOCALES[k]
    return `<a class="${k === cur ? 'on' : ''}" href="/${L.path}" onclick="try{localStorage.setItem('ziyue.lang','${k}')}catch(e){}">${L.label}</a>`
  }).join('')
  return `<details class="langsw"><summary aria-label="Language">${globe}<span class="cur">${LOCALES[cur].label}</span>${chev}</summary><div class="langmenu">${items}</div></details>`
}

// 落地页(banner 样式)
function landing(key) {
  const L = LOCALES[key]
  // 仅根(zh)做浏览器语言自动跳转(用户手动选过则不跳)
  const autoRedirect = key === 'zh' ? `<script>
(function(){try{
  if(localStorage.getItem('ziyue.lang'))return;
  var m={en:'en',ja:'ja',ko:'ko',it:'it',th:'th'};
  var l=(navigator.language||'').slice(0,2).toLowerCase();
  if(m[l])location.replace('/'+m[l]+'/');
}catch(e){}})();
</script>` : ''
  const body = `${autoRedirect}<main class="lp">
  ${switcher(key)}
  <div class="lp-hero">
    <canvas id="orb" class="orb" aria-hidden="true"></canvas>
    <h1 class="lp-title" id="headline">${L.headlines[0]}</h1>
    <div class="lp-cta">
      <div class="dl">
        ${appstoreBtn}
        <div class="qrpop" role="tooltip"><div class="qr">${qrSvg}</div></div>
      </div>
    </div>
  </div>
  <footer class="lp-foot">
    <p class="lp-ent">${L.ent}</p>
    <div class="foot-nav"><a href="${L.legal}/terms/">${L.terms}</a><span class="sep">·</span><a href="${L.legal}/privacy/">${L.privacy}</a></div>
    <div class="cr">© ${YEAR} ${L.name}</div>
  </footer>
</main>
<script src="/orb.js" defer></script>
<script>
(function(){
  var hs=${JSON.stringify(L.headlines)};
  var el=document.getElementById('headline');
  if(el&&hs.length>1){var i=0;setInterval(function(){i=(i+1)%hs.length;el.style.opacity='0';
    setTimeout(function(){el.textContent=hs[i];el.style.opacity='1';},380);},5200);}
  document.addEventListener('click',function(e){
    var d=document.querySelector('.langsw[open]');
    if(d&&!d.contains(e.target))d.removeAttribute('open');
  });
})();
</script>`
  const out = L.path + 'index.html'
  const path = new URL(`./dist/${out}`, import.meta.url)
  mkdirSync(dirname(path.pathname), { recursive: true })
  writeFileSync(path, shell({ lang: L.lang, title: L.title, desc: L.desc, body, home: true }))
  console.log('  ✓', out || 'index.html', `(${L.label})`)
}

// 法务页(纯单页,zh + en)
function renderDoc({ mdFile, out, lang, title, desc }) {
  const src = readFileSync(new URL(`./content/${mdFile}`, import.meta.url), 'utf8')
  const body = `<main class="wrap"><article class="doc">${md.render(src)}</article></main>`
  const path = new URL(`./dist/${out}`, import.meta.url)
  mkdirSync(dirname(path.pathname), { recursive: true })
  writeFileSync(path, shell({ lang, title, desc, body }))
  console.log('  ✓', out)
}

// —— 构建 ——
rmSync(new URL('./dist', import.meta.url), { recursive: true, force: true })
mkdirSync(new URL('./dist', import.meta.url), { recursive: true })
copyFileSync(new URL('./src/orb.js', import.meta.url), new URL('./dist/orb.js', import.meta.url))
copyFileSync(new URL('./src/icon.jpg', import.meta.url), new URL('./dist/icon.jpg', import.meta.url))
writeFileSync(new URL('./dist/CNAME', import.meta.url), 'ziyue.app\n')

console.log('构建落地页(6 语):')
for (const k of ORDER) landing(k)

console.log('构建法务页:')
renderDoc({ mdFile: 'terms.zh-Hans.md', out: 'terms/index.html', lang: 'zh-Hans', title: '用户协议 · 紫月塔罗', desc: '紫月塔罗用户协议' })
renderDoc({ mdFile: 'privacy.zh-Hans.md', out: 'privacy/index.html', lang: 'zh-Hans', title: '隐私政策 · 紫月塔罗', desc: '紫月塔罗隐私政策' })
if (existsSync(new URL('./content/terms.en.md', import.meta.url)))
  renderDoc({ mdFile: 'terms.en.md', out: 'en/terms/index.html', lang: 'en', title: 'Terms of Service · Ziyue Tarot', desc: 'Ziyue Tarot Terms of Service' })
if (existsSync(new URL('./content/privacy.en.md', import.meta.url)))
  renderDoc({ mdFile: 'privacy.en.md', out: 'en/privacy/index.html', lang: 'en', title: 'Privacy Policy · Ziyue Tarot', desc: 'Ziyue Tarot Privacy Policy' })

console.log('完成 → dist/')
