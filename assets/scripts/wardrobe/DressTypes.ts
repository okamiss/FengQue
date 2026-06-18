/**
 * DressTypes.ts
 * 换装系统类型定义（第二阶段）。换装相关类型的唯一来源。
 */

import { PlayerStats } from '../story/StoryTypes';

/** 衣服部位 */
export type DressPart = 'hair' | 'makeup' | 'dress' | 'cloak' | 'accessory' | 'hand';

/** 衣服稀有度 */
export type DressRarity = 'normal' | 'rare' | 'epic' | 'legend';

/**
 * 解锁方式：
 * default 默认拥有 / story 剧情获得 / rank 晋升获得 /
 * currency 银两(玉佩)购买 / ad 广告解锁占位 / share 分享解锁占位
 */
export type DressUnlockType = 'default' | 'story' | 'rank' | 'currency' | 'ad' | 'share';

/** 衣服属性加成（仅影响展示用的“总属性”，不写入基础属性） */
export type DressStatBonus = Partial<PlayerStats>;

/** 解锁条件（按 unlockType 取用对应字段） */
export interface DressUnlockCondition {
    silver?: number;   // currency：所需银两
    jade?: number;     // currency：所需玉佩
    rankId?: string;   // rank：由哪个身份晋升发放
    flag?: string;     // story：关联剧情 flag（说明用途，可选）
}

/** 一件衣服 */
export interface DressItem {
    id: string;
    name: string;
    part: DressPart;
    rarity: DressRarity;
    description?: string;
    statBonus: DressStatBonus;
    tags: string[];
    unlockType: DressUnlockType;
    unlockCondition?: DressUnlockCondition;
}

/** 部位 -> 中文名 */
export const DRESS_PART_NAMES: Record<DressPart, string> = {
    hair: '发型',
    makeup: '妆容',
    dress: '服饰',
    cloak: '披风',
    accessory: '饰品',
    hand: '手持',
};

/** 部位展示顺序 */
export const DRESS_PART_ORDER: DressPart[] = ['hair', 'makeup', 'dress', 'cloak', 'accessory', 'hand'];

/** 稀有度 -> 中文名 */
export const DRESS_RARITY_NAMES: Record<DressRarity, string> = {
    normal: '普通',
    rare: '稀有',
    epic: '珍品',
    legend: '传说',
};

/** 稀有度 -> 颜色（RGB），用于 UI 区分 */
export const DRESS_RARITY_COLORS: Record<DressRarity, [number, number, number]> = {
    normal: [180, 180, 180],
    rare: [90, 160, 220],
    epic: [180, 120, 220],
    legend: [220, 170, 80],
};
