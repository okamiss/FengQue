/**
 * MainUI.ts
 * 主界面。提供“开始游戏 / 继续游戏 / 重置存档”三个按钮。
 * 只负责显示与点击，业务全部转交 GameManager。
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { EventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property({ type: Label, tooltip: '游戏标题（可选）' })
    titleLabel: Label = null!;

    @property({ type: Node, tooltip: '“开始游戏”按钮' })
    startButton: Node = null!;

    @property({ type: Node, tooltip: '“继续游戏”按钮' })
    continueButton: Node = null!;

    @property({ type: Node, tooltip: '“重置存档”按钮' })
    resetButton: Node = null!;

    @property({ type: Label, tooltip: '提示文本（可选）' })
    tipLabel: Label = null!;

    onLoad() {
        EventBus.on('main-refresh', this.refresh, this);

        this.bindClick(this.startButton, () => GameManager.instance?.newGame());
        this.bindClick(this.continueButton, () => this.onContinue());
        this.bindClick(this.resetButton, () => this.onReset());

        if (this.titleLabel) this.titleLabel.string = '凤阙浮生';
    }

    onEnable() {
        this.refresh();
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private bindClick(node: Node, cb: () => void): void {
        if (!node) return;
        node.on(Button.EventType.CLICK, cb, this);
    }

    /** 根据是否有存档，决定“继续游戏 / 重置存档”是否可用 */
    private refresh(): void {
        const has = GameManager.instance ? GameManager.instance.hasSave() : false;
        this.setButtonEnabled(this.continueButton, has);
        this.setButtonEnabled(this.resetButton, has);
        if (this.tipLabel) {
            this.tipLabel.string = has ? '' : '暂无存档，请点击“开始游戏”';
        }
    }

    private setButtonEnabled(node: Node, enabled: boolean): void {
        if (!node) return;
        const btn = node.getComponent(Button);
        if (btn) btn.interactable = enabled;
    }

    private onContinue(): void {
        const ok = GameManager.instance?.continueGame();
        if (!ok && this.tipLabel) {
            this.tipLabel.string = '没有可继续的存档';
        }
    }

    private onReset(): void {
        GameManager.instance?.resetSave();
        if (this.tipLabel) this.tipLabel.string = '存档已重置';
    }
}
