// 紫月塔罗 · 法务静态站构建:content/*.md → dist/{terms,privacy}/index.html + 落地页 index.html
// 运行:npm i && npm run build。产物在 dist/,部署到 ziyue.app 顶域。

import MarkdownIt from 'markdown-it'
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs'
import { dirname } from 'node:path'

const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: false })

const SITE = '紫月塔罗'
const YEAR = 2026

// 页面壳(移动端优先 / 系统宋体标题 / 深色模式 / 无 AI 味)
function shell({ title, desc, body, doc = false }) {
  return `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title} · ${SITE}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index,follow">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/icon.png">
<link rel="apple-touch-icon" href="/icon.png">
<style>
:root{
  --bg:#FBFBFD; --card:#FFFFFF; --ink:#1A1B22; --muted:#6B6C7A; --hair:#EAEAF0;
  --accent:#6B4EFF; --accent-soft:#F1EEFF; --maxw:720px;
  --serif:"Songti SC","Noto Serif SC","SimSun",ui-serif,serif;
  --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{ --bg:#0F0F14; --card:#17171F; --ink:#ECECF2; --muted:#9A9AA8; --hair:#26262F;
         --accent:#9E8BFF; --accent-soft:#20202C; }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  line-height:1.8;font-size:16px;-webkit-font-smoothing:antialiased;
  padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:var(--maxw);margin:0 auto;padding:20px 24px 72px}
header.top{max-width:var(--maxw);margin:0 auto;padding:18px 24px;display:flex;align-items:center;gap:10px}
header.top a.brand{color:var(--muted);font-weight:600;font-size:14px}
header.top a.brand b{color:var(--ink);font-family:var(--serif)}

/* 文档正文 */
.doc h1{font-family:var(--serif);font-size:27px;line-height:1.35;font-weight:700;margin:8px 0 2px}
.doc h2{font-family:var(--serif);font-size:20px;font-weight:700;margin:38px 0 12px;padding-left:12px;
  border-left:3px solid var(--accent)}
.doc h3{font-size:16px;font-weight:700;margin:24px 0 8px;color:var(--ink)}
.doc p{margin:12px 0;color:var(--ink)}
.doc strong{font-weight:700;color:var(--ink)}
.doc ul,.doc ol{margin:12px 0;padding-left:22px}
.doc li{margin:7px 0}
.doc blockquote{margin:16px 0;padding:12px 16px;background:var(--accent-soft);
  border-left:3px solid var(--accent);border-radius:0 10px 10px 0;color:var(--muted);font-size:14.5px}
.doc blockquote p{margin:4px 0}
.doc hr{border:0;border-top:1px solid var(--hair);margin:32px 0}
.doc em{color:var(--muted);font-style:normal}
/* 生效日期等 meta:文档开头前两段加粗行淡化 */
.doc > p:first-of-type,.doc > p:nth-of-type(2){color:var(--muted);font-size:13.5px;margin:2px 0}

footer.foot{max-width:var(--maxw);margin:0 auto;padding:28px 24px 40px;border-top:1px solid var(--hair);
  color:var(--muted);font-size:13px}
footer.foot .links{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px}
footer.foot a{color:var(--muted)}

/* 官网单页 */
.site{max-width:var(--maxw);margin:0 auto;padding:0 24px 20px}
.hero{padding:11vh 0 42px;text-align:center;max-width:560px;margin:0 auto}
.hero .appicon{width:92px;height:92px;border-radius:21px;box-shadow:0 10px 34px rgba(60,40,120,.18)}
.hname{font-family:var(--serif);font-size:38px;font-weight:700;letter-spacing:1px;margin:22px 0 0}
.htag{color:var(--accent);font-weight:600;font-size:16px;margin:9px 0 0}
.hlead{color:var(--muted);font-size:15px;line-height:1.85;margin:18px auto 26px;max-width:470px}
.hent{color:var(--muted);font-size:12.5px;margin:16px 0 0;opacity:.85}

/* App Store 按钮 */
.appstore{display:inline-flex;align-items:center;gap:9px;background:#000;color:#fff;
  padding:10px 20px 10px 16px;border-radius:13px;text-decoration:none}
.appstore:hover{text-decoration:none;opacity:.88}
.appstore svg{flex:none}
.as-txt{display:flex;flex-direction:column;line-height:1.12;text-align:left}
.as-txt small{font-size:10px;opacity:.9;font-weight:400}
.as-txt b{font-size:17px;font-weight:600;letter-spacing:.2px}
@media (prefers-color-scheme: dark){ .appstore{background:#fff;color:#000} }

/* 功能 */
.features{display:grid;gap:14px;margin:4px 0 46px}
.feat{display:flex;gap:14px;align-items:flex-start;background:var(--card);
  border:1px solid var(--hair);border-radius:16px;padding:18px}
.fic{flex:none;width:42px;height:42px;border-radius:11px;background:var(--accent-soft);
  display:flex;align-items:center;justify-content:center;color:var(--accent)}
.ficon{width:22px;height:22px}
.feat h3{font-size:16px;font-weight:700;margin:1px 0 5px}
.feat p{color:var(--muted);font-size:14px;line-height:1.7;margin:0}
@media (min-width:600px){ .features{grid-template-columns:1fr 1fr} }

/* 收尾 CTA + 页脚 */
.cta{text-align:center;padding:8px 0 44px}
.cta h2{font-family:var(--serif);font-size:24px;font-weight:700;margin:0 0 20px}
.site-foot{text-align:center;border-top:1px solid var(--hair);padding:26px 0 20px;
  color:var(--muted);font-size:13px}
.site-foot .links{display:flex;justify-content:center;gap:20px;margin-bottom:10px}
.site-foot a{color:var(--muted)}
@media (max-width:480px){ .wrap{padding:16px 18px 64px} .doc h1{font-size:24px}
  .hero{padding:8vh 0 36px} .hname{font-size:32px} }
</style>
</head>
<body>
${body}
</body>
</html>`
}

