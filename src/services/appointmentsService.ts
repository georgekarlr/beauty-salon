import { supabase } from '../lib/supabase'
import type {
  Appointment,
  BookAppointmentInput,
  GetAppointmentsParams,
  RescheduleAppointmentInput,
} from '../types/appointment'
import {getCurrentDate} from "../utils/dateAndTime.ts";

export class AppointmentsService {
  static async getAppointments(params: GetAppointmentsParams): Promise<{ data: Appointment[]; error: string | null }> {
    try {
      const p_start_date = params.startDate.toISOString().slice(0, 10)
      const p_end_date = params.endDate.toISOString().slice(0, 10)
      const { data, error } = await supabase.rpc('bs_get_appointments', {
        p_start_date,
        p_end_date,
        p_staff_ids: params.staffIds ?? null,
      })
      if (error) return { data: [], error: error.message }
      return { data: (data as Appointment[]) ?? [], error: null }
    } catch (e: any) {
      return { data: [], error: e?.message || 'Failed to fetch appointments' }
    }
  }

  static async bookAppointment(input: BookAppointmentInput): Promise<{ data: { id: string; start_time: string; end_time: string } | null; error: string | null }> {
    try {
        console.log("input",input)

        const { data, error } = await supabase.rpc('bs_book_appointment', {
        p_account_id: input.account_id,
        p_customer_id: input.customer_id,
        p_staff_id: input.staff_id,
          p_created_at: getCurrentDate(),

          p_start_time: input.start_time,
        p_end_time: input.end_time,
        p_service_ids: input.service_ids,
        p_notes: input.notes ?? null,
      })
      if (error) return { data: null, error: error.message }
      const row = (data as any[])?.[0] || null
      return { data: row, error: null }
    } catch (e: any) {
      return { data: null, error: e?.message || 'Failed to book appointment' }
    }
  }

  static async rescheduleAppointment(input: RescheduleAppointmentInput): Promise<{ success: boolean; error: string | null }> {
    try {
        console.log("input",input)

        const { error } = await supabase.rpc('bs_reschedule_appointment', {
        p_appointment_id: input.appointment_id,
        p_staff_id: typeof input.staff_id === 'string' ? input.staff_id : input.staff_id ?? null,
        p_start_time: typeof input.start_time === 'string' ? input.start_time : input.start_time ?? null,
        p_end_time: typeof input.end_time === 'string' ? input.end_time : input.end_time ?? null,
        p_service_ids: input.service_ids ?? null,
        p_status: input.status ?? null,
        p_notes: typeof input.notes === 'string' ? input.notes : input.notes ?? null,
      })
      if (error) return { success: false, error: error.message }
      return { success: true, error: null }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update appointment' }
    }
  }

  static async cancelAppointment(appointmentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.rpc('bs_cancel_appointment', { p_appointment_id: appointmentId })
      if (error) return { success: false, error: error.message }
      return { success: true, error: null }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to cancel appointment' }
    }
  }
}
