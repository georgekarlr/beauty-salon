import React from 'react'
import {
    Mail,
    Phone,
    CalendarClock,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react'
import useStaffDetails from '../../hooks/useStaffDetails'

type Props = {
    staffId: string
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Helper to format time (09:00:00 -> 9:00 AM)
const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const date = new Date()
    date.setHours(Number(h))
    date.setMinutes(Number(m))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// Helper for Avatar
const getInitials = (first: string, last?: string | null) => {
    return `${first.charAt(0)}${last ? last.charAt(0) : ''}`.toUpperCase();
}

export const StaffDetailsPanel: React.FC<Props> = ({ staffId }) => {
    const { data, loading, error } = useStaffDetails(staffId)

    if (loading) return (
        <div className="animate-pulse space-y-6 p-2">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
            </div>
            <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
    )

    if (error) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <XCircle className="w-4 h-4" /> {error}
        </div>
    )

    if (!data) return <div className="text-gray-500 p-4">No data found.</div>

    // Organize schedule by day for easier rendering
    const scheduleByDay = new Array(7).fill(null).map((_, i) =>
        data.schedule?.filter(s => s.day_of_week === i) || []
    );

    return (
        <div className="flex flex-col h-full max-h-[80vh]">

            {/* --- Header Section --- */}
            <div className="shrink-0 space-y-6 pr-2">

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm ring-4 ring-gray-50">
                            {getInitials(data.first_name, data.last_name)}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{data.first_name} {data.last_name}</h3>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-1
                ${data.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {data.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {data.is_active ? 'Active Staff' : 'Inactive'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                            <p className="text-sm font-medium text-gray-900 truncate" title={data.email || ''}>
                                {data.email || <span className="text-gray-400 italic">Not set</span>}
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                            <p className="text-sm font-medium text-gray-900">
                                {data.phone_number || <span className="text-gray-400 italic">Not set</span>}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- Schedule Section (Scrollable) --- */}
            <div className="flex-1 min-h-0 mt-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                    <CalendarClock className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-gray-900">Work Schedule</h4>
                </div>

                <div className="overflow-y-auto pr-2 -mr-2 flex-1 custom-scrollbar">
                    {(!data.schedule || data.schedule.length === 0) ? (
                        <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            No working hours configured.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {scheduleByDay.map((shifts, dayIndex) => {
                                const hasShifts = shifts.length > 0;

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`flex items-center p-3 rounded-lg border transition-colors
                      ${hasShifts ? 'bg-white border-gray-200' : 'bg-gray-50 border-transparent opacity-60'}`}
                                    >
                                        {/* Day Name */}
                                        <div className="w-24 shrink-0 flex flex-col">
                      <span className={`text-sm font-semibold ${hasShifts ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dayNames[dayIndex]}
                      </span>
                                            {hasShifts && <span className="text-[10px] text-emerald-600 font-medium">Working</span>}
                                        </div>

                                        {/* Shifts */}
                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {hasShifts ? (
                                                shifts.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((shift, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium"
                                                    >
                            <Clock className="w-3 h-3" />
                                                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Off Duty</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default StaffDetailsPanel