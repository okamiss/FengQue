# 游戏定位

游戏暂定名可以叫：

**《凤阙浮生》**

副标题：

**现代穿越宫廷逆袭记**

玩法一句话：

> 玩家从现代穿越到古代宫廷，从最低级宫女开始，通过一次次剧情选择、换装、站队、争宠、破局，逐步晋升，最终走向皇后、太后、权臣盟友、归隐民间，或者惨死冷宫等不同结局。

注意：可以参考《甄嬛传》的“宫斗氛围”，但不要直接用甄嬛、华妃、皇后、安陵容这些人物名、台词、剧情桥段，避免版权/IP风险。我们做原创世界观。

------

# 核心玩法设计

## 1. 主循环

玩家每天进入游戏后，大概是这个流程：

```
进入章节
↓
阅读剧情
↓
出现 2~4 个选择
↓
选择影响属性 / 好感 / 阵营 / 生死
↓
获得银两、衣服、道具、剧情线索
↓
满足条件后晋升身份
↓
进入下一章或触发分支结局
```

比如：

```
你被分到尚衣局，掌事姑姑故意刁难你，让你连夜赶制贵妃的新衣。

A. 忍下委屈，通宵完成
结果：心计 +1，体力 -1，掌事好感 +1

B. 偷偷找同屋宫女帮忙
结果：人脉 +1，但欠下人情

C. 故意把瑕疵留在不起眼的位置
结果：心计 +2，若被发现则触发惩罚剧情
```

------

# 玩家成长属性

建议先做 6 个核心属性，别太多。

```
type PlayerStats = {
  charm: number;      // 魅力：影响皇帝、贵人、社交剧情
  wisdom: number;     // 智谋：影响破局、识破陷害
  etiquette: number;  // 礼仪：影响宫规、晋升、宴会
  scheming: number;   // 心计：影响宫斗、反击、陷害
  health: number;     // 体力：太低会病倒或死亡
  prestige: number;   // 威望：影响宫女、太监、下人服从
};
```

额外可以有几个关系值：

```
type PlayerRelations = {
  emperorFavor: number;  // 皇帝好感
  queenFavor: number;    // 皇后好感
  consortFavor: number;  // 贵妃好感
  maidFavor: number;     // 宫女阵营好感
  eunuchFavor: number;   // 太监消息网好感
};
```

------

# 身份晋升路线

玩家一开始不是妃子，而是最低级宫女，这样逆袭感更强。

建议身份路线：

```
粗使宫女
↓
二等宫女
↓
一等宫女
↓
掌事宫女
↓
女官
↓
采女
↓
答应
↓
常在
↓
贵人
↓
嫔
↓
妃
↓
贵妃
↓
皇贵妃
↓
皇后
```

每次晋升需要条件，比如：

```
rankUpRules: [
  {
    from: 'rough_maid',
    to: 'second_maid',
    need: {
      etiquette: 3,
      wisdom: 2,
      chapter: 3,
    },
  },
  {
    from: 'female_officer',
    to: 'cairen',
    need: {
      charm: 8,
      emperorFavor: 5,
      prestige: 4,
    },
  },
]
```

这样后面很好扩展。

------

# 剧情结构设计

## 第一幕：穿越入宫

目标：让玩家知道自己是谁、为什么进宫、怎么活下来。

剧情：

现代女主因为一次意外，穿越到古代王朝，醒来时发现自己成了刚被送入宫的低等宫女。她没有家族背景，没有银子，也不懂宫规。

主要冲突：

```
不懂规矩 → 被老宫女欺负
没有靠山 → 被派去最苦的差事
知道现代知识 → 可以用小聪明解决问题
```

第一幕适合做新手教程。

关键选择：

```
1. 被掌事姑姑训斥时，是低头认错，还是据理力争？
2. 同屋宫女偷了东西，被怀疑的人是你，你要不要替她隐瞒？
3. 贵妃衣服出了问题，你是否利用现代审美救场？
```

可能结局：

```
小结局：初入深宫
坏结局：杖责而死
隐藏路线：获得尚衣局姑姑赏识
```

------

## 第二幕：尚衣局风波

目标：引出换装系统和宫斗系统。

玩家被分到尚衣局，开始接触衣服、宴会、贵人。

