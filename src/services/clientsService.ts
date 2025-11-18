import { supabase } from '../lib/supabase'
import type { Client, CreateClientInput, UpdateClientInput, UUID } from '../types/client'
import {getCurrentDate} from "../utils/dateAndTime.ts";

export class ClientsService {
  static async getClients(search?: string | null): Promise<{ data: Client[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_get_clients', {
        p_search_term: search && search.trim() !== '' ? search : null,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as Client[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to fetch clients' }
    }
  }

  static async addClient(input: CreateClientInput): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_add_client', {
        p_account_id: input.account_id,
        p_first_name: input.first_name,
        p_last_name: input.last_name ?? null,
        p_email: input.email ?? null,
        p_phone_number: input.phone_number ?? null,
        p_current_date: getCurrentDate(),
        p_date_of_birth: input.date_of_birth ?? null,
        p_notes: input.notes ?? null,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Client[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to add client' }
    }
  }

  static async editClient(input: UpdateClientInput): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_edit_client', {
        p_client_id: input.id,
        p_first_name: input.first_name ?? null,
        p_last_name: input.last_name ?? null,
        p_email: input.email ?? null,
        p_phone_number: input.phone_number ?? null,
        p_date_of_birth: input.date_of_birth ?? null,
        p_notes: input.notes ?? null,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Client[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to edit client' }
    }
  }

  static async deleteClient(id: UUID): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('bs_delete_client', {
        p_client_id: id,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as Client[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to delete client' }
    }
  }
}
