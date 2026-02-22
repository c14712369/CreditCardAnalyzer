import { useCardStore } from '../store/useCardStore'
import { PAYMENT_METHODS } from '../types'
import { useCategories } from '../hooks/useCategories'

export function FilterPanel() {
    const {
        filters,
        setFilter,
        resetFilters,
        onlyShowMyCards,
        toggleOnlyShowMyCards,
        setIsSelectingMyCards
    } = useCardStore()
    const { categoryGroups } = useCategories()

    return (
        <div className="filter-panel">
            <div className="filter-panel__header">
                <h2 className="filter-panel__title">
                    <span className="filter-panel__icon">🔍</span>
                    條件篩選
                </h2>
                <div className="header-actions">
                    <button
                        className="btn-my-cards"
                        onClick={() => setIsSelectingMyCards(true)}
                    >
                        ⚙️ 設定我的信用卡
                    </button>
                    <button className="btn-reset" onClick={resetFilters}>
                        重置
                    </button>
                </div>
            </div>

            <div className="filter-panel__body">
                {/* 新增：只顯示我的信用卡 */}
                <div className="filter-item filter-item--my-cards">
                    <label className="toggle-switch-label">
                        <input
                            type="checkbox"
                            className="toggle-switch-checkbox"
                            checked={onlyShowMyCards}
                            onChange={(e) => toggleOnlyShowMyCards(e.target.checked)}
                        />
                        <span className="toggle-switch-slider"></span>
                        <span className="filter-item__text">
                            只顯示我的信用卡
                        </span>
                    </label>
                </div>

                {/* 搜尋欄位 */}
                <div className="filter-item filter-item--search" style={{ marginBottom: '16px' }}>
                    <div className="search-wrapper" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="搜尋銀行或信用卡..."
                            value={filters.searchTerm || ''}
                            onChange={(e) => setFilter('searchTerm', e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '36px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: 0.5
                        }}>🔍</span>
                        {filters.searchTerm && (
                            <button
                                onClick={() => setFilter('searchTerm', '')}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >✕</button>
                        )}
                    </div>
                </div>

                {/* 條件 A：直接折抵 */}
                <div className="filter-item">
                    <label className="filter-item__label">
                        <span className="filter-item__text">
                            <span className="filter-item__badge filter-item__badge--a">A</span>
                            直接折抵帳單
                        </span>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${filters.isDirectDeduct === null ? 'active' : ''}`}
                                onClick={() => setFilter('isDirectDeduct', null)}
                            >
                                不限
                            </button>
                            <button
                                className={`toggle-btn ${filters.isDirectDeduct === true ? 'active' : ''}`}
                                onClick={() => setFilter('isDirectDeduct', true)}
                            >
                                ✓ 要
                            </button>
                            <button
                                className={`toggle-btn ${filters.isDirectDeduct === false ? 'active' : ''}`}
                                onClick={() => setFilter('isDirectDeduct', false)}
                            >
                                ✗ 否
                            </button>
                        </div>
                    </label>
                </div>

                {/* 條件 B：免手動切換 */}
                <div className="filter-item">
                    <label className="filter-item__label">
                        <span className="filter-item__text">
                            <span className="filter-item__badge filter-item__badge--b">B</span>
                            免手動切換權益
                        </span>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${filters.noRequireSwitch === null ? 'active' : ''}`}
                                onClick={() => setFilter('noRequireSwitch', null)}
                            >
                                不限
                            </button>
                            <button
                                className={`toggle-btn ${filters.noRequireSwitch === true ? 'active' : ''}`}
                                onClick={() => setFilter('noRequireSwitch', true)}
                            >
                                ✓ 要
                            </button>
                            <button
                                className={`toggle-btn ${filters.noRequireSwitch === false ? 'active' : ''}`}
                                onClick={() => setFilter('noRequireSwitch', false)}
                            >
                                ✗ 否
                            </button>
                        </div>
                    </label>
                </div>

                {/* 條件 C：通路選單 */}
                <div className="filter-item">
                    <label className="filter-item__label">
                        <span className="filter-item__text">
                            <span className="filter-item__badge filter-item__badge--c">C</span>
                            消費通路
                        </span>
                        <select
                            className="select-input"
                            value={filters.category}
                            onChange={(e) => setFilter('category', e.target.value)}
                        >
                            <option value="">全部通路</option>
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
                    </label>
                </div>

                {/* 條件 D：支付方式 (New Phase 13) */}
                <div className="filter-item">
                    <label className="filter-item__label">
                        <span className="filter-item__text">
                            <span className="filter-item__badge" style={{ background: 'var(--accent-purple)' }}>D</span>
                            支付方式
                        </span>
                        <select
                            className="select-input"
                            value={filters.paymentMethod || ''}
                            onChange={(e) => setFilter('paymentMethod', e.target.value)}
                        >
                            <option value="">不限</option>
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm} value={pm}>
                                    {pm}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </div>
    )
}
