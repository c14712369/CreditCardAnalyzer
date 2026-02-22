import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useCardStore'
import { PAYMENT_METHODS } from '../types'
import { useCategories } from '../hooks/useCategories'
import type { CardWithRewards } from '../types'
import { TAIWAN_BANKS, BANK_SHORT_NAMES } from '../data/banks'
import { useAllCards } from '../hooks/useCards'

export function AdminPanel() {
    const { user, setUser } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)

    // Tab State: 'form' (Add/Edit) | 'list' (Manage) | 'categories' (通路管理)
    const [activeTab, setActiveTab] = useState<'form' | 'list' | 'categories'>('list')

    // Phase 15: Categories
    const { categories, categoryGroups, loading: catLoading, addCategory, updateCategory, deleteCategory, refetch: refetchCategories } = useCategories()
    const [newCatName, setNewCatName] = useState('')
    const [newCatGroup, setNewCatGroup] = useState<'國內' | '國外'>('國內')
    const [editingCatId, setEditingCatId] = useState<number | null>(null)
    const [editingCatName, setEditingCatName] = useState('')

    // Card List & Filtering
    const { cards, loading: cardsLoading, refetch } = useAllCards()
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Edit Mode State
    const [editMode, setEditMode] = useState(false)
    const [currentCardId, setCurrentCardId] = useState<number | null>(null)

    // Card Form State
    const [bankName, setBankName] = useState('')
    const [cardName, setCardName] = useState('')
    const [isDirectDeduct, setIsDirectDeduct] = useState(false)
    const [requireSwitch, setRequireSwitch] = useState(false)
    const [note, setNote] = useState('')

    // Rewards Form State
    interface FormReward {
        category: string
        rate: string
        limit: string
        planName: string
        paymentMethods: string[]
    }

    // Phase 14: 卡片層級活動期間
    const [cardStartDate, setCardStartDate] = useState('')
    const [cardEndDate, setCardEndDate] = useState('')

    // Phase 14: 權益分組 (僅 requireSwitch 模式使用)
    interface PlanGroup {
        planName: string
        rewards: FormReward[]
    }

    // 一般卡使用平坦列表
    const [rewards, setRewards] = useState<FormReward[]>([
        { category: '國內一般', rate: '', limit: '', planName: '', paymentMethods: [] }
    ])

    // 切換卡使用分組列表
    const [planGroups, setPlanGroups] = useState<PlanGroup[]>([
        { planName: '', rewards: [{ category: '國內一般', rate: '', limit: '', planName: '', paymentMethods: [] }] }
    ])

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await supabase.auth.getUser()
                setUser(data.user)
            } catch (error) {
                console.error('Auth check error:', error)
            } finally {
                setAuthLoading(false)
            }
        }
        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                setAuthLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [setUser])

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Filter and Pagination Logic
    const filteredCards = cards.filter(card =>
        card.BankName.includes(searchTerm) ||
        card.CardName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const displayedCards = filteredCards.slice(startIndex, startIndex + itemsPerPage)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginLoading(true)
        setMessage('')
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
        } catch (err: any) {
            setMessage(err.message)
        } finally {
            setLoginLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMessage('')
        setActiveTab('form')
    }

    const emptyReward = (): FormReward => ({ category: '國內一般', rate: '', limit: '', planName: '', paymentMethods: [] })

    const addRewardRow = () => {
        setRewards([...rewards, emptyReward()])
    }

    const removeRewardRow = (index: number) => {
        if (rewards.length === 1) return
        setRewards(rewards.filter((_, i) => i !== index))
    }

    // Phase 14: PlanGroup 操作 (requireSwitch 模式)
    const addPlanGroup = () => {
        setPlanGroups([...planGroups, { planName: '', rewards: [emptyReward()] }])
    }

    const removePlanGroup = (groupIndex: number) => {
        if (planGroups.length === 1) return
        setPlanGroups(planGroups.filter((_, i) => i !== groupIndex))
    }

    const updatePlanGroupName = (groupIndex: number, name: string) => {
        const newGroups = [...planGroups]
        newGroups[groupIndex] = { ...newGroups[groupIndex], planName: name }
        setPlanGroups(newGroups)
    }

    const addRewardToGroup = (groupIndex: number) => {
        const newGroups = [...planGroups]
        newGroups[groupIndex] = { ...newGroups[groupIndex], rewards: [...newGroups[groupIndex].rewards, emptyReward()] }
        setPlanGroups(newGroups)
    }

    const removeRewardFromGroup = (groupIndex: number, rewardIndex: number) => {
        const newGroups = [...planGroups]
        if (newGroups[groupIndex].rewards.length === 1) return
        newGroups[groupIndex] = { ...newGroups[groupIndex], rewards: newGroups[groupIndex].rewards.filter((_, i) => i !== rewardIndex) }
        setPlanGroups(newGroups)
    }

    const updateGroupReward = (groupIndex: number, rewardIndex: number, field: keyof FormReward, value: any) => {
        const newGroups = [...planGroups]
        const newRewards = [...newGroups[groupIndex].rewards]
        newRewards[rewardIndex] = { ...newRewards[rewardIndex], [field]: value }
        newGroups[groupIndex] = { ...newGroups[groupIndex], rewards: newRewards }
        setPlanGroups(newGroups)
    }

    const updateReward = (index: number, field: keyof FormReward, value: any) => {
        const newRewards = [...rewards]
        newRewards[index] = { ...newRewards[index], [field]: value }
        setRewards(newRewards)
    }

    const resetForm = () => {
        setBankName('')
        setCardName('')
        setIsDirectDeduct(false)
        setRequireSwitch(false)
        setNote('')
        setCardStartDate('')
        setCardEndDate('')
        setRewards([emptyReward()])
        setPlanGroups([{ planName: '', rewards: [emptyReward()] }])
        setEditMode(false)
        setCurrentCardId(null)
        setMessage('')
    }

    const switchToAddMode = () => {
        resetForm()
        setActiveTab('form')
    }

    const handleEdit = (card: CardWithRewards) => {
        setEditMode(true)
        setCurrentCardId(card.CardID)
        setBankName(card.BankName)
        setCardName(card.CardName)
        setIsDirectDeduct(card.IsDirectDeduct)
        setRequireSwitch(card.RequireSwitch)
        setNote(card.Note || '')
        setCardStartDate(card.StartDate || '')
        setCardEndDate(card.EndDate || '')

        if (card.Rewards && card.Rewards.length > 0) {
            const formRewards: FormReward[] = card.Rewards.map(r => ({
                category: r.Category,
                rate: r.RewardRate.toString(),
                limit: r.MonthlyLimit ? r.MonthlyLimit.toString() : '',
                planName: r.PlanName || '',
                paymentMethods: r.PaymentMethods || []
            }))

            if (card.RequireSwitch) {
                // 將平坦列表重組為 PlanGroup 階層
                const groupMap = new Map<string, FormReward[]>()
                formRewards.forEach(r => {
                    const key = r.planName || '（未命名權益）'
                    if (!groupMap.has(key)) groupMap.set(key, [])
                    groupMap.get(key)!.push(r)
                })
                const groups: PlanGroup[] = Array.from(groupMap.entries()).map(([name, rws]) => ({ planName: name, rewards: rws }))
                setPlanGroups(groups.length > 0 ? groups : [{ planName: '', rewards: [emptyReward()] }])
                setRewards([emptyReward()]) // Reset flat list
            } else {
                setRewards(formRewards)
                setPlanGroups([{ planName: '', rewards: [emptyReward()] }]) // Reset groups
            }
        } else {
            setRewards([emptyReward()])
            setPlanGroups([{ planName: '', rewards: [emptyReward()] }])
        }

        setActiveTab('form')
        setMessage('進入編輯模式')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (cardId: number) => {
        if (!window.confirm('確定要刪除這張信用卡嗎？相關回饋資料也會一併刪除。')) return
        setLoginLoading(true)
        try {
            const { error } = await supabase.from('CreditCards').delete().eq('CardID', cardId)
            if (error) throw error
            setMessage('刪除成功')
            refetch()
        } catch (err: any) {
            setMessage(`刪除失敗：${err.message}`)
        } finally {
            setLoginLoading(false)
        }
    }

    const handleSubmitCard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoginLoading(true)
        setMessage('')

        try {
            let targetCardId = currentCardId

            if (editMode && currentCardId) {
                // UPDATE MODE
                const { error: cardError } = await supabase
                    .from('CreditCards')
                    .update({
                        BankName: bankName,
                        CardName: cardName,
                        IsDirectDeduct: isDirectDeduct,
                        RequireSwitch: requireSwitch,
                        Note: note || null,
                        StartDate: cardStartDate || null,
                        EndDate: cardEndDate || null
                    })
                    .eq('CardID', currentCardId)

                if (cardError) throw cardError

                const { error: delError } = await supabase.from('Rewards').delete().eq('CardID', currentCardId)
                if (delError) throw delError

            } else {
                // INSERT MODE
                const { data: cardData, error: cardError } = await supabase
                    .from('CreditCards')
                    .insert([{
                        BankName: bankName,
                        CardName: cardName,
                        IsDirectDeduct: isDirectDeduct,
                        RequireSwitch: requireSwitch,
                        Note: note || null,
                        StartDate: cardStartDate || null,
                        EndDate: cardEndDate || null
                    }])
                    .select()
                    .single()

                if (cardError) throw cardError
                targetCardId = cardData.CardID
            }

            // Phase 14: 根據模式組合回饋規則
            let allRewards: FormReward[] = []
            if (requireSwitch) {
                // 從 PlanGroup 展開為平坦列表
                planGroups.forEach(group => {
                    group.rewards.forEach(r => {
                        allRewards.push({ ...r, planName: group.planName })
                    })
                })
            } else {
                allRewards = rewards
            }

            const rewardInserts = allRewards.map(r => ({
                CardID: targetCardId!,
                Category: r.category,
                RewardRate: parseFloat(r.rate),
                MonthlyLimit: r.limit ? parseInt(r.limit) : null,
                PlanName: (requireSwitch && r.planName) ? r.planName : null,
                PaymentMethods: r.paymentMethods.length > 0 ? r.paymentMethods : []
            }))

            const { error: rewardError } = await supabase.from('Rewards').insert(rewardInserts)
            if (rewardError) throw rewardError

            setMessage(`成功${editMode ? '更新' : '新增'}卡片：${bankName} ${cardName}`)

            resetForm()
            refetch()

        } catch (err: any) {
            setMessage(`${editMode ? '更新' : '新增'}失敗：${err.message}`)
        } finally {
            setLoginLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="admin-panel auth-loading">
                <div className="spinner"></div>
                <p>檢查身分中...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="admin-panel login-view">
                <h2>管理員登入</h2>
                <form onSubmit={handleLogin} className="admin-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="admin-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="admin-input"
                        />
                    </div>
                    <button type="submit" disabled={loginLoading} className="btn-admin-primary">
                        {loginLoading ? '登入中...' : '登入'}
                    </button>
                    {message && <p className="error-msg">{message}</p>}
                </form>
            </div>
        )
    }

    return (
        <div className="admin-container">
            <div className="admin-header-bar">
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('list')
                            if (editMode) resetForm()
                        }}
                    >
                        信用卡列表
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'form' ? 'active' : ''}`}
                        onClick={() => setActiveTab('form')}
                    >
                        {editMode ? '編輯信用卡' : '新增信用卡'}
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        🗂️ 通路管理
                    </button>
                </div>

                <div className="user-info">
                    <span>{user.email}</span>
                    <button onClick={handleLogout} className="btn-logout">登出</button>
                </div>
            </div>

            {activeTab === 'form' && (
                <div className="admin-panel form-view">
                    <div className="panel-header">
                        <h3>{editMode ? '編輯信用卡資料' : '填寫新卡片資料'}</h3>
                        {editMode && (
                            <button onClick={switchToAddMode} className="btn-text-action">
                                切換為新增模式
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmitCard} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>發卡銀行</label>
                                <select
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    required
                                    className="admin-select"
                                >
                                    <option value="" disabled>請選擇銀行</option>
                                    {TAIWAN_BANKS.map(bank => (
                                        <option key={bank} value={BANK_SHORT_NAMES[bank] || bank}>
                                            {bank} ({BANK_SHORT_NAMES[bank] || bank})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>信用卡名稱</label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={e => setCardName(e.target.value)}
                                    placeholder="例：U Bear 卡"
                                    required
                                    className="admin-input"
                                />
                            </div>
                        </div>

                        <div className="form-row checkboxes">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isDirectDeduct}
                                    onChange={e => setIsDirectDeduct(e.target.checked)}
                                />
                                直接折抵帳單
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={requireSwitch}
                                    onChange={e => setRequireSwitch(e.target.checked)}
                                />
                                需手動切換權益
                            </label>
                        </div>

                        <div className="form-group">
                            <label>備註 / 使用說明</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="例：需登錄..."
                                className="admin-input"
                                rows={3}
                            />
                        </div>

                        {/* Phase 14: 卡片層級活動期間 */}
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>📅 活動開始日期</label>
                                <input type="date" value={cardStartDate}
                                    onChange={e => setCardStartDate(e.target.value)} className="admin-input" />
                            </div>
                            <div className="form-group">
                                <label>📅 活動結束日期</label>
                                <input type="date" value={cardEndDate}
                                    onChange={e => setCardEndDate(e.target.value)} className="admin-input" />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '-8px 0 12px', fontStyle: 'italic' }}>
                            留空代表長期有效。試算時會自動排除已過期或未開始的卡片。
                        </p>

                        <h3>回饋規則 {requireSwitch && <span className="calc-badge">多權益模式</span>}</h3>
                        <div className="rewards-list">

                            {/* ===== 一般卡模式 (平坦列表) ===== */}
                            {!requireSwitch && rewards.map((reward, index) => (
                                <div key={index} className="reward-item-box" style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div className="reward-row-input" style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.5fr 1fr 1fr auto',
                                        gap: '8px',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>通路</label>
                                            <select
                                                value={reward.category}
                                                onChange={e => updateReward(index, 'category', e.target.value)}
                                                className="admin-select"
                                            >
                                                {categoryGroups.map((group) => (
                                                    <optgroup key={group.label} label={group.label}>
                                                        {group.options.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>回饋 %</label>
                                            <input type="number" step="0.1" placeholder="%" value={reward.rate}
                                                onChange={e => updateReward(index, 'rate', e.target.value)} required className="admin-input rate-input" />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>上限</label>
                                            <input type="number" placeholder="無上限" value={reward.limit}
                                                onChange={e => updateReward(index, 'limit', e.target.value)} className="admin-input limit-input" />
                                        </div>

                                        <button type="button" onClick={() => removeRewardRow(index)} className="btn-remove-row"
                                            disabled={rewards.length === 1} style={{ alignSelf: 'flex-end', marginBottom: '6px' }}>✕</button>
                                    </div>

                                    {/* 支付方式 */}
                                    <div className="payment-methods-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                            指定支付方式 (未勾選代表不限)
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {PAYMENT_METHODS.map(pm => (
                                                <label key={pm} style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer',
                                                    background: reward.paymentMethods?.includes(pm) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                    padding: '2px 8px', borderRadius: '12px',
                                                    border: reward.paymentMethods?.includes(pm) ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <input type="checkbox" checked={reward.paymentMethods?.includes(pm) || false}
                                                        onChange={e => {
                                                            const current = reward.paymentMethods || []
                                                            const next = e.target.checked ? [...current, pm] : current.filter(p => p !== pm)
                                                            updateReward(index, 'paymentMethods', next)
                                                        }} style={{ display: 'none' }} />
                                                    {pm}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!requireSwitch && (
                                <button type="button" onClick={addRewardRow} className="btn-add-row">
                                    + 新增規則
                                </button>
                            )}

                            {/* ===== 切換卡模式 (權益 → 通路 階層) ===== */}
                            {requireSwitch && planGroups.map((group, gIdx) => (
                                <div key={gIdx} style={{
                                    border: '2px solid var(--accent-purple)',
                                    borderRadius: 'var(--radius-lg, 12px)',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    background: 'rgba(99, 102, 241, 0.05)'
                                }}>
                                    {/* 權益名稱 (母層級) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '4px' }}>
                                                🏷️ 權益名稱
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="例：趣旅行、樂饗購"
                                                value={group.planName}
                                                onChange={e => updatePlanGroupName(gIdx, e.target.value)}
                                                className="admin-input"
                                                style={{ fontWeight: 600, fontSize: '1rem' }}
                                            />
                                        </div>
                                        <button type="button" onClick={() => removePlanGroup(gIdx)} className="btn-remove-row"
                                            disabled={planGroups.length === 1} style={{ marginTop: '18px' }}>
                                            刪除權益
                                        </button>
                                    </div>

                                    {/* 通路列表 (子層級) */}
                                    {group.rewards.map((reward, rIdx) => (
                                        <div key={rIdx} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '12px',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '10px',
                                            border: '1px solid var(--border-color)',
                                            marginLeft: '16px'
                                        }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.5fr 1fr 1fr auto',
                                                gap: '8px',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>通路</label>
                                                    <select value={reward.category}
                                                        onChange={e => updateGroupReward(gIdx, rIdx, 'category', e.target.value)} className="admin-select">
                                                        {categoryGroups.map((cg) => (
                                                            <optgroup key={cg.label} label={cg.label}>
                                                                {cg.options.map((opt) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>回饋 %</label>
                                                    <input type="number" step="0.1" placeholder="%" value={reward.rate}
                                                        onChange={e => updateGroupReward(gIdx, rIdx, 'rate', e.target.value)} required className="admin-input rate-input" />
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>上限</label>
                                                    <input type="number" placeholder="無上限" value={reward.limit}
                                                        onChange={e => updateGroupReward(gIdx, rIdx, 'limit', e.target.value)} className="admin-input limit-input" />
                                                </div>

                                                <button type="button" onClick={() => removeRewardFromGroup(gIdx, rIdx)} className="btn-remove-row"
                                                    disabled={group.rewards.length === 1} style={{ alignSelf: 'flex-end', marginBottom: '6px' }}>✕</button>
                                            </div>

                                            {/* 支付方式 */}
                                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                                    指定支付方式 (未勾選代表不限)
                                                </label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {PAYMENT_METHODS.map(pm => (
                                                        <label key={pm} style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer',
                                                            background: reward.paymentMethods?.includes(pm) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                            padding: '2px 8px', borderRadius: '12px',
                                                            border: reward.paymentMethods?.includes(pm) ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                                                            transition: 'all 0.2s'
                                                        }}>
                                                            <input type="checkbox" checked={reward.paymentMethods?.includes(pm) || false}
                                                                onChange={e => {
                                                                    const current = reward.paymentMethods || []
                                                                    const next = e.target.checked ? [...current, pm] : current.filter(p => p !== pm)
                                                                    updateGroupReward(gIdx, rIdx, 'paymentMethods', next)
                                                                }} style={{ display: 'none' }} />
                                                            {pm}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button type="button" onClick={() => addRewardToGroup(gIdx)} className="btn-add-row"
                                        style={{ marginLeft: '16px', marginTop: '4px' }}>
                                        + 新增通路
                                    </button>
                                </div>
                            ))}

                            {requireSwitch && (
                                <button type="button" onClick={addPlanGroup} className="btn-add-row"
                                    style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px dashed var(--accent-purple)' }}>
                                    + 新增權益
                                </button>
                            )}
                        </div>


                        <div className="form-actions" style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" disabled={loginLoading} className="btn-admin-submit" style={{ flex: 1 }}>
                                {loginLoading ? '處理中...' : editMode ? '儲存更新' : '確認新增卡片'}
                            </button>

                            {editMode && (
                                <button type="button" onClick={switchToAddMode} className="btn-admin-cancel" style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    marginTop: '12px'
                                }}>
                                    取消編輯
                                </button>
                            )}
                        </div>

                        {message && <p className={`message ${message.includes('失敗') ? 'error' : 'success'}`}>
                            {message}
                        </p>}
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="admin-list-section">
                    <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>現有信用卡列表</h3>

                    {/* Search Bar */}
                    <div className="search-bar" style={{ marginBottom: '16px' }}>
                        <input
                            type="text"
                            placeholder="搜尋銀行或信用卡名稱..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="admin-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {cardsLoading ? (
                        <p>載入中...</p>
                    ) : (
                        <>
                            <div className="admin-card-list">
                                {displayedCards.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        {searchTerm ? '找不到符合的信用卡。' : '尚無信用卡資料。'}
                                    </p>
                                ) : (
                                    displayedCards.map(card => (
                                        <div key={card.CardID} className="admin-card-row">
                                            <div className="card-info">
                                                <span style={{ fontWeight: 600, marginRight: '8px' }}>{card.BankName}</span>
                                                <span>{card.CardName}</span>
                                                {card.RequireSwitch && <span className="calc-badge">需切換</span>}
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    onClick={() => handleEdit(card)}
                                                    className="btn-edit"
                                                >
                                                    編輯
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(card.CardID)}
                                                    className="btn-delete"
                                                >
                                                    刪除
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination" style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginTop: '20px',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="btn-page"
                                    >
                                        上一頁
                                    </button>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        頁次 {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="btn-page"
                                    >
                                        下一頁
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ===== 通路管理 Tab ===== */}
            {activeTab === 'categories' && (
                <div className="admin-panel form-view">
                    <div className="panel-header">
                        <h3>🗂️ 通路管理</h3>
                    </div>

                    {/* 新增通路 */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '20px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>➕ 新增通路</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '160px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>通路名稱</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={e => setNewCatName(e.target.value)}
                                    placeholder="例：百貨公司"
                                    className="admin-input"
                                />
                            </div>
                            <div style={{ minWidth: '100px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>大類</label>
                                <select
                                    value={newCatGroup}
                                    onChange={e => setNewCatGroup(e.target.value as '國內' | '國外')}
                                    className="admin-select"
                                >
                                    <option value="國內">國內</option>
                                    <option value="國外">國外</option>
                                </select>
                            </div>
                            <button
                                className="btn-submit"
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                disabled={!newCatName.trim()}
                                onClick={async () => {
                                    try {
                                        await addCategory(newCatName.trim(), newCatGroup)
                                        setNewCatName('')
                                        setMessage(`已新增通路：${newCatName.trim()}`)
                                    } catch (err: any) {
                                        setMessage(`新增失敗：${err.message}`)
                                    }
                                }}
                            >
                                新增
                            </button>
                        </div>
                    </div>

                    {/* 通路列表 - 國內 */}
                    {['國內', '國外'].map(group => {
                        const groupCats = categories.filter(c => c.ParentGroup === group)
                        return (
                            <div key={group} style={{ marginBottom: '20px' }}>
                                <h4 style={{
                                    fontSize: '1rem',
                                    margin: '0 0 8px',
                                    padding: '8px 12px',
                                    background: group === '國內' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: group === '國內' ? 'var(--accent-green)' : 'var(--accent-purple)',
                                    borderLeft: `3px solid ${group === '國內' ? 'var(--accent-green)' : 'var(--accent-purple)'}`
                                }}>
                                    {group === '國內' ? '🇹🇼' : '🌍'} {group} ({groupCats.length} 項)
                                </h4>
                                {catLoading ? (
                                    <p style={{ color: 'var(--text-secondary)', padding: '8px' }}>載入中...</p>
                                ) : groupCats.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', padding: '8px', fontStyle: 'italic' }}>無通路</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {groupCats.map(cat => (
                                            <div key={cat.CategoryID} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                {editingCatId === cat.CategoryID ? (
                                                    // 編輯模式
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editingCatName}
                                                            onChange={e => setEditingCatName(e.target.value)}
                                                            className="admin-input"
                                                            style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                                                            autoFocus
                                                            onKeyDown={async e => {
                                                                if (e.key === 'Enter' && editingCatName.trim()) {
                                                                    try {
                                                                        await updateCategory(cat.CategoryID, { Name: editingCatName.trim() })
                                                                        setEditingCatId(null)
                                                                        setMessage(`已更新通路名稱`)
                                                                    } catch (err: any) {
                                                                        setMessage(`更新失敗：${err.message}`)
                                                                    }
                                                                }
                                                                if (e.key === 'Escape') setEditingCatId(null)
                                                            }}
                                                        />
                                                        <button
                                                            className="btn-submit"
                                                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                                            onClick={async () => {
                                                                if (!editingCatName.trim()) return
                                                                try {
                                                                    await updateCategory(cat.CategoryID, { Name: editingCatName.trim() })
                                                                    setEditingCatId(null)
                                                                    setMessage(`已更新通路名稱`)
                                                                } catch (err: any) {
                                                                    setMessage(`更新失敗：${err.message}`)
                                                                }
                                                            }}
                                                        >✔️</button>
                                                        <button
                                                            className="btn-remove-row"
                                                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                            onClick={() => setEditingCatId(null)}
                                                        >✖️</button>
                                                    </>
                                                ) : (
                                                    // 顯示模式
                                                    <>
                                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{cat.Name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{cat.SortOrder}</span>
                                                        <button
                                                            className="btn-text-action"
                                                            style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                                                            onClick={() => {
                                                                setEditingCatId(cat.CategoryID)
                                                                setEditingCatName(cat.Name)
                                                            }}
                                                        >✏️ 編輯</button>
                                                        <button
                                                            className="btn-remove-row"
                                                            style={{ fontSize: '0.8rem', padding: '2px 8px' }}
                                                            onClick={async () => {
                                                                if (!window.confirm(`確定要刪除通路「${cat.Name}」嗎？\n❗ 已使用此通路的回饋規則不會被刪除，但可能需要手動調整。`)) return
                                                                try {
                                                                    await deleteCategory(cat.CategoryID)
                                                                    setMessage(`已刪除通路：${cat.Name}`)
                                                                } catch (err: any) {
                                                                    setMessage(`刪除失敗：${err.message}`)
                                                                }
                                                            }}
                                                        >🗑️ 刪除</button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {message && (
                        <div className="admin-message" style={{ marginTop: '12px' }}>{message}</div>
                    )}
                </div>
            )}
        </div>
    )
}
