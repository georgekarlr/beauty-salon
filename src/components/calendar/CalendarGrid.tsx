import React from 'react'
import AppointmentCard from './AppointmentCard'
import type { Appointment } from '../../types/appointment'

import type { CalendarView } from './CalendarToolbar'

type Props = {
  date: Date
  view: CalendarView
  appointments: Appointment[]
  onSelectAppointment: (a: Appointment) => void
  onCreateAt?: (d: Date) => void
}

function startOfWeek(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = x.getDate() - day
  x.setDate(diff)
  x.setHours(0,0,0,0)
  return x
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}
function daysInMonth(d: Date) {
  const year = d.getFullYear()
  const month = d.getMonth()
  return new Date(year, month + 1, 0).getDate()
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function toDateOnly(iso: string) {
  const d = new Date(iso)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const dayLabel = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

const CalendarGrid: React.FC<Props> = ({ date, view, appointments, onSelectAppointment, onCreateAt }) => {
  if (view === 'day') {
    const dayAppts = appointments
      .filter(a => isSameDay(toDateOnly(a.start_time), date))
      .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800">{dayLabel(date)}</div>
            {onCreateAt && (
              <button onClick={() => onCreateAt(date)} className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Add</button>
            )}
          </div>
          <div className="space-y-3">
            {dayAppts.length === 0 ? (
              <div className="text-sm text-gray-500">No appointments.</div>
            ) : dayAppts.map(a => (
              <AppointmentCard key={a.id} appt={a} onClick={onSelectAppointment} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'week') {
    const start = startOfWeek(date)
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {days.map(d => {
          const list = appointments
            .filter(a => isSameDay(toDateOnly(a.start_time), d))
            .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))
          return (
            <div key={d.toISOString()} className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">{dayLabel(d)}</div>
                {onCreateAt && (
                  <button onClick={() => onCreateAt(d)} className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Add</button>
                )}
              </div>
              <div className="space-y-2">
                {list.length === 0 ? (
                  <div className="text-xs text-gray-400">No appointments</div>
                ) : list.map(a => (
                  <AppointmentCard key={a.id} appt={a} onClick={onSelectAppointment} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // month
  const count = daysInMonth(date)
  const year = date.getFullYear()
  const month = date.getMonth()
  const days = Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
      {days.map(d => {
        const list = appointments
          .filter(a => isSameDay(toDateOnly(a.start_time), d))
          .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))
        return (
          <div key={d.toISOString()} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">{dayLabel(d)}</div>
              {onCreateAt && (
                <button onClick={() => onCreateAt(d)} className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Add</button>
              )}
            </div>
            <div className="space-y-2">
              {list.length === 0 ? (
                <div className="text-xs text-gray-400">No appointments</div>
              ) : list.map(a => (
                <AppointmentCard key={a.id} appt={a} onClick={onSelectAppointment} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CalendarGrid
