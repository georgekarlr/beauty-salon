export type UUID = string

// Represents a staff record from bs_staff / RPC return
export interface Staff {
  id: UUID
  user_id?: UUID | null
  account_id?: number | null
  staff_auth_id?: UUID | null
  first_name: string
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  is_active: boolean
  created_at?: string | null
    schedule?: StaffScheduleItem[]

}

// Weekly recurring schedule item (as used by bs_staff_schedules and RPC JSON)
export type StaffScheduleItem = {
  id?: UUID
  day_of_week: number // 0-6
  start_time: string // HH:MM[:SS]
  end_time: string   // HH:MM[:SS]
}

export type CreateStaffInput = {
  account_id: number
  first_name: string
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  is_active?: boolean
  // Optional: pass schedule to create along with staff
  schedule?: StaffScheduleItem[]
}

export type UpdateStaffInput = {
  id: UUID
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone_number?: string | null
  is_active?: boolean | null
  // For bs_edit_staff: omit (undefined) to leave as-is, pass [] to clear, or array to replace
  schedule?: StaffScheduleItem[]
}

// Detailed staff with schedule as returned by bs_get_staff_details
export interface StaffDetails extends Staff {
  schedule: StaffScheduleItem[]
}
