import React, { useEffect, useMemo, useState } from 'react'
import CalendarToolbar, { type CalendarView } from '../components/calendar/CalendarToolbar'
import CalendarGrid from '../components/calendar/CalendarGrid'
import AppointmentModal from '../components/calendar/AppointmentModal'
import type { Appointment } from '../types/appointment'
import type { Staff } from '../types/staff'
import type { UUID } from '../types/client'
import { StaffService } from '../services/staffService'
import { AppointmentsService } from '../services/appointmentsService'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'

function startOfWeek(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = x.getDate() - day
  x.setDate(diff)
  x.setHours(0,0,0,0)
  return x
}
function endOfWeek(d: Date) {
  const x = startOfWeek(d)
  x.setDate(x.getDate() + 6)
  x.setHours(23,59,59,999)
  return x
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [staffId, setStaffId] = useState<UUID | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(() => {
    if (view === 'day') return { start: new Date(date.getFullYear(), date.getMonth(), date.getDate()), end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999) }
    if (view === 'week') return { start: startOfWeek(date), end: endOfWeek(date) }
    return { start: startOfMonth(date), end: endOfMonth(date) }
  }, [date, view])

  // Load staff list once
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await StaffService.getStaffList(null)
      if (!active) return
      setStaffList(data)
    })()
    return () => { active = false }
  }, [])

  // Load appointments on deps change
  const reload = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await AppointmentsService.getAppointments({
      startDate: range.start,
      endDate: range.end,
      staffIds: staffId ? [staffId] : null,
    })
    if (error) {
      setAppointments([])
      setError(error)
    } else {
      setAppointments(data)
    }
    setLoading(false)
  }
  useEffect(() => { reload() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start.getTime(), range.end.getTime(), staffId])

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [createDate, setCreateDate] = useState<Date | null>(null)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)

  const onNew = () => { setCreateDate(date); setCreateOpen(true) }
  const onCreateAt = (d: Date) => { setCreateDate(d); setCreateOpen(true) }
  const onSelectAppointment = (a: Appointment) => setEditAppt(a)

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><CalendarIcon className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">Book, reschedule, and view schedules across day, week, and month.</p>
        </div>
      </div>

      <CalendarToolbar
        date={date}
        view={view}
        onChangeDate={setDate}
        onChangeView={setView}
        staffList={staffList}
        staffId={staffId}
        onChangeStaffId={setStaffId}
        onNew={onNew}
      />

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading appointments...</div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <CalendarGrid
            date={date}
            view={view}
            appointments={appointments}
            onSelectAppointment={onSelectAppointment}
            onCreateAt={onCreateAt}
          />
        )}
      </div>

      {/* Create Modal */}
      <AppointmentModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        staffList={staffList}
        mode="create"
        defaultDate={createDate}
        defaultStaffId={staffId}
        appointment={null}
        onChanged={reload}
      />

      {/* Edit Modal */}
      <AppointmentModal
        isOpen={!!editAppt}
        onClose={() => setEditAppt(null)}
        staffList={staffList}
        mode="edit"
        defaultDate={null}
        defaultStaffId={null}
        appointment={editAppt}
        onChanged={reload}
      />
    </div>
  )
}

export default CalendarPage
