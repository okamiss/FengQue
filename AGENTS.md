# CLAUDE.md

本文件为 Claude Code 在本项目中工作时提供上下文与协作规范。
**开始任何任务前，请先完整阅读本文件。**

---

## ⚠️ 重要前置要求（每个任务开始前必读）

1. **产品需求 —— 先读 PRD**
   动手编码前，**务必先阅读项目根目录下的 `PRD.md`**，理解完整的产品需求、玩法、数值与功能边界后再开始。`PRD.md` 是唯一需求来源，本文件不重复其中的数值/剧情/规则细节，需求以 PRD 为准。需求有歧义时先确认，不要凭猜测实现。

2. **UI 设计 —— 严格对照设计图**
   所有涉及界面的工作，请参考 `exampleImages/` 目录中的设计图。
   **尤其在做布局（layout）时，必须严格对照设计图的 UI 布局**，包括整体结构、栅格、间距、对齐、组件层级与视觉层次（主次关系），以及颜色、字号、圆角等细节。不要自行发挥或简化布局结构；设计图与需求冲突时先提出再处理。

---

## 项目概述

**《凤阙浮生》**（副标题：现代穿越宫廷逆袭记）——一款 **2D 竖屏宫斗叙事小游戏**。

玩家从现代穿越成最低级宫女，通过剧情选择、换装、站队、争宠、破局逐步晋升，最终走向皇后 / 太后 / 女官 / 归隐 / 黑化 / 冷宫等多种结局。核心循环：**阅读剧情 → 2~4 个选择 → 影响属性·好感·阵营·生死 → 获得资源 → 满足条件晋升 → 进入下一章或分支结局**。

详细玩法、属性、晋升路线、剧情结构、结局清单见 `PRD.md`。

---

## 技术栈

- **引擎**：Cocos Creator
- **语言**：TypeScript
- **目标平台**：**先发微信小游戏，后续发抖音小游戏**。代码需从一开始就做好双平台适配（详见下方「平台适配」一节）
- **存档**：首版本地存档（`SaveService`），后续再升级线上账号 / 云存档
- **充值/排行榜/云存档/好友系统**：首版**不做**，预留接口即可

---

## 核心架构原则（写代码时必须遵守）

> 这几条来自 PRD，是本项目的架构红线，违反会让后期扩展非常痛苦：

- **UI 只负责显示和点击**，不写业务逻辑。
- **剧情选择逻辑不要写在 UI 里**，统一由 `story/` 下的系统处理。
- **剧情数据走配置，不要硬编码**（节点、选择、效果、条件都用配置）。
- **广告、分享、存档等平台能力封装**：广告/分享走 `PlatformService`（或 `AdService` / `ShareService`），存档统一走 `SaveService`，业务层不直接调平台 API。
- **配置驱动优先**：剧情、衣服、晋升规则、数值都放 `config/`，方便后续扩展和策划调整。

---

## 平台适配（微信优先，抖音后续）

目标是发完微信后，**移植抖音时只改适配层，不改业务代码**。务必遵守：

- **业务代码禁止直接调用平台 API**。不要在 `story/` `player/` `ui/` 等业务层里出现 `wx.*`（或抖音的 `tt.*`）。所有平台能力都通过 `core/PlatformService` 暴露的统一接口调用。
- **PlatformService 做成抽象 + 多实现**：定义统一接口（如登录、激励视频、分享、震动、存档读写、用户信息等），下面分 `WechatPlatform` / `DouyinPlatform` 两个实现，运行时根据环境选择。新增平台只加一个实现类。
  ```
  core/
    platform/
      IPlatform.ts        # 统一接口定义
      WechatPlatform.ts    # 微信实现（首版）
      DouyinPlatform.ts    # 抖音实现（后续，可先留空壳）
      PlatformService.ts   # 入口：环境检测 + 选择实现
  ```
- **首版只需实现微信**，但接口要按"通用能力"设计，不要让微信特有的参数/字段渗进接口签名。抖音实现可先建空壳（接口齐全、内部 TODO），保证业务层调用方式不变。
- **平台差异点重点关注**：登录鉴权、激励视频广告、分享回流、支付（后续）、存档/云能力、用户信息授权、文件系统、震动/音频等——这些在微信和抖音上 API 和审核规则都不同，全部收敛到适配层。
- **广告/分享合规按平台分别处理**：复活/分享的次数限制、诱导分享规则在两个平台审核标准不同，相关策略走配置或适配层开关，不要硬编码进业务逻辑。

---

## 目录结构

