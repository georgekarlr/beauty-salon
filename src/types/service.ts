import type { UUID, ActivityLogItem } from './product'

export interface Service {
  id: UUID
  user_id?: UUID | null
  account_id: number
  category?: string | null
  name: string
  description?: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  created_at?: string | null
}

export type CreateServiceInput = {
  account_id: number
  name: string
  duration_minutes: number
  price: number
  category?: string | null
  description?: string | null
  is_active?: boolean
}

export type UpdateServiceInput = {
  id: UUID
  name?: string | null
  duration_minutes?: number | null
  price?: number | null
  category?: string | null
  description?: string | null
  is_active?: boolean | null
}

export interface ServiceDetails extends Service {
  activity_history?: ActivityLogItem[]
}
