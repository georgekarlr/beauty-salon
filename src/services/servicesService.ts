import { supabase } from '../lib/supabase'
import type { Service, CreateServiceInput, UpdateServiceInput, ServiceDetails } from '../types/service'
import {getCurrentDate} from "../utils/dateAndTime.ts";


export class ServicesService {
  static async getServices(search?: string | null): Promise<{ data: Service[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_service_list', {
        p_search_term: search && search.trim() !== '' ? search : null,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as Service[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to fetch services' }
    }
  }

  static async addService(input: CreateServiceInput): Promise<{ data: Service | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_add_service', {
        p_account_id: input.account_id,
        p_name: input.name,
        p_duration_minutes: input.duration_minutes,
        p_price: input.price,
          p_created_at: getCurrentDate(),
          p_category: input.category ?? null,
        p_description: input.description ?? null,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : true,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Service[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to add service' }
    }
  }

  static async editService(input: UpdateServiceInput): Promise<{ data: Service | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_edit_service', {
        p_service_id: input.id,
        p_name: input.name ?? null,
        p_duration_minutes: typeof input.duration_minutes === 'number' ? input.duration_minutes : null,
        p_price: typeof input.price === 'number' ? input.price : null,
        p_category: input.category ?? null,
        p_description: input.description ?? null,
        p_is_active: typeof input.is_active === 'boolean' ? input.is_active : null,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Service[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to edit service' }
    }
  }

  static async getServiceDetails(id: string): Promise<{ data: ServiceDetails | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_service_details', {
        p_service_id: id,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as ServiceDetails[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to fetch service details' }
    }
  }
}
