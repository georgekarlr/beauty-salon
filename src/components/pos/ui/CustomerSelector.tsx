import React from 'react'
import type { Client } from '../../../types/client'
import type { Appointment } from '../../../types/appointment'

type Props = {
  clientQuery: string
  setClientQuery: (q: string) => void
  clients: Client[]
  selectedClient: Client | null
  onSelectClient: (c: Client) => void
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  onSelectAppointment: (a: Appointment) => void
}

const CustomerSelector: React.FC<Props> = ({
  clientQuery,
  setClientQuery,
  clients,
  selectedClient,
  onSelectClient,
  appointments,
  selectedAppointment,
  onSelectAppointment,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Search Customer</label>
        <input
          className="mt-1 w-full border rounded-md px-3 py-2"
          placeholder="Type name, email or phone"
          value={clientQuery}
          onChange={(e) => setClientQuery(e.target.value)}
        />
      </div>
      <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
        {clients.map((c) => (
          <button
            key={c.id}
            className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-indigo-50' : ''}`}
            onClick={() => onSelectClient(c)}
          >
            <div className="font-medium">
              {c.first_name} {c.last_name || ''}
            </div>
            <div className="text-xs text-gray-500">{c.email || c.phone_number || '—'}</div>
          </button>
        ))}
      </div>
      {selectedClient && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Appointment (optional)</label>
          <div className="mt-1 max-h-40 overflow-y-auto border rounded-md divide-y">
            {appointments.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No upcoming appointments today.</div>
            )}
            {appointments.map((a) => (
              <button
                key={a.id}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selectedAppointment?.id === a.id ? 'bg-indigo-50' : ''}`}
                onClick={() => onSelectAppointment(a)}
              >
                <div className="font-medium">
                  {new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {a.services.map((s) => s.name).join(', ')}
                </div>
                <div className="text-xs text-gray-500">Staff: {a.staff_name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerSelector
