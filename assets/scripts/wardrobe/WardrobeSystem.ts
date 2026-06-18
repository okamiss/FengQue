/**
 * WardrobeSystem.ts
 * 衣橱换装系统：负责衣服的拥有、解锁、装备/卸下、属性加成计算等全部业务逻辑。
 * UI（WardrobePanel）只负责显示与点击，所有逻辑都走本系统。
 */

import { PlayerModel } from '../player/PlayerModel';
import { SaveService } from '../core/SaveService';
import { EventBus, GameEvents } from '../core/EventBus';
import { AdService } from '../monetization/AdService';
import { DressItem, DressPart, DressStatBonus } from './DressTypes';
import {
    DressConfig,
    getDressById,
    getDressesByPart,
    sumDressStatBonus,
} from '../config/DressConfig';

/** 操作结果 */
export interface WardrobeResult {
    success: boolean;
    reason?: string;
}

export class WardrobeSystem {
    private model: PlayerModel;

    constructor(model: PlayerModel) {
        this.model = model;
    }

    // ===== 查询 =====

    getAllDresses(): DressItem[] {
        return DressConfig;
    }

    getDressesByPart(part: DressPart): DressItem[] {
        return getDressesByPart(part);
    }

    getOwnedDresses(): DressItem[] {
        return DressConfig.filter((d) => this.isOwned(d.id));
    }

    getUnownedDresses(): DressItem[] {
        return DressConfig.filter((d) => !this.isOwned(d.id));
    }

    isOwned(id: string): boolean {
        return this.model.hasItem(id);
    }

    isEquipped(id: string): boolean {
        return this.model.isEquipped(id);
    }

    /** 取某部位当前装备的衣服（无则 null） */
    getEquippedByPart(part: DressPart): DressItem | null {
        for (const id of this.model.equippedDressIds) {
            const d = getDressById(id);
            if (d && d.part === part) return d;
        }
        return null;
    }

    /** 计算当前服装总属性加成 */
    calcDressBonus(): DressStatBonus {
        return sumDressStatBonus(this.model.equippedDressIds);
    }

    // ===== 解锁 =====

    /** 解锁（获得）一件衣服。已拥有视为成功。 */
    unlock(id: string): WardrobeResult {
        const dress = getDressById(id);
        if (!dress) return { success: false, reason: '衣服不存在' };
        if (this.isOwned(id)) return { success: true };
        this.model.addItem(id);
        this.persistAndNotify();
        return { success: true };
    }

    /** 银两/玉佩购买（unlockType === 'currency'） */
    purchase(id: string): WardrobeResult {
        const dress = getDressById(id);
        if (!dress) return { success: false, reason: '衣服不存在' };
        if (this.isOwned(id)) return { success: true };
        if (dress.unlockType !== 'currency') return { success: false, reason: '该衣服不可购买' };

        const cost = dress.unlockCondition || {};
        const cur = this.model.save.currencies;
        if (cost.silver && cur.silver < cost.silver) {
            return { success: false, reason: `银两不足（需 ${cost.silver}）` };
        }
        if (cost.jade && cur.jade < cost.jade) {
            return { success: false, reason: `玉佩不足（需 ${cost.jade}）` };
        }
        if (cost.silver) this.model.addCurrency('silver', -cost.silver);
        if (cost.jade) this.model.addCurrency('jade', -cost.jade);

        this.model.addItem(id);
        this.persistAndNotify();
        return { success: true };
    }

    /** 广告解锁占位（unlockType === 'ad'）：模拟看广告成功后解锁 */
    unlockByAd(id: string, onDone?: (r: WardrobeResult) => void): void {
        const dress = getDressById(id);
        if (!dress) {
            onDone?.({ success: false, reason: '衣服不存在' });
            return;
        }
        if (dress.unlockType !== 'ad') {
            onDone?.({ success: false, reason: '该衣服非广告解锁' });
            return;
        }
        AdService.showRewardedVideo((ok) => {
            if (ok) {
                const r = this.unlock(id);
                onDone?.(r);
            } else {
                onDone?.({ success: false, reason: '广告未完成' });
            }
        });
    }

    // ===== 装备 / 卸下 =====

    /** 装备一件衣服（必须已拥有；同部位旧衣服自动卸下） */
    equip(id: string): WardrobeResult {
        const dress = getDressById(id);
        if (!dress) return { success: false, reason: '衣服不存在' };
        if (!this.isOwned(id)) return { success: false, reason: '尚未拥有该衣服' };
        if (this.isEquipped(id)) return { success: true };

        // 移除同部位已装备的，再加入新的
        const next = this.model.equippedDressIds.filter((eid) => {
            const d = getDressById(eid);
            return !(d && d.part === dress.part);
        });
        next.push(id);
        this.model.setEquipped(next);
        this.persistAndNotify();
        return { success: true };
    }

    /** 卸下指定衣服 */
    unequip(id: string): WardrobeResult {
        if (!this.isEquipped(id)) return { success: true };
        const next = this.model.equippedDressIds.filter((eid) => eid !== id);
        this.model.setEquipped(next);
        this.persistAndNotify();
        return { success: true };
    }

    /** 卸下某部位 */
    unequipPart(part: DressPart): void {
        const next = this.model.equippedDressIds.filter((eid) => {
            const d = getDressById(eid);
            return !(d && d.part === part);
        });
        this.model.setEquipped(next);
        this.persistAndNotify();
    }

    /** 一键卸下全部 */
    unequipAll(): void {
        this.model.setEquipped([]);
        this.persistAndNotify();
    }

    // ===== 内部 =====

    private persistAndNotify(): void {
        SaveService.save(this.model.save);
        EventBus.emit(GameEvents.WARDROBE_CHANGED, this.model.save);
        EventBus.emit(GameEvents.STATS_CHANGED, this.model.save);
    }
}
