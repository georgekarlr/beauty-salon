export type UUID = string

// Financial overview for a date range
export interface FinancialOverview {
  gross_sales: number
  total_refunds: number
  net_sales: number
  total_tax: number
  total_tips: number
  total_sales_count: number
  total_refunds_count: number
}

export type SaleItemType = 'service' | 'product'

export interface SalesSummaryItem {
  item_type: SaleItemType
  item_id: UUID
  item_name: string | null
  total_quantity_sold: number
  total_revenue: number
}

export interface StaffPerformanceItem {
  staff_id: UUID
  staff_name: string | null
  total_appointments: number
  services_revenue: number
  products_revenue: number
  total_tips: number
}

export interface InventoryValueItem {
  product_id: UUID
  product_name: string
  sku: string | null
  stock_quantity: number
  cost_price: number | null
  total_value: number
}

export interface TopClientItem {
  customer_id: UUID
  customer_name: string
  total_visits: number
  total_spent: number
}
