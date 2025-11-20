import React, { useEffect, useState } from 'react'
import {
    Users,
    Plus,
    Pencil,
    Search,
    Eye,
    Mail,
    Phone,
    CheckCircle2,
    XCircle,
    MoreHorizontal
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import StaffForm, { StaffFormValues } from '../components/staff/StaffForm'
import type { Staff } from '../types/staff'
import { StaffService } from '../services/staffService'
import { useAuth } from '../contexts/AuthContext'
import StaffDetailsPanel from '../components/staff/StaffDetailsPanel'

// --- UI Helpers ---
const getInitials = (first: string, last?: string | null) => {
    return `${first.charAt(0)}${last ? last.charAt(0) : ''}`.toUpperCase();
}

const Avatar = ({ first, last }: { first: string, last?: string | null }) => (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
        {getInitials(first, last)}
    </div>
)

const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        ))}
    </div>
)

const StaffPage: React.FC = () => {
    const { persona } = useAuth()
    const [items, setItems] = useState<Staff[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal States
    const [createOpen, setCreateOpen] = useState(false)
    const [editItem, setEditItem] = useState<Staff | null>(null)
    const [viewId, setViewId] = useState<string | null>(null)

    // Fetch Logic
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
        if (!persona?.id) { setError('No account selected.'); return; }
        const input = { account_id: Number(persona.id), ...values }
        const { data, error } = await StaffService.addStaff(input)
        if (error) { setError(error); return }
        if (data) setItems(prev => [data, ...prev])
        setCreateOpen(false)
    }

    const updateStaff = async (values: StaffFormValues) => {
        if (!editItem) return
        const { data, error } = await StaffService.editStaff({ id: editItem.id, ...values })
        if (error) { setError(error); return }

        // Refresh list to ensure schedule changes are reflected if needed
        if (data) {
            const { data: newData } = await StaffService.getStaffList(query.trim() || null)
            if (newData) setItems(newData)
        }
        setEditItem(null)
    }

    const toggleActive = async (item: Staff) => {
        // Optimistic UI update
        setItems(prev => prev.map(c => c.id === item.id ? { ...c, is_active: !c.is_active } : c))

        const { error } = await StaffService.editStaff({ id: item.id, is_active: !item.is_active })
        if (error) {
            // Revert on error
            setItems(prev => prev.map(c => c.id === item.id ? { ...c, is_active: item.is_active } : c))
            setError(error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

            {/* --- Header --- */}
            <div className="max-w-6xl mx-auto mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            Staff Members
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium border border-gray-200">
                {items.length} Total
              </span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage team schedules and profiles</p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Staff
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Search by name, email, or phone..."
                    />
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="max-w-6xl mx-auto">

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <TableSkeleton />
                    ) : items.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No staff members found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or add a new team member.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <table className="hidden md:table min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((s) => (
                                    <tr key={s.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar first={s.first_name} last={s.last_name} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{s.first_name} {s.last_name}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">ID: {s.id.slice(0,8)}...</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 text-sm">
                                                {s.email ? (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {s.email}
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">No Email</span>}

                                                {s.phone_number ? (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone_number}
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">No Phone</span>}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleActive(s)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                           ${s.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                                            >
                                                {s.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setViewId(s.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditItem(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md" title="Edit Staff">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {items.map((s) => (
                                    <div key={s.id} className="p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar first={s.first_name} last={s.last_name} />
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{s.first_name} {s.last_name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                        <button onClick={() => toggleActive(s)} className={`font-medium ${s.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                            {s.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setViewId(s.id)} className="text-gray-400 hover:text-indigo-600">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {s.email || 'No email'}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {s.phone_number || 'No phone'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setViewId(s.id)} className="py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                View Profile
                                            </button>
                                            <button onClick={() => setEditItem(s)} className="py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700">
                                                Edit Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}

            <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Team Member">
                <StaffForm onSubmit={addStaff} onCancel={() => setCreateOpen(false)} />
            </Modal>

            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Team Member">
                {editItem && (
                    <StaffForm
                        initial={{
                            first_name: editItem.first_name,
                            last_name: editItem.last_name ?? '',
                            email: editItem.email ?? '',
                            phone_number: editItem.phone_number ?? '',
                            is_active: editItem.is_active,
                            schedule: editItem.schedule ?? undefined,
                        }}
                        onSubmit={updateStaff}
                        onCancel={() => setEditItem(null)}
                    />
                )}
            </Modal>

            <Modal isOpen={!!viewId} onClose={() => setViewId(null)} title="Staff Profile">
                {viewId && <StaffDetailsPanel staffId={viewId} />}
            </Modal>
        </div>
    )
}

export default StaffPage