import React, { useEffect, useState } from 'react'
import {
    User,
    Mail,
    Phone,
    CalendarClock,
    Briefcase
} from 'lucide-react'
import type { StaffScheduleItem } from '../../types/staff'
import { ScheduleInput } from './ScheduleInput'

export type StaffFormValues = {
    first_name: string
    last_name?: string | null
    email?: string | null
    phone_number?: string | null
    is_active: boolean
    schedule?: StaffScheduleItem[]
}

type StaffFormProps = {
    initial?: StaffFormValues
    onSubmit: (values: StaffFormValues) => void | Promise<void>
    onCancel?: () => void
    submitting?: boolean
}

const StaffForm: React.FC<StaffFormProps> = ({ initial, onSubmit, onCancel, submitting }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'schedule'>('profile')
    const [values, setValues] = useState<StaffFormValues>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        is_active: true,
        schedule: [],
    })

    useEffect(() => {
        if (initial) setValues({
            first_name: initial.first_name || '',
            last_name: initial.last_name ?? '',
            email: initial.email ?? '',
            phone_number: initial.phone_number ?? '',
            is_active: typeof initial.is_active === 'boolean' ? initial.is_active : true,
            schedule: initial.schedule ?? [],
        })
    }, [initial])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload: StaffFormValues = {
            ...values,
            last_name: values.last_name?.trim() ? values.last_name : null,
            email: values.email?.trim() ? values.email : null,
            phone_number: values.phone_number?.trim() ? values.phone_number : null,
            schedule: values.schedule ?? []
        }
        await onSubmit(payload)
    }

    return (
        <form onSubmit={submit} className="flex flex-col h-full max-h-[80vh]">

            {/* --- Tabs Header --- */}
            <div className="flex border-b border-gray-200 mb-4 shrink-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-2
                    ${activeTab === 'profile'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <User className="w-4 h-4" /> Profile Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors flex items-center justify-center gap-2
                    ${activeTab === 'schedule'
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                    <CalendarClock className="w-4 h-4" /> Work Schedule
                </button>
            </div>

            {/* --- Scrollable Content Area --- */}
            <div className="flex-1 overflow-y-auto px-1 pb-2 custom-scrollbar">

                {/* TAB 1: PROFILE */}
                <div className={`space-y-6 ${activeTab === 'profile' ? 'block' : 'hidden'}`}>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Personal Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                <input
                                    name="first_name"
                                    value={values.first_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Sarah"
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    name="last_name"
                                    value={values.last_name ?? ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Smith"
                                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Contact Info
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={values.email ?? ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="sarah@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        name="phone_number"
                                        value={values.phone_number ?? ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex flex-col justify-center">
                            <span className="block text-sm font-medium text-gray-700 mb-2">Account Status</span>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={values.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className={`ml-3 text-sm font-medium ${values.is_active ? 'text-indigo-700' : 'text-gray-500'}`}>
                                    {values.is_active ? 'Active Staff Member' : 'Inactive / Archived'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* TAB 2: SCHEDULE */}
                <div className={`${activeTab === 'schedule' ? 'block' : 'hidden'}`}>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-3">
                        <CalendarClock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold">Weekly Availability</p>
                            <p>Set the regular working hours for this staff member. This will control when they can be booked for appointments.</p>
                        </div>
                    </div>

                    <ScheduleInput
                        value={values.schedule ?? []}
                        onChange={(val) => setValues(v => ({ ...v, schedule: val }))}
                    />
                </div>
            </div>

            {/* --- Footer Actions --- */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!!submitting || !values.first_name}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {submitting ? 'Saving...' : 'Save Staff Member'}
                </button>
            </div>
        </form>
    )
}

export default StaffForm