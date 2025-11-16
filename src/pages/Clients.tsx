import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users as UsersIcon, Search, Loader2, AlertTriangle } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ClientForm, { ClientFormValues } from '../components/clients/ClientForm'
import type { Client } from '../types/client'
import { ClientsService } from '../services/clientsService'
import { useAuth } from '../contexts/AuthContext'

const Clients: React.FC = () => {
  const { persona } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)

  // Fetch clients on mount and when query changes (debounced)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    const handle = setTimeout(async () => {
      const { data, error } = await ClientsService.getClients(query.trim() || null)
      if (!active) return
      if (error) {
        setError(error)
        setClients([])
      } else {
        setClients(data)
      }
      setLoading(false)
    }, 300)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query])

  const addClient = async (values: ClientFormValues) => {
    if (!persona?.id && persona?.id !== 0) {
      setError('No account selected. Please switch persona to an account with ID.')
      return
    }
    const input = {
      account_id: Number(persona!.id),
      ...values,
      date_of_birth: values.date_of_birth?.trim() ? values.date_of_birth : null,
      email: values.email?.trim() ? values.email : null,
      phone_number: values.phone_number?.trim() ? values.phone_number : null,
      last_name: values.last_name?.trim() ? values.last_name : null,
      notes: values.notes?.trim() ? values.notes : null,
    }
    const { data, error } = await ClientsService.addClient(input)
    if (error) {
      setError(error)
      return
    }
    if (data) setClients(prev => [data, ...prev])
    setCreateOpen(false)
  }

  const updateClient = async (values: ClientFormValues) => {
    if (!editClient) return
    const { data, error } = await ClientsService.editClient({
      id: editClient.id,
      ...values,
      date_of_birth: values.date_of_birth?.trim() ? values.date_of_birth : null,
      email: values.email?.trim() ? values.email : null,
      phone_number: values.phone_number?.trim() ? values.phone_number : null,
      last_name: values.last_name?.trim() ? values.last_name : null,
      notes: values.notes?.trim() ? values.notes : null,
    })
    if (error) {
      setError(error)
      return
    }
    if (data) setClients(prev => prev.map(c => c.id === data.id ? data : c))
    setEditClient(null)
  }

  const confirmDelete = async () => {
    if (!deleteClient) return
    const { data, error } = await ClientsService.deleteClient(deleteClient.id)
    if (error) {
      setError(error)
      return
    }
    if (data) setClients(prev => prev.filter(c => c.id !== data.id))
    setDeleteClient(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><UsersIcon className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">View and manage client records and contact information.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients by name, email, or phone"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {loading && (
          <div className="p-6 flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading clients...
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {(clients || []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                  {c.notes ? <div className="text-xs text-gray-500 line-clamp-1">{c.notes}</div> : null}
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700 text-sm">{c.email || '-'}{c.email && c.phone_number ? ' • ' : ''}{c.phone_number || ''}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{c.date_of_birth || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditClient(c)}
                      className="px-2 py-1.5 rounded-md text-blue-600 hover:bg-blue-50 inline-flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteClient(c)}
                      className="px-2 py-1.5 rounded-md text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Client Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Client">
        <ClientForm onSubmit={addClient} onCancel={() => setCreateOpen(false)} submitLabel="Create" />
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={!!editClient} onClose={() => setEditClient(null)} title="Edit Client">
        {editClient && (
          <ClientForm
            initial={editClient}
            onSubmit={updateClient}
            onCancel={() => setEditClient(null)}
            submitLabel="Update"
          />
        )}
      </Modal>

      {/* Delete Client Modal */}
      <Modal isOpen={!!deleteClient} onClose={() => setDeleteClient(null)} title="Delete Client">
        <p className="text-sm text-gray-600">Are you sure you want to delete this client? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setDeleteClient(null)} className="px-4 py-2 rounded-md hover:bg-gray-100">Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

export default Clients
