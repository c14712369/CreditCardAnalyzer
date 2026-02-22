import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, CalculationResult } from '../types'

interface CardStore {
    // 篩選狀態
    filters: FilterState
    setFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void
    resetFilters: () => void

    // 試算狀態
    calcAmount: string
    calcCategory: string
    calcPaymentMethod: string
    setCalcAmount: (amount: string) => void
    setCalcCategory: (category: string) => void
    setCalcPaymentMethod: (method: string) => void

    // 試算結果
    calcResults: CalculationResult[]
    setCalcResults: (results: CalculationResult[]) => void

    // 模式切換：'list' = 篩選瀏覽, 'calc' = 回饋試算, 'admin' = 管理後台
    mode: 'list' | 'calc' | 'admin'
    setMode: (mode: 'list' | 'calc' | 'admin') => void

    // 我的信用卡功能
    myCardIds: number[]
    onlyShowMyCards: boolean
    isSelectingMyCards: boolean
    setMyCards: (ids: number[]) => void
    toggleOnlyShowMyCards: (show: boolean) => void
    setIsSelectingMyCards: (isOpen: boolean) => void

    // 主題功能
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
    toggleTheme: () => void
}

const defaultFilters: FilterState = {
    bank: '',
    category: '',
    isDirectDeduct: null,
    noRequireSwitch: null,
    searchTerm: '',
    paymentMethod: ''
}

export const useCardStore = create<CardStore>()(
    persist(
        (set) => ({
            filters: defaultFilters,
            setFilter: (key, value) =>
                set((state) => ({ filters: { ...state.filters, [key]: value } })),
            resetFilters: () => set({ filters: defaultFilters }),

            calcAmount: '',
            calcCategory: '國內一般',
            calcPaymentMethod: '',
            setCalcAmount: (amount) => set({ calcAmount: amount }),
            setCalcCategory: (category) => set({ calcCategory: category }),
            setCalcPaymentMethod: (method) => set({ calcPaymentMethod: method }),

            calcResults: [],
            setCalcResults: (results) => set({ calcResults: results }),

            mode: 'list',
            setMode: (mode) => set({ mode }),

            // 我的信用卡初始狀態
            myCardIds: [],
            onlyShowMyCards: false,
            isSelectingMyCards: false,

            setMyCards: (ids) => set({ myCardIds: ids }),
            toggleOnlyShowMyCards: (show) => set({ onlyShowMyCards: show }),
            setIsSelectingMyCards: (isOpen) => set({ isSelectingMyCards: isOpen }),

            // 主題功能
            theme: 'dark', // 預設深色
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'card-storage', // LocalStorage key
            partialize: (state) => ({
                myCardIds: state.myCardIds,
                onlyShowMyCards: state.onlyShowMyCards,
                theme: state.theme
            }),
        }
    )
)

// 加強版：整合 Supabase Auth 狀態 (不持久化，由 App 初始化時偵測)
export const useAuthStore = create<{
    user: any | null
    setUser: (user: any | null) => void
}>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}))
