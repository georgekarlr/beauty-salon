import React from 'react';
import type { RecentClient } from '../../types/dashboard';
import { Users } from 'lucide-react';

type Props = { clients: RecentClient[]; };

const RecentClientsList: React.FC<Props> = ({ clients }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Recent Clients</h3>
        </div>
        {clients.length === 0 ? (
            <p className="text-sm text-gray-500">No new clients added recently.</p>
        ) : (
            <ul className="space-y-2">
                {clients.map(client => (
                    <li key={client.id} className="text-sm">
                        <p className="font-medium text-gray-800">{client.name}</p>
                        <p className="text-gray-500">{client.phone_number}</p>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default RecentClientsList;