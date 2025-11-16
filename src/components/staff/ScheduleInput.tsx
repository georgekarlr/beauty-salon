import React from 'react'
import type { StaffScheduleItem } from '../../types/staff'

type Props = {
  value: StaffScheduleItem[]
  onChange: (value: StaffScheduleItem[]) => void
}

const dayLabels = ['0 Sun', '1 Mon', '2 Tue', '3 Wed', '4 Thu', '5 Fri', '6 Sat']

export const ScheduleInput: React.FC<Props> = ({ value, onChange }) => {
  const updateItem = (index: number, next: Partial<StaffScheduleItem>) => {
    const copy = [...value]
    copy[index] = { ...copy[index], ...next }
    onChange(copy)
  }

  const addItem = () => {
    onChange([
      ...value,
      { day_of_week: 0, start_time: '09:00', end_time: '17:00' },
    ])
  }

  const removeItem = (index: number) => {
    const copy = value.filter((_, i) => i !== index)
    onChange(copy)
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="text-sm text-gray-500">No schedule items. Add one below.</div>
      )}
      {value.map((item, idx) => (
        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700">Day (0–6)</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2"
              value={item.day_of_week}
              onChange={(e) => updateItem(idx, { day_of_week: Number(e.target.value) })}
            >
              {Array.from({ length: 7 }).map((_, d) => (
                <option key={d} value={d}>{dayLabels[d]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700">Start time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2"
              value={item.start_time}
              onChange={(e) => updateItem(idx, { start_time: e.target.value })}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-gray-700">End time</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2"
              value={item.end_time}
              onChange={(e) => updateItem(idx, { end_time: e.target.value })}
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="mt-6 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Add slot
        </button>
      </div>
    </div>
  )
}

export default ScheduleInput
