import React from 'react'
import Modal from './Modal'
import { Calendar as CalendarIcon } from 'lucide-react'

export type DateRange = { start: Date; end: Date }

type Props = {
  value: DateRange
  onChange: (range: DateRange) => void
  buttonClassName?: string
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

function label(range: DateRange) {
  const opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  return `${range.start.toLocaleDateString(undefined, opt)} — ${range.end.toLocaleDateString(undefined, opt)}`
}

const DateRangePicker: React.FC<Props> = ({ value, onChange, buttonClassName }) => {
  const [open, setOpen] = React.useState(false)
  const [start, setStart] = React.useState<string>(fmt(value.start))
  const [end, setEnd] = React.useState<string>(fmt(value.end))

  React.useEffect(() => {
    setStart(fmt(value.start))
    setEnd(fmt(value.end))
  }, [value.start.getTime(), value.end.getTime()])

  const apply = () => {
    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return
    if (s > e) return
    onChange({ start: new Date(s.getFullYear(), s.getMonth(), s.getDate()), end: new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999) })
    setOpen(false)
  }

  const preset = (code: 'today' | '7' | '30' | 'thisMonth' | 'lastMonth' | 'ytd') => {
    const now = new Date()
    let s: Date
    let e: Date
    if (code === 'today') {
      s = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    } else if (code === '7') {
      e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      s = new Date(e)
      s.setDate(s.getDate() - 6)
    } else if (code === '30') {
      e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      s = new Date(e)
      s.setDate(s.getDate() - 29)
    } else if (code === 'thisMonth') {
      s = startOfMonth(now)
      e = endOfMonth(now)
    } else if (code === 'lastMonth') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      s = startOfMonth(last)
      e = endOfMonth(last)
    } else {
      s = new Date(now.getFullYear(), 0, 1)
      e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    }
    setStart(fmt(s))
    setEnd(fmt(e))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName || 'inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50'}
      >
        <CalendarIcon className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700">{label(value)}</span>
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Select Date Range" footer={
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md" onClick={() => setOpen(false)}>Cancel</button>
          <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md" onClick={apply}>Apply</button>
        </div>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Quick ranges</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => preset('today')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">Today</button>
              <button onClick={() => preset('7')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">Last 7 days</button>
              <button onClick={() => preset('30')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">Last 30 days</button>
              <button onClick={() => preset('thisMonth')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">This month</button>
              <button onClick={() => preset('lastMonth')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">Last month</button>
              <button onClick={() => preset('ytd')} className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">Year to date</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DateRangePicker