核心玩法：

```
制作衣服
搭配衣服
提升魅力 / 礼仪
解锁宫宴剧情
```

剧情事件：

```
贵妃新衣被人剪破
皇后赏赐的料子被调包
宫宴上有人故意让你出丑
```

选择方向：

```
走皇后线：稳重、守规矩、地位安全
走贵妃线：奖励多、风险高、容易卷入争斗
走中立线：成长慢，但后期自由度高
```

------

## 第三幕：御前露脸

目标：从宫女转入女官或后宫身份。

玩家因为一次宫宴救场，被皇帝注意到。

关键剧情：

```
皇帝问你为何会这种新式花样？
A. 说是家乡旧法
B. 说是梦中所得
C. 说是贵妃教导
D. 说是皇后赏识
```

每个选择影响后续阵营。

这里可以触发第一次大分支：

```
皇后线
贵妃线
太后线
皇帝宠爱线
独善其身线
黑化心计线
```

------

## 第四幕：宫斗升级

目标：从小打小闹变成真正的生死局。

剧情事件：

```
1. 被人栽赃私通外臣
2. 药膳中被下毒
3. 身边宫女背叛
4. 皇帝突然冷落
5. 皇后试探你的忠心
6. 贵妃逼你站队
```

玩法：

```
收集线索
选择证人
判断谁在陷害你
使用道具自保
```

例如：

```
你发现药碗有异味，此时太医已经站在门外。

A. 立刻打翻药碗
B. 假装喝下，暗中留下证据
C. 让贴身宫女先试
D. 拿去给皇后查验
```

不同选择可能导致：

```
体力下降
皇帝好感下降
贵妃怀疑你
皇后信任你
宫女死亡
自己死亡
```

------

## 第五幕：终局夺位

目标：决定最终结局。

最终核心问题：

```
你想成为谁？
```

可选结局方向：

```
1. 皇后结局：权倾六宫，但失去自由
2. 太后结局：熬到最后，成为真正掌权者
3. 宠妃结局：皇帝独宠，但树敌无数
4. 女官结局：不入后宫，掌管内廷
5. 归隐结局：假死出宫，回到自由生活
6. 黑化结局：除掉所有敌人，但众叛亲离
7. 冷宫结局：争斗失败，被废入冷宫
8. 毒酒结局：关键选择错误，被赐死
9. 穿越回现代结局：完成隐藏条件后回到现代
```

------

# 换装系统设计

衣服不是单纯好看，要和剧情属性挂钩。

## 衣服类型

```
发型
妆容
上衣
下裙
披风
饰品
手持物
特殊套装
```

## 衣服属性

```
type DressItem = {
  id: string;
  name: string;
  part: 'hair' | 'makeup' | 'dress' | 'cloak' | 'accessory' | 'hand';
  rarity: 'normal' | 'rare' | 'epic' | 'legend';
  stats: {
    charm?: number;
    etiquette?: number;
    wisdom?: number;
    prestige?: number;
  };
  tags: string[];
  unlockType: 'story' | 'gold' | 'ad' | 'share' | 'event';
};
```

例如：

```
{
  id: 'dress_snow_lotus',
  name: '雪莲宫装',
  part: 'dress',
  rarity: 'epic',
  stats: {
    charm: 5,
    etiquette: 3,
  },
  tags: ['清冷', '宫宴', '皇后喜好'],
  unlockType: 'ad',
}
```

剧情里可以要求：

```
参加太后寿宴，需要“端庄”标签 ≥ 2
参加御花园偶遇，需要魅力 ≥ 10
参加皇后请安，需要礼仪 ≥ 8
```

这样玩家就有动力收集衣服。

------

# 广告和分享设计

不要一上来就做强制广告，建议做“可选奖励”。

## 激励视频场景

```
1. 剧情死亡后复活
2. 体力不足时恢复体力
3. 解锁限定衣服
4. 剧情失败后重选一次
5. 每日领取银两
6. 宫宴评分翻倍
```

复活规则建议：

```
每章最多复活 1 次
每天最多广告复活 3 次
复活回到最近剧情节点
不允许无限复活
```

伪代码：

```
type ReviveRule = {
  maxRevivePerChapter: number;
  maxRevivePerDay: number;
  reviveTo: 'lastCheckpoint';
};
```

