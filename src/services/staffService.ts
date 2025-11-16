import { supabase } from '../lib/supabase'
import type { Staff, CreateStaffInput, UpdateStaffInput, StaffDetails } from '../types/staff'

export class StaffService {
  static async getStaffList(search?: string | null): Promise<{ data: Staff[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_staff_list', {
        p_search_term: search && search.trim() !== '' ? search : null,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as Staff[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to fetch staff' }
    }
  }

  static async addStaff(input: CreateStaffInput): Promise<{ data: Staff | null; error: string | null }> {
    try {
      const params: Record<string, any> = {
        p_account_id: input.account_id,
        p_first_name: input.first_name,
        p_last_name: input.last_name ?? null,
        p_email: input.email ?? null,
        p_phone_number: input.phone_number ?? null,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : true,
      }
      // Only pass schedule if provided; backend default is []
      if (typeof input.schedule !== 'undefined') {
        params.p_schedule = input.schedule ?? []
      }
      const { data, error } = await supabase.rpc('bs_add_staff', params)
      if (error) return { data: null, error: error.message }
      const row = (data as Staff[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to add staff' }
    }
  }

  static async editStaff(input: UpdateStaffInput): Promise<{ data: Staff | null; error: string | null }> {
    try {
      const params: Record<string, any> = {
        p_staff_id: input.id,
        p_first_name: input.first_name ?? null,
        p_last_name: input.last_name ?? null,
        p_email: input.email ?? null,
        p_phone_number: input.phone_number ?? null,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : null,
      }
      // For edit: undefined means no change; [] means clear; array means replace
      if (typeof input.schedule !== 'undefined') {
        params.p_schedule = input.schedule
      }
      const { data, error } = await supabase.rpc('bs_edit_staff', params)
      if (error) return { data: null, error: error.message }
      const row = (data as Staff[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to edit staff' }
    }
  }

  static async getStaffDetails(id: string): Promise<{ data: StaffDetails | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_staff_details', {
        p_staff_id: id,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as StaffDetails[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to fetch staff details' }
    }
  }
}
