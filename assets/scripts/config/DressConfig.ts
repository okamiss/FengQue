/**
 * DressConfig.ts
 * 衣服配置（配置驱动）。共 12 件：
 *   默认拥有 3 / 剧情解锁 3 / 晋升解锁 3 / 银两购买 2 / 广告占位 1
 * 部位分布：发型2 / 妆容2 / 服饰3 / 披风1 / 饰品2 / 手持2
 *
 * 衣服 statBonus 只作为“总属性加成”，不会写入玩家基础属性。
 */

import { DressItem, DressPart, DressStatBonus } from '../wardrobe/DressTypes';
import { PlayerStats } from '../story/StoryTypes';

export const DressConfig: DressItem[] = [
    // ===== 默认拥有（3）=====
    {
        id: 'hair_plain',
        name: '素青发髻',
        part: 'hair',
        rarity: 'normal',
        description: '最朴素的宫女发髻，规整干净。',
        statBonus: { etiquette: 1 },
        tags: ['朴素'],
        unlockType: 'default',
    },
    {
        id: 'makeup_clear',
        name: '清水淡妆',
        part: 'makeup',
        rarity: 'normal',
        description: '几乎不施粉黛，清清爽爽。',
        statBonus: { charm: 1 },
        tags: ['清爽'],
        unlockType: 'default',
    },
    {
        id: 'dress_light_green',
        name: '浅绿宫装',
        part: 'dress',
        rarity: 'normal',
        description: '尚衣局发放的浅绿色粗布宫装。',
        statBonus: { etiquette: 1, charm: 1 },
        tags: ['日常'],
        unlockType: 'default',
    },

    // ===== 剧情解锁（3）=====
    {
        id: 'hair_magnolia',
        name: '玉兰簪花',
        part: 'hair',
        rarity: 'rare',
        description: '一支白玉兰发簪，清丽脱俗。',
        statBonus: { charm: 2, etiquette: 1 },
        tags: ['清雅', '宫宴'],
        unlockType: 'story',
        unlockCondition: { flag: 'unlock_hair_magnolia' },
    },
    {
        id: 'cloak_spring_willow',
        name: '春柳披烟',
        part: 'cloak',
        rarity: 'rare',
        description: '烟青色薄披风，行走间如柳拂风。',
        statBonus: { charm: 5, etiquette: 3 },
        tags: ['清雅', '端庄'],
        unlockType: 'story',
        unlockCondition: { flag: 'unlock_cloak_spring_willow' },
    },
    {
        id: 'accessory_sujuan_pouch',
        name: '素绢香囊',
        part: 'accessory',
        rarity: 'rare',
        description: '素绢绣成的香囊，暗香盈袖。',
        statBonus: { wisdom: 2, etiquette: 1 },
        tags: ['雅致'],
        unlockType: 'story',
        unlockCondition: { flag: 'unlock_accessory_sujuan_pouch' },
    },

    // ===== 晋升解锁（3）=====
    {
        id: 'makeup_daimei',
        name: '螺黛宫妆',
        part: 'makeup',
        rarity: 'epic',
        description: '掌事宫女方可上的精致螺黛妆。',
        statBonus: { charm: 3, scheming: 1 },
        tags: ['精致', '掌事'],
        unlockType: 'rank',
        unlockCondition: { rankId: 'chief_maid' },
    },
    {
        id: 'dress_officer_green',
        name: '女官青衣',
        part: 'dress',
        rarity: 'epic',
        description: '内廷女官的青色官服，端庄而有威仪。',
        statBonus: { etiquette: 4, wisdom: 3, prestige: 2 },
        tags: ['端庄', '威仪', '女官'],
        unlockType: 'rank',
        unlockCondition: { rankId: 'female_officer' },
    },
    {
        id: 'hand_cairen_fan',
        name: '采女团扇',
        part: 'hand',
        rarity: 'epic',
        description: '采女所持的描金团扇，半遮面而生姿。',
        statBonus: { charm: 2, etiquette: 2 },
        tags: ['娇俏', '采女'],
        unlockType: 'rank',
        unlockCondition: { rankId: 'cairen' },
    },

    // ===== 银两购买（2）=====
    {
        id: 'accessory_pearl_earring',
        name: '珍珠耳坠',
        part: 'accessory',
        rarity: 'rare',
        description: '一对温润的珍珠耳坠。',
        statBonus: { charm: 3 },
        tags: ['温婉'],
        unlockType: 'currency',
        unlockCondition: { silver: 50 },
    },
    {
        id: 'hand_sujuan_fan',
        name: '素绢团扇',
        part: 'hand',
        rarity: 'normal',
        description: '素白绢面团扇，简洁素净。',
        statBonus: { charm: 1, etiquette: 1 },
        tags: ['素净'],
        unlockType: 'currency',
        unlockCondition: { silver: 30 },
    },

    // ===== 广告占位（1）=====
    {
        id: 'dress_liuguang',
        name: '流光宫装',
        part: 'dress',
        rarity: 'legend',
        description: '流光溢彩的限定宫装，惊艳绝伦。',
        statBonus: { charm: 6, etiquette: 3, prestige: 2 },
        tags: ['限定', '惊艳'],
        unlockType: 'ad',
    },
];

/** 默认拥有的衣服 id */
export function getDefaultOwnedDressIds(): string[] {
    return DressConfig.filter((d) => d.unlockType === 'default').map((d) => d.id);
}

/** 默认装备（每个默认部位各一件，默认拥有的即默认穿上） */
export function getDefaultEquippedDressIds(): string[] {
    return getDefaultOwnedDressIds();
}

/** 按 id 取衣服 */
export function getDressById(id: string): DressItem | undefined {
    return DressConfig.find((d) => d.id === id);
}

/** 按部位取衣服列表 */
export function getDressesByPart(part: DressPart): DressItem[] {
    return DressConfig.filter((d) => d.part === part);
}

/** 取某身份晋升时解锁的衣服 id 列表 */
export function getRankUnlockDressIds(rankId: string): string[] {
    return DressConfig.filter(
        (d) => d.unlockType === 'rank' && d.unlockCondition?.rankId === rankId
    ).map((d) => d.id);
}

/**
 * 计算一组已装备衣服的总属性加成（纯函数，供属性系统与换装系统共用，避免重复实现）。
 */
export function sumDressStatBonus(equippedIds: string[]): DressStatBonus {
    const bonus: DressStatBonus = {};
    equippedIds.forEach((id) => {
        const dress = getDressById(id);
        if (!dress) return;
        (Object.keys(dress.statBonus) as (keyof PlayerStats)[]).forEach((k) => {
            bonus[k] = (bonus[k] || 0) + (dress.statBonus[k] || 0);
        });
    });
    return bonus;
}
