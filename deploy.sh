#!/usr/bin/env bash
# 构建法务站并发布到 GitHub Pages(gh-pages 分支根目录)。
# 用分支部署而非 Actions:当前 gh token 无 workflow scope,建不了工作流。
# 改完 content/*.md 后跑 ./deploy.sh 即上线(约 1 分钟后 https://ziyue.app 生效)。
set -e
cd "$(dirname "$0")"

npm run build

cd dist
git init -b gh-pages -q
git add -A
git -c user.name="ziyue-web" -c user.email="deploy@ziyue.app" commit -q -m "deploy $(date +%F' '%H:%M)"
git push -f "https://github.com/JohnnyHooo/ziyue-web.git" gh-pages
rm -rf .git   # 移除临时 git,dist/ 保持干净

echo "✓ 已发布到 gh-pages → https://ziyue.app"
