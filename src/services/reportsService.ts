import { supabase } from '../lib/supabase'
import type {
  FinancialOverview,
  SalesSummaryItem,
  StaffPerformanceItem,
  InventoryValueItem,
  TopClientItem,
} from '../types/reports'

// Format date as YYYY-MM-DD in local time to avoid UTC off-by-one issues
function toDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export class ReportsService {
  static async getFinancialOverview(params: { startDate: Date; endDate: Date }): Promise<{ data: FinancialOverview | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_financial_overview', {
        p_start_date: toDateString(params.startDate),
        p_end_date: toDateString(params.endDate),
      })
      if (error) return { data: null, error: error.message }
      const row = (data as FinancialOverview[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to load financial overview' }
    }
  }

  static async getSalesSummary(params: { startDate: Date; endDate: Date }): Promise<{ data: SalesSummaryItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_sales_summary', {
        p_start_date: toDateString(params.startDate),
        p_end_date: toDateString(params.endDate),
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as SalesSummaryItem[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to load sales summary' }
    }
  }

  static async getStaffPerformance(params: { startDate: Date; endDate: Date }): Promise<{ data: StaffPerformanceItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_staff_performance', {
        p_start_date: toDateString(params.startDate),
        p_end_date: toDateString(params.endDate),
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as StaffPerformanceItem[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to load staff performance' }
    }
  }

  static async getLowStock(): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_low_stock')
      if (error) return { data: [], error: error.message }
      return { data: (data as any[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to load low stock' }
    }
  }

  static async getInventoryValue(): Promise<{ data: InventoryValueItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_inventory_value')
      if (error) return { data: [], error: error.message }
      return { data: (data as InventoryValueItem[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to load inventory value' }
    }
  }

  static async getTopClients(params: { startDate: Date; endDate: Date; limit?: number }): Promise<{ data: TopClientItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_report_top_clients', {
        p_start_date: toDateString(params.startDate),
        p_end_date: toDateString(params.endDate),
        p_limit: typeof params.limit === 'number' ? params.limit : 10,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as TopClientItem[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to load top clients' }
    }
  }
}