## 分享奖励场景

```
1. 分享获得限定发簪
2. 分享解锁番外剧情
3. 分享获得一次“重选机会”
4. 分享获得银两
```

注意：分享奖励在微信和抖音上要看平台审核要求，不能设计得太诱导。首版可以先做按钮和逻辑，平台接入后再开关控制。

------

# 货币和资源系统

建议先做 4 种资源。

```
银两：普通货币，用于买普通衣服、道具
玉佩：高级货币，后期可接充值或活动
体力：进入剧情消耗
重选令：选择错了可以重选一次
```

首版可以不做充值，只做：

```
剧情奖励
每日登录
广告奖励
分享奖励
```

------

# 死亡和失败设计

宫斗游戏一定要有“危险感”。

失败类型：

```
1. 死亡：毒死、杖毙、赐死、落水
2. 冷宫：身份保住，但主线失败
3. 出宫：被赶出宫，普通结局
4. 失宠：皇帝好感清零
5. 背叛：关键 NPC 离开你
```

每次死亡不要只是“游戏结束”，要给玩家看一段短剧情。

例如：

```
你端起那碗药时，指尖微微发凉。
片刻后，眼前的宫灯一盏盏熄灭。
你终于明白，真正想杀你的人，并不在这间屋子里。
```

然后出现：

```
看广告复活
使用重选令
查看结局
重新开始
```

------

# NPC 设计

## 主要角色

### 1. 皇帝：萧景珩

标签：

```
多疑、冷静、重权术
```

作用：

```
影响晋升
影响宠爱线
后期可能信任你，也可能利用你
```

------

### 2. 皇后：沈皇后

标签：

```
端庄、隐忍、掌控后宫
```

路线：

```
选择皇后线，前期安全，后期容易被当成棋子。
```

------

### 3. 贵妃：容贵妃

标签：

```
张扬、狠辣、赏罚分明
```

路线：

```
选择贵妃线，奖励多，晋升快，但仇恨也高。
```

------

### 4. 太后：崔太后

标签：

```
看似慈祥，实际最懂权力
```

路线：

```
隐藏高阶路线，适合智慧和礼仪高的玩家。
```

------

### 5. 同屋宫女：阿棠

标签：

```
善良、胆小、可能背叛也可能救你
```

作用：

```
她是玩家前期最重要的人情线。
你对她好，她后期替你挡灾。
你利用她，她可能在关键时刻背叛。
```

------

### 6. 太监：小禄子

标签：

```
消息灵通、贪财、讲义气
```

作用：

```
负责情报系统。
银两或好感足够时，可以提前知道危险剧情。
```

------

# 章节设计：第一版建议做 10 章

首版不要做太大，先做 10 章即可。

```
第 1 章：一梦入宫
第 2 章：尚衣局初罚
第 3 章：贵妃新衣
第 4 章：夜半失物
第 5 章：御花园初见
第 6 章：皇后试探
第 7 章：药膳疑云
第 8 章：宫宴惊变
第 9 章：背主之人
第 10 章：第一次晋封
```

第 10 章做一个阶段性结局：

```
成功：从宫女晋升为女官 / 采女
失败：被赶出尚衣局 / 死亡 / 冷宫支线
隐藏成功：获得皇后或太后赏识
```

这样第一版就有完整闭环。

------

# Cocos 场景结构

建议先做这些场景：

```
LoadingScene
MainScene
StoryScene
ChoiceScene
WardrobeScene
RankScene
DeathScene
EndingScene
```

实际 Cocos 里可以先只做一个 `GameScene`，通过 UI Panel 切换，后面再拆场景。

目录建议：

```
assets/scripts/
  core/
    GameManager.ts
    EventBus.ts
    SaveService.ts
    PlatformService.ts

  story/
    StorySystem.ts
    ChoiceSystem.ts
    EndingSystem.ts
    StoryTypes.ts

  player/
    PlayerModel.ts
    RankSystem.ts
    AttributeSystem.ts

  wardrobe/
    WardrobeSystem.ts
    DressItem.ts

  monetization/
    AdService.ts
    ShareService.ts

  ui/
    MainUI.ts
    StoryPanel.ts
    ChoicePanel.ts
    WardrobePanel.ts
    DeathPanel.ts
    RankUpPanel.ts

  config/
    GameConfig.ts
    StoryConfig.ts
    DressConfig.ts
    RankConfig.ts
```

