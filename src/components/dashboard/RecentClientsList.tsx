import React from 'react';
import type { RecentClient } from '../../types/dashboard';
import { Users, Phone, Mail, Clock } from 'lucide-react';

type Props = {
    clients: RecentClient[];
};

// Helper to generate initials
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const RecentClientsList: React.FC<Props> = ({ clients }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">

            {/* --- Header --- */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-gray-900">New Customers</h3>
                </div>
            </div>

            {/* --- List --- */}
            <div className="flex-1 overflow-y-auto max-h-[350px] p-0 custom-scrollbar">
                {clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">No new clients</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {clients.map((client) => (
                            <div key={client.id} className="group p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {getInitials(client.name)}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">{client.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{client.phone_number || 'No phone'}</span>
                                            {/* Mock Date - In a real app, pass 'created_at' */}
                                            <span className="hidden sm:flex items-center gap-1">
                                                • <Clock className="w-3 h-3" /> New
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {client.phone_number && (
                                        <a
                                            href={`tel:${client.phone_number}`}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Call Customer"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Footer --- */}
            {clients.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        View All Customers
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentClientsList;