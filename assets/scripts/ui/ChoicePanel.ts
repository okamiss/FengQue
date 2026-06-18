/**
 * ChoicePanel.ts
 * 选项面板。只负责“显示选项 + 接收点击”，把选择 id 交给 GameManager -> StorySystem。
 * 不做任何选择逻辑/效果计算。最多支持 4 个选项（预先在编辑器摆好 4 个按钮节点）。
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { EventBus, GameEvents } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { StoryNode, StoryChoice } from '../story/StoryTypes';

const { ccclass, property } = _decorator;

@ccclass('ChoicePanel')
export class ChoicePanel extends Component {
    @property({ type: [Node], tooltip: '选项按钮节点（最多 4 个，每个含 Button 与子 Label）' })
    choiceButtons: Node[] = [];

    /** 当前节点的选项列表，按按钮索引对应 */
    private currentChoices: StoryChoice[] = [];

    onLoad() {
        EventBus.on(GameEvents.NODE_CHANGED, this.onNodeChanged, this);
        // 按索引绑定点击事件
        this.choiceButtons.forEach((btn, index) => {
            if (!btn) return;
            btn.on(Button.EventType.CLICK, () => this.onClickChoice(index), this);
        });
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private onNodeChanged(node: StoryNode): void {
        // 阶段结局节点的选项交由结局/死亡面板处理，这里清空即可
        this.currentChoices = node.isEnding ? [] : node.choices.slice();
        this.refresh();
    }

    private refresh(): void {
        this.choiceButtons.forEach((btn, index) => {
            if (!btn) return;
            const choice = this.currentChoices[index];
            if (!choice) {
                btn.active = false;
                return;
            }
            btn.active = true;

            // 设置文本
            const label = btn.getComponentInChildren(Label);
            if (label) label.string = choice.text;

            // 条件不满足则置灰（不可点击）
            const btnComp = btn.getComponent(Button);
            if (btnComp) btnComp.interactable = this.isAvailable(choice);
        });
    }

    /** 通过 GameManager 暴露的剧情系统判断选项是否可选 */
    private isAvailable(choice: StoryChoice): boolean {
        const gm = GameManager.instance;
        if (!gm) return true;
        return gm.isChoiceAvailable(choice);
    }

    private onClickChoice(index: number): void {
        const choice = this.currentChoices[index];
        if (!choice) return;
        GameManager.instance?.onChoose(choice.id);
    }
}
