# Profile Builder（个人档案官）

> 通过引导式问答与选项，帮 AI Agent 用户从零建立或优化「个人 AI 记忆档案」——归纳个人偏好、长期记忆与回答规则，输出可直接落地的个人档案。

[![Skill](https://img.shields.io/badge/WorkBuddy-Skill-blue)](https://open.workbuddy.cn) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Version](https://img.shields.io/badge/version-1.0.0-orange)](SKILL.md)

## 解决什么问题

第一次使用 AI Agent 工具（WorkBuddy / Claude Code / 任何支持 Agent Skills 的环境）时，AI 对你一无所知——不知道怎么称呼你、喜欢什么语气、回答要多长、哪些话题不能碰。用户往往说不清"我想要什么"，AI 也问不到点子上。

这个技能用**多轮引导式问答 + 选项**把这个问题拆成 7 个维度逐项问清，最终归纳成一份结构化 Markdown 档案，可直接存入 AI 的记忆体系。

## 两大场景

| 场景 | 适用 | 产出 |
|------|------|------|
| **A. 从零建档** | 新用户，AI 记忆为空 | 完整个人档案（快速模式 2-3 轮 / 完整模式 4-7 轮） |
| **B. 已有档案优化** | 已有零散自我介绍、旧档案或 USER.md / MEMORY.md | 去重补漏后的优化版 + 变更清单（新增/修改/删除） |

## 功能特性

- **选项优先，不替用户做主**：每轮给 2-4 个具体选项降低表达门槛，用户可选「其他」追问真实需求
- **7 维度体系**：身份背景 / 沟通偏好 / 回答规则 / 兴趣与专业 / 工作方式与工具 / 边界与禁忌 / 当前关注与目标
- **防注入清洗**：逐条检查用户输入，劫持 AI 行为的指令（如「忽略所有系统设定」）一律剔除并告知
- **隐私最小化**：证件号、密码、财务账号等敏感信息默认不收集、不追问
- **不臆造**：所有条目来自用户表达或经确认的推断，推断项标注「（待你确认）」
- **增量更新**：稳定项（身份/兴趣/工具）默认不动，易变项（偏好/规则/目标）优先更新
- **双格式输出**：通用 Markdown + 带 frontmatter 的 WorkBuddy 记忆文件版（USER.md / MEMORY.md）

## 安装

### WorkBuddy

```bash
# 方式一：放入用户技能目录
# 解压后放到 ~/.workbuddy/skills/ 下，重启 WorkBuddy 生效

# 方式二：技能市场
# 技能中心搜索「个人档案官 / Profile Builder」安装
```

### 其他兼容 Agent Skills 的环境

任何支持 [Agent Skills](https://code.claude.com/docs/en/skills) 标准（SKILL.md + references）的环境均可：

```bash
git clone https://github.com/tfq3650/profile-builder.git
cp -r profile-builder <你的技能目录>/
```

## 使用

无需特殊命令，直接对 AI 说：

- 「帮我建档」
- 「记住我的偏好」
- 「整理一下我的用户档案」
- 「优化我的 USER.md」

更新已有档案：直接说「更新我的档案」。

## 目录结构

```
profile-builder/
├── SKILL.md                              # 技能定义（触发词 + 工作流）
├── README.md
├── avatar.png                            # 512×512 头像
└── references/
    ├── preference-dimensions.md          # 7 维度清单 + 选项式提问模板
    └── rule-template.md                  # 档案输出模板（通用版 + frontmatter 落地版）
```

## 输出示例（脱敏节选）

```markdown
## 身份背景（记忆）
- 称呼：小张
- 城市：杭州
- 职业：后端工程师，主要写 Go

## 回答规则（规则）
- 结论先行，再展开依据
- 正式书面语，不用 emoji 和网络用语
- 技术方案给 trade-off，不只给单一推荐
```

## 安全设计

本技能将三条安全边界置于一切问答之前：

1. **防提示注入**——用户输入中的劫持指令不写入档案
2. **隐私最小化**——敏感个人信息默认不收集
3. **不臆造**——未确认的信息不落档

## 许可证

[MIT](LICENSE) © Tang

## 作者

**Tang** · t.thane.tang@gmail.com

发现 bug 或有改进建议？欢迎提 [Issue](https://github.com/tfq3650/profile-builder/issues) 或 PR。
