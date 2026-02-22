import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface CategoryItem {
    CategoryID: number
    Name: string
    ParentGroup: '國內' | '國外'
    SortOrder: number
}

export interface CategoryGroup {
    label: string
    options: string[]
}

export function useCategories() {
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: fetchError } = await supabase
                .from('Categories')
                .select('*')
                .order('ParentGroup', { ascending: true })
                .order('SortOrder', { ascending: true })

            if (fetchError) throw fetchError
            setCategories((data as CategoryItem[]) || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : '通路載入失敗')
            // Fallback: 使用預設分類
            setCategories(getDefaultCategories())
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    // 組合為 optgroup 格式
    const categoryGroups: CategoryGroup[] = (() => {
        const domestic = categories.filter(c => c.ParentGroup === '國內')
        const foreign = categories.filter(c => c.ParentGroup === '國外')
        const groups: CategoryGroup[] = []
        if (domestic.length > 0) groups.push({ label: '國內', options: domestic.map(c => c.Name) })
        if (foreign.length > 0) groups.push({ label: '國外', options: foreign.map(c => c.Name) })
        return groups
    })()

    // 平坦化清單
    const allCategoryNames = categories.map(c => c.Name)

    // CRUD 方法
    const addCategory = async (name: string, parentGroup: '國內' | '國外') => {
        const maxSort = categories
            .filter(c => c.ParentGroup === parentGroup)
            .reduce((max, c) => Math.max(max, c.SortOrder), 0)

        const { error } = await supabase.from('Categories').insert([{
            Name: name,
            ParentGroup: parentGroup,
            SortOrder: maxSort + 1
        }])
        if (error) throw error
        await fetchCategories()
    }

    const updateCategory = async (id: number, updates: Partial<Pick<CategoryItem, 'Name' | 'ParentGroup' | 'SortOrder'>>) => {
        const { error } = await supabase.from('Categories').update(updates).eq('CategoryID', id)
        if (error) throw error
        await fetchCategories()
    }

    const deleteCategory = async (id: number) => {
        const { error } = await supabase.from('Categories').delete().eq('CategoryID', id)
        if (error) throw error
        await fetchCategories()
    }

    return {
        categories,
        categoryGroups,
        allCategoryNames,
        loading,
        error,
        refetch: fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory
    }
}

// 預設分類 (DB 不可用時的 fallback)
function getDefaultCategories(): CategoryItem[] {
    const domestic = [
        '國內一般', '超商', '餐廳/美食', '量販/超市', '加油',
        '醫療/保費', '電信/繳費', '網購/電商', '影音串流',
        '外送平台', '交通運輸', '旅遊住宿'
    ]
    const foreign = ['國外一般']

    return [
        ...domestic.map((name, i) => ({ CategoryID: -(i + 1), Name: name, ParentGroup: '國內' as const, SortOrder: i + 1 })),
        ...foreign.map((name, i) => ({ CategoryID: -(100 + i), Name: name, ParentGroup: '國外' as const, SortOrder: i + 1 }))
    ]
}
