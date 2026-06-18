/**
 * WardrobePanel.ts
 * 衣橱界面。只负责显示与点击：左侧部位分类、右侧衣服列表、装备/解锁/一键卸下。
 * 所有换装逻辑都走 WardrobeSystem（通过 GameManager 获取）。
 *
 * 列表为运行时根据 itemTemplate 动态生成，无需美术。
 */

import { _decorator, Component, Node, Label, Button, instantiate } from 'cc';
import { EventBus, GameEvents } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { WardrobeSystem } from '../wardrobe/WardrobeSystem';
import { DressItem, DressPart, DressStatBonus } from '../wardrobe/DressTypes';
import {
    DRESS_PART_ORDER,
    DRESS_PART_NAMES,
    DRESS_RARITY_NAMES,
} from '../wardrobe/DressTypes';
import { STAT_NAMES } from '../config/GameConfig';
import { PlayerStats } from '../story/StoryTypes';

const { ccclass, property } = _decorator;

@ccclass('WardrobePanel')
export class WardrobePanel extends Component {
    @property({ type: Label, tooltip: '当前角色形象占位（显示当前装扮文字）' })
    characterLabel: Label = null!;

    @property({ type: Label, tooltip: '当前服装总加成' })
    bonusLabel: Label = null!;

    @property({ type: Label, tooltip: '当前部位标题（可选）' })
    listTitleLabel: Label = null!;

    @property({ type: [Node], tooltip: '部位分类按钮（按 发型/妆容/服饰/披风/饰品/手持 顺序，最多 6 个）' })
    partButtons: Node[] = [];

    @property({ type: Node, tooltip: '衣服列表容器（建议挂 Layout）' })
    listContent: Node = null!;

    @property({ type: Node, tooltip: '衣服列表项模板（含 NameLabel/InfoLabel/EquipButton/UnlockButton，默认隐藏）' })
    itemTemplate: Node = null!;

    @property({ type: Node, tooltip: '“一键卸下”按钮' })
    unequipAllButton: Node = null!;

    @property({ type: Node, tooltip: '“返回”按钮' })
    backButton: Node = null!;

    @property({ type: Label, tooltip: '操作提示（可选）' })
    tipLabel: Label = null!;

    private currentPart: DressPart = 'hair';

    onLoad() {
        EventBus.on('wardrobe-open', this.onOpen, this);
        EventBus.on(GameEvents.WARDROBE_CHANGED, this.onWardrobeChanged, this);

        // 部位分类按钮
        this.partButtons.forEach((btn, i) => {
            if (!btn) return;
            const part = DRESS_PART_ORDER[i];
            if (!part) return;
            const label = btn.getComponentInChildren(Label);
            if (label) label.string = DRESS_PART_NAMES[part];
            btn.on(Button.EventType.CLICK, () => this.selectPart(part), this);
        });

        this.bindClick(this.unequipAllButton, () => this.onUnequipAll());
        this.bindClick(this.backButton, () => GameManager.instance?.closeOverlay());

        if (this.itemTemplate) this.itemTemplate.active = false;
    }

    onDestroy() {
        EventBus.offTarget(this);
    }

    private bindClick(node: Node, cb: () => void): void {
        if (!node) return;
        node.on(Button.EventType.CLICK, cb, this);
    }

    private get ws(): WardrobeSystem | null {
        return GameManager.instance?.getWardrobeSystem() || null;
    }

    private onOpen(): void {
        this.currentPart = 'hair';
        this.refreshAll();
    }

    private onWardrobeChanged(): void {
        if (this.node.active) this.refreshAll();
    }

    private selectPart(part: DressPart): void {
        this.currentPart = part;
        this.refreshAll();
        if (this.tipLabel) this.tipLabel.string = '';
    }

    private refreshAll(): void {
        this.refreshHeader();
        this.refreshList();
    }

    private refreshHeader(): void {
        const ws = this.ws;
        if (!ws) return;

        if (this.listTitleLabel) {
            this.listTitleLabel.string = DRESS_PART_NAMES[this.currentPart];
        }

        // 当前装扮
        if (this.characterLabel) {
            const parts = DRESS_PART_ORDER.map((p) => {
                const d = ws.getEquippedByPart(p);
                return `${DRESS_PART_NAMES[p]}：${d ? d.name : '（空）'}`;
            });
            this.characterLabel.string = '当前装扮\n' + parts.join('\n');
        }

        // 服装总加成
        if (this.bonusLabel) {
            this.bonusLabel.string = '服装加成：' + this.formatBonus(ws.calcDressBonus());
        }
    }

