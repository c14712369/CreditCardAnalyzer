import type { CardWithRewards, CalculationResult } from '../types'

/**
 * 計算單張卡片在指定條件下的回饋金額
 * 若超過 MonthlyLimit，以 MonthlyLimit 為準
 */
export function calculateCardReward(
    card: CardWithRewards,
    amount: number,
    category: string,
    planName?: string | null,
    paymentMethod: string = '' // New Phase 13
): CalculationResult | null {
    // 找出所有符合 通路 與 權益 的規則
    let candidates = card.Rewards.filter(r => r.Category === category)

    if (planName) {
        candidates = candidates.filter(r => r.PlanName === planName)
    } else {
        // 一般卡或無權益指定，優先找無 PlanName，若無則... (維持原邏輯，但這裡簡化為：若 card.RequireSwitch 則必須 match planName?
        // 為了相容：若可能有 PlanName 但未傳入 (防呆)，則只找 PlanName 為 null 的
        // 若 card.RequireSwitch 為 false，則 PlanName 通常為 null
        if (card.RequireSwitch && !planName) {
            // 防呆：需切換但沒給權益，無法計算
            return null
        }
        if (!card.RequireSwitch) {
            candidates = candidates.filter(r => !r.PlanName)
        }
    }

    // 根據支付方式過濾
    if (paymentMethod) {
        candidates = candidates.filter(r => {
            const methods = r.PaymentMethods || []
            // 若規則未指定支付方式 (空陣列) 代表全適用
            // 若有指定，則必須包含使用者選的支付方式
            return methods.length === 0 || methods.includes(paymentMethod)
        })
    }
    // 若 paymentMethod 為空，則不進行額外過濾 (視為可接受任何方式，取最高)

    if (candidates.length === 0) return null

    // 取回饋率最高者 (若有多條規則符合)
    const reward = candidates.reduce((prev, current) => (prev.RewardRate > current.RewardRate) ? prev : current)

    const rawReward = amount * (reward.RewardRate / 100)
    const maxReward = (reward.MonthlyLimit !== null && rawReward > reward.MonthlyLimit)
        ? reward.MonthlyLimit
        : rawReward

    return {
        card,
        amount,
        annualAmount: maxReward * 12,
        monthlyLimitUsed: 0,
        isMaxed: false,
        maxReward,
        rewardRate: reward.RewardRate,
        isLimited: reward.MonthlyLimit !== null && rawReward > reward.MonthlyLimit,
        planName: planName || null
    }
}

/**
 * 對所有卡片進行試算並依回饋由高到低排序
 * 支援多權益卡片拆分顯示
 */
export function calculateAndSort(
    cards: CardWithRewards[],
    amount: number,
    category: string,
    paymentMethod: string = '' // New Phase 13
): CalculationResult[] {
    const results: CalculationResult[] = []

    for (const card of cards) {
        // Phase 14: 卡片層級活動期間檢查
        const today = new Date().toISOString().split('T')[0]
        if (card.StartDate && today < card.StartDate) continue // 尚未開始
        if (card.EndDate && today > card.EndDate) continue     // 已過期

        if (card.RequireSwitch && card.Rewards.some(r => r.PlanName)) {
            // 多權益卡片：找出所有獨特的 PlanName
            const plans = Array.from(new Set(card.Rewards.map(r => r.PlanName).filter(Boolean))) as string[]

            if (plans.length > 0) {
                for (const plan of plans) {
                    const result = calculateCardReward(card, amount, category, plan, paymentMethod)
                    if (result) results.push(result)
                }
            } else {
                const result = calculateCardReward(card, amount, category, undefined, paymentMethod)
                if (result) results.push(result)
            }
        } else {
            // 一般卡片
            const result = calculateCardReward(card, amount, category, undefined, paymentMethod)
            if (result) results.push(result)
        }
    }

    return results.sort((a, b) => b.maxReward - a.maxReward)
}
