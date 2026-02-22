import type { CardWithRewards, FilterState } from '../types'
import type { CalculationResult } from '../types'

interface CardItemProps {
    card: CardWithRewards
    filters?: FilterState
    calcResult?: CalculationResult
    rank?: number
}

export function CardItem({ card, filters, calcResult, rank }: CardItemProps) {
    // 判斷要顯示哪些通路的回饋（篩選模式 vs 試算模式）
    // 若試算模式有 planName，則只顯示該 planName (calculator 已經 filter 過，但還是在此確認)
    const displayCategory = calcResult
        ? calcResult.card.Rewards.find((r) => r.RewardRate === calcResult.rewardRate)?.Category
        : filters?.category || null

    // 篩選顯示的回饋規則
    let relevantRewards = card.Rewards

    if (displayCategory) {
        // 若有選通路，只顯示該通路
        relevantRewards = relevantRewards.filter((r) => r.Category === displayCategory)
    }

    // 若為試算模式且有指定 planName，進一步過濾 (雖然邏輯上 maxReward 已經定案，但顯示細節時可能需要)
    // 但因為 `card` 是原始資料，所以我們要自己過濾
    if (calcResult?.planName) {
        relevantRewards = relevantRewards.filter(r => r.PlanName === calcResult.planName)
    }

    return (
        <div className={`card-item ${calcResult && rank === 1 ? 'card-item--top' : ''}`}>
            {rank && (
                <div className={`card-item__rank rank-${rank <= 3 ? rank : 'other'}`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>
            )}

            <div className="card-item__header">
                <div className="card-item__bank">{card.BankName}</div>
                <div className="card-item__name">
                    {card.CardName}
                    {calcResult?.planName && (
                        <span className="plan-badge">{calcResult.planName}</span>
                    )}
                </div>
            </div>

            <div className="card-item__tags">
                <span className={`tag ${card.IsDirectDeduct ? 'tag--green' : 'tag--gray'}`}>
                    {card.IsDirectDeduct ? '✓ 直接折抵' : '✗ 非直接折抵'}
                </span>
                <span className={`tag ${!card.RequireSwitch ? 'tag--green' : 'tag--yellow'}`}>
                    {card.RequireSwitch ? '⚠ 需手動切換' : '✓ 免切換'}
                </span>
            </div>

            {/* 備註與說明 */}
            {card.Note && (
                <div className="card-item__note">
                    <span className="note-icon">ℹ️</span>
                    <span className="note-text">{card.Note}</span>
                </div>
            )}

            {/* 試算結果顯示 */}
            {calcResult ? (
                <div className="card-item__calc-result">
                    <div className="calc-result__reward-rate">
                        回饋率：<strong>{calcResult.rewardRate}%</strong>
                        {/* 若有 PlanName 但在上方已顯示，此處可省略，或顯示通路 */}
                        <span className="calc-category-label">({displayCategory})</span>
                    </div>
                    <div className="calc-result__amount">
                        <span className="calc-result__label">預估回饋</span>
                        <span className="calc-result__value">
                            NT$ {calcResult.maxReward.toFixed(0)}
                            {calcResult.isLimited && <span className="calc-result__capped">（已達上限）</span>}
                        </span>
                    </div>
                </div>
            ) : (
                /* 一般列表顯示：顯示匹配通路的回饋 */
                <div className="card-item__rewards">
                    {relevantRewards.map((reward) => (
                        <div key={reward.RewardID} className="reward-row">
                            <div className="reward-row__info">
                                <span className="reward-row__category">{reward.Category}</span>
                                {reward.PlanName && <span className="reward-plan-tag">{reward.PlanName}</span>}
                            </div>
                            <span className="reward-row__rate">{reward.RewardRate}%</span>
                            {reward.MonthlyLimit !== null && (
                                <span className="reward-row__limit">上限 {reward.MonthlyLimit} 元</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
