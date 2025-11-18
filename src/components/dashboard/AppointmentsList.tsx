import React from 'react';
import type { AppointmentSummary } from '../../types/dashboard';
import { Calendar, Clock } from 'lucide-react';

type Props = { appointments: AppointmentSummary[]; };

const AppointmentsList: React.FC<Props> = ({ appointments }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Today's Appointments</h3>
        </div>
        {appointments.length === 0 ? (
            <p className="text-sm text-gray-500">No appointments scheduled for today.</p>
        ) : (
            <ul className="space-y-3">
                {appointments.map(appt => (
                    <li key={appt.id} className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-medium text-gray-800">{appt.customer_name}</p>
                            <p className="text-gray-500">with {appt.staff_name} - <span className="capitalize">{appt.status}</span></p>
                        </div>
                        <p className="text-gray-600 font-mono">
                            {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default AppointmentsList;