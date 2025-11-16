import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import type { UUID } from '../../types/client'
import type { Staff } from '../../types/staff'

export type CalendarView = 'day' | 'week' | 'month'

type Props = {
  date: Date
  view: CalendarView
  onChangeDate: (d: Date) => void
  onChangeView: (v: CalendarView) => void
  staffList: Staff[]
  staffId: UUID | null
  onChangeStaffId: (id: UUID | null) => void
  onNew: () => void
}

function formatRangeTitle(date: Date, view: CalendarView) {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  if (view === 'day') {
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }
  if (view === 'week') {
    const start = startOfWeek(date)
    const end = addDays(start, 6)
    return `${monthNames[start.getMonth()]} ${start.getDate()} — ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
  }
  // month
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
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

const CalendarToolbar: React.FC<Props> = ({ date, view, onChangeDate, onChangeView, staffList, staffId, onChangeStaffId, onNew }) => {
  const goPrev = () => {
    const x = new Date(date)
    if (view === 'day') x.setDate(x.getDate() - 1)
    else if (view === 'week') x.setDate(x.getDate() - 7)
    else x.setMonth(x.getMonth() - 1)
    onChangeDate(x)
  }
  const goNext = () => {
    const x = new Date(date)
    if (view === 'day') x.setDate(x.getDate() + 1)
    else if (view === 'week') x.setDate(x.getDate() + 7)
    else x.setMonth(x.getMonth() + 1)
    onChangeDate(x)
  }
  const goToday = () => onChangeDate(new Date())

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-50" onClick={goPrev} aria-label="Previous">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-50" onClick={goNext} aria-label="Next">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50" onClick={goToday}>
          Today
        </button>
        <div className="ml-2 flex items-center gap-2 text-gray-700">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <div className="font-medium">{formatRangeTitle(date, view)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex rounded-md border border-gray-200 overflow-hidden">
          {(['day','week','month'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => onChangeView(v)}
              className={`px-3 py-2 text-sm ${view === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <select
          className="px-3 py-2 rounded-md border border-gray-300 text-sm"
          value={staffId || ''}
          onChange={(e) => onChangeStaffId(e.target.value ? e.target.value : null)}
        >
          <option value="">All staff</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.first_name}{s.last_name ? ` ${s.last_name}` : ''}</option>
          ))}
        </select>
        <button onClick={onNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>
    </div>
  )
}

export default CalendarToolbar
