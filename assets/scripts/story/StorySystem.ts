/**
 * StorySystem.ts
 * 剧情系统：负责“当前剧情节点、选项结果、死亡、跳转、复活”等全部剧情业务逻辑。
 * UI 不写任何剧情逻辑，只调用本系统的方法，并通过 EventBus 监听变化做展示。
 */

import { PlayerModel } from '../player/PlayerModel';
import { AttributeSystem } from '../player/AttributeSystem';
import { SaveService } from '../core/SaveService';
import { EventBus, GameEvents } from '../core/EventBus';
import { StoryNode, StoryChoice, DeathEnding } from './StoryTypes';
import { getStoryNode, getDeathEnding } from './StoryConfig';
import { REVIVE_RULE, START_NODE_ID } from '../config/GameConfig';

export class StorySystem {
    private model: PlayerModel;
    private currentNode: StoryNode | null = null;

    constructor(model: PlayerModel) {
        this.model = model;
    }

    getCurrentNode(): StoryNode | null {
        return this.currentNode;
    }

    /** 从存档记录的节点开始（继续游戏 / 新游戏后） */
    start(): void {
        const startId = this.model.currentNodeId || START_NODE_ID;
        this.goTo(startId, false);
    }

    /**
     * 跳转到指定节点。
     * @param applyChapterReset 是否在切章时重置每章复活次数（正常流程为 true，复活还原时为 false）
     */
    goTo(nodeId: string, applyChapterReset: boolean = true): void {
        const node = getStoryNode(nodeId);
        if (!node) {
            console.error('[StorySystem] node not found:', nodeId);
            return;
        }
        this.currentNode = node;
        this.model.currentNodeId = node.id;

        // 切章处理：重置每章复活次数
        if (applyChapterReset && node.chapterId !== this.model.currentChapterId) {
            this.model.currentChapterId = node.chapterId;
            this.model.save.revive.chapterCount = 0;
        }

        // 进入 checkpoint：记录快照（用于复活还原）
        if (node.checkpoint) {
            this.model.saveCheckpoint(node.id);
        }

        // 每次进入节点都持久化，保证“继续游戏”能恢复到当前节点
        SaveService.save(this.model.save);

        // 阶段性成功结局
        if (node.isEnding) {
            this.model.unlockEnding(node.id);
            SaveService.save(this.model.save);
            EventBus.emit(GameEvents.STORY_ENDED, node, this.model.save);
        }

        EventBus.emit(GameEvents.NODE_CHANGED, node, this.model.save);
    }

    /** 玩家做出选择（UI 只传 choiceId，逻辑全在这里） */
    choose(choiceId: string): void {
        if (!this.currentNode) return;
        const choice = this.currentNode.choices.find((c) => c.id === choiceId);
        if (!choice) {
            console.error('[StorySystem] choice not found:', choiceId);
            return;
        }

        // 条件不满足，不允许选择（UI 已置灰，这里再兜底一次）
        if (!this.isChoiceAvailable(choice)) {
            console.warn('[StorySystem] choice not available:', choiceId);
            return;
        }

        // 特殊动作：重新开始 / 返回主界面（由 GameManager 处理，事件转交）
        if (choice.action) {
            EventBus.emit('choice-action', choice.action);
            return;
        }

        // 应用效果
        AttributeSystem.applyEffects(this.model, choice.effects);

        // 显式死亡结局
        if (choice.deathEndingId) {
            this.triggerDeath(choice.deathEndingId);
            return;
        }

        // 体力归零兜底死亡
        if (AttributeSystem.isDead(this.model)) {
            this.triggerDeath('death_collapse');
            return;
        }

        // 正常跳转
        if (choice.nextNodeId) {
            this.goTo(choice.nextNodeId);
        } else {
            console.warn('[StorySystem] choice has no nextNodeId and no action:', choiceId);
        }
    }

    /** 判断选项是否可选（条件满足） */
    isChoiceAvailable(choice: StoryChoice): boolean {
        return AttributeSystem.checkConditions(this.model, choice.conditions);
    }

    /** 触发死亡结局 */
    private triggerDeath(endingId: string): void {
        const ending = getDeathEnding(endingId) || {
            id: endingId,
            title: '殒命',
            content: '你的故事在此终结。',
        };
        this.model.unlockEnding(endingId);
        SaveService.save(this.model.save);
        EventBus.emit(GameEvents.PLAYER_DIED, ending as DeathEnding);
    }

    // ===== 复活相关 =====

    /** 是否还能复活（每章/每天次数限制） */
    canRevive(): boolean {
        this.refreshDailyRevive();
        const r = this.model.save.revive;
        return (
            r.chapterCount < REVIVE_RULE.maxRevivePerChapter &&
            r.todayCount < REVIVE_RULE.maxRevivePerDay
        );
    }

    /** 跨天则重置今日复活次数 */
    private refreshDailyRevive(): void {
        const r = this.model.save.revive;
        const today = SaveService.today();
        if (r.lastDate !== today) {
            r.lastDate = today;
            r.todayCount = 0;
        }
    }

    /**
     * 复活：回到最近 checkpoint（还原属性快照），并计入复活次数。
     * 仅在广告播放成功后由上层调用。
     * @returns 是否复活成功
     */
    revive(): boolean {
        if (!this.canRevive()) return false;

        // 先记录复活后的计数（checkpoint 快照里的 revive 较旧，还原后需覆盖回来，防止无限复活）
        const newChapterCount = this.model.save.revive.chapterCount + 1;
        const newTodayCount = this.model.save.revive.todayCount + 1;
        const lastDate = this.model.save.revive.lastDate;

        // 优先用内存快照还原属性，否则兜底回到记录的 checkpoint 节点
        const nodeId = this.model.restoreFromCheckpoint();
        const targetId = nodeId || this.model.save.lastCheckpointNodeId || START_NODE_ID;

        // 还原后覆盖复活计数
        this.model.save.revive.chapterCount = newChapterCount;
        this.model.save.revive.todayCount = newTodayCount;
        this.model.save.revive.lastDate = lastDate;

        // 复活不重置每章复活计数（用 applyChapterReset=false）
        this.goTo(targetId, false);
        return true;
    }
}
