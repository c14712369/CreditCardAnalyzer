import { useCardStore } from '../store/useCardStore'
import { useCards } from '../hooks/useCards'
import { CardItem } from './CardItem'

export function CardList() {
    const { filters, calcResults, mode, onlyShowMyCards, myCardIds } = useCardStore()

    // 傳入 myCardIds 與 onlyShowMyCards 進行過濾
    const { cards, loading, error, refetch } = useCards(filters, onlyShowMyCards, myCardIds)

    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" />
                <p className="state-text">載入中...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="state-container state-container--error">
                <p className="state-icon">⚠️</p>
                <p className="state-text">{error}</p>
                <button className="btn-retry" onClick={refetch}>重新載入</button>
            </div>
        )
    }

    if (mode === 'calc') {
        if (calcResults.length === 0) {
            return (
                <div className="state-container">
                    <p className="state-icon">🔎</p>
                    <p className="state-text">查無符合的回饋規則</p>
                    <p className="state-subtext" style={{ fontSize: '14px', opacity: 0.8 }}>
                        請試著調整消費金額、通路或支付方式。<br />
                        (註：此工具主要比對加碼回饋，部分基本回饋可能未列入)
                    </p>
                </div>
            )
        }
        return (
            <div className="card-list">
                <p className="card-list__count">
                    找到 <strong>{calcResults.length}</strong> 張符合條件的信用卡
                </p>
                {calcResults.map((result, index) => (
                    <CardItem
                        key={`${result.card.CardID}-${result.planName || 'default'}-${index}`}
                        card={result.card}
                        calcResult={result}
                        rank={index + 1}
                    />
                ))}
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <div className="state-container">
                <p className="state-icon">😶</p>
                <p className="state-text">沒有符合條件的信用卡。</p>
                {onlyShowMyCards && (
                    <p className="state-subtext">您開啟了「只顯示我的信用卡」，請確認是否已設定收藏。</p>
                )}
            </div>
        )
    }

    return (
        <div className="card-list">
            <p className="card-list__count">
                共 <strong>{cards.length}</strong> 張信用卡
            </p>
            {cards.map((card) => (
                <CardItem key={card.CardID} card={card} filters={filters} />
            ))}
        </div>
    )
}
