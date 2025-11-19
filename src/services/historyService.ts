import { supabase } from '../lib/supabase'
import type {
    GetSalesHistoryInput,
    SaleHistoryItem,
    SaleDetails,
    ProcessRefundInput,
    RefundResult
} from '../types/history.ts'
import {getCurrentDate} from "../utils/dateAndTime.ts";

export class HistoryService {

    /**
     * Fetches the sales history list with calculated net revenue.
     * Maps to: bs_get_sales_history
     */
    static async getSalesHistory(input: GetSalesHistoryInput): Promise<{ data: SaleHistoryItem[]; error: string | null }> {
        try {
            const { data, error } = await supabase.rpc('bs_get_sales_history', {
                p_start_date: input.start_date,
                p_end_date: input.end_date,
                p_search_term: input.search_term || null, // Convert empty string to null for SQL
            })

            if (error) return { data: [], error: error.message }

            return { data: (data as SaleHistoryItem[]) ?? [], error: null }
        } catch (e: any) {
            return { data: [], error: e?.message || 'Failed to fetch sales history' }
        }
    }

    /**
     * Fetches the full details (receipt) for a specific sale.
     * Maps to: bs_get_sale_details
     */
    static async getSaleDetails(saleId: string): Promise<{ data: SaleDetails | null; error: string | null }> {
        try {
            const { data, error } = await supabase.rpc('bs_get_sale_details', {
                p_sale_id: saleId,
            })

            if (error) return { data: null, error: error.message }

            // RPC returns an array, but we expect a single record
            const row = (data as SaleDetails[])?.[0] || null
            return { data: row, error: null }
        } catch (e: any) {
            return { data: null, error: e?.message || 'Failed to fetch sale details' }
        }
    }

    /**
     * Processes a refund, handling inventory updates and logging.
     * Maps to: bs_process_refund
     */
    static async processRefund(input: ProcessRefundInput): Promise<{ data: RefundResult | null; error: string | null }> {
        try {
            const { data, error } = await supabase.rpc('bs_process_refund', {
                p_account_id: input.account_id,
                p_sale_id: input.sale_id,
                p_reason: input.reason,
                p_refund_items: input.items, // Supabase automatically converts JS Array -> JSONB
                p_created_at: getCurrentDate(),
            })

            if (error) return { data: null, error: error.message }

            const row = (data as RefundResult[])?.[0] || null
            return { data: row, error: null }
        } catch (e: any) {
            return { data: null, error: e?.message || 'Failed to process refund' }
        }
    }
}