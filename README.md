# 绒萌的赛博手记

一个纯静态的个人博客：HTML + CSS + 原生 JS，零依赖、零构建、断网可看。

## 结构（两级）

1. **一级页 `index.html`**：图片门户。满屏兽设背景 + 三个入口（博客 / 关于 / 图集）。
2. **二级页**：
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
├─ index.html          # 一级页：图片门户
├─ blog.html           # 二级页：博客索引 + 标签筛选
├─ about.html          # 二级页：关于
├─ gallery.html        # 二级页：图集
├─ 404.html            # 404
├─ _template.html      # 新文章模板（不对外链接）
├─ posts/              # 文章（目前只有 placeholder.html 占位页）
├─ assets/
│  ├─ style.css        # 全部样式
│  ├─ blog.js          # 主题、目录、进度、复制、标签筛选
│  └─ img/             # 头像、兽设图、分享封面
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
- 门户背景：`index.html` 顶部的 `portal-bg`（默认 `fursona-08.webp`）
- 入口卡片背景：`style.css` 里的 `.entry-blog` / `.entry-about` / `.entry-gallery`

图集页用的是原始比例，不裁切；换图后记得改 `gallery.html` 里的 `alt` 和 `figcaption`。


## 改配色

颜色都在 `assets/style.css` 顶部的 `:root` 和 `[data-theme="light"]` 里。改 `--accent` 就能换强调色，改 `--bg` / `--card` 就能换底色。

## 主题

- 一级门户（`index.html`）固定深色，保证图片背景上的文字对比度；
- 二级页面（博客 / 关于 / 图集 / 文章）首次访问跟随系统，点右上角按钮切换，选择存进 `localStorage`；
- 想强制二级页面默认深色，把页面 `<head>` 里的主题脚本删掉即可（`<html>` 会使用 `:root` 的深色变量）。


## 部署到 GitHub Pages

1. 新建一个仓库，把 `blog/` 里的文件推到仓库根目录；
2. 仓库 Settings → Pages → Source 选 “Deploy from a branch”，分支选 `main`，目录选 `/ (root)`；
3. 等一两分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

不需要构建步骤，推上去就能用。

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
- 截图在 `docs/`，是用 Edge 无头模式生成的；无头模式下最小布局宽度约 492px，所以手机截图按 500px 宽生成。
