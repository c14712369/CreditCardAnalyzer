import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CardWithRewards, FilterState } from '../types'

interface UseCardsReturn {
    cards: CardWithRewards[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useCards(
    filters: FilterState,
    onlyShowMyCards: boolean = false,
    myCardIds: number[] = []
): UseCardsReturn {
    const [cards, setCards] = useState<CardWithRewards[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCards = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            let query = supabase
                .from('CreditCards')
                .select(`
          CardID,
          BankName,
          CardName,
          IsDirectDeduct,
          RequireSwitch,
          Note,
          StartDate,
          EndDate,
          Rewards!inner (
            RewardID,
            CardID,
            Category,
            RewardRate,
            MonthlyLimit,
            PaymentMethods,
            PlanName
          )
        `)

            // 條件 A：是否直接折抵
            if (filters.isDirectDeduct !== null) {
                query = query.eq('IsDirectDeduct', filters.isDirectDeduct)
            }

            // 條件 B：是否不需手動切換
            if (filters.noRequireSwitch !== null) {
                query = query.eq('RequireSwitch', !filters.noRequireSwitch)
            }

            // 條件：只顯示我的信用卡
            if (onlyShowMyCards) {
                if (myCardIds.length === 0) {
                    query = query.in('CardID', [])
                } else {
                    query = query.in('CardID', myCardIds)
                }
            }

            // 條件 C：指定通路篩選
            if (filters.category !== '') {
                query = query.eq('Rewards.Category', filters.category)
            }

            // 條件 D：關鍵字搜尋
            if (filters.searchTerm && filters.searchTerm.trim() !== '') {
                const term = filters.searchTerm.trim()
                query = query.or(`BankName.ilike.%${term}%,CardName.ilike.%${term}%`)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            let filteredData = (data as CardWithRewards[]) || []

            // 條件 E：支付方式篩選 (因 JSONB or 邏輯在 Supabase 平坦化後較複雜，在此進行前端過濾以確保準確性)
            if (filters.paymentMethod !== '') {
                filteredData = filteredData.filter(card =>
                    card.Rewards.some(r => {
                        const methods = r.PaymentMethods || []
                        return methods.length === 0 || methods.includes(filters.paymentMethod)
                    })
                )
            }

            setCards(filteredData)
        } catch (err) {
            const message = err instanceof Error ? err.message : '資料載入失敗'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [filters.isDirectDeduct, filters.noRequireSwitch, filters.category, filters.searchTerm, filters.paymentMethod, onlyShowMyCards, myCardIds])

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    return { cards, loading, error, refetch: fetchCards }
}

/**
 * 取得所有卡片（含所有通路回饋，供試算用）
 */
export function useAllCards(): UseCardsReturn {
    const [cards, setCards] = useState<CardWithRewards[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCards = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('CreditCards')
                .select(`
          CardID,
          BankName,
          CardName,
          IsDirectDeduct,
          RequireSwitch,
          Note,
          StartDate,
          EndDate,
          Rewards (
            RewardID,
            CardID,
            Category,
            RewardRate,
            MonthlyLimit,
            PaymentMethods,
            PlanName
          )
        `)
            if (fetchError) throw fetchError
            setCards((data as CardWithRewards[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : '資料載入失敗')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    return { cards, loading, error, refetch: fetchCards }
}
