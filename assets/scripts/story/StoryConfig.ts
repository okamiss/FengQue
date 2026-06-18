/**
 * StoryConfig.ts
 * 剧情数据（配置驱动）。所有剧情文本、选项、效果、跳转都在这里，UI 与系统都不硬编码剧情。
 * 节点 id 约定：chN_xxx，选项 id：chN_xxx_a。
 *
 * 原创世界观，规避 IP 风险：皇帝萧景珩 / 皇后沈皇后 / 贵妃容贵妃 / 太后崔太后 /
 * 同屋宫女阿棠 / 太监小禄子，女主原创（默认名 苏念）。
 */

import { StoryNode, DeathEnding } from './StoryTypes';

export const StoryConfig: StoryNode[] = [
    // ===== 第一章：一梦入宫 =====
    {
        id: 'ch1_001',
        chapterId: 'chapter_1',
        title: '第一章 · 一梦入宫',
        background: 'palace_gate',
        character: 'aunt_li',
        checkpoint: true,
        content:
            '一阵刺骨的凉意将你惊醒。眼前是斑驳的宫墙与朱红大门，身上换成了粗布宫装。\n掌事姑姑的声音冰冷地落下：“新来的，还不快跪下学规矩？”',
        choices: [
            {
                id: 'ch1_001_a',
                text: '立刻跪下，低头认错',
                nextNodeId: 'ch1_002',
                effects: [
                    { type: 'add_stat', key: 'etiquette', value: 1 },
                    { type: 'add_relation', key: 'maidFavor', value: 1 },
                ],
            },
            {
                id: 'ch1_001_b',
                text: '忍不住反问她是谁',
                nextNodeId: 'ch1_003',
                effects: [
                    { type: 'add_stat', key: 'wisdom', value: 1 },
                    { type: 'add_relation', key: 'maidFavor', value: -1 },
                ],
            },
            {
                id: 'ch1_001_c',
                text: '假装昏倒，暗中观察局势',
                nextNodeId: 'ch1_004',
                effects: [
                    { type: 'add_stat', key: 'scheming', value: 2 },
                    { type: 'add_stat', key: 'health', value: -1 },
                ],
            },
        ],
    },
    {
        id: 'ch1_002',
        chapterId: 'chapter_1',
        title: '第一章 · 守得本分',
        background: 'palace_gate',
        character: 'aunt_li',
        content:
            '你顺从地跪下，额头触地。掌事姑姑的眼神缓和了几分：“算你识相。这宫里，活下去比什么都难。”\n她挥手让你起身，分你去尚衣局当差。',
        choices: [
            {
                id: 'ch1_002_a',
                text: '谢过姑姑，随她前往尚衣局',
                nextNodeId: 'ch1_005',
                effects: [{ type: 'add_relation', key: 'maidFavor', value: 1 }],
            },
        ],
    },
    {
        id: 'ch1_003',
        chapterId: 'chapter_1',
        title: '第一章 · 言多必失',
        background: 'palace_gate',
        character: 'aunt_li',
        content:
            '“我是谁？”掌事姑姑冷笑，“一个连跪都不会的贱婢，倒敢问本姑姑是谁。”\n四周宫人噤若寒蝉。你意识到，此刻的态度将决定你的生死。',
        choices: [
            {
                id: 'ch1_003_a',
                text: '立刻收敛，叩首请罪',
                nextNodeId: 'ch1_005',
                effects: [
                    { type: 'add_stat', key: 'wisdom', value: 1 },
                    { type: 'add_relation', key: 'maidFavor', value: -1 },
                ],
            },
            {
                id: 'ch1_003_b',
                text: '梗着脖子继续顶撞',
                // 顶撞到底 -> 杖责而死
                deathEndingId: 'death_caned',
                effects: [{ type: 'add_stat', key: 'health', value: -3 }],
            },
        ],
    },
    {
        id: 'ch1_004',
        chapterId: 'chapter_1',
        title: '第一章 · 以退为进',
        background: 'palace_gate',
        character: 'taitang',
        content:
            '你软软倒下。一个怯生生的宫女扶住了你，低声道：“别怕，我叫阿棠……装也要装得像点。”\n她偷偷塞给你半块干粮。混乱中，你记住了这张善良的脸。',
        choices: [
            {
                id: 'ch1_004_a',
                text: '悄悄道谢，记下这份人情',
                nextNodeId: 'ch1_005',
                effects: [
                    { type: 'add_relation', key: 'maidFavor', value: 2 },
                    { type: 'set_flag', key: 'met_taitang', value: true },
                    // 阿棠回赠一枚素绢香囊（剧情解锁衣服）
                    { type: 'unlock_dress', key: 'accessory_sujuan_pouch', value: true },
                ],
            },
        ],
    },
    {
        id: 'ch1_005',
        chapterId: 'chapter_1',
        title: '第一章 · 初入尚衣局',
        background: 'sewing_room',
        character: 'narrator',
        checkpoint: true,
        content:
            '尚衣局里堆满绫罗绸缎，针线声不绝。你被安排做最粗的活计。\n夜深时，掌事姑姑忽然将一匹料子摔在你面前——一场刁难，才刚刚开始。',
        choices: [
            {
                id: 'ch1_005_a',
                text: '接下料子，准备应对',
                nextNodeId: 'ch2_001',
                effects: [{ type: 'add_stat', key: 'etiquette', value: 1 }],
            },
        ],
    },

    // ===== 第二章：尚衣局风波 =====
    {
        id: 'ch2_001',
        chapterId: 'chapter_2',
        title: '第二章 · 连夜赶制',
        background: 'sewing_room',
        character: 'aunt_li',
        checkpoint: true,
        content:
            '“贵妃娘娘明日要穿的新衣，今夜务必赶出来。”掌事姑姑分明是在为难你。\n烛火摇曳，时间紧迫，你必须做出选择。',
        choices: [
            {
                id: 'ch2_001_a',
                text: '忍下委屈，通宵赶制',
                nextNodeId: 'ch2_005',
                effects: [
                    { type: 'add_stat', key: 'scheming', value: 1 },
                    { type: 'add_stat', key: 'health', value: -2 },
                    { type: 'add_relation', key: 'maidFavor', value: 1 },
                    // 私下裁出的一袭春柳披烟（剧情解锁衣服）
                    { type: 'unlock_dress', key: 'cloak_spring_willow', value: true },
                ],
            },
            {
                id: 'ch2_001_b',
                text: '去找阿棠帮忙',
                nextNodeId: 'ch2_005',
                // 需要先认识阿棠
                conditions: [{ type: 'flag', key: 'met_taitang', operator: '==', value: true }],
                effects: [
                    { type: 'add_relation', key: 'maidFavor', value: 1 },
                    { type: 'set_flag', key: 'owe_taitang', value: true },
                ],
            },
            {
                id: 'ch2_001_c',
                text: '故意把瑕疵留在不起眼处',
                nextNodeId: 'ch2_004',
                effects: [{ type: 'add_stat', key: 'scheming', value: 2 }],
            },
        ],
    },
    {
        id: 'ch2_004',
        chapterId: 'chapter_2',
        title: '第二章 · 瑕疵',
        background: 'sewing_room',
        character: 'aunt_li',
        content:
            '次日，掌事姑姑展开新衣，目光忽然停在领口的一处针脚上。\n“这是什么？”她声音陡然转厉。你的心提到了嗓子眼。',
        choices: [
            {
                id: 'ch2_004_a',
                text: '从容认错，称连夜赶工力有不逮',
                nextNodeId: 'ch2_005',
                effects: [
                    { type: 'add_stat', key: 'etiquette', value: 1 },
                    { type: 'add_relation', key: 'maidFavor', value: -1 },
                ],
            },
            {
                id: 'ch2_004_b',
                text: '矢口狡辩，反咬是旁人栽赃',
                // 心计不足以圆谎 -> 触发杖责
                deathEndingId: 'death_caned',
                effects: [{ type: 'add_stat', key: 'health', value: -3 }],
            },
        ],
    },
    {
        id: 'ch2_005',
        chapterId: 'chapter_2',
        title: '第二章 · 宫宴将至',
        background: 'sewing_room',
        character: 'narrator',
        checkpoint: true,
        content:
            '风波暂歇。你凭着一手现代审美的巧思，悄悄在衣袂上添了几笔素雅纹样。\n消息传到贵妃耳中，她竟点名要在御花园见见做衣裳的人。',
        choices: [
            {
                id: 'ch2_005_a',
                text: '整理仪容，前往御花园',
                nextNodeId: 'ch3_001',
                effects: [
                    { type: 'add_stat', key: 'charm', value: 1 },
                    // 为面圣梳妆，得一支玉兰簪花（剧情解锁衣服）
                    { type: 'unlock_dress', key: 'hair_magnolia', value: true },
                    // 一点赏银，便于在衣橱中购买衣服
                    { type: 'add_currency', key: 'silver', value: 60 },
                ],
            },
        ],
    },

    // ===== 第三章：御前露脸 =====
    {
        id: 'ch3_001',
        chapterId: 'chapter_3',
        title: '第三章 · 御花园初见',
        background: 'garden',
        character: 'emperor',
        checkpoint: true,
        content:
            '御花园中花影错落。你正要拜见贵妃，却不料迎面遇上的，竟是当今圣上萧景珩。\n他注意到你衣上的新式纹样，淡淡问道：“这花样，你从何处学来？”',
        choices: [
            {
                id: 'ch3_001_a',
                text: '“是民女家乡旧法。”',
                nextNodeId: 'ch3_002',
                effects: [
                    { type: 'add_stat', key: 'wisdom', value: 1 },
                    { type: 'add_relation', key: 'emperorFavor', value: 2 },
                ],
            },
            {
                id: 'ch3_001_b',
                text: '“是梦中所得，醒来便会了。”',
                nextNodeId: 'ch3_003',
                effects: [
                    { type: 'add_stat', key: 'scheming', value: 1 },
                    { type: 'add_relation', key: 'emperorFavor', value: 1 },
                    { type: 'add_relation', key: 'consortFavor', value: -1 },
                ],
            },
            {
                id: 'ch3_001_c',
                text: '“是容贵妃娘娘指点。”（攀附贵妃）',
                nextNodeId: 'ch3_003',
                effects: [
                    { type: 'add_relation', key: 'consortFavor', value: 2 },
                    { type: 'add_relation', key: 'emperorFavor', value: -1 },
                ],
            },
        ],
    },
    {
        id: 'ch3_002',
        chapterId: 'chapter_3',
        title: '第三章 · 简在帝心',
        background: 'garden',
        character: 'emperor',
        content:
            '皇帝微微颔首：“家乡旧法，倒有几分新意。”\n他记住了你这个人。不久后，一道口谕传来——尚衣局粗使宫女苏念，擢为女官，专司御前衣饰。',
        choices: [
            {
                id: 'ch3_002_a',
                text: '叩谢隆恩，正式晋升',
                nextNodeId: 'ch_promote',
                effects: [
                    { type: 'change_rank', key: 'rank', value: 'female_officer' },
                    { type: 'add_stat', key: 'prestige', value: 3 },
                ],
            },
        ],
    },
    {
        id: 'ch3_003',
        chapterId: 'chapter_3',
        title: '第三章 · 树大招风',
        background: 'queen_room',
        character: 'consort',
        content:
            '你的应对惹来了麻烦。容贵妃笑意不达眼底：“一个小宫女，也敢在御前卖弄。”\n当晚，一碗“安神药膳”被送到了你的住处。你端起碗，闻到一丝若有若无的苦杏味。',
        choices: [
            {
                id: 'ch3_003_a',
                text: '立刻打翻药碗，绝不入口',
                nextNodeId: 'ch4_001',
                effects: [
                    { type: 'add_stat', key: 'wisdom', value: 1 },
                    { type: 'add_relation', key: 'consortFavor', value: -2 },
                ],
            },
            {
                id: 'ch3_003_b',
                text: '假装喝下，暗中留存证据',
                nextNodeId: 'ch4_001',
                // 心计足够才能瞒天过海
                conditions: [{ type: 'stat', key: 'scheming', operator: '>=', value: 3 }],
                effects: [
                    { type: 'add_stat', key: 'scheming', value: 2 },
                    { type: 'set_flag', key: 'has_poison_proof', value: true },
                ],
            },
            {
                id: 'ch3_003_c',
                text: '不疑有他，一饮而尽',
                // 关键选择错误 -> 毒酒结局
                deathEndingId: 'death_poison',
                effects: [{ type: 'add_stat', key: 'health', value: -9 }],
            },
        ],
    },

    // ===== 第四章 + 阶段性结局 =====
    {
        id: 'ch4_001',
        chapterId: 'chapter_4',
        title: '第四章 · 绝处逢生',
        background: 'queen_room',
        character: 'queen',
        checkpoint: true,
        content:
            '你死里逃生。沈皇后听闻此事，召你入殿。\n“贵妃跋扈久矣。”她意味深长地看着你，“你若肯为本宫所用，本宫保你平步青云。”',
        choices: [
            {
                id: 'ch4_001_a',
                text: '呈上药膳证据，投向皇后',
                nextNodeId: 'ch_promote',
                conditions: [{ type: 'flag', key: 'has_poison_proof', operator: '==', value: true }],
                effects: [
                    { type: 'add_relation', key: 'queenFavor', value: 3 },
                    { type: 'change_rank', key: 'rank', value: 'female_officer' },
                    { type: 'add_stat', key: 'prestige', value: 2 },
                ],
            },
            {
                id: 'ch4_001_b',
                text: '谨慎周旋，暂不表态',
                nextNodeId: 'ch_promote',
                effects: [
                    { type: 'add_stat', key: 'wisdom', value: 2 },
                    { type: 'change_rank', key: 'rank', value: 'chief_maid' },
                    { type: 'add_relation', key: 'queenFavor', value: 1 },
                ],
            },
        ],
    },
    {
        id: 'ch_promote',
        chapterId: 'chapter_4',
        title: '阶段结局 · 第一次晋封',
        background: 'queen_room',
        character: 'narrator',
        isEnding: true,
        endingTitle: '初露锋芒',
        content:
            '从粗使宫女到御前女官，你在这深宫中迈出了第一步。\n风起云涌的宫廷岁月才刚刚开始——你的逆袭，未完待续。\n\n（第一版剧情到此告一段落，感谢游玩。）',
        choices: [
            {
                id: 'ch_promote_restart',
                text: '重新开始一段宫廷岁月',
                action: 'restart',
            },
            {
                id: 'ch_promote_main',
                text: '返回主界面',
                action: 'main_menu',
            },
        ],
    },
];

