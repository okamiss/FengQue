/**
 * AttributeSystem.ts
 * 属性系统：负责把“选择效果”应用到玩家数据，以及判断“选择条件”是否满足。
 * 纯逻辑、无状态（静态方法），数据全部来自 PlayerModel。
 */

import { PlayerModel } from './PlayerModel';
import { ChoiceEffect, ChoiceCondition, PlayerStats, PlayerRelations } from '../story/StoryTypes';
import { STAT_MIN, STAT_MAX } from '../config/GameConfig';

export class AttributeSystem {
    /** 应用单条效果到玩家数据 */
    static applyEffect(model: PlayerModel, effect: ChoiceEffect): void {
        switch (effect.type) {
            case 'add_stat':
                AttributeSystem.addStat(model, effect.key as keyof PlayerStats, Number(effect.value));
                break;
            case 'add_relation':
                AttributeSystem.addRelation(model, effect.key as keyof PlayerRelations, Number(effect.value));
                break;
            case 'add_currency':
                model.addCurrency(effect.key, Number(effect.value));
                break;
            case 'set_flag':
                model.setFlag(effect.key, Boolean(effect.value));
                break;
            case 'change_rank':
                model.setRank(String(effect.value));
                break;
            case 'add_item':
                model.addItem(String(effect.value));
                break;
            default:
                console.warn('[AttributeSystem] unknown effect type:', (effect as ChoiceEffect).type);
        }
    }

    /** 批量应用效果 */
    static applyEffects(model: PlayerModel, effects?: ChoiceEffect[]): void {
        if (!effects) return;
        effects.forEach((e) => AttributeSystem.applyEffect(model, e));
    }

    /** 增减属性并钳制到 [STAT_MIN, STAT_MAX] */
    static addStat(model: PlayerModel, key: keyof PlayerStats, delta: number): void {
        const stats = model.stats;
        if (typeof stats[key] !== 'number') return;
        stats[key] = AttributeSystem.clamp(stats[key] + delta);
    }

    /** 增减关系值（关系值可为负，仅做上限钳制） */
    static addRelation(model: PlayerModel, key: keyof PlayerRelations, delta: number): void {
        const rel = model.relations;
        if (typeof rel[key] !== 'number') return;
        rel[key] = Math.min(STAT_MAX, rel[key] + delta);
    }

    static clamp(v: number): number {
        return Math.max(STAT_MIN, Math.min(STAT_MAX, v));
    }

    /** 玩家是否已死亡（体力 <= 0） */
    static isDead(model: PlayerModel): boolean {
        return model.stats.health <= 0;
    }

    /** 判断单个条件是否满足 */
    static checkCondition(model: PlayerModel, cond: ChoiceCondition): boolean {
        let current: number | string | boolean;
        switch (cond.type) {
            case 'stat':
                current = (model.stats as unknown as Record<string, number>)[cond.key];
                break;
            case 'relation':
                current = (model.relations as unknown as Record<string, number>)[cond.key];
                break;
            case 'flag':
                current = model.getFlag(cond.key);
                break;
            case 'item':
                current = model.hasItem(cond.key);
                break;
            case 'rank':
                current = model.rankId;
                break;
            default:
                return true;
        }
        return AttributeSystem.compare(current, cond.operator, cond.value);
    }

    /** 判断一组条件是否全部满足 */
    static checkConditions(model: PlayerModel, conds?: ChoiceCondition[]): boolean {
        if (!conds || conds.length === 0) return true;
        return conds.every((c) => AttributeSystem.checkCondition(model, c));
    }

    private static compare(
        a: number | string | boolean,
        op: ChoiceCondition['operator'],
        b: number | string | boolean
    ): boolean {
        switch (op) {
            case '>=':
                return Number(a) >= Number(b);
            case '<=':
                return Number(a) <= Number(b);
            case '==':
                return a === b;
            case '!=':
                return a !== b;
            default:
                return false;
        }
    }
}
