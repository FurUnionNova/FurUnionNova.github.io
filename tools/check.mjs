#!/usr/bin/env node
/**
 * 零依赖自检：链接、元数据、外链资源、标题层级、图片 alt、隐私词、体积。
 * 用法：node tools/check.mjs
 * 退出码：有错误为 1，仅警告为 0。
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'archive' || name === 'node_modules') continue;
      out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

const all = walk(ROOT);
const pages = all.filter(
  (p) => extname(p) === '.html' && !relative(ROOT, p).startsWith('_template')
);
const rel = (p) => relative(ROOT, p).replaceAll('\\', '/');

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const stripTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const PRIVACY = [
  '医院', '诊断', '处方', '剂量', '氟西汀', '舍曲林', '奥氮平', '丁螺环酮',
  '安非他酮', '身份证', '手机号', '学校', '班主任', '住院',
];

for (const page of pages) {
  const name = rel(page);
  const html = stripComments(readFileSync(page, 'utf8'));
  const text = stripTags(html);
  const dir = dirname(page);

  // 标题
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) errors.push(`${name}: 缺少 <title>`);

  // 描述
  if (!/<meta[^>]+name=["']description["']/i.test(html) && !name.endsWith('404.html')) {
    warnings.push(`${name}: 缺少 <meta name="description">`);
  }

  // h1 与层级
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) errors.push(`${name}: <h1> 数量为 ${h1}，应为 1`);

  const levels = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  let seenH2 = false;
  for (const lv of levels) {
    if (lv === 2) seenH2 = true;
    if (lv === 3 && !seenH2) errors.push(`${name}: 出现 h3 之前没有 h2`);
    if (lv > 3) warnings.push(`${name}: 使用了 h${lv}，建议只用 h1–h3`);
  }

  // 图片
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    if (!altMatch) errors.push(`${name}: <img> 缺少 alt（${src || '无 src'}）`);
    if (!src) {
      errors.push(`${name}: <img> 缺少 src`);
      continue;
    }
    if (/^https?:/i.test(src)) {
      errors.push(`${name}: 图片引用了外链 ${src}`);
      continue;
    }
    const target = resolve(dir, src.split('#')[0]);
    if (!existsSync(target)) warnings.push(`${name}: 图片不存在（可能是待上传占位）${src}`);
  }

  // 外链资源
  for (const m of html.matchAll(/<(link|script)\b[^>]*>/gi)) {
    const tag = m[0];
    const url = tag.match(/\b(?:href|src)=["']([^"']+)["']/i)?.[1];
    if (url && /^https?:/i.test(url)) {
      errors.push(`${name}: 资源引用了外链 ${url}`);
    }
  }

  // 内部链接
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = m[1];
    if (/^(#|https?:|mailto:|tel:|data:)/i.test(href)) continue;
    const clean = decodeURI(href.split('#')[0].split('?')[0]);
    if (!clean) continue;
    let target = resolve(dir, clean);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) errors.push(`${name}: 死链 ${href}`);
  }

  // 隐私词
  for (const word of PRIVACY) {
    if (text.includes(word)) errors.push(`${name}: 命中隐私词“${word}”`);
  }
}

// 文章元数据
for (const page of pages.filter((p) => rel(p).startsWith('posts/'))) {
  const name = rel(page);
  const html = stripComments(readFileSync(page, 'utf8'));
  if (!/<time[^>]+datetime=["']\d{4}-\d{2}-\d{2}["']/i.test(html)) {
    errors.push(`${name}: 缺少 <time datetime="YYYY-MM-DD">`);
  }
  if (!/class=["']tag["']/i.test(html)) errors.push(`${name}: 至少需要一个标签`);
}

// 体积
const sizes = [];
for (const p of all.filter((p) => ['.html', '.css', '.js'].includes(extname(p)))) {
  sizes.push([rel(p), statSync(p).size]);
}
sizes.sort((a, b) => b[1] - a[1]);

console.log('\nDSH 博客自检\n');
if (errors.length) {
  for (const e of errors) console.log(`❌ ${e}`);
}
if (warnings.length) {
  for (const w of warnings) console.log(`⚠️  ${w}`);
}
if (!errors.length && !warnings.length) console.log('✅ 全部通过');
console.log('\n体积（Top 8）：');
for (const [f, s] of sizes.slice(0, 8)) console.log(`  ${(s / 1024).toFixed(1)} KB  ${f}`);
console.log(`\n页面 ${pages.length} 个，错误 ${errors.length}，警告 ${warnings.length}\n`);

process.exit(errors.length ? 1 : 0);
