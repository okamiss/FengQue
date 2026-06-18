/**
 * StoryPanel.ts
 * 剧情显示面板。只负责“显示”：背景占位、角色名、剧情文本、当前身份、当前属性。
 * 不含任何剧情逻辑，数据通过 EventBus.NODE_CHANGED 推送过来。
 */

import { _decorator, Component, Node, Label, Sprite, Color, Button } from 'cc';
import { EventBus, GameEvents } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { StoryNode, PlayerSaveData, PlayerStats } from '../story/StoryTypes';
import {
    RANK_NAMES,
    STAT_NAMES,
    CHARACTER_NAMES,
    BACKGROUND_COLORS,
} from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('StoryPanel')
export class StoryPanel extends Component {
    @property({ type: Sprite, tooltip: '背景图（首版用纯色块占位）' })
    backgroundSprite: Sprite = null!;

    @property({ type: Label, tooltip: '章节/节点标题' })
    titleLabel: Label = null!;

    @property({ type: Label, tooltip: '出场角色名' })
    characterLabel: Label = null!;

    @property({ type: Label, tooltip: '剧情正文' })
    contentLabel: Label = null!;

    @property({ type: Label, tooltip: '当前身份' })
    identityLabel: Label = null!;

    @property({ type: Label, tooltip: '当前属性（多行，显示总属性）' })
    statsLabel: Label = null!;

    @property({ type: Node, tooltip: '（可选）剧情内“衣橱”入口按钮' })
    wardrobeButton: Node = null!;

    @property({ type: Node, tooltip: '（可选）剧情内“晋升”入口按钮' })
    rankButton: Node = null!;

    onLoad() {
        EventBus.on(GameEvents.NODE_CHANGED, this.onNodeChanged, this);
        // 换装/晋升后总属性变化，刷新属性与身份显示
        EventBus.on(GameEvents.STATS_CHANGED, this.onStatsChanged, this);

        if (this.wardrobeButton) {
            this.wardrobeButton.on(Button.EventType.CLICK, () => GameManager.instance?.openWardrobe(), this);
        }
        if (this.rankButton) {
            this.rankButton.on(Button.EventType.CLICK, () => GameManager.instance?.openRank(), this);
        }
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private onNodeChanged(node: StoryNode, save: PlayerSaveData): void {
        if (this.titleLabel) this.titleLabel.string = node.title || '';
        if (this.contentLabel) this.contentLabel.string = node.content || '';

        // 角色名（narrator 显示为旁白/空）
        if (this.characterLabel) {
            const charName = node.character ? CHARACTER_NAMES[node.character] : '';
            this.characterLabel.string = charName || '';
        }

        // 背景占位色
        if (this.backgroundSprite) {
            const key = node.background && BACKGROUND_COLORS[node.background] ? node.background : 'default';
            const [r, g, b] = BACKGROUND_COLORS[key];
            this.backgroundSprite.color = new Color(r, g, b, 255);
        }

        this.refreshIdentityAndStats(save);
    }

    /** 换装/晋升后总属性或身份变化 */
    private onStatsChanged(save: PlayerSaveData): void {
        this.refreshIdentityAndStats(save);
    }

    private refreshIdentityAndStats(save: PlayerSaveData): void {
        // 当前身份
        if (this.identityLabel) {
            const rankName = RANK_NAMES[save.rankId] || save.rankId;
            this.identityLabel.string = `身份：${save.playerName}（${rankName}）`;
        }

        // 当前属性：显示总属性（基础 + 身份 + 服装）
        if (this.statsLabel) {
            const total = GameManager.instance?.getTotalStats() || save.stats;
            this.statsLabel.string = this.formatStats(total);
        }
    }

    private formatStats(stats: PlayerStats): string {
        const keys: (keyof PlayerStats)[] = ['charm', 'wisdom', 'etiquette', 'scheming', 'health', 'prestige'];
        return keys.map((k) => `${STAT_NAMES[k]} ${stats[k]}`).join('   ');
    }
}
