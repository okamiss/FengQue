/**
 * SaveService.ts
 * 统一存档读写。首版使用本地存储（Cocos sys.localStorage，微信/抖音小游戏均兼容）。
 * 业务层只通过本服务读写 PlayerSaveData，不直接碰存储 API；后续升级云存档只改这里。
 */

import { sys } from 'cc';
import { PlayerSaveData } from '../story/StoryTypes';
import {
    SAVE_KEY,
    SAVE_VERSION,
    DEFAULT_PLAYER_NAME,
    START_NODE_ID,
    INITIAL_STATS,
    INITIAL_RELATIONS,
    INITIAL_CURRENCIES,
    INITIAL_RANK,
} from '../config/GameConfig';
import { getDefaultOwnedDressIds, getDefaultEquippedDressIds } from '../config/DressConfig';

export class SaveService {
    /** 生成一份全新的默认存档 */
    static createDefault(playerName: string = DEFAULT_PLAYER_NAME): PlayerSaveData {
        return {
            version: SAVE_VERSION,
            playerName,
            currentChapterId: 'chapter_1',
            currentNodeId: START_NODE_ID,
            rankId: INITIAL_RANK,
            stats: { ...INITIAL_STATS },
            relations: { ...INITIAL_RELATIONS },
            flags: {},
            ownedDressIds: getDefaultOwnedDressIds(),
            equippedDressIds: getDefaultEquippedDressIds(),
            currencies: { ...INITIAL_CURRENCIES },
            revive: {
                todayCount: 0,
                chapterCount: 0,
                lastDate: SaveService.today(),
            },
            endingsUnlocked: [],
            lastCheckpointNodeId: START_NODE_ID,
        };
    }

    /** 保存存档 */
    static save(data: PlayerSaveData): void {
        try {
            sys.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[SaveService] save failed:', e);
        }
    }

    /** 读取存档；无存档或解析失败返回 null */
    static load(): PlayerSaveData | null {
        try {
            const raw = sys.localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw) as PlayerSaveData;
            return SaveService.migrate(data);
        } catch (e) {
            console.error('[SaveService] load failed:', e);
            return null;
        }
    }

    /** 是否存在存档 */
    static hasSave(): boolean {
        return !!sys.localStorage.getItem(SAVE_KEY);
    }

    /** 删除存档 */
    static clear(): void {
        sys.localStorage.removeItem(SAVE_KEY);
    }

    /** 存档结构迁移（版本升级时在此补充字段/转换；首版只做兜底补全） */
    private static migrate(data: PlayerSaveData): PlayerSaveData {
        if (data.version !== SAVE_VERSION) {
            // 后续版本在此做字段迁移；首版直接对齐版本号并补全缺省字段
            data.version = SAVE_VERSION;
        }
        if (!data.lastCheckpointNodeId) {
            data.lastCheckpointNodeId = data.currentNodeId || START_NODE_ID;
        }
        if (!data.revive) {
            data.revive = { todayCount: 0, chapterCount: 0, lastDate: SaveService.today() };
        }
        // 第二阶段：衣橱 / 身份字段兜底
        if (!Array.isArray(data.ownedDressIds) || data.ownedDressIds.length === 0) {
            data.ownedDressIds = getDefaultOwnedDressIds();
        }
        if (!Array.isArray(data.equippedDressIds)) {
            data.equippedDressIds = getDefaultEquippedDressIds();
        }
        if (!data.rankId) {
            data.rankId = INITIAL_RANK;
        }
        return data;
    }

    /** 当前日期字符串（yyyy-mm-dd），用于每日复活次数重置 */
    static today(): string {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }
}
