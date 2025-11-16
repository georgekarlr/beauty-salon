import React, { useMemo, useState } from 'react'
import type { Service } from '../../types/service'

export type ServiceFormValues = Omit<Service, 'id' | 'created_at' | 'account_id' | 'user_id'>

type Props = {
  initial?: Partial<Service>
  onSubmit: (values: ServiceFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

const ServiceForm: React.FC<Props> = ({ initial, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [values, setValues] = useState<ServiceFormValues>({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    duration_minutes: typeof initial?.duration_minutes === 'number' ? initial.duration_minutes : 30,
    price: typeof initial?.price === 'number' ? initial.price : 0,
    is_active: typeof initial?.is_active === 'boolean' ? initial.is_active : true,
  } as ServiceFormValues)

  const isValid = useMemo(() => {
    return values.name.trim().length > 0 && (values.duration_minutes as number) > 0 && (values.price as number) >= 0
  }, [values])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any
    setValues(v => ({
      ...v,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? Boolean(checked) : value,
    }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isValid) onSubmit(values)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={(values as any).name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Classic Haircut"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            name="category"
            value={(values as any).category ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Haircuts"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            min={5}
            step={5}
            value={(values as any).duration_minutes}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={(values as any).description ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Describe the service"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            min={0}
            step={0.01}
            value={(values as any).price}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 mt-6">
            <input type="checkbox" name="is_active" checked={!!(values as any).is_active} onChange={handleChange} />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={!isValid} className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
