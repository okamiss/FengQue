/**
 * GameManager.ts
 * 游戏总控（挂在场景根节点上的组件）。
 * 职责：初始化游戏、创建并连接各系统、在各 UI Panel 之间切换、把 UI 的请求转交给系统。
 * 本身不写剧情逻辑（剧情在 StorySystem）、不写存储细节（在 SaveService）。
 */

import { _decorator, Component, Node } from 'cc';
import { SaveService } from './SaveService';
import { EventBus, GameEvents } from './EventBus';
import { PlayerModel } from '../player/PlayerModel';
import { StorySystem } from '../story/StorySystem';
import { AdService } from '../monetization/AdService';
import { DeathEnding, StoryNode, StoryChoice } from '../story/StoryTypes';
import { DEFAULT_PLAYER_NAME } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/** UI 视图状态 */
export type ViewState = 'main' | 'story' | 'death';

@ccclass('GameManager')
export class GameManager extends Component {
    /** 全局单例，供 UI 访问 */
    static instance: GameManager | null = null;

    @property({ type: Node, tooltip: '主界面面板根节点（MainUI）' })
    mainPanel: Node = null!;

    @property({ type: Node, tooltip: '剧情面板根节点（StoryPanel）' })
    storyPanel: Node = null!;

    @property({ type: Node, tooltip: '选项面板根节点（ChoicePanel）' })
    choicePanel: Node = null!;

    @property({ type: Node, tooltip: '死亡/结局面板根节点（DeathPanel）' })
    deathPanel: Node = null!;

    private model: PlayerModel | null = null;
    private storySystem: StorySystem | null = null;

    onLoad() {
        GameManager.instance = this;
        // 监听系统层事件：死亡 / 阶段结局 / 选项特殊动作
        EventBus.on(GameEvents.PLAYER_DIED, this.onPlayerDied, this);
        EventBus.on(GameEvents.STORY_ENDED, this.onStoryEnded, this);
        EventBus.on('choice-action', this.onChoiceAction, this);
    }

    start() {
        // 启动先进入主界面（start 阶段所有 onLoad 已执行，instance 已就绪，再刷新主界面状态）
        this.showView('main');
        this.refreshMain();
    }

    onDestroy() {
        EventBus.offTarget(this);
        if (GameManager.instance === this) GameManager.instance = null;
    }

    // ===== 对外提供给 UI 调用的方法 =====

    /** 是否存在存档（主界面用来决定“继续游戏”是否可用） */
    hasSave(): boolean {
        return SaveService.hasSave();
    }

    /** 新游戏：清空旧档，从头开始 */
    newGame(): void {
        const data = SaveService.createDefault(DEFAULT_PLAYER_NAME);
        SaveService.save(data);
        this.bootSystems(new PlayerModel(data));
        this.showView('story');
        this.storySystem!.start();
    }

    /** 继续游戏：读取存档恢复进度；无存档则不处理 */
    continueGame(): boolean {
        const data = SaveService.load();
        if (!data) {
            console.warn('[GameManager] 无存档，无法继续');
            return false;
        }
        this.bootSystems(new PlayerModel(data));
        this.showView('story');
        this.storySystem!.start();
        return true;
    }

    /** 重置存档：删除本地存档并回到主界面 */
    resetSave(): void {
        SaveService.clear();
        this.model = null;
        this.storySystem = null;
        this.showView('main');
        this.refreshMain();
    }

    /** UI 选项点击：转交给剧情系统 */
    onChoose(choiceId: string): void {
        this.storySystem?.choose(choiceId);
    }

    /** 死亡界面：看广告复活 */
    requestRevive(): void {
        if (!this.storySystem) return;
        if (!this.storySystem.canRevive()) {
            console.warn('[GameManager] 复活次数已达上限');
            EventBus.emit('revive-rejected');
            return;
        }
        AdService.showRewardedVideo((success) => {
            if (success && this.storySystem) {
                const ok = this.storySystem.revive();
                if (ok) this.showView('story');
            }
        });
    }

    /** 死亡/结局界面：返回主界面 */
    backToMain(): void {
        this.showView('main');
        this.refreshMain();
    }

    /** 当前剧情系统能否复活（供 DeathPanel 决定按钮显隐） */
    canRevive(): boolean {
        return this.storySystem ? this.storySystem.canRevive() : false;
    }

    /** 判断选项是否可选（供 ChoicePanel 置灰不可选项） */
    isChoiceAvailable(choice: StoryChoice): boolean {
        return this.storySystem ? this.storySystem.isChoiceAvailable(choice) : true;
    }

    // ===== 内部 =====

    private bootSystems(model: PlayerModel): void {
        this.model = model;
        this.storySystem = new StorySystem(model);
    }

    /** 切换 UI 视图：剧情视图同时显示剧情面板与选项面板 */
    private showView(state: ViewState): void {
        if (this.mainPanel) this.mainPanel.active = state === 'main';
        if (this.storyPanel) this.storyPanel.active = state === 'story';
        if (this.choicePanel) this.choicePanel.active = state === 'story';
        if (this.deathPanel) this.deathPanel.active = state === 'death';
    }

    private refreshMain(): void {
        EventBus.emit('main-refresh');
    }

    private onPlayerDied(ending: DeathEnding): void {
        this.showView('death');
        EventBus.emit('show-ending', ending, true /* isDeath */, this.canRevive());
    }

    private onStoryEnded(node: StoryNode): void {
        // 阶段性成功结局也用死亡面板展示，但不提供复活
        this.showView('death');
        const ending: DeathEnding = {
            id: node.id,
            title: node.endingTitle || node.title,
            content: node.content,
        };
        EventBus.emit('show-ending', ending, false /* isDeath */, false);
    }

    private onChoiceAction(action: 'restart' | 'main_menu'): void {
        if (action === 'restart') {
            this.newGame();
        } else if (action === 'main_menu') {
            this.backToMain();
        }
    }
}
