import React from 'react'
import { Plus, Trash2, Copy, Clock, CalendarDays } from 'lucide-react'
import type { StaffScheduleItem } from '../../types/staff'

type Props = {
    value: StaffScheduleItem[]
    onChange: (value: StaffScheduleItem[]) => void
}

const DAYS = [
    { id: 1, label: 'Monday', short: 'Mon' },
    { id: 2, label: 'Tuesday', short: 'Tue' },
    { id: 3, label: 'Wednesday', short: 'Wed' },
    { id: 4, label: 'Thursday', short: 'Thu' },
    { id: 5, label: 'Friday', short: 'Fri' },
    { id: 6, label: 'Saturday', short: 'Sat' },
    { id: 0, label: 'Sunday', short: 'Sun' },
]

export const ScheduleInput: React.FC<Props> = ({ value, onChange }) => {

    // Helper: Get all shifts for a specific day
    const getShiftsForDay = (dayId: number) => {
        return value.filter(s => s.day_of_week === dayId).sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    // Helper: Add a new slot for a specific day
    const addShiftToDay = (dayId: number) => {
        onChange([...value, { day_of_week: dayId, start_time: '09:00', end_time: '17:00' }])
    }

    // Helper: Update a specific shift
    // We need to find the exact object reference in the original array to update it correctly
    const updateShift = (oldShift: StaffScheduleItem, newParams: Partial<StaffScheduleItem>) => {
        const newValue = value.map(item => {
            if (item === oldShift) {
                return { ...item, ...newParams }
            }
            return item
        })
        onChange(newValue)
    }

    // Helper: Remove a specific shift
    const removeShift = (shiftToRemove: StaffScheduleItem) => {
        onChange(value.filter(item => item !== shiftToRemove))
    }


    // Helper: Copy M-F 9-5
    const setStandardWeek = () => {
        const standard: StaffScheduleItem[] = [];
        [1, 2, 3, 4, 5].forEach(day => {
            standard.push({ day_of_week: day, start_time: '09:00', end_time: '17:00' })
        })
        // Keep existing weekend shifts if any, remove existing weekday shifts
        const weekends = value.filter(s => s.day_of_week === 0 || s.day_of_week === 6);
        onChange([...weekends, ...standard]);
    }

    return (
        <div className="space-y-6">

            {/* Global Actions */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={setStandardWeek}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                >
                    <Copy className="w-3 h-3" /> Set Standard Week (M-F, 9-5)
                </button>
            </div>

            {/* Days Grid */}
            <div className="space-y-3">
                {DAYS.map((day) => {
                    const shifts = getShiftsForDay(day.id);
                    const isActive = shifts.length > 0;

                    return (
                        <div
                            key={day.id}
                            className={`rounded-lg border transition-all duration-200 ${isActive ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-80'}`}
                        >
                            <div className="p-3">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                                    {/* Day Label & Toggle */}
                                    <div className="sm:w-32 flex-shrink-0 flex items-center justify-between sm:justify-start sm:gap-3 pt-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {day.short.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {day.label}
                      </span>
                                        </div>

                                        {/* Mobile Toggle (Add first shift) */}
                                        {!isActive && (
                                            <button
                                                type="button"
                                                onClick={() => addShiftToDay(day.id)}
                                                className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-md text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                                            >
                                                + Add
                                            </button>
                                        )}
                                    </div>

                                    {/* Shifts Container */}
                                    <div className="flex-1 space-y-2">
                                        {shifts.length === 0 && (
                                            <div className="py-1.5 text-sm text-gray-400 italic flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" /> No shifts scheduled (Off Duty)
                                            </div>
                                        )}

                                        {shifts.map((shift, idx) => (
                                            <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                                <div className="relative flex-1 max-w-[140px]">
                                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="time"
                                                        value={shift.start_time}
                                                        onChange={(e) => updateShift(shift, { start_time: e.target.value })}
                                                        className="block w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                    />
                                                </div>

                                                <span className="text-gray-400 text-sm">to</span>

                                                <div className="relative flex-1 max-w-[140px]">
                                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="time"
                                                        value={shift.end_time}
                                                        onChange={(e) => updateShift(shift, { end_time: e.target.value })}
                                                        className="block w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeShift(shift)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Remove shift"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add another shift (Split Shift) button */}
                                        {isActive && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => addShiftToDay(day.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Split Shift
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ScheduleInput