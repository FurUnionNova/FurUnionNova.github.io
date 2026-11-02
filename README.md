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
│  ├─ transition.js    # 页面切换淡出 / 滑入
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
- 入口卡片背景：`style.css` 里的 `.entry-blog` / `.entry-about` / `.entry-gallery`

图集页用的是原始比例，不裁切；换图后记得改 `gallery.html` 里的 `alt` 和 `figcaption`。

## 动画与音乐

- **动画**：欢迎页标题/按钮逐个淡入，菜单卡片错开上浮，背景缓慢放大；`prefers-reduced-motion` 下全部关闭。
- **音乐**：`assets/music.js` 用 Web Audio 现场合成一段轻环境音（Dm7–Cmaj7–Fmaj7–G7，加一点延迟），**没有音频文件、没有版权问题、也不增加下载体积**。
- 右上角 `♪` 按钮开关；第一次需要点击（浏览器不允许自动播放）。欢迎页点“点击进入”会记住“音乐开”，进入菜单后会尝试续播。
- 因为页面是纯静态、每次跳转会重新加载，音乐**不会跨页面连续播放**；换页后点一下 `♪` 就会继续。

## 鼠标与页面过渡

- **星形光标**：桌面端（`hover: hover` + `pointer: fine`）是一个紫蓝渐变的四角星，其中一个角拉长成箭头尖，热点在尖端（`3,3`）；悬停链接/按钮变成更亮的渐变。图片在 `assets/img/cursor-star.png` 和 `cursor-star-hover.png`，32×32。手机/触屏不会启用。
- **预取**：菜单页 `<head>` 里预取博客/关于/图集，鼠标悬停站内链接时也会动态 `<link rel="prefetch">`，所以点进去通常已经缓存好。
- **加载过渡**：点击后旧页内容变暗、加载层淡入；同时 `fetch` 目标页（最长等 3.5 秒）。跳转时新页在第一次绘制前就带上同一个加载层（内联脚本 + `sessionStorage`），等页面就绪后再用 **650ms 淡出**，露出新内容——所以不会出现“loading 一消失就突然切换”。直接打开三级页面时，`main` 仍然从左侧 36px 滑入（700ms）；从加载层进入时改为淡出显示，避免双重动画。
- 如果脚本失效，加载层会在 5 秒后自动淡出，不会把页面永久盖住。
- 没有 JS 时链接照常跳转；`prefers-reduced-motion` 下加载层和滑入都会关闭。

## 改配色

颜色都在 `assets/style.css` 顶部的 `:root` 和 `[data-theme="light"]` 里。改 `--accent` 就能换强调色，改 `--bg` / `--card` 就能换底色。

## 主题

- 一级欢迎页、二级菜单页固定深色，保证图片背景上的文字对比度；
- 三级页面（博客 / 关于 / 图集 / 文章）首次访问跟随系统，点右上角按钮切换，选择存进 `localStorage`；
- 想强制三级页面默认深色，把页面 `<head>` 里的主题脚本删掉即可（`<html>` 会使用 `:root` 的深色变量）。

## 部署到 GitHub Pages

当前已部署：

- 地址：<https://FurUnionNova.github.io/>
- 仓库：`FurUnionNova/FurUnionNova.github.io`
- 推送 `main` 后，`.github/workflows/pages.yml` 会自动发布，等 1 分钟左右。

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
