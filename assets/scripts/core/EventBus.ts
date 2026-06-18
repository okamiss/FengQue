/**
 * EventBus.ts
 * 极简全局事件总线，用于“系统层 -> UI 层”的单向通知，避免 UI 依赖业务逻辑。
 * UI 只订阅事件做展示；业务逻辑（StorySystem 等）只负责 emit。
 */

type Handler = (...args: any[]) => void;

interface Listener {
    fn: Handler;
    target?: any;
}

/** 全局事件名常量（统一管理，避免字符串拼写错误） */
export const GameEvents = {
    /** 剧情节点变化：(node: StoryNode, save: PlayerSaveData) */
    NODE_CHANGED: 'node-changed',
    /** 玩家死亡：(ending: DeathEnding) */
    PLAYER_DIED: 'player-died',
    /** 到达阶段性（成功）结局：(node: StoryNode) */
    STORY_ENDED: 'story-ended',
} as const;

export class EventBus {
    private static listeners: Map<string, Listener[]> = new Map();

    /** 订阅事件 */
    static on(event: string, fn: Handler, target?: any): void {
        let arr = this.listeners.get(event);
        if (!arr) {
            arr = [];
            this.listeners.set(event, arr);
        }
        arr.push({ fn, target });
    }

    /** 取消订阅（按 fn + target 精确移除；只传 target 则移除该 target 的全部监听） */
    static off(event: string, fn?: Handler, target?: any): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        const filtered = arr.filter((l) => {
            if (fn) return !(l.fn === fn && l.target === target);
            return l.target !== target;
        });
        this.listeners.set(event, filtered);
    }

    /** 移除某个 target 在所有事件上的监听（UI 节点销毁时调用，防止泄漏） */
    static offTarget(target: any): void {
        this.listeners.forEach((arr, event) => {
            this.listeners.set(event, arr.filter((l) => l.target !== target));
        });
    }

    /** 触发事件 */
    static emit(event: string, ...args: any[]): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        // 复制一份，避免回调中增删监听导致遍历异常
        arr.slice().forEach((l) => {
            try {
                l.fn.apply(l.target, args);
            } catch (e) {
                console.error(`[EventBus] handler error on "${event}":`, e);
            }
        });
    }

    /** 清空所有监听（重置游戏时可用） */
    static clear(): void {
        this.listeners.clear();
    }
}
