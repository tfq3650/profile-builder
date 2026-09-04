#!/usr/bin/env node
/**
 * WorkBuddy Skill frontmatter 校验脚本
 *
 * 校验范围：
 *   1. SKILL.md 必须存在且含 --- ... --- 形式的 YAML frontmatter
 *   2. 必填字段：name / version / description / license
 *   3. 命名规范：name 必须 kebab-case（^[a-z][a-z0-9-]{2,50}$）
 *   4. 版本规范：version 必须 semver（X.Y.Z，可带 -prerelease）
 *   5. 描述规范：description 长度 20–500 字符；description_zh 长度 10–60 字符
 *   6. 元数据规范：metadata.author / metadata.email 必填且 email 格式合法
 *   7. 文件完整性：references/ 下关键文件必须存在
 *   8. 可选：description 末尾必须含 "当用户...时使用" 风格的触发句（AI 友好）
 *
 * 退出码：0 = 通过；1 = 有错误；2 = 仅有警告
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SKILL_PATH = path.join(ROOT, 'SKILL.md');

let errors = 0;
let warnings = 0;

function pass(name, msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${name}: ${msg}`);
}
function fail(name, msg) {
  console.error(`  \x1b[31m✗\x1b[0m ${name}: ${msg}`);
  errors++;
}
function warn(name, msg) {
  console.warn(`  \x1b[33m!\x1b[0m ${name}: ${msg}`);
  warnings++;
}

console.log('WorkBuddy Skill frontmatter 校验');
console.log('================================');

// ===== 1. 文件存在性 =====
if (!fs.existsSync(SKILL_PATH)) {
  fail('文件', `SKILL.md 不存在（${SKILL_PATH}）`);
  finish();
}
pass('文件', 'SKILL.md 存在');

// ===== 2. 解析 frontmatter =====
const content = fs.readFileSync(SKILL_PATH, 'utf8');
const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!fmMatch) {
  fail('frontmatter', '未找到 --- ... --- 包裹的 YAML 头');
  finish();
}
const fmRaw = fmMatch[1];

// 简易 YAML 解析（仅支持本项目用到的字段类型）
const fm = {};
const fmNested = {}; // 顶层嵌套键（如 metadata）
for (const line of fmRaw.split(/\r?\n/)) {
  // 嵌套对象（缩进 2 空格）
  const nestMatch = line.match(/^  (\w+):\s*(.*)$/);
  if (nestMatch) {
    fmNested[nestMatch[1]] = nestMatch[2].trim().replace(/^["']|["']$/g, '');
    continue;
  }
  // 顶层
  const m = line.match(/^(\w+):\s*(.*)$/);
  if (m) {
    const val = m[2].trim().replace(/^["']|["']$/g, '');
    fm[m[1]] = val;
  }
}
fm.metadata = fmNested;

// ===== 3. 必填字段 =====
console.log('\n[1] 必填字段');
const required = ['name', 'version', 'description', 'license'];
for (const k of required) {
  if (fm[k] && fm[k].length > 0) {
    pass(k, fm[k].length > 60 ? `${fm[k].slice(0, 60)}...` : fm[k]);
  } else {
    fail(k, '缺失或为空');
  }
}

// ===== 4. name 格式 =====
console.log('\n[2] 命名规范');
if (fm.name) {
  if (/^[a-z][a-z0-9-]{2,50}$/.test(fm.name)) {
    pass('name', 'kebab-case 合规');
  } else {
    fail('name', '必须 kebab-case（小写字母+数字+连字符，3-50 字符）');
  }
}

// ===== 5. version 格式 =====
console.log('\n[3] 版本规范');
if (fm.version) {
  if (/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?(\+[a-z0-9.-]+)?$/i.test(fm.version)) {
    pass('version', `${fm.version}（semver 合规）`);
  } else {
    fail('version', '必须 semver 格式（X.Y.Z，可带预发布/构建标签）');
  }
}

// ===== 6. description 长度 =====
console.log('\n[4] 描述规范');
if (fm.description) {
  const len = fm.description.length;
  if (len >= 20 && len <= 500) {
    pass('description', `${len} 字符（合规 20-500）`);
  } else if (len < 20) {
    fail('description', `过短（${len} 字符，要求 ≥20）`);
  } else {
    fail('description', `过长（${len} 字符，要求 ≤500）`);
  }
  // 触发句风格（AI 友好）：末尾含"当用户...时使用"（中间可含列举关键词，长度上限 200）
  if (/当用户[\s\S]{1,200}?时(使用|调用|触发|加载)/.test(fm.description)) {
    pass('description.trigger', '含"当用户...时使用"触发句');
  } else {
    warn('description.trigger', '末尾建议加"当用户...时使用"风格的触发句，便于 AI 自动加载');
  }
}
if (fm.description_zh) {
  const len = fm.description_zh.length;
  if (len >= 10 && len <= 60) {
    pass('description_zh', `${len} 字符（合规 10-60）`);
  } else {
    fail('description_zh', `${len} 字符不合规（要求 10-60）`);
  }
}
if (fm.display_name) {
  pass('display_name', fm.display_name);
}

// ===== 7. metadata =====
console.log('\n[5] 元数据');
if (fm.metadata.author) {
  pass('metadata.author', fm.metadata.author);
} else {
  fail('metadata.author', '缺失');
}
if (fm.metadata.email) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fm.metadata.email)) {
    pass('metadata.email', fm.metadata.email);
  } else {
    fail('metadata.email', `格式不合法：${fm.metadata.email}`);
  }
} else {
  fail('metadata.email', '缺失');
}

// ===== 8. references 文件存在性 =====
console.log('\n[6] references 完整性');
const expectedRefs = [
  'references/preference-dimensions.md',
  'references/rule-template.md',
];
for (const ref of expectedRefs) {
  const full = path.join(ROOT, ref);
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    if (stat.size > 100) {
      pass(ref, `${stat.size} bytes`);
    } else {
      warn(ref, `文件过小（${stat.size} bytes），可能未填充内容`);
    }
  } else {
    fail(ref, '文件不存在');
  }
}

// ===== 9. LICENSE 文件 =====
console.log('\n[7] LICENSE');
if (fs.existsSync(path.join(ROOT, 'LICENSE'))) {
  pass('LICENSE', '存在');
} else {
  warn('LICENSE', '建议添加 LICENSE 文件以声明版权');
}

function finish() {
  console.log('\n================================');
  if (errors > 0) {
    console.error(`\x1b[31m${errors} 错误\x1b[0m, ${warnings} 警告`);
    process.exit(1);
  } else if (warnings > 0) {
    console.warn(`\x1b[33m0 错误, ${warnings} 警告\x1b[0m`);
    process.exit(2);
  } else {
    console.log('\x1b[32m全部检查通过 ✅\x1b[0m');
    process.exit(0);
  }
}
finish();
