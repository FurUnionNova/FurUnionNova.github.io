# 绒萌的赛博手记

一个纯静态的个人博客：HTML + CSS + 原生 JS，零依赖、零构建、断网可看。

## 结构（三级）

1. **一级页 `index.html`**：欢迎页。满屏兽设背景 + “欢迎来到我的 blog” + **点击进入**。
2. **二级页 `home.html`**：入口卡片。目前 3 张（博客 / 关于 / 图集）+ 3 张空白占位卡，以后继续往网格里加。
3. **三级页**：
   - `blog.html`：博客索引，标签筛选（全部 / DSH / 折腾 / 前端）+ 空状态；
   - `about.html`：关于我、F.U.N. 企划、折腾史；
   - `gallery.html`：兽设图集，点图看原图；
   - `posts/placeholder.html`：文章页占位，用来预览排版。

> 当前状态：三篇示例文章已移到 `../private/drafts/posts/`（不在部署目录里），博客索引显示“暂无文章”，文章页用占位页代替。等要写内容时再按下面的步骤加回来。

## 本地打开

双击 `index.html` 即可，不需要服务器、不需要安装任何东西。

## 目录

```
blog/
├─ index.html          # 一级页：欢迎页
├─ home.html           # 二级页：入口卡片（3 个 + 3 个空白）
├─ blog.html           # 三级页：博客索引 + 标签筛选
├─ about.html          # 三级页：关于
├─ gallery.html        # 三级页：图集
├─ 404.html            # 404
├─ _template.html      # 新文章模板（不对外链接）
├─ posts/              # 文章（目前只有 placeholder.html 占位页）
├─ assets/
│  ├─ style.css        # 全部样式 + 动画
│  ├─ blog.js          # 主题、目录、进度、复制、标签筛选
│  ├─ music.js         # Web Audio 背景音乐（无音频文件）
│  ├─ transition.js    # 旧页淡出 / 新页淡入
│  └─ img/             # 头像、兽设图、分享封面、星形光标
├─ tools/check.mjs     # 零依赖自检
└─ docs/               # 截图
```

## 加一篇新文章

1. 复制 `_template.html` 到 `posts/你的文件名.html`（英文、短横线）。
2. 改 `<title>`、`<meta name="description">`、`<h1>`、`<time datetime="YYYY-MM-DD">` 和标签。
3. 正文写在 `<div class="prose">` 里，用 `h2` / `h3` / `p` / `ul` / `pre><code`。
4. 打开 `blog.html`，在 `.post-grid` 里加一张卡片，改链接、日期、标题、摘要、标签，并加上 `data-post-tag="dsh 折腾"`（空格分隔）；同时把“暂无文章”的空状态删掉。
5. 如果加了新标签，在 `.filters` 里补一个按钮（`data-filter` 与 `data-post-tag` 里的词对应）。
6. 跑一次自检：

```sh
node tools/check.mjs
```

## 换图片

- 头像：`assets/img/avatar.webp`（正方形，建议 512×512）
- 兽设图：`assets/img/fursona-01/02/03/05/06/08.webp`（只放约稿；设定图在 `../private/fursona/ref/`，不部署）
- 分享封面：`assets/img/og-cover.webp`（1200×630）
- 欢迎页背景：`index.html` 的 `welcome-bg`（默认 `fursona-08.webp`）
- 菜单页背景：`home.html` 的 `portal-bg`（默认 `fursona-08.webp`）
- 入口卡片图：`assets/img/fursona-xx-card.webp`（深色底合成，和卡片底栏同色；手机另有一份 `-card-480.webp`）

图集页用的是原始比例，不裁切；换图后记得改 `gallery.html` 里的 `alt` 和 `figcaption`。

## 加载速度

- 欢迎页/菜单页背景用 `<picture>` 按 **700px** 切 **480w / 800w WebP**，并 `preload` 对应尺寸；手机固定拿 480w（约 30KB）。
- 入口卡片：桌面 800w；手机用 **480w WebP**（三张约 65KB），图片解码不阻塞主线程。
- 头像压到 **256×256**（约 18KB）；512 图标只给 PWA 用，不在首屏加载。
- 首屏背景只 `preload` 当前尺寸的一份，不做页面预取；卡片图用 `<img>` + `decoding="async"`，不再走 CSS 背景。
- 第一次打开仍受 GitHub Pages 网络影响；之后走浏览器缓存会快很多。

## 动画与音乐