重点原则：

```
UI 只负责显示和点击
剧情选择逻辑不要写在 UI 里
广告、分享封装成 PlatformService
存档统一走 SaveService
剧情数据走配置，不要硬编码
```

------

# 剧情配置设计

后面剧情一定会越来越多，所以建议用配置驱动。

```
export type StoryNode = {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  background?: string;
  character?: string;
  checkpoint?: boolean;
  choices: StoryChoice[];
};

export type StoryChoice = {
  id: string;
  text: string;
  nextNodeId?: string;
  effects?: ChoiceEffect[];
  conditions?: ChoiceCondition[];
  deathEndingId?: string;
};

export type ChoiceEffect = {
  type:
    | 'add_stat'
    | 'add_relation'
    | 'add_item'
    | 'change_rank'
    | 'set_flag'
    | 'add_currency';
  key: string;
  value: number | string | boolean;
};

export type ChoiceCondition = {
  type: 'stat' | 'relation' | 'flag' | 'item' | 'rank';
  key: string;
  operator: '>=' | '<=' | '==' | '!=';
  value: number | string | boolean;
};
```

示例剧情：

```
export const StoryConfig: StoryNode[] = [
  {
    id: 'ch1_001',
    chapterId: 'chapter_1',
    title: '一梦入宫',
    content:
      '你从昏沉中醒来，耳边传来掌事姑姑冰冷的声音：“新来的，还不快跪下学规矩？”',
    background: 'palace_gate',
    character: 'aunt_li',
    checkpoint: true,
    choices: [
      {
        id: 'ch1_001_a',
        text: '立刻跪下，低头认错',
        nextNodeId: 'ch1_002',
        effects: [
          { type: 'add_stat', key: 'etiquette', value: 1 },
          { type: 'add_relation', key: 'maidFavor', value: 1 },
        ],
      },
      {
        id: 'ch1_001_b',
        text: '忍不住反问她是谁',
        nextNodeId: 'ch1_003',
        effects: [
          { type: 'add_stat', key: 'wisdom', value: 1 },
          { type: 'add_relation', key: 'maidFavor', value: -1 },
        ],
      },
      {
        id: 'ch1_001_c',
        text: '假装昏倒，观察局势',
        nextNodeId: 'ch1_004',
        effects: [
          { type: 'add_stat', key: 'scheming', value: 2 },
          { type: 'add_stat', key: 'health', value: -1 },
        ],
      },
    ],
  },
];
```

------

# 存档设计

先用本地存档，后面要做线上账号再升级。

```
export type PlayerSaveData = {
  version: number;
  playerName: string;
  currentChapterId: string;
  currentNodeId: string;
  rankId: string;

  stats: PlayerStats;
  relations: PlayerRelations;

  flags: Record<string, boolean>;
  ownedDressIds: string[];
  equippedDressIds: string[];

  currencies: {
    silver: number;
    jade: number;
    energy: number;
    retryToken: number;
  };

  revive: {
    todayCount: number;
    chapterCount: number;
    lastDate: string;
  };

  endingsUnlocked: string[];
};
```

------

# 首版 MVP 功能范围

第一版不要贪多，建议只做这些：

```
1. 主界面
2. 剧情阅读
3. 选择分支
4. 属性变化
5. 本地存档
6. 死亡结局
7. 广告复活占位
8. 服装系统基础版
9. 10 章剧情
10. 第一次晋升
```

先不做：

```
复杂动画
复杂战斗
充值
排行榜
好友系统
云存档
大量衣服
真人配音
```

------

# 第一版美术风格

建议：

```
2D 古风插画
竖屏 750x1334
背景静态图
角色半身立绘
UI 用卷轴、玉佩、宫墙、绸缎元素
```

首版可以先用占位图：

```
palace_gate.png       宫门
sewing_room.png       尚衣局
garden.png            御花园
queen_room.png        皇后寝殿
death_bg.png          死亡背景
```

角色先做：

```
女主
掌事姑姑
皇后
贵妃
皇帝
阿棠
小禄子
```