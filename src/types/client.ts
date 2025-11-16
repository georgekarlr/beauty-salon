export type UUID = string

// Represents a customer record from bs_customers / RPC return
export interface Client {
  id: UUID
  user_id?: UUID | null
  account_id: number
  first_name: string
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  date_of_birth?: string | null // YYYY-MM-DD
  notes?: string | null
  created_at?: string | null
}

export type CreateClientInput = {
  account_id: number
  first_name: string
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  notes?: string | null
}

export type UpdateClientInput = {
  id: UUID
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  date_of_birth?: string | null
  notes?: string | null
}
