/**
 * DeathPanel.ts
 * 死亡 / 结局面板。展示结局文案，并提供按钮：看广告复活、重新开始、返回主界面。
 * 也复用于阶段性成功结局（此时隐藏“看广告复活”按钮）。
 * 只负责显示与点击，复活/重开等逻辑全部转交 GameManager。
 */

import { _decorator, Component, Node, Label } from 'cc';
import { EventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { DeathEnding } from '../story/StoryTypes';

const { ccclass, property } = _decorator;

@ccclass('DeathPanel')
export class DeathPanel extends Component {
    @property({ type: Label, tooltip: '结局标题' })
    titleLabel: Label = null!;

    @property({ type: Label, tooltip: '结局正文' })
    contentLabel: Label = null!;

    @property({ type: Node, tooltip: '“看广告复活”按钮（成功结局时隐藏）' })
    reviveButton: Node = null!;

    @property({ type: Node, tooltip: '“重新开始”按钮' })
    restartButton: Node = null!;

    @property({ type: Node, tooltip: '“返回主界面”按钮' })
    mainButton: Node = null!;

    @property({ type: Label, tooltip: '提示文本（如复活次数用尽），可选' })
    tipLabel: Label = null!;

    onLoad() {
        EventBus.on('show-ending', this.onShowEnding, this);
        EventBus.on('revive-rejected', this.onReviveRejected, this);

        this.bindClick(this.reviveButton, () => GameManager.instance?.requestRevive());
        this.bindClick(this.restartButton, () => GameManager.instance?.newGame());
        this.bindClick(this.mainButton, () => GameManager.instance?.backToMain());
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private bindClick(node: Node, cb: () => void): void {
        if (!node) return;
        node.on(Node.EventType.TOUCH_END, cb, this);
    }

    /**
     * 展示结局。
     * @param ending 结局数据
     * @param isDeath 是否为死亡结局（true 显示复活按钮）
     * @param canRevive 是否还能复活
     */
    private onShowEnding(ending: DeathEnding, isDeath: boolean, canRevive: boolean): void {
        if (this.titleLabel) this.titleLabel.string = ending.title;
        if (this.contentLabel) this.contentLabel.string = ending.content;

        // 死亡结局且还能复活时才显示复活按钮
        if (this.reviveButton) this.reviveButton.active = isDeath && canRevive;

        if (this.tipLabel) {
            this.tipLabel.string = isDeath && !canRevive ? '本章复活次数已用尽' : '';
        }
    }

    private onReviveRejected(): void {
        if (this.tipLabel) this.tipLabel.string = '复活次数已达上限，无法复活';
        if (this.reviveButton) this.reviveButton.active = false;
    }
}
