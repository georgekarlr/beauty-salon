import React from 'react';
import type { AppointmentSummary } from '../../types/dashboard';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Timer } from 'lucide-react';

type Props = {
    appointments: AppointmentSummary[];
};

// Helper to get status colors and icons
const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
        case 'confirmed':
        case 'completed':
            return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle2 };
        case 'cancelled':
            return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: XCircle };
        case 'pending':
            return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: AlertCircle };
        default:
            return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', icon: Timer };
    }
};

const AppointmentsList: React.FC<Props> = ({ appointments }) => {

    // Sort by time (earliest first) just in case API didn't
    const sorted = [...appointments].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">

            {/* --- Header --- */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                </div>
                {appointments.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                        {appointments.length}
                    </span>
                )}
            </div>

            {/* --- Scrollable List --- */}
            <div className="flex-1 overflow-y-auto max-h-[350px] p-0 custom-scrollbar">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">No appointments today</p>
                        <p className="text-xs">Enjoy your free time!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sorted.map((appt) => {
                            const style = getStatusStyle(appt.status);
                            const StatusIcon = style.icon;
                            const time = new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={appt.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                                    {/* Time Column */}
                                    <div className="flex flex-col items-center pt-1 min-w-[60px]">
                                        <span className="text-sm font-bold text-gray-900">{time}</span>
                                        <div className="h-full w-px bg-gray-200 mt-2 group-last:hidden"></div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-gray-900">{appt.customer_name}</h4>

                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${style.bg} ${style.text} ${style.border}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {appt.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                <User className="w-3 h-3" /> {appt.staff_name}
                                            </span>
                                            {/* Placeholder for service name if available in your type */}
                                            {/* <span>• Haircut</span> */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Optional Footer Link */}
            {appointments.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        View Full Calendar
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentsList;