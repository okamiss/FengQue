/**
 * RankPanel.ts
 * 晋升界面。只负责显示与点击：当前身份、下一身份、晋升加成、晋升条件及达成情况、晋升按钮。
 * 所有晋升逻辑都走 RankSystem（通过 GameManager 获取）。
 *
 * 条件列表为运行时根据 conditionTemplate 动态生成。
 */

import { _decorator, Component, Node, Label, Button, Color, instantiate } from 'cc';
import { EventBus, GameEvents } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { RankSystem } from '../player/RankSystem';
import { PlayerStats } from '../story/StoryTypes';
import { STAT_NAMES } from '../config/GameConfig';

const { ccclass, property } = _decorator;

const COLOR_OK = new Color(70, 160, 70, 255);
const COLOR_FAIL = new Color(190, 70, 70, 255);

@ccclass('RankPanel')
export class RankPanel extends Component {
    @property({ type: Label, tooltip: '当前身份' })
    currentRankLabel: Label = null!;

    @property({ type: Label, tooltip: '下一身份' })
    nextRankLabel: Label = null!;

    @property({ type: Label, tooltip: '晋升后属性加成' })
    bonusLabel: Label = null!;

    @property({ type: Label, tooltip: '下一身份描述（可选）' })
    descLabel: Label = null!;

    @property({ type: Node, tooltip: '晋升条件列表容器（建议挂 Layout）' })
    conditionsContent: Node = null!;

    @property({ type: Node, tooltip: '条件列表项模板（含一个 Label，默认隐藏）' })
    conditionTemplate: Node = null!;

    @property({ type: Node, tooltip: '“晋升”按钮' })
    promoteButton: Node = null!;

    @property({ type: Label, tooltip: '晋升结果提示' })
    resultLabel: Label = null!;

    @property({ type: Node, tooltip: '“返回”按钮' })
    backButton: Node = null!;

    onLoad() {
        EventBus.on('rank-open', this.refresh, this);
        EventBus.on(GameEvents.RANK_CHANGED, this.refresh, this);

        this.bindClick(this.promoteButton, () => this.onPromote());
        this.bindClick(this.backButton, () => GameManager.instance?.closeOverlay());

        if (this.conditionTemplate) this.conditionTemplate.active = false;
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private bindClick(node: Node, cb: () => void): void {
        if (!node) return;
        node.on(Button.EventType.CLICK, cb, this);
    }

    private get rs(): RankSystem | null {
        return GameManager.instance?.getRankSystem() || null;
    }

    private refresh(): void {
        const rs = this.rs;
        if (!rs) return;

        const cur = rs.getCurrentRank();
        if (this.currentRankLabel) {
            this.currentRankLabel.string = `当前身份：${cur.name}（${cur.title}）`;
        }

        const next = rs.getNextRank();

        // 清空旧条件
        if (this.conditionsContent) {
            this.conditionsContent.children.slice().forEach((c) => c.destroy());
        }

        if (!next) {
            if (this.nextRankLabel) this.nextRankLabel.string = '已达当前阶段最高身份';
            if (this.bonusLabel) this.bonusLabel.string = '';
            if (this.descLabel) this.descLabel.string = '';
            this.setPromotable(false);
            return;
        }

        if (this.nextRankLabel) this.nextRankLabel.string = `下一身份：${next.name}（${next.title}）`;
        if (this.descLabel) this.descLabel.string = next.description || '';
        if (this.bonusLabel) this.bonusLabel.string = '晋升加成：' + this.formatBonus(next.statBonus);

        // 条件列表
        const conds = rs.getPromotionConditions();
        conds.forEach((c) => this.createConditionRow(`${c.ok ? '✔' : '✘'} ${c.label}（${c.current}）`, c.ok));

        // 是否可晋升
        this.setPromotable(rs.canPromote());
    }

    private createConditionRow(text: string, ok: boolean): void {
        if (!this.conditionsContent || !this.conditionTemplate) return;
        const row = instantiate(this.conditionTemplate);
        row.active = true;
        row.setParent(this.conditionsContent);
        const label = row.getComponentInChildren(Label);
        if (label) {
            label.string = text;
            label.color = ok ? COLOR_OK : COLOR_FAIL;
        }
    }

    private setPromotable(can: boolean): void {
        if (!this.promoteButton) return;
        const btn = this.promoteButton.getComponent(Button);
        if (btn) btn.interactable = can;
    }

    private onPromote(): void {
        const rs = this.rs;
        if (!rs) return;
        const result = rs.promote();
        if (result.success && result.rank) {
            if (this.resultLabel) this.resultLabel.string = `晋升成功！现为「${result.rank.name}」`;
            this.refresh();
        } else {
            // 条件不足：提示原因（条件列表已标红未达成项）
            const reason = result.reason || '晋升失败';
            const firstUnmet = result.unmet && result.unmet.length > 0 ? `（${result.unmet[0].label}）` : '';
            if (this.resultLabel) this.resultLabel.string = `${reason}${firstUnmet}`;
        }
    }

    private formatBonus(bonus: Partial<PlayerStats>): string {
        const keys = Object.keys(bonus) as (keyof PlayerStats)[];
        if (keys.length === 0) return '无';
        return keys
            .filter((k) => (bonus[k] || 0) !== 0)
            .map((k) => `${STAT_NAMES[k]}+${bonus[k]}`)
            .join(' ');
    }
}
