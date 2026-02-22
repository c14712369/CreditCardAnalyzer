import { useState, useMemo } from 'react'
import { useCardStore } from '../store/useCardStore'
import { useAllCards } from '../hooks/useCards'

export function MyCardsModal() {
    const { isSelectingMyCards, setIsSelectingMyCards, myCardIds, setMyCards } = useCardStore()
    const { cards, loading } = useAllCards()
    const [searchTerm, setSearchTerm] = useState('')

    // 本地暫存選擇狀態，確認後再寫入 store
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(myCardIds)

    // 當 Modal 開啟時，同步 store 狀態到 local
    useMemo(() => {
        if (isSelectingMyCards) {
            setLocalSelectedIds(myCardIds)
            setSearchTerm('')
        }
    }, [isSelectingMyCards, myCardIds])

    const filteredCards = cards.filter((card) =>
        card.CardName.includes(searchTerm) || card.BankName.includes(searchTerm)
    )

    const handleToggle = (id: number) => {
        setLocalSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleSave = () => {
        setMyCards(localSelectedIds)
        setIsSelectingMyCards(false)
    }

    if (!isSelectingMyCards) return null

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>設定我的信用卡</h2>
                    <button className="btn-close" onClick={() => setIsSelectingMyCards(false)}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="搜尋銀行或卡片名稱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {loading ? (
                        <div className="modal-loading">載入中...</div>
                    ) : (
                        <div className="card-selection-list">
                            {filteredCards.length > 0 ? (
                                filteredCards.map((card) => (
                                    <label key={card.CardID} className="card-selection-item">
                                        <input
                                            type="checkbox"
                                            checked={localSelectedIds.includes(card.CardID)}
                                            onChange={() => handleToggle(card.CardID)}
                                        />
                                        <div className="card-selection-info">
                                            <span className="card-selection-bank">{card.BankName}</span>
                                            <span className="card-selection-name">{card.CardName}</span>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="modal-empty">找不到符合的卡片</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <span className="selection-count">已選擇 {localSelectedIds.length} 張</span>
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setIsSelectingMyCards(false)}>
                            取消
                        </button>
                        <button className="btn-save" onClick={handleSave}>
                            儲存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
