// 紫月塔罗 · 法务静态站构建:content/*.md → dist/{terms,privacy}/index.html + 落地页 index.html
// 运行:npm i && npm run build。产物在 dist/,部署到 ziyue.app 顶域。

import MarkdownIt from 'markdown-it'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
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

/* 落地页 */
.home{max-width:var(--maxw);margin:0 auto;padding:14vh 24px 40px;min-height:70vh}
.home .name{font-family:var(--serif);font-size:34px;font-weight:700;letter-spacing:.5px}
.home .tag{color:var(--muted);margin:10px 0 34px;font-size:15px}
.home .card{display:flex;flex-direction:column;background:var(--card);border:1px solid var(--hair);
  border-radius:16px;overflow:hidden}
.home .card a{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;
  color:var(--ink);font-weight:600;font-size:15.5px}
.home .card a + a{border-top:1px solid var(--hair)}
.home .card a span.arw{color:var(--muted);font-weight:400}
@media (max-width:480px){ .wrap{padding:16px 18px 64px} header.top{padding:14px 18px} .doc h1{font-size:24px} }
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

console.log('构建法务站:')

renderDoc({
  mdFile: 'terms.zh-Hans.md', out: 'terms/index.html',
  title: '用户协议', desc: '紫月塔罗用户协议',
})
renderDoc({
  mdFile: 'privacy.zh-Hans.md', out: 'privacy/index.html',
  title: '隐私政策', desc: '紫月塔罗隐私政策',
})

// 落地页
const home = `<main class="home">
  <div class="name">${SITE}</div>
  <div class="tag">AI 塔罗占卜 · 仅供娱乐</div>
  <div class="card">
    <a href="/terms/">用户协议 <span class="arw">›</span></a>
    <a href="/privacy/">隐私政策 <span class="arw">›</span></a>
  </div>
</main>
<footer class="foot"><div>© ${YEAR} ${SITE}</div></footer>`
writeFileSync(new URL('./dist/index.html', import.meta.url), shell({
  title: '首页', desc: '紫月塔罗 · AI 塔罗占卜', body: home,
}))
console.log('  ✓ index.html')

// GitHub Pages 自定义域名(顶域 ziyue.app)
writeFileSync(new URL('./dist/CNAME', import.meta.url), 'ziyue.app\n')
console.log('  ✓ CNAME (ziyue.app)')
console.log('完成 → dist/')