/** 死亡 / 失败结局（至少 2 个） */
export const DeathEndings: DeathEnding[] = [
    {
        id: 'death_caned',
        title: '杖毙 · 血溅宫墙',
        content:
            '“拖下去，杖责四十！”\n冰冷的廷杖落下，疼痛逐渐变得遥远。你终于明白，在这深宫里，逞一时口舌之快，便是拿命去赌。\n你的故事，止于这一日。',
    },
    {
        id: 'death_poison',
        title: '毒酒 · 香消玉殒',
        content:
            '你端起那碗药时，指尖微微发凉。\n片刻后，眼前的宫灯一盏盏熄灭。你终于明白，真正想杀你的人，并不在这间屋子里。\n苦杏的气息，成了你在这世间最后的记忆。',
    },
    {
        // 体力归零时的兜底死亡结局
        id: 'death_collapse',
        title: '油尽灯枯 · 病殁',
        content:
            '连日的操劳与惊惧终于压垮了你。你倒在冰冷的青砖上，再没能爬起来。\n深宫吃人，从不只用刀剑。',
    },
];

/** 工具：按 id 取节点 */
export function getStoryNode(id: string): StoryNode | undefined {
    return StoryConfig.find((n) => n.id === id);
}

/** 工具：按 id 取死亡结局 */
export function getDeathEnding(id: string): DeathEnding | undefined {
    return DeathEndings.find((e) => e.id === id);
}