function renderDoc({ mdFile, out, title, desc }) {
  const src = readFileSync(new URL(`./content/${mdFile}`, import.meta.url), 'utf8')
  const html = md.render(src)
  // 纯单页:只有正文,无顶部返回、无页脚
  const body = `<main class="wrap"><article class="doc">${html}</article></main>`
  const page = shell({ title, desc, body, doc: true })
  const path = new URL(`./dist/${out}`, import.meta.url)
  mkdirSync(dirname(path.pathname), { recursive: true })
  writeFileSync(path, page)
  console.log('  ✓', out, `(${(page.length / 1024).toFixed(1)}KB)`)
}

// 清空 dist
rmSync(new URL('./dist', import.meta.url), { recursive: true, force: true })
mkdirSync(new URL('./dist', import.meta.url), { recursive: true })
// App 图标(官网 hero / favicon)
copyFileSync(new URL('./assets/icon-256.png', import.meta.url), new URL('./dist/icon.png', import.meta.url))

console.log('构建站点:')

renderDoc({
  mdFile: 'terms.zh-Hans.md', out: 'terms/index.html',
  title: '用户协议', desc: '紫月塔罗用户协议',
})
renderDoc({
  mdFile: 'privacy.zh-Hans.md', out: 'privacy/index.html',
  title: '隐私政策', desc: '紫月塔罗隐私政策',
})

// 官网单页
const APPSTORE = 'https://apps.apple.com/app/id6784248226'
const appleLogo = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 8.02 7.37c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.51 4.04l.01-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`
const appstoreBtn = `<a class="appstore" href="${APPSTORE}" target="_blank" rel="noopener">${appleLogo}<span class="as-txt"><small>Download on the</small><b>App Store</b></span></a>`
const fic = (d) => `<svg class="ficon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`

const FEATURES = [
  { i: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.9 3.5 6.6 6.6 0 0 0 20.5 13.2z"/>',
    t: 'AI 智能解读', d: '输入你的问题,抽牌后由「紫月」结合牌义,生成贴合你处境的解读,而不是套话。' },
  { i: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"/>',
    t: '今日运势', d: '每天第一次占卜翻开的第一张牌,就是你这一天的运势主题。' },
  { i: '<rect x="3.5" y="4" width="6.5" height="16" rx="1.6"/><rect x="14" y="4" width="6.5" height="16" rx="1.6"/>',
    t: '多种占卜场景', d: '爱情、事业、财运、抉择、人际,或用「宇宙占卜」自由提问。' },
  { i: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17.5v3"/>',
    t: '沉浸式与语音', d: '用语音说出你想问的,听紫月把解读慢慢读给你听。' },
  { i: '<path d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 0-2 2z"/><path d="M18 20a2 2 0 0 0-2-2H5"/>',
    t: '78 张牌义与图鉴', d: '完整正逆位牌义,多种牌面风格随心切换。' },
  { i: '<path d="M7 18a4 4 0 0 1-.5-7.97 5.5 5.5 0 0 1 10.6-1 3.75 3.75 0 0 1-.1 8.97z"/>',
    t: '记录与同步', d: '占卜记录本地保存,会员可跨设备 iCloud 同步。' },
]

const home = `<main class="site">
  <section class="hero">
    <img class="appicon" src="/icon.png" alt="${SITE}" width="92" height="92">
    <h1 class="hname">${SITE}</h1>
    <p class="htag">你的 AI 塔罗占卜师</p>
    <p class="hlead">抽牌、解读、每日运势——紫月把塔罗几百年沉淀的象征语言学了个透,再用 AI 组织成一段说得通的话讲给你听。深夜想问就问,它始终冷静地陪你把心里的事理清楚。</p>
    ${appstoreBtn}
    <p class="hent">仅供娱乐,不构成任何专业建议</p>
  </section>

  <section class="features">
    ${FEATURES.map(f => `<div class="feat"><span class="fic">${fic(f.i)}</span><div><h3>${f.t}</h3><p>${f.d}</p></div></div>`).join('\n    ')}
  </section>

  <section class="cta">
    <h2>现在就问问紫月</h2>
    ${appstoreBtn}
  </section>

  <footer class="site-foot">
    <div class="links"><a href="/terms/">用户协议</a><a href="/privacy/">隐私政策</a></div>
    <div>© ${YEAR} ${SITE}</div>
  </footer>
</main>`
writeFileSync(new URL('./dist/index.html', import.meta.url), shell({
  title: 'AI 塔罗占卜', desc: '紫月塔罗——你的 AI 塔罗占卜师。抽牌、解读、每日运势,仅供娱乐。', body: home,
}))
console.log('  ✓ index.html(官网)')

// GitHub Pages 自定义域名(顶域 ziyue.app)
writeFileSync(new URL('./dist/CNAME', import.meta.url), 'ziyue.app\n')
console.log('  ✓ CNAME (ziyue.app)')
console.log('完成 → dist/')
