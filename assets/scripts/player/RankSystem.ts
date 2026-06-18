/**
 * RankSystem.ts
 * 身份晋升系统：当前身份、下一身份、晋升条件判定、执行晋升、发放奖励。
 * UI（RankPanel）只负责显示与点击，所有逻辑都走本系统。
 */

import { PlayerModel } from './PlayerModel';
import { AttributeSystem } from './AttributeSystem';
import { WardrobeSystem } from '../wardrobe/WardrobeSystem';
import { SaveService } from '../core/SaveService';
import { EventBus, GameEvents } from '../core/EventBus';
import { PlayerStats, PlayerRelations } from '../story/StoryTypes';
import { RankDef, getRankById, getNextRank } from '../config/RankConfig';
import { STAT_NAMES, RELATION_NAMES, INITIAL_RANK } from '../config/GameConfig';

/** 单条晋升条件的达成情况（供 UI 展示） */
export interface PromotionCondition {
    label: string;     // 条件描述，如 “礼仪 ≥ 3”
    current: string;   // 当前值描述
    ok: boolean;       // 是否达成
}

/** 晋升结果 */
export interface PromotionResult {
    success: boolean;
    rank?: RankDef;
    reason?: string;
    unmet?: PromotionCondition[];
}

export class RankSystem {
    private model: PlayerModel;
    private wardrobe: WardrobeSystem;

    constructor(model: PlayerModel, wardrobe: WardrobeSystem) {
        this.model = model;
        this.wardrobe = wardrobe;
    }

    /** 当前身份 */
    getCurrentRank(): RankDef {
        return getRankById(this.model.rankId) || getRankById(INITIAL_RANK)!;
    }

    /** 下一身份（已最高则 null） */
    getNextRank(): RankDef | null {
        return getNextRank(this.model.rankId) || null;
    }

    /** 当前剧情章节号（解析 currentChapterId，如 chapter_4 -> 4） */
    getCurrentChapterNumber(): number {
        const id = this.model.currentChapterId || '';
        const m = id.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 1;
    }

    /** 取晋升到下一身份的全部条件及达成情况 */
    getPromotionConditions(): PromotionCondition[] {
        const next = this.getNextRank();
        if (!next || !next.promotionNeed) return [];
        const need = next.promotionNeed;
        const total = AttributeSystem.getTotalStats(this.model);
        const conds: PromotionCondition[] = [];

        // 属性条件（按总属性）
        if (need.stats) {
            (Object.keys(need.stats) as (keyof PlayerStats)[]).forEach((k) => {
                const req = need.stats![k] as number;
                const cur = total[k];
                conds.push({
                    label: `${STAT_NAMES[k]} ≥ ${req}`,
                    current: `当前 ${cur}`,
                    ok: cur >= req,
                });
            });
        }

        // 好感条件
        if (need.relations) {
            (Object.keys(need.relations) as (keyof PlayerRelations)[]).forEach((k) => {
                const req = need.relations![k] as number;
                const cur = this.model.relations[k];
                conds.push({
                    label: `${RELATION_NAMES[k]}好感 ≥ ${req}`,
                    current: `当前 ${cur}`,
                    ok: cur >= req,
                });
            });
        }

        // 章节条件
        if (typeof need.chapter === 'number') {
            const cur = this.getCurrentChapterNumber();
            conds.push({
                label: `剧情进度 ≥ 第 ${need.chapter} 章`,
                current: `当前第 ${cur} 章`,
                ok: cur >= need.chapter,
            });
        }

        // flag 条件
        if (need.flags) {
            need.flags.forEach((f) => {
                conds.push({
                    label: `需达成剧情：${f}`,
                    current: this.model.getFlag(f) ? '已达成' : '未达成',
                    ok: this.model.getFlag(f),
                });
            });
        }

        // 消耗货币条件
        if (need.cost) {
            if (need.cost.silver) {
                const cur = this.model.save.currencies.silver;
                conds.push({
                    label: `消耗银两 ${need.cost.silver}`,
                    current: `当前 ${cur}`,
                    ok: cur >= need.cost.silver,
                });
            }
            if (need.cost.jade) {
                const cur = this.model.save.currencies.jade;
                conds.push({
                    label: `消耗玉佩 ${need.cost.jade}`,
                    current: `当前 ${cur}`,
                    ok: cur >= need.cost.jade,
                });
            }
        }

        return conds;
    }

    /** 是否满足全部晋升条件 */
    canPromote(): boolean {
        const next = this.getNextRank();
        if (!next) return false;
        const conds = this.getPromotionConditions();
        return conds.every((c) => c.ok);
    }

    /** 执行晋升 */
    promote(): PromotionResult {
        const next = this.getNextRank();
        if (!next) return { success: false, reason: '已是当前阶段最高身份' };

        const conds = this.getPromotionConditions();
        const unmet = conds.filter((c) => !c.ok);
        if (unmet.length > 0) {
            return { success: false, reason: '晋升条件未满足', unmet };
        }

        // 扣除消耗
        const cost = next.promotionNeed?.cost;
        if (cost) {
            if (cost.silver) this.model.addCurrency('silver', -cost.silver);
            if (cost.jade) this.model.addCurrency('jade', -cost.jade);
        }

        // 更新身份
        this.model.setRank(next.id);

        // 发放奖励
        this.applyRewards(next);

        // 自动保存并广播
        SaveService.save(this.model.save);
        EventBus.emit(GameEvents.RANK_CHANGED, this.model.save);
        EventBus.emit(GameEvents.STATS_CHANGED, this.model.save);

        return { success: true, rank: next };
    }

    /** 发放某身份的晋升奖励（货币 / 衣服 / flag） */
    private applyRewards(rank: RankDef): void {
        const rewards = rank.unlockRewards;
        if (!rewards) return;
        if (rewards.silver) this.model.addCurrency('silver', rewards.silver);
        if (rewards.jade) this.model.addCurrency('jade', rewards.jade);
        if (rewards.flags) rewards.flags.forEach((f) => this.model.setFlag(f, true));
        if (rewards.dresses) rewards.dresses.forEach((id) => this.wardrobe.unlock(id));
    }
}
