import { supabase } from '../lib/supabase'
import type { ProcessSaleInput, ProcessSaleResult } from '../types/sale'
import { getCurrentDate } from '../utils/dateAndTime.ts'

export class SalesService {
  static async processSale(input: ProcessSaleInput): Promise<{ data: ProcessSaleResult | null; error: string | null }>{
    try {
      const { data, error } = await supabase.rpc('bs_process_sale', {
        p_account_id: input.account_id,
        p_created_at: getCurrentDate(),
        p_customer_id: input.customer_id ?? null,
        p_appointment_id: input.appointment_id ?? null,
        p_subtotal: input.subtotal,
        p_tax_amount: input.tax_amount,
        p_tip_amount: input.tip_amount,
        p_total_amount: input.total_amount,
        p_amount_tendered: input.amount_tendered ?? null,
        p_payment_method: input.payment_method,
        p_service_items: input.service_items,
        p_product_items: input.product_items,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as ProcessSaleResult[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to process sale' }
    }
  }
}
