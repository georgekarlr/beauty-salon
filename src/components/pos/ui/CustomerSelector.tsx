import React from 'react'
import { Search, User, Clock, Check } from 'lucide-react'
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
    // New prop to handle loading state (essential for LCP)
    isLoading?: boolean
}

// 1. Extract & Memoize Row to prevent unnecessary re-renders during typing
const ClientRow = React.memo(({
                                  client,
                                  isSelected,
                                  onClick
                              }: {
    client: Client,
    isSelected: boolean,
    onClick: () => void
}) => {
    const initials = `${client.first_name.charAt(0)}${client.last_name ? client.last_name.charAt(0) : ''}`.toUpperCase();

    return (
        <button
            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150 content-visibility-auto
        ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-gray-50 bg-white'}
      `}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold
          ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    {initials}
                </div>
                <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {client.first_name} {client.last_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {client.email || client.phone_number || 'No contact info'}
                    </div>
                </div>
            </div>
            {isSelected && <Check className="h-4 w-4 text-indigo-600 ml-2 flex-shrink-0" />}
        </button>
    )
});

// 2. Skeleton Loader Component (Crucial for LCP)
// Paints gray bars immediately so the browser registers content paint before data arrives
const ClientListSkeleton = () => (
    <div className="divide-y divide-gray-100 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const CustomerSelector: React.FC<Props> = ({
                                               clientQuery,
                                               setClientQuery,
                                               clients,
                                               selectedClient,
                                               onSelectClient,
                                               appointments,
                                               selectedAppointment,
                                               onSelectAppointment,
                                               isLoading = false, // Default to false
                                           }) => {

    return (
        <div className="space-y-6 bg-white p-1">
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                    Select Customer
                </label>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        placeholder="Search..."
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        // Optimization: defer attribute isn't valid on React inputs, but ensure this doesn't block main thread
                    />
                </div>

                {/* 3. CSS Optimization: contain-strict or content-visibility
            We use a style object here to enforce performance on the container */}
                <div
                    className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-sm scrollbar-thin scrollbar-thumb-gray-200"
                    style={{ contentVisibility: 'auto', contain: 'layout style paint' }}
                >
                    {isLoading ? (
                        <ClientListSkeleton />
                    ) : clients.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-gray-300" />
                            <span>{clientQuery ? 'No customers found.' : 'Search for a customer'}</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {clients.map((c) => (
                                <ClientRow
                                    key={c.id}
                                    client={c}
                                    isSelected={selectedClient?.id === c.id}
                                    onClick={() => onSelectClient(c)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Section (Only rendered when needed) */}
            {selectedClient && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                            Link Appointment
                        </label>
                        {selectedAppointment && (
                            <button
                                onClick={() => onSelectAppointment(null as any)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                        {appointments.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500 bg-gray-50/50">
                                No upcoming appointments.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {appointments.map((a) => {
                                    const isSelected = selectedAppointment?.id === a.id;
                                    return (
                                        <button
                                            key={a.id}
                                            className={`w-full text-left px-4 py-3 transition-colors duration-150
                        ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}
                      `}
                                            onClick={() => onSelectAppointment(a)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        {new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <span className="text-gray-300">|</span>
                                                        <span>{a.services.map((s) => s.name).join(', ')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-5">
                                                        <User className="h-3 w-3" />
                                                        <span>Staff: {a.staff_name}</span>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="h-3 w-3 text-indigo-600" />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerSelector