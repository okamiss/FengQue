/**
 * GameConfig.ts
 * 全局数值/常量配置。所有“可调参数”集中在这里，方便策划调整，业务层不要写死。
 */

import { PlayerStats, PlayerRelations, PlayerCurrencies } from '../story/StoryTypes';

/** 本地存档 key 与版本 */
export const SAVE_KEY = 'fengque_save';
export const SAVE_VERSION = 1;

/** 默认玩家名（现代穿越女主，原创角色） */
export const DEFAULT_PLAYER_NAME = '苏念';

/** 起始剧情节点 */
export const START_NODE_ID = 'ch1_001';

/** 属性上下限（health 最低为 0，低于等于 0 触发死亡） */
export const STAT_MIN = 0;
export const STAT_MAX = 99;

/** 初始属性 */
export const INITIAL_STATS: PlayerStats = {
    charm: 1,
    wisdom: 1,
    etiquette: 1,
    scheming: 1,
    health: 5,
    prestige: 0,
};

/** 初始关系值 */
export const INITIAL_RELATIONS: PlayerRelations = {
    emperorFavor: 0,
    queenFavor: 0,
    consortFavor: 0,
    maidFavor: 0,
    eunuchFavor: 0,
};

/** 初始货币 */
export const INITIAL_CURRENCIES: PlayerCurrencies = {
    silver: 0,
    jade: 0,
    energy: 10,
    retryToken: 0,
};

/** 初始身份 */
export const INITIAL_RANK = 'rough_maid';

/** 复活规则（PRD：每章 1 次，每天 3 次，回到最近 checkpoint） */
export const REVIVE_RULE = {
    maxRevivePerChapter: 1,
    maxRevivePerDay: 3,
};

/** 身份 id -> 中文名（与 RankConfig 保持一致；RankConfig 为系统层唯一来源，此处供 UI 快速取名） */
export const RANK_NAMES: Record<string, string> = {
    rough_maid: '粗使宫女',
    second_maid: '二等宫女',
    first_maid: '一等宫女',
    chief_maid: '掌事宫女',
    female_officer: '女官',
    cairen: '采女',
    daying: '答应',
    changzai: '常在',
    guiren: '贵人',
};

/** 属性 key -> 中文名（用于 UI 展示） */
export const STAT_NAMES: Record<keyof PlayerStats, string> = {
    charm: '魅力',
    wisdom: '智谋',
    etiquette: '礼仪',
    scheming: '心计',
    health: '体力',
    prestige: '威望',
};

/** 关系 key -> 中文名 */
export const RELATION_NAMES: Record<keyof PlayerRelations, string> = {
    emperorFavor: '皇帝',
    queenFavor: '皇后',
    consortFavor: '贵妃',
    maidFavor: '宫女',
    eunuchFavor: '太监',
};

/** 角色标识 -> 中文名（用于剧情界面角色名展示） */
export const CHARACTER_NAMES: Record<string, string> = {
    aunt_li: '掌事姑姑',
    queen: '沈皇后',
    consort: '容贵妃',
    emperor: '萧景珩',
    taitang: '阿棠',
    xiaoluzi: '小禄子',
    self: '苏念',
    narrator: '',
};

/**
 * 背景标识 -> 占位颜色（RGB），首版无美术，用纯色块代替背景图。
 * 后续接入美术时，这里换成图片资源映射即可，UI 不用改。
 */
export const BACKGROUND_COLORS: Record<string, [number, number, number]> = {
    palace_gate: [90, 60, 55],   // 宫门：暗红
    sewing_room: [70, 80, 70],   // 尚衣局：青灰
    garden: [80, 95, 75],        // 御花园：草绿
    queen_room: [95, 80, 60],    // 皇后寝殿：暖金
    death_bg: [30, 25, 28],      // 死亡：暗黑
    default: [60, 50, 50],
};
