import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '請在 .env 檔案中設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
