/**
 * RankConfig.ts
 * 身份等级配置（配置驱动）。第二阶段实现 9 级：粗使宫女 → 贵人。
 *
 * 约定：每个身份的 promotionNeed 表示“晋升进入该身份所需的条件”。
 *   - statBonus 为该身份的被动属性加成（只计入总属性，不写入基础属性）。
 *   - unlockRewards 为晋升进入该身份时一次性发放的奖励（货币/衣服/flag）。
 */

import { PlayerStats, PlayerRelations } from '../story/StoryTypes';

/** 晋升条件 */
export interface PromotionNeed {
    /** 指定属性需达到（按总属性判定） */
    stats?: Partial<PlayerStats>;
    /** 指定 NPC 好感需达到 */
    relations?: Partial<PlayerRelations>;
    /** 剧情章节需达到（数字，如 2 表示需进行到第 2 章） */
    chapter?: number;
    /** 需要已存在的剧情 flag */
    flags?: string[];
    /** 晋升消耗的货币 */
    cost?: { silver?: number; jade?: number };
}

/** 晋升发放的奖励 */
export interface UnlockRewards {
    silver?: number;
    jade?: number;
    /** 解锁的衣服 id 列表 */
    dresses?: string[];
    /** 设置的剧情 flag */
    flags?: string[];
}

/** 一个身份等级 */
export interface RankDef {
    id: string;
    name: string;
    title: string;
    order: number;
    description: string;
    statBonus: Partial<PlayerStats>;
    unlockRewards?: UnlockRewards;
    promotionNeed?: PromotionNeed;
}

export const RankConfig: RankDef[] = [
    {
        id: 'rough_maid',
        name: '粗使宫女',
        title: '初入深宫',
        order: 1,
        description: '宫中最低等的杂役宫女，做最苦最累的差事。',
        statBonus: {},
        // 起始身份，无晋升条件
    },
    {
        id: 'second_maid',
        name: '二等宫女',
        title: '略通宫规',
        order: 2,
        description: '已能料理寻常差事，不再被随意责打。',
        statBonus: { etiquette: 1 },
        unlockRewards: { silver: 30 },
        promotionNeed: {
            stats: { etiquette: 3, wisdom: 2 },
            chapter: 2,
        },
    },
    {
        id: 'first_maid',
        name: '一等宫女',
        title: '崭露头角',
        order: 3,
        description: '在尚衣局站稳脚跟，渐有体面。',
        statBonus: { etiquette: 2, prestige: 1 },
        unlockRewards: { silver: 50 },
        promotionNeed: {
            stats: { etiquette: 5, wisdom: 4 },
            chapter: 3,
        },
    },
    {
        id: 'chief_maid',
        name: '掌事宫女',
        title: '执掌一方',
        order: 4,
        description: '可管束下等宫女，是宫女中的头脸人物。',
        statBonus: { prestige: 3, wisdom: 1 },
        unlockRewards: { silver: 80, dresses: ['makeup_daimei'] },
        promotionNeed: {
            stats: { wisdom: 7, prestige: 5 },
            chapter: 3,
            cost: { silver: 50 },
        },
    },
    {
        id: 'female_officer',
        name: '女官',
        title: '内廷女史',
        order: 5,
        description: '脱离宫女之列，成为执掌内廷事务的女官。',
        statBonus: { etiquette: 3, wisdom: 3, prestige: 3 },
        unlockRewards: { silver: 120, jade: 1, dresses: ['dress_officer_green'] },
        promotionNeed: {
            stats: { wisdom: 10, etiquette: 10, prestige: 8 },
            chapter: 4,
        },
    },
    {
        id: 'cairen',
        name: '采女',
        title: '初承恩泽',
        order: 6,
        description: '正式踏入后宫，成为最低位份的妃嫔。',
        statBonus: { charm: 3, etiquette: 3 },
        unlockRewards: { jade: 2, dresses: ['hand_cairen_fan'] },
        promotionNeed: {
            stats: { charm: 12, etiquette: 12 },
            relations: { emperorFavor: 5 },
            chapter: 4,
        },
    },
    {
        id: 'daying',
        name: '答应',
        title: '后宫一席',
        order: 7,
        description: '位份虽低，却已能在御前答应侍奉。',
        statBonus: { charm: 4, prestige: 2 },
        unlockRewards: { jade: 2 },
        promotionNeed: {
            stats: { charm: 15, scheming: 8 },
            relations: { emperorFavor: 8 },
            chapter: 4,
        },
    },
    {
        id: 'changzai',
        name: '常在',
        title: '渐得恩宠',
        order: 8,
        description: '常伴君侧，恩宠渐隆。',
        statBonus: { charm: 5, prestige: 3 },
        unlockRewards: { jade: 3 },
        promotionNeed: {
            stats: { charm: 18, scheming: 12 },
            relations: { emperorFavor: 12 },
            chapter: 4,
        },
    },
    {
        id: 'guiren',
        name: '贵人',
        title: '位列贵人',
        order: 9,
        description: '后宫中举足轻重的位份，离妃嫔之列仅一步之遥。',
        statBonus: { charm: 6, prestige: 5, scheming: 2 },
        unlockRewards: { jade: 5 },
        promotionNeed: {
            stats: { charm: 22, scheming: 16, prestige: 12 },
            relations: { emperorFavor: 18 },
            chapter: 4,
        },
    },
];

/** 按 id 取身份 */
export function getRankById(id: string): RankDef | undefined {
    return RankConfig.find((r) => r.id === id);
}

/** 按 order 取身份 */
export function getRankByOrder(order: number): RankDef | undefined {
    return RankConfig.find((r) => r.order === order);
}

/** 取下一个身份（无则返回 undefined，表示已达本阶段最高） */
export function getNextRank(currentId: string): RankDef | undefined {
    const cur = getRankById(currentId);
    if (!cur) return undefined;
    return getRankByOrder(cur.order + 1);
}

/** 取某身份的被动属性加成 */
export function getRankStatBonus(rankId: string): Partial<PlayerStats> {
    return getRankById(rankId)?.statBonus || {};
}
