/**
 * StoryTypes.ts
 * 剧情与玩家核心类型定义（与 PRD.md 保持一致，字段命名不要随意更改）。
 * 这里只放“类型”，不放任何业务逻辑或数据。
 */

/** 玩家 6 个核心属性 */
export interface PlayerStats {
    charm: number;      // 魅力：影响皇帝、贵人、社交剧情
    wisdom: number;     // 智谋：影响破局、识破陷害
    etiquette: number;  // 礼仪：影响宫规、晋升、宴会
    scheming: number;   // 心计：影响宫斗、反击、陷害
    health: number;     // 体力：太低会病倒或死亡
    prestige: number;   // 威望：影响宫女、太监、下人服从
}

/** 与主要 NPC / 阵营的好感关系值 */
export interface PlayerRelations {
    emperorFavor: number;  // 皇帝好感
    queenFavor: number;    // 皇后好感
    consortFavor: number;  // 贵妃好感
    maidFavor: number;     // 宫女阵营好感
    eunuchFavor: number;   // 太监消息网好感
}

// 注：衣服相关类型（DressItem / DressPart / DressRarity / DressUnlockType 等）
// 第二阶段已迁移到 wardrobe/DressTypes.ts，作为换装系统的唯一类型来源。

/** 选择产生的效果类型 */
export type ChoiceEffectType =
    | 'add_stat'
    | 'add_relation'
    | 'add_item'
    | 'change_rank'
    | 'set_flag'
    | 'add_currency'
    | 'unlock_dress'; // 第二阶段：剧情解锁衣服

/** 选择效果：对玩家数据做一次改动 */
export interface ChoiceEffect {
    type: ChoiceEffectType;
    key: string;
    value: number | string | boolean;
}

/** 选择条件：用于判断某个选项是否可选 */
export interface ChoiceCondition {
    type: 'stat' | 'relation' | 'flag' | 'item' | 'rank';
    key: string;
    operator: '>=' | '<=' | '==' | '!=';
    value: number | string | boolean;
}

/** 选项触发的特殊动作（用于结局节点等无 nextNode 的场景） */
export type ChoiceAction = 'restart' | 'main_menu';

/** 一个剧情选项 */
export interface StoryChoice {
    id: string;
    text: string;
    nextNodeId?: string;          // 跳转到的下一个节点
    effects?: ChoiceEffect[];     // 选择后对玩家数据的影响
    conditions?: ChoiceCondition[]; // 满足条件才可选（不满足则置灰/隐藏）
    deathEndingId?: string;       // 若存在，则选择后触发死亡结局
    action?: ChoiceAction;        // 特殊动作（重新开始 / 返回主界面）
}

/** 一个剧情节点 */
export interface StoryNode {
    id: string;
    chapterId: string;
    title: string;
    content: string;
    background?: string;   // 背景占位标识（首版用纯色映射）
    character?: string;    // 出场角色标识
    checkpoint?: boolean;  // 是否为存档/复活检查点
    isEnding?: boolean;    // 是否为阶段性（成功）结局节点
    endingTitle?: string;  // 结局标题（isEnding 时使用）
    choices: StoryChoice[];
}

/** 死亡 / 失败结局描述 */
export interface DeathEnding {
    id: string;
    title: string;
    content: string;
}

/** 复活规则 */
export interface ReviveState {
    todayCount: number;
    chapterCount: number;
    lastDate: string;
}

/** 货币与资源 */
export interface PlayerCurrencies {
    silver: number;     // 银两
    jade: number;       // 玉佩
    energy: number;     // 体力（资源层，区别于 stats.health）
    retryToken: number; // 重选令
}

/** 玩家存档结构（带 version，结构变更时升级 version 并迁移） */
export interface PlayerSaveData {
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

    currencies: PlayerCurrencies;

    revive: ReviveState;

    endingsUnlocked: string[];

    /** 最近 checkpoint 的节点 id（用于复活兜底，PRD 字段之外的实现扩展） */
    lastCheckpointNodeId?: string;
}
