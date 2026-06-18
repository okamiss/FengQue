/**
 * PlayerModel.ts
 * 玩家数据模型：包裹 PlayerSaveData，提供读写方法。
 * 只管“数据”，不管存储（存储交给 SaveService）、不管剧情流程（交给 StorySystem）。
 */

import { PlayerSaveData, PlayerStats, PlayerRelations } from '../story/StoryTypes';

export class PlayerModel {
    private _save: PlayerSaveData;

    /** checkpoint 处的存档快照（内存态，用于死亡复活时还原属性） */
    private _checkpoint: PlayerSaveData | null = null;

    constructor(save: PlayerSaveData) {
        this._save = save;
    }

    /** 直接访问底层存档（只读用途；写操作请走下面的方法） */
    get save(): PlayerSaveData {
        return this._save;
    }

    get stats(): PlayerStats {
        return this._save.stats;
    }

    get relations(): PlayerRelations {
        return this._save.relations;
    }

    get rankId(): string {
        return this._save.rankId;
    }

    get currentNodeId(): string {
        return this._save.currentNodeId;
    }

    set currentNodeId(id: string) {
        this._save.currentNodeId = id;
    }

    get currentChapterId(): string {
        return this._save.currentChapterId;
    }

    set currentChapterId(id: string) {
        this._save.currentChapterId = id;
    }

    setRank(rankId: string): void {
        this._save.rankId = rankId;
    }

    getFlag(key: string): boolean {
        return !!this._save.flags[key];
    }

    setFlag(key: string, value: boolean): void {
        this._save.flags[key] = value;
    }

    hasItem(id: string): boolean {
        return this._save.ownedDressIds.indexOf(id) >= 0;
    }

    addItem(id: string): void {
        if (!this.hasItem(id)) this._save.ownedDressIds.push(id);
    }

    addCurrency(key: string, value: number): void {
        const c = this._save.currencies as unknown as Record<string, number>;
        if (typeof c[key] === 'number') {
            c[key] = c[key] + value;
        }
    }

    unlockEnding(id: string): void {
        if (this._save.endingsUnlocked.indexOf(id) < 0) {
            this._save.endingsUnlocked.push(id);
        }
    }

    // ---- checkpoint 快照 ----

    /** 记录当前状态为 checkpoint（深拷贝），用于复活还原 */
    saveCheckpoint(nodeId: string): void {
        this._save.lastCheckpointNodeId = nodeId;
        this._checkpoint = PlayerModel.clone(this._save);
    }

    /** 是否有可用的内存 checkpoint 快照 */
    hasCheckpoint(): boolean {
        return this._checkpoint !== null;
    }

    /** 从 checkpoint 还原（深拷贝回写），返回 checkpoint 的节点 id */
    restoreFromCheckpoint(): string | null {
        if (!this._checkpoint) return this._save.lastCheckpointNodeId || null;
        this._save = PlayerModel.clone(this._checkpoint);
        return this._save.currentNodeId;
    }

    /** 深拷贝存档（结构均为 JSON 可序列化） */
    static clone(data: PlayerSaveData): PlayerSaveData {
        return JSON.parse(JSON.stringify(data));
    }
}
