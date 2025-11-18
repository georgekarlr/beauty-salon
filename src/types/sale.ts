import type { UUID } from './product'

export type SalePaymentMethod = 'cash' | 'card' | 'other'

export type SaleLineItem = {
  id: UUID
  quantity: number
  price: number
  total_amount: number
}

export type ProcessSaleInput = {
  account_id: number
  customer_id?: UUID | null
  appointment_id?: UUID | null
  subtotal: number
  tax_amount: number
  tip_amount: number
  total_amount: number
  amount_tendered?: number | null
  payment_method: SalePaymentMethod
  service_items: SaleLineItem[]
  product_items: SaleLineItem[]
}

export type ProcessSaleResult = {
  sale_id: UUID
  total_amount: number
  change_due: number
  sale_date: string
}
