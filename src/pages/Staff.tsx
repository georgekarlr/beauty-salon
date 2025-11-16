import React, { useEffect, useState } from 'react'
import { Users as UsersIcon, Plus, Pencil, ToggleLeft, ToggleRight, Search, Loader2, Eye } from 'lucide-react'
import Modal from '../components/ui/Modal'
import StaffForm, { StaffFormValues } from '../components/staff/StaffForm'
import type { Staff } from '../types/staff'
import { StaffService } from '../services/staffService'
import { useAuth } from '../contexts/AuthContext'
import StaffDetailsPanel from '../components/staff/StaffDetailsPanel'

const StaffPage: React.FC = () => {
  const { persona } = useAuth()
  const [items, setItems] = useState<Staff[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Staff | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    const handle = setTimeout(async () => {
      const { data, error } = await StaffService.getStaffList(query.trim() || null)
      if (!active) return
      if (error) {
        setError(error)
        setItems([])
      } else {
        setItems(data)
      }
      setLoading(false)
    }, 300)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query])

  const addStaff = async (values: StaffFormValues) => {
    if (!persona?.id && persona?.id !== 0) {
      setError('No account selected. Please switch persona to an account with ID.')
      return
    }
    const input = {
      account_id: Number(persona!.id),
      ...values,
    }
    const { data, error } = await StaffService.addStaff(input)
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => [data, ...prev])
    setCreateOpen(false)
  }

  const updateStaff = async (values: StaffFormValues) => {
    if (!editItem) return
    const { data, error } = await StaffService.editStaff({
      id: editItem.id,
      ...values,
    })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c))
    setEditItem(null)
  }

  const toggleActive = async (item: Staff) => {
    const { data, error } = await StaffService.editStaff({ id: item.id, is_active: !item.is_active })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(c => c.id === data.id ? { ...c, is_active: data.is_active } : c))
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><UsersIcon className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500">Manage staff members, contact info, and active status.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff by name or email"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" /> Loading staff...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No staff found.</td>
                </tr>
              ) : (
                items.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.first_name} {s.last_name || ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex flex-col">
                        {s.email && <span>{s.email}</span>}
                        {s.phone_number && <span>{s.phone_number}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewId(s.id)} className="px-2 py-1 text-gray-700 hover:bg-gray-50 rounded-md" title="View details">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => setEditItem(s)} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(s)} className="px-2 py-1 text-gray-700 hover:bg-gray-50 rounded-md" title="Toggle Active">
                          {s.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-t border-red-200">{error}</div>
        )}
      </div>

      {/* Create Staff Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Staff">
        <StaffForm onSubmit={addStaff} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Staff">
        {editItem && (
          <StaffForm
            initial={{
              first_name: editItem.first_name,
              last_name: editItem.last_name ?? '',
              email: editItem.email ?? '',
              phone_number: editItem.phone_number ?? '',
              is_active: editItem.is_active,
            }}
            onSubmit={updateStaff}
            onCancel={() => setEditItem(null)}
          />
        )}
      </Modal>

      {/* View Staff Details Modal */}
      <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Staff Details">
        {viewId && <StaffDetailsPanel staffId={viewId} />}
      </Modal>
    </div>
  )
}

export default StaffPage
