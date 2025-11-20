import React, { useEffect, useState } from 'react'
import {
    Plus, Pencil, Trash2, Users, Search,
    Mail, Phone, Calendar, XCircle, ChevronRight
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import ClientForm, { ClientFormValues } from '../components/clients/ClientForm'
import type { Client } from '../types/client'
import { ClientsService } from '../services/clientsService'
import { useAuth } from '../contexts/AuthContext'

// --- UI Helpers ---

const Avatar = ({ first, last }: { first: string; last?: string | null }) => {
    const initials = `${first.charAt(0)}${last ? last.charAt(0) : ''}`.toUpperCase();
    return (
        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm">
            {initials}
        </div>
    );
};

const ClientSkeleton = () => (
    <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        ))}
    </div>
);

const Clients: React.FC = () => {
    const { persona } = useAuth()
    const [clients, setClients] = useState<Client[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal States
    const [createOpen, setCreateOpen] = useState(false)
    const [editClient, setEditClient] = useState<Client | null>(null)
    const [deleteClient, setDeleteClient] = useState<Client | null>(null)

    // Fetch Logic
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

    // CRUD Handlers
    const addClient = async (values: ClientFormValues) => {
        if (!persona?.id) { setError('No account selected.'); return; }
        const input = {
            account_id: Number(persona.id),
            ...values,
            date_of_birth: values.date_of_birth?.trim() || null,
            email: values.email?.trim() || null,
            phone_number: values.phone_number?.trim() || null,
            last_name: values.last_name?.trim() || null,
            notes: values.notes?.trim() || null,
        }
        const { data, error } = await ClientsService.addClient(input)
        if (error) { setError(error); return }
        if (data) setClients(prev => [data, ...prev])
        setCreateOpen(false)
    }

    const updateClient = async (values: ClientFormValues) => {
        if (!editClient) return
        const { data, error } = await ClientsService.editClient({
            id: editClient.id,
            ...values,
            date_of_birth: values.date_of_birth?.trim() || null,
            email: values.email?.trim() || null,
            phone_number: values.phone_number?.trim() || null,
            last_name: values.last_name?.trim() || null,
            notes: values.notes?.trim() || null,
        })
        if (error) { setError(error); return }
        if (data) setClients(prev => prev.map(c => c.id === data.id ? data : c))
        setEditClient(null)
    }

    const confirmDelete = async () => {
        if (!deleteClient) return
        const { data, error } = await ClientsService.deleteClient(deleteClient.id)
        if (error) { setError(error); return }
        if (data) setClients(prev => prev.filter(c => c.id !== data.id))
        setDeleteClient(null)
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

            {/* --- Header --- */}
            <div className="max-w-6xl mx-auto mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your customer database</p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </div>

                {/* --- Search Bar --- */}
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
                        <div className="flex">
                            <div className="flex-shrink-0"><XCircle className="h-5 w-5 text-red-400" /></div>
                            <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <ClientSkeleton />
                ) : clients.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or create a new client.</p>
                    </div>
                ) : (
                    <>
                        {/* --- Desktop Table View (Hidden on Mobile) --- */}
                        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar first={c.first_name} last={c.last_name} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{c.first_name} {c.last_name}</div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {c.date_of_birth || 'No DOB'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 text-sm">
                                                {c.email ? (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {c.email}
                                                    </div>
                                                ) : <span className="text-gray-400 text-xs italic">No Email</span>}

                                                {c.phone_number ? (
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.phone_number}
                                                    </div>
                                                ) : <span className="text-gray-400 text-xs italic">No Phone</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.notes ? (
                                                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100 max-w-[200px] truncate">
                            {c.notes}
                          </span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditClient(c)}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors text-xs font-semibold shadow-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteClient(c)}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-xs font-semibold shadow-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- Mobile Card View (Visible on Mobile) --- */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {clients.map((c) => (
                                <div key={c.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar first={c.first_name} last={c.last_name} />
                                            <div>
                                                <h3 className="font-bold text-gray-900">{c.first_name} {c.last_name}</h3>
                                                <p className="text-xs text-gray-500">{c.date_of_birth || 'No DOB'}</p>
                                            </div>
                                        </div>
                                        {c.notes && (
                                            <span className="w-2 h-2 rounded-full bg-yellow-400" title="Has notes"></span>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{c.email || 'No Email'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{c.phone_number || 'No Phone'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setEditClient(c)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteClient(c)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-100 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* --- Modals (Unchanged Logic) --- */}
            <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Customer">
                <ClientForm onSubmit={addClient} onCancel={() => setCreateOpen(false)} submitLabel="Create Account" />
            </Modal>

            <Modal isOpen={!!editClient} onClose={() => setEditClient(null)} title="Edit Customer">
                {editClient && (
                    <ClientForm
                        initial={editClient}
                        onSubmit={updateClient}
                        onCancel={() => setEditClient(null)}
                        submitLabel="Save Changes"
                    />
                )}
            </Modal>

            <Modal isOpen={!!deleteClient} onClose={() => setDeleteClient(null)} title="Delete Customer">
                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 text-sm flex gap-3">
                        <div className="shrink-0"><XCircle className="w-5 h-5" /></div>
                        <div>
                            <span className="font-bold block text-red-900 mb-1">Delete {deleteClient?.first_name}?</span>
                            This action will permanently remove their history and cannot be undone.
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setDeleteClient(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm">Delete Permanently</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Clients