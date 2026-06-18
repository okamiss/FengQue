/**
 * AdService.ts
 * 广告服务（首版为模拟实现，不接真实 SDK）。
 * 业务层只调用 showRewardedVideo，不直接碰 wx.* / tt.*；后续接入平台广告只改这里
 * （或下沉到 PlatformService）。回调里 success=true 表示“完整观看，发放奖励”。
 */

type RewardCallback = (success: boolean) => void;

export class AdService {
    /** 模拟激励视频：延迟一小段时间后回调成功，模仿真实观看流程 */
    static showRewardedVideo(onResult: RewardCallback): void {
        console.log('[AdService] (模拟) 开始播放激励视频...');
        // 用 setTimeout 模拟广告播放耗时；真实环境替换为平台广告回调
        setTimeout(() => {
            console.log('[AdService] (模拟) 广告播放完成，发放奖励');
            onResult(true);
        }, 300);
    }

    /** 模拟分享：首版同样直接返回成功 */
    static share(onResult: RewardCallback): void {
        console.log('[AdService] (模拟) 触发分享...');
        setTimeout(() => onResult(true), 200);
    }
}