    private refreshList(): void {
        const ws = this.ws;
        if (!ws || !this.listContent || !this.itemTemplate) return;

        // 清空旧列表项
        this.listContent.children.slice().forEach((c) => c.destroy());

        const dresses = ws.getDressesByPart(this.currentPart);
        dresses.forEach((dress) => this.createRow(dress, ws));
    }

    private createRow(dress: DressItem, ws: WardrobeSystem): void {
        const row = instantiate(this.itemTemplate);
        row.active = true;
        row.setParent(this.listContent);

        const owned = ws.isOwned(dress.id);
        const equipped = ws.isEquipped(dress.id);

        // 名称
        const nameLabel = this.findLabel(row, 'NameLabel');
        if (nameLabel) nameLabel.string = dress.name;

        // 信息：稀有度 + 加成 + 状态
        const infoLabel = this.findLabel(row, 'InfoLabel');
        if (infoLabel) {
            const status = owned ? (equipped ? '已装备' : '已拥有') : '未拥有';
            infoLabel.string = `[${DRESS_RARITY_NAMES[dress.rarity]}] ${this.formatBonus(dress.statBonus)}  ${status}`;
        }

        const equipBtn = row.getChildByName('EquipButton');
        const unlockBtn = row.getChildByName('UnlockButton');

        // 已拥有 -> 显示装备/卸下；未拥有 -> 显示解锁
        if (owned) {
            this.setButton(equipBtn, true, equipped ? '卸下' : '装备', true, () => {
                if (equipped) ws.unequip(dress.id);
                else ws.equip(dress.id);
            });
            this.setButton(unlockBtn, false);
        } else {
            this.setButton(equipBtn, false);
            this.configUnlockButton(unlockBtn, dress, ws);
        }
    }

    /** 配置未拥有衣服的解锁按钮（按解锁方式区分） */
    private configUnlockButton(btn: Node | null, dress: DressItem, ws: WardrobeSystem): void {
        switch (dress.unlockType) {
            case 'currency': {
                const cost = dress.unlockCondition || {};
                const costText = cost.silver ? `银两${cost.silver}` : cost.jade ? `玉佩${cost.jade}` : '';
                this.setButton(btn, true, `购买(${costText})`, true, () => {
                    const r = ws.purchase(dress.id);
                    if (!r.success) this.showTip(r.reason || '购买失败');
                });
                break;
            }
            case 'ad':
                this.setButton(btn, true, '看广告解锁', true, () => {
                    this.showTip('正在播放广告…');
                    ws.unlockByAd(dress.id, (r) => {
                        this.showTip(r.success ? '解锁成功' : r.reason || '解锁失败');
                    });
                });
                break;
            case 'share':
                this.setButton(btn, true, '分享解锁', false);
                break;
            case 'rank':
                this.setButton(btn, true, '晋升解锁', false);
                break;
            case 'story':
            default:
                this.setButton(btn, true, '剧情解锁', false);
                break;
        }
    }

    /** 统一设置按钮的显隐/文字/可点击/回调 */
    private setButton(
        btn: Node | null,
        active: boolean,
        text?: string,
        interactable?: boolean,
        onClick?: () => void
    ): void {
        if (!btn) return;
        btn.active = active;
        if (!active) return;

        const label = btn.getComponentInChildren(Label);
        if (label && text !== undefined) label.string = text;

        const comp = btn.getComponent(Button);
        if (comp) comp.interactable = interactable !== false;

        btn.off(Button.EventType.CLICK);
        if (onClick) btn.on(Button.EventType.CLICK, onClick, this);
    }

    private onUnequipAll(): void {
        this.ws?.unequipAll();
        this.showTip('已一键卸下');
    }

    private findLabel(root: Node, childName: string): Label | null {
        const child = root.getChildByName(childName);
        return child ? child.getComponent(Label) : null;
    }

    private showTip(msg: string): void {
        if (this.tipLabel) this.tipLabel.string = msg;
    }

    /** 把属性加成格式化为 "魅力+5 礼仪+3" */
    private formatBonus(bonus: DressStatBonus): string {
        const keys = Object.keys(bonus) as (keyof PlayerStats)[];
        if (keys.length === 0) return '无';
        return keys
            .filter((k) => (bonus[k] || 0) !== 0)
            .map((k) => `${STAT_NAMES[k]}+${bonus[k]}`)
            .join(' ');
    }
}
