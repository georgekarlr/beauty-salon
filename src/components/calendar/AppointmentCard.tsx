import React from 'react'
import type { Appointment } from '../../types/appointment'

type Props = {
  appt: Appointment
  onClick?: (a: Appointment) => void
}

function timeRange(startIso: string, endIso: string) {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const toHM = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${toHM(s)} - ${toHM(e)}`
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const AppointmentCard: React.FC<Props> = ({ appt, onClick }) => {
  const color = statusColors[appt.status] || 'bg-white text-gray-800 border-gray-200'
  return (
    <button
      type="button"
      onClick={() => onClick && onClick(appt)}
      className={`w-full text-left p-3 rounded-lg border ${color} hover:shadow-sm transition`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium">{appt.customer_name}</div>
        <div className="text-xs">{timeRange(appt.start_time, appt.end_time)}</div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
        <div>{appt.staff_name}</div>
        <div>{appt.services?.map(s => s.name).join(', ')}</div>
      </div>
    </button>
  )
}

export default AppointmentCard
