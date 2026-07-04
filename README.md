# ziyue-web

紫月塔罗 法务 / 落地静态站,部署到 **ziyue.app** 顶域(GitHub Pages)。

- 内容源:`content/*.md`(用户协议、隐私政策)
- 构建:`npm i && npm run build` → 产物在 `dist/`(`/terms/`、`/privacy/`、落地页 `/`)
- 部署:`./deploy.sh` → 构建并把 `dist/` 强推到 `gh-pages` 分支(GitHub Pages 服务该分支根目录)。
  用分支部署而非 Actions:当前 gh token 无 `workflow` scope。
- 自定义域名:`dist/CNAME` = `ziyue.app`(GitHub Pages 自动签发 HTTPS)

改文案:改 `content/*.md` → 跑 `./deploy.sh` → 约 1 分钟上线。App 内《用户协议》《隐私政策》链接指向 `https://ziyue.app/terms`、`/privacy`(`AppConfig.webBaseURL`)。
