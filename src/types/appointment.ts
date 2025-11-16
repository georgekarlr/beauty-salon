import type { UUID } from './client'

// Status enum in DB: appointment_status
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export type ServiceSummary = {
  id: UUID
  name: string
  price: number
  duration: number
}

export interface Appointment {
  id: UUID
  start_time: string // ISO string from DB (TIMESTAMPTZ)
  end_time: string   // ISO string from DB (TIMESTAMPTZ)
  status: AppointmentStatus
  notes: string | null
  staff_id: UUID
  staff_name: string
  customer_id: UUID
  customer_name: string
  services: ServiceSummary[]
}

export type GetAppointmentsParams = {
  startDate: Date
  endDate: Date
  staffIds?: UUID[] | null
}

export type BookAppointmentInput = {
  account_id: number
  customer_id: UUID
  staff_id: UUID
  start_time: string // ISO
  end_time: string   // ISO
  service_ids: UUID[]
  notes?: string | null
}

export type RescheduleAppointmentInput = {
  appointment_id: UUID
  staff_id?: UUID | null
  start_time?: string | null
  end_time?: string | null
  service_ids?: UUID[] | null
  status?: AppointmentStatus | null
  notes?: string | null
}
