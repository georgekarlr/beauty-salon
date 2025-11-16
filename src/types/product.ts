export type UUID = string

export interface Product {
  id: UUID
  user_id?: UUID | null
  account_id: number
  brand?: string | null
  name: string
  sku?: string | null
  description?: string | null
  retail_price: number
  cost_price?: number | null
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  created_at?: string | null
}

export type CreateProductInput = {
  account_id: number
  name: string
  retail_price: number
  stock_quantity?: number
  brand?: string | null
  sku?: string | null
  description?: string | null
  cost_price?: number | null
  low_stock_threshold?: number
  is_active?: boolean
}

export type UpdateProductInput = {
  id: UUID
  name?: string | null
  brand?: string | null
  sku?: string | null
  description?: string | null
  retail_price?: number | null
  cost_price?: number | null
  low_stock_threshold?: number | null
  is_active?: boolean | null
}

export interface ActivityLogItem {
  id?: UUID
  user_id?: UUID | null
  action?: string | null
  target_type?: string | null
  target_id?: UUID | null
  details?: any
  created_at?: string | null
}

export interface ProductDetails extends Product {
  activity_history?: ActivityLogItem[]
}
