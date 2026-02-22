import { useState } from 'react'
import { useCardStore } from '../store/useCardStore'
import { useAllCards } from '../hooks/useCards'
import { calculateAndSort } from '../utils/calculator'
import { PAYMENT_METHODS } from '../types'
import { useCategories } from '../hooks/useCategories'

export function CalculatorPanel() {
    const {
        calcAmount,
        calcCategory,
        calcPaymentMethod,
        setCalcAmount,
        setCalcCategory,
        setCalcPaymentMethod,
        setCalcResults,
        onlyShowMyCards,
        myCardIds
    } = useCardStore()
    const { cards, loading, error: loadError } = useAllCards()
    const { categoryGroups } = useCategories()
    const [hasCalculated, setHasCalculated] = useState(false)

    const handleCalculate = () => {
        const amount = parseFloat(calcAmount)
        if (isNaN(amount) || amount <= 0) return

        let cardsToCalc = cards

        // 若開啟「只顯示我的信用卡」，過濾掉非收藏的卡片
        if (onlyShowMyCards) {
            if (myCardIds.length === 0) {
                cardsToCalc = []
            } else {
                cardsToCalc = cards.filter((c) => myCardIds.includes(c.CardID))
            }
        }

        const results = calculateAndSort(cardsToCalc, amount, calcCategory, calcPaymentMethod)
        setCalcResults(results)
        setHasCalculated(true)
    }

    return (
        <div className="calc-panel">
            <div className="calc-panel__header">
                <h2 className="calc-panel__title">
                    <span className="calc-panel__icon">💰</span>
                    回饋試算
                </h2>
                {onlyShowMyCards && (
                    <span className="calc-badge">只比較我的信用卡 ({myCardIds.length})</span>
                )}
            </div>

            <div className="calc-panel__body">
                <div className="calc-row">
                    <div className="calc-field">
                        <label className="calc-label" htmlFor="calc-amount">
                            消費金額 (NT$)
                        </label>
                        <input
                            id="calc-amount"
                            type="number"
                            className="calc-input"
                            placeholder="輸入消費金額"
                            value={calcAmount}
                            min={1}
                            onChange={(e) => setCalcAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                        />
                    </div>

                    <div className="calc-field">
                        <label className="calc-label" htmlFor="calc-category">
                            消費通路
                        </label>
                        <select
                            id="calc-category"
                            className="select-input"
                            value={calcCategory}
                            onChange={(e) => setCalcCategory(e.target.value)}
                        >
                            {categoryGroups.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="calc-field">
                        <label className="calc-label" htmlFor="calc-payment">
                            支付方式
                        </label>
                        <select
                            id="calc-payment"
                            className="select-input"
                            value={calcPaymentMethod}
                            onChange={(e) => setCalcPaymentMethod(e.target.value)}
                        >
                            <option value="">不限/自動推薦</option>
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm} value={pm}>
                                    {pm}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    className="btn-calc"
                    onClick={handleCalculate}
                    disabled={loading || !calcAmount || !!loadError}
                >
                    {loading ? '載入中...' : loadError ? '資料載入失敗' : '開始試算'}
                </button>

                {loadError && (
                    <div className="error-hint" style={{ color: 'var(--accent-red)', marginTop: '12px', fontSize: '14px' }}>
                        ⚠️ {loadError} (請確認是否已執行資料庫更新)
                    </div>
                )}

                {!hasCalculated && !loadError && (
                    <p className="calc-hint">輸入金額、通路與支付方式，找出最優解 🎯</p>
                )}

                {hasCalculated && !loadError && (cards.length === 0 || (onlyShowMyCards && myCardIds.length === 0)) && (
                    <p className="calc-hint" style={{ color: 'var(--accent-orange)' }}>
                        目前沒有可比較的信用卡資料。
                        {onlyShowMyCards && " (您開啟了「只顯示我的信用卡」，但尚未收藏任何卡片)"}
                    </p>
                )}
            </div>
        </div>
    )
}
