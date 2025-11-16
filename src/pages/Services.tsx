import React, { useEffect, useMemo, useState } from 'react'
import { Scissors, Plus, Pencil, Eye, Search, Loader2, ToggleLeft, ToggleRight, ArrowUpDown } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ServiceForm, { ServiceFormValues } from '../components/services/ServiceForm'
import ServiceDetailsPanel from '../components/services/ServiceDetailsPanel'
import type { Service } from '../types/service'
import { ServicesService } from '../services/servicesService'
import { useAuth } from '../contexts/AuthContext'

const ServicesPage: React.FC = () => {
  const { persona } = useAuth()
  const [items, setItems] = useState<Service[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Service | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration'>('name')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    const handle = setTimeout(async () => {
      const { data, error } = await ServicesService.getServices(query.trim() || null)
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

  const sorted = useMemo(() => {
    const arr = [...items]
    if (sortBy === 'name') arr.sort((a,b) => (a.name || '').localeCompare(b.name || ''))
    if (sortBy === 'price') arr.sort((a,b) => Number(b.price) - Number(a.price))
    if (sortBy === 'duration') arr.sort((a,b) => (b.duration_minutes ?? 0) - (a.duration_minutes ?? 0))
    return arr
  }, [items, sortBy])

  const addService = async (values: ServiceFormValues) => {
    if (!persona?.id && persona?.id !== 0) {
      setError('No account selected. Please switch persona to an account with ID.')
      return
    }
    const input = {
      account_id: Number(persona!.id),
      ...values,
    }
    const { data, error } = await ServicesService.addService(input)
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => [data, ...prev])
    setCreateOpen(false)
  }

  const updateService = async (values: ServiceFormValues) => {
    if (!editItem) return
    const { data, error } = await ServicesService.editService({
      id: editItem.id,
      name: values.name,
      category: values.category ?? null,
      description: values.description ?? null,
      duration_minutes: values.duration_minutes,
      price: values.price,
      is_active: values.is_active,
    })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(s => s.id === data.id ? { ...s, ...data } as Service : s))
    setEditItem(null)
  }

  const toggleActive = async (item: Service) => {
    const { data, error } = await ServicesService.editService({ id: item.id, is_active: !item.is_active })
    if (error) {
      setError(error)
      return
    }
    if (data) setItems(prev => prev.map(s => s.id === data.id ? { ...s, is_active: data.is_active } : s))
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach(i => { if (i.category) set.add(i.category) })
    return Array.from(set).sort()
  }, [items])

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><Scissors className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500">Create, categorize, price, and manage your services.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services by name or category"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 rounded-md border border-gray-300 text-sm"
              title="Sort by"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="duration">Duration</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(item => {
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><Scissors className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      {item.category && <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{item.category}</span>}
                    </div>
                    <div className="text-xs text-gray-500">{item.duration_minutes} min</div>
                  </div>
                  <button onClick={() => toggleActive(item)} className="text-gray-500 hover:text-gray-700" title={item.is_active ? 'Deactivate' : 'Activate'}>
                    {item.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Price</div>
                    <div className="font-medium">${Number(item.price).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Category</div>
                    <div className="font-medium">{item.category || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="font-medium">{item.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setEditItem(item)} className="px-3 py-1.5 text-sm inline-flex items-center gap-1 rounded-md border border-gray-300 hover:bg-gray-50"><Pencil className="w-4 h-4" /> Edit</button>
                  <button onClick={() => setViewId(item.id)} className="ml-auto px-3 py-1.5 text-sm inline-flex items-center gap-1 rounded-md bg-gray-900 text-white hover:bg-black"><Eye className="w-4 h-4" /> View</button>
                </div>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16">No services found.</div>
          )}
        </div>
      )}

      {/* Create Service Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Service">
        <ServiceForm
          onSubmit={addService}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create"
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Service">
        {editItem && (
          <ServiceForm
            initial={editItem}
            onSubmit={updateService}
            onCancel={() => setEditItem(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Service Details">
        {viewId && <ServiceDetailsPanel serviceId={viewId} />}
      </Modal>
    </div>
  )
}

export default ServicesPage