```
assets/scripts/
  core/          # 全局：GameManager / EventBus / SaveService / PlatformService
  story/         # 剧情：StorySystem / ChoiceSystem / EndingSystem / StoryTypes
  player/        # 玩家：PlayerModel / RankSystem / AttributeSystem
  wardrobe/      # 换装：WardrobeSystem / DressItem
  monetization/  # 变现：AdService / ShareService
  ui/            # 界面：MainUI / StoryPanel / ChoicePanel / WardrobePanel / DeathPanel / RankUpPanel
  config/        # 配置：GameConfig / StoryConfig / DressConfig / RankConfig
```

场景：首版可先只做一个 `GameScene`，通过 UI Panel 切换（Story / Choice / Wardrobe / Rank / Death / Ending），后续再按需拆成独立场景。

---

## 数据与类型约定

以下核心类型已在 PRD 中定义，新增/修改时保持一致，**不要随意改字段命名**：

- `PlayerStats`（charm / wisdom / etiquette / scheming / health / prestige）
- `PlayerRelations`（emperorFavor / queenFavor / consortFavor / maidFavor / eunuchFavor）
- `DressItem`（part / rarity / stats / tags / unlockType）
- `StoryNode` / `StoryChoice` / `ChoiceEffect` / `ChoiceCondition`（剧情配置）
- `PlayerSaveData`（带 `version` 字段，存档结构变更时升级 version 并做迁移）

字段含义、枚举取值、示例数据见 `PRD.md`。

---

## 编码规范

- **TypeScript 严格类型**：避免 `any`，补全类型；枚举/联合类型沿用 PRD 定义。
- **命名一致**：组件、变量、文件遵循既有命名约定（剧情节点 id 如 `ch1_001`、`ch1_001_a`）。
- **复用优先**：复用已有系统与工具函数，不重复造轮子。
- **改动收敛**：只改与当前任务相关的代码，不顺手重构无关部分。
- **注释**：复杂逻辑加必要注释，不写废话注释。

---

## 首版 MVP 范围

**做**：主界面、剧情阅读、选择分支、属性变化、本地存档、死亡结局、广告复活占位、换装系统基础版、10 章剧情、第一次晋升。

**先不做**：复杂动画、复杂战斗、充值、排行榜、好友系统、云存档、大量衣服、真人配音。

不要在 MVP 阶段超范围实现"先不做"的功能，除非明确确认。

---

## 重要约束

- **原创世界观，规避 IP 风险**：可参考宫斗氛围，但**禁止使用《甄嬛传》等作品的人物名、台词、剧情桥段**。本项目人物为原创（皇帝萧景珩、皇后沈皇后、贵妃容贵妃、太后崔太后、宫女阿棠、太监小禄子等，以 PRD 为准）。
- **广告/分享合规**：激励视频与分享奖励要符合**微信和抖音**各自的审核要求，不可设计成强诱导，两平台规则不同需分别适配（见「平台适配」）。首版先做按钮和逻辑，平台接入后用开关控制。复活规则有上限（每章/每天限次，回到最近 checkpoint，不允许无限复活）。

---

## 美术 / 适配规范

- 风格：2D 古风插画，UI 多用卷轴、玉佩、宫墙、绸缎元素。
- 分辨率：**竖屏 750×1334**。
- 资源：背景静态图、角色半身立绘；首版可用占位图（如 `palace_gate.png` / `sewing_room.png` / `garden.png` 等，命名见 PRD）。

---

## 协作约定

- 不确定需求或设计时，**先提问确认**再动手。
- 完成后简要说明改了什么、为什么这么改。
- 破坏性操作（删文件、改配置、改依赖、改存档结构）前先说明。


##  CodeGraph (Required)

This repository uses CodeGraph.

Before performing code analysis, debugging, refactoring, or feature implementation:

- Use CodeGraph MCP tools as the primary navigation mechanism.
- Use CodeGraph to locate symbols, references, callers, callees, dependencies, and impact scope.
- Use CodeGraph to understand architecture before reading files.
- Determine affected code paths before making changes.

Do NOT start with:

- grep
- ripgrep
- find
- global text search
- reading large portions of the repository

Read source files only after the relevant locations have been identified through CodeGraph.

If CodeGraph is not initialized:

```bash
codegraph init -i
```

Preferred workflow:

1. Analyze repository structure with CodeGraph.
2. Locate relevant symbols and references.
3. Trace dependencies and call chains.
4. Determine impact scope.
5. Read only necessary files.
6. Implement changes.
7. Verify changes.

---