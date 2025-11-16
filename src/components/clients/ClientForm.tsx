import React, { useMemo, useState } from 'react'
import type { Client } from '../../types/client'

export type ClientFormValues = Omit<Client, 'id' | 'created_at' | 'account_id' | 'user_id'>

type ClientFormProps = {
  initial?: Partial<Client>
  onSubmit: (values: ClientFormValues) => void
  onCancel: () => void
  submitLabel?: string
}

const ClientForm: React.FC<ClientFormProps> = ({ initial, onSubmit, onCancel, submitLabel = 'Save' }) => {
  const [values, setValues] = useState<ClientFormValues>({
    first_name: initial?.first_name ?? '',
    last_name: initial?.last_name ?? '',
    email: initial?.email ?? '',
    phone_number: initial?.phone_number ?? '',
    date_of_birth: initial?.date_of_birth ?? '',
    notes: initial?.notes ?? ''
  })

  const isValid = useMemo(() => values.first_name.trim().length > 0, [values.first_name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues(v => ({ ...v, [name]: value }))
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
        <div>
          <label className="block text-sm font-medium text-gray-700">First name</label>
          <input
            name="first_name"
            value={values.first_name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Jane"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last name</label>
          <input
            name="last_name"
            value={values.last_name ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Doe"
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
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            name="phone_number"
            value={values.phone_number ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+1 555 555 5555"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={values.date_of_birth ?? ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="sm:col-span-1"></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={values.notes ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Customer preferences, allergies, etc."
        />
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

export default ClientForm
