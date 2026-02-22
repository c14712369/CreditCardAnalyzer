// 信用卡主檔
export interface CreditCard {
    CardID: number
    BankName: string
    CardName: string
    IsDirectDeduct: boolean
    RequireSwitch: boolean
    Note?: string // 備註/使用說明
    StartDate?: string | null  // 活動開始日期 (Phase 14)
    EndDate?: string | null    // 活動結束日期 (Phase 14)
}

// 回饋規則
export interface Reward {
    RewardID: number
    CardID: number
    Category: string
    RewardRate: number
    MonthlyLimit: number | null
    PlanName?: string | null // 權益名稱 (如: 趣旅行)
    PaymentMethods?: string[] | null // 支付方式 (JSONB)
}

// 含回饋的信用卡（JOIN 結果）
export interface CardWithRewards extends CreditCard {
    Rewards: Reward[]
}

// 試算結果
export interface CalculationResult {
    card: CardWithRewards
    amount: number
    annualAmount: number
    monthlyLimitUsed: number
    isMaxed: boolean
    planName?: string | null // 若該卡有區分權益，試算的權益來源
    maxReward: number
    rewardRate: number
    isLimited: boolean
}

// 篩選條件
export interface FilterState {
    bank: string
    isDirectDeduct: boolean | null  // null = 不限
    noRequireSwitch: boolean | null // null = 不限
    category: string                // '' = 不限
    paymentMethod: string           // '' = 不限 (New Phase 13)
    searchTerm?: string
}

// 支付方式選項 (Phase 13)
export const PAYMENT_METHODS = [
    '實體卡',
    'Apple Pay',
    'Google Pay',
    'Samsung Pay',
    'Line Pay',
    '街口支付',
    '全支付',
    '悠遊付',
    '台灣Pay',
    'OPEN錢包',
    'FamiPay',
    '網路刷卡'
] as const

export type PaymentMethod = typeof PAYMENT_METHODS[number]

// 通路分類分組 (fallback，實際從 DB Categories 表讀取)
export const CATEGORY_GROUPS = [
    {
        label: '國內',
        options: ['國內一般', '超商', '餐廳/美食', '量販/超市', '加油', '醫療/保費', '電信/繳費', '網購/電商', '影音串流', '外送平台', '交通運輸', '旅遊住宿']
    },
    {
        label: '國外',
        options: ['國外一般']
    }
] as const

// 平坦化的通路清單，用於相容與型別檢核
export const CATEGORIES = CATEGORY_GROUPS.flatMap(group => group.options)
export type Category = typeof CATEGORIES[number]
