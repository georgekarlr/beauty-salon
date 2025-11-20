import React, { useMemo, useState } from 'react'
import { Scissors, Clock, DollarSign, FileText, Layers } from 'lucide-react'
import type { Service } from '../../types/service'

export type ServiceFormValues = Omit<Service, 'id' | 'created_at' | 'account_id' | 'user_id'>

type Props = {
    initial?: Partial<Service>
    onSubmit: (values: ServiceFormValues) => void
    onCancel: () => void
    submitLabel?: string
}

const ServiceForm: React.FC<Props> = ({ initial, onSubmit, onCancel, submitLabel = 'Save Service' }) => {
    const [values, setValues] = useState<ServiceFormValues>({
        name: initial?.name ?? '',
        category: initial?.category ?? '',
        description: initial?.description ?? '',
        duration_minutes: typeof initial?.duration_minutes === 'number' ? initial.duration_minutes : 30,
        price: typeof initial?.price === 'number' ? initial.price : 0,
        is_active: typeof initial?.is_active === 'boolean' ? initial.is_active : true,
    })

    const isValid = useMemo(() => {
        return values.name.trim().length > 0 && values.duration_minutes > 0 && values.price >= 0
    }, [values])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setValues(v => ({ ...v, [name]: checked }))
        } else {
            setValues(v => ({
                ...v,
                [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
            }))
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                if (isValid) onSubmit(values)
            }}
            className="flex flex-col h-full max-h-[80vh]"
        >

            {/* --- Scrollable Content --- */}
            <div className="flex-1 overflow-y-auto px-1 space-y-6 pb-4 custom-scrollbar">

                {/* Section 1: Basic Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Scissors className="w-4 h-4" /> Service Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name <span className="text-red-500">*</span></label>
                            <input
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-medium"
                                placeholder="e.g. Classic Haircut"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Layers className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        name="category"
                                        value={values.category ?? ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="e.g. Hair, Nails, Spa"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">{'\u20b1'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        min={0}
                                        step={0.01}
                                        value={values.price}
                                        onChange={handleChange}
                                        className="w-full pl-9 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-semibold text-gray-900"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <div className="relative">
                <textarea
                    name="description"
                    value={values.description ?? ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm resize-none"
                    placeholder="What does this service include?"
                />
                                <FileText className="absolute top-3 right-3 h-4 w-4 text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Booking & Status */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Booking Settings
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                min={5}
                                step={5}
                                value={values.duration_minutes}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                            <div className="flex gap-2 mt-2">
                                {[15, 30, 45, 60].map(mins => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setValues(v => ({ ...v, duration_minutes: mins }))}
                                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <span className="block text-sm font-medium text-gray-700 mb-2">Service Status</span>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={!!values.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className={`ml-3 text-sm font-medium ${values.is_active ? 'text-indigo-700' : 'text-gray-500'}`}>
                  {values.is_active ? 'Active (Bookable)' : 'Archived'}
                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Sticky Footer --- */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isValid}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    )
}

export default ServiceForm