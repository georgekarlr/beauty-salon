import React, { useEffect, useState } from 'react'
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
    const [values, setValues] = useState<StaffFormValues>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        is_active: true,
        schedule: undefined,
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
            // Always include schedule. If null/undefined, send empty array to clear it.
            schedule: values.schedule ?? []
        }

        await onSubmit(payload)
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First name</label>
                    <input
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last name</label>
                    <input
                        name="last_name"
                        value={values.last_name ?? ''}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={values.email ?? ''}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        name="phone_number"
                        value={values.phone_number ?? ''}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input id="is_active" name="is_active" type="checkbox" checked={values.is_active} onChange={handleChange} />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>

            {/* Schedule editor - Always visible */}
            <div className="border-t pt-4">
                <div className="mb-2">
                    <label className="text-sm font-medium text-gray-700">Schedule (day_of_week 0–6)</label>
                </div>
                <ScheduleInput
                    value={values.schedule ?? []}
                    onChange={(val) => setValues(v => ({ ...v, schedule: val }))}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!!submitting}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    )
}

export default StaffForm