- **动画**：只保留页面淡入（850ms）和旧页淡出（320ms）；没有卡片错开上浮、背景缩放或滑入。`prefers-reduced-motion` 下关闭。
- **音乐**：`assets/music.js` 用 Web Audio 现场合成一段轻环境音（Dm7–Cmaj7–Fmaj7–G7，加一点延迟），**没有音频文件、没有版权问题、也不增加下载体积**。
- 右上角 `♪` 按钮开关；第一次需要点击（浏览器不允许自动播放）。欢迎页点“点击进入”会记住“音乐开”，进入菜单后会尝试续播。
- 因为页面是纯静态、每次跳转会重新加载，音乐**不会跨页面连续播放**；换页后点一下 `♪` 就会继续。

## 鼠标与页面过渡

- **星形光标**：桌面端（`hover: hover` + `pointer: fine`）是一个紫蓝渐变的四角星，其中一个角拉长成箭头尖，热点在尖端（`3,3`）；悬停链接/按钮变成更亮的渐变。图片在 `assets/img/cursor-star.png` 和 `cursor-star-hover.png`，32×32。手机/触屏不会启用。
- **页面过渡**：点击站内链接后，旧页在 **320ms** 内淡出，新页主内容在 **850ms** 内淡入；没有 loading 层、没有 `fetch`、没有页面预取，减少首屏带宽争抢。
- 桌面端强制保留 **12px 滚动条槽**（轨道透明、滑块半透明），页面长短变化时不会因为滚动条突然出现/消失而横向抽动。
- 没有 JS 时链接照常跳转；`prefers-reduced-motion` 下淡入淡出关闭。

## 改配色

颜色都在 `assets/style.css` 顶部的 `:root` 和 `[data-theme="light"]` 里。改 `--accent` 就能换强调色，改 `--bg` / `--card` 就能换底色。

## 主题

- 一级欢迎页、二级菜单页也支持主题切换；默认跟随系统，右上角按钮可切白/深，选择存进 `localStorage`；
- 三级页面（博客 / 关于 / 图集 / 文章）首次访问跟随系统，点右上角按钮切换，选择存进 `localStorage`；
- 想强制三级页面默认深色，把页面 `<head>` 里的主题脚本删掉即可（`<html>` 会使用 `:root` 的深色变量）。

## 部署到 GitHub Pages

当前已部署：

- 地址：<https://FurUnionNova.github.io/>
- 仓库：`FurUnionNova/FurUnionNova.github.io`
- 推送 `main` 后由 GitHub 自带的 `pages-build-deployment` 发布，等 1 分钟左右；自定义 `.github/workflows/pages.yml` 只保留手动触发，避免两个部署任务抢锁。

换仓库时：把 `blog/` 里的文件推到仓库根目录，在 Settings → Pages 里把 Source 设为 **GitHub Actions**（或 Deploy from a branch → `main` / `/ (root)`）。

## 自检

`tools/check.mjs` 会检查：

- 所有相对链接是否存在；
- 每页是否只有一个 `<h1>`、标题层级是否跳级；
- 是否有图片缺 `alt`；
- 是否引用了外部 CDN / 字体 / 图片；
- 文章是否有 `<time datetime>` 和标签；
- 是否出现隐私关键词（医院、诊断、药名等）；
- 各文件体积。

有错误退出码为 1，只有警告为 0。

## 隐私边界

这个博客是公开页面。写作时不出现：真实姓名、学校、所在地、医院、诊断名称、药物与剂量、家庭情况、亲密关系。心理状态只保留一句概括。

## 已知限制

- 文字用系统字体渲染，不同电脑上字形会略有差别。
- 没有评论、搜索、分页；文章多了以后可以再加。
- 背景音乐受浏览器自动播放限制，第一次要手动点一下；换页后不会连续播放。
- 星形光标在部分浏览器/系统上可能被忽略，会回退成系统箭头；手机不显示。
- 手机浏览器自带的地址栏/状态栏由浏览器决定，网页无法强制它一直显示；站点导航栏已经做成吸顶。想连浏览器工具栏一起隐藏，可以把站点“添加到主屏幕”（`site.webmanifest` 已配置 `standalone`）。
- 截图在 `docs/`，是用 Edge 无头模式生成的；无头模式下最小布局宽度约 492px，所以手机截图按 500px 宽生成。


## 渲染与容错

- 阅读进度条改用 	ransform: scaleX()，并在 equestAnimationFrame 里合并滚动更新；滚动时不再反复读 scrollHeight，避免强制重排。
- 「返回顶部」和进度条共用同一帧更新，减少滚动事件里的重复读写。
- 音乐按钮改成静态 HTML，JS 只负责绑定事件；不再在加载后往导航里插节点，避免布局抖动。
- 所有 <img> 加 decoding="async"；图片加载失败时替换成透明占位并加 .is-missing，保留原尺寸，不会把布局撑坏。
- 图集原有的 igure.is-missing 占位继续保留。