import React from 'react'
import type { UUID } from '../../types/product'
import { useServiceDetails } from '../../hooks/useServiceDetails'
import {
    Clock,
    DollarSign,
    Activity,
    AlertTriangle,
    Layers,
    CheckCircle2,
    ArrowRight,
    TrendingUp
} from 'lucide-react'

type Props = {
    serviceId: UUID
}

// --- Helper to Format Keys (e.g. "duration_minutes" -> "Duration Minutes") ---
const formatKey = (key: string) => {
    // If key is numeric (like "0", "1"), return empty string or generic label
    if (!isNaN(Number(key))) return '';
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// --- ROBUST VALUE RENDERER ---
const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">Empty</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    // 1. Handle Arrays
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400 italic">None</span>;

        return (
            <div className="flex flex-col gap-2 mt-1">
                {value.map((item, idx) => {
                    // Case 1.1: Array of Objects
                    if (typeof item === 'object' && item !== null) {
                        return (
                            <div key={idx} className="bg-white border border-gray-200 rounded-md p-2 text-xs shadow-sm">
                                {Object.entries(item).map(([subKey, subVal], i) => (
                                    <div key={i} className="flex items-start gap-2 mb-0.5 last:mb-0">
                                        <span className="text-gray-500 font-medium min-w-[60px]">{formatKey(subKey)}:</span>
                                        <span className="text-gray-800">{String(subVal)}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    // Case 1.2: Array of Strings/Numbers
                    return (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium w-fit">
              {String(item)}
            </span>
                    );
                })}
            </div>
        );
    }

    // 2. Handle "Diff/Change" Objects
    // Matches { old: 'A', new: 'B' } OR { from: 'A', to: 'B' }
    const isDiff = typeof value === 'object' && value !== null &&
        (('old' in value && 'new' in value) || ('from' in value && 'to' in value));

    if (isDiff) {
        const fromVal = value.from ?? value.old;
        const toVal = value.to ?? value.new;
        return (
            <div className="flex items-center gap-2 flex-wrap">
        <span className="line-through text-red-400 text-xs bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
          {String(fromVal)}
        </span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-bold text-emerald-700 text-sm bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
          {String(toVal)}
        </span>
            </div>
        );
    }

    // 3. Handle Standard Objects
    if (typeof value === 'object' && value !== null) {
        return <span className="font-mono text-xs text-gray-500 break-all">{JSON.stringify(value)}</span>;
    }

    // 4. Standard Values
    return <span className="text-gray-800 font-medium">{String(value)}</span>;
}

const ServiceDetailsPanel: React.FC<Props> = ({ serviceId }) => {
    const { data, loading, error } = useServiceDetails(serviceId)

    if (loading) return (
        <div className="animate-pulse space-y-4 p-2">
            <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-100 rounded-xl"></div>
                <div className="h-24 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-32 bg-gray-100 rounded-xl mt-4"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> {error}
        </div>
    );

    if (!data) return <div className="text-gray-500 p-4">No data found.</div>;

    // Calculate effective hourly rate
    const hourlyRate = data.duration_minutes > 0
        ? ((Number(data.price) / data.duration_minutes) * 60).toFixed(2)
        : '0.00';

    return (
        <div className="flex flex-col h-full max-h-[80vh]">

            {/* --- Header & Stats --- */}
            <div className="shrink-0 space-y-6 pr-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {data.name}
                        </h3>
                        {data.category && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Layers className="w-3.5 h-3.5" /> {data.category}
                            </div>
                        )}
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5
            ${data.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                        {data.is_active ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {data.is_active ? 'Active Service' : 'Archived'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Price Card */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            <DollarSign className="w-3 h-3" /> Price
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">Per Session</span>
                            <span className="text-lg font-bold text-gray-900">{'\u20b1'}{Number(data.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-200/50">
               <span className="text-[10px] text-gray-400 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> Effective Rate
               </span>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 rounded">
                 {'\u20b1'}{hourlyRate}/hr
               </span>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Duration
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">Time Block</span>
                            <span className="text-lg font-bold text-gray-900">{data.duration_minutes} <span className="text-sm font-normal text-gray-500">min</span></span>
                        </div>
                    </div>
                </div>

                {data.description && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Description</h4>
                        <div className="text-sm text-gray-600 bg-white p-3 border border-gray-100 rounded-lg italic leading-relaxed">
                            "{data.description}"
                        </div>
                    </div>
                )}
            </div>

            {/* --- Activity Timeline --- */}
            <div className="flex-1 min-h-0 mt-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-gray-900">History Log</h4>
                </div>

                <div className="overflow-y-auto pr-2 -mr-2 flex-1 custom-scrollbar max-h-[250px]">
                    <div className="relative border-l-2 border-gray-100 ml-2 space-y-6 pl-6 py-2">
                        {(!data.activity_history || data.activity_history.length === 0) ? (
                            <div className="text-sm text-gray-400 italic py-4">No recorded activity yet.</div>
                        ) : (
                            data.activity_history.map((a, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-300 group-hover:bg-indigo-400 transition-colors" />

                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-gray-800">{a.action}</span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString()}
                      </span>
                                        </div>

                                        {a.details && typeof a.details === 'object' && Object.keys(a.details).length > 0 && (
                                            <div className="mt-2 bg-gray-50/80 rounded-md p-2.5 border border-gray-100 space-y-2">
                                                {Object.entries(a.details).map(([key, val], i) => {
                                                    // IMPROVED LOGIC:
                                                    // If the value is an object with 'field', use 'field' as the label instead of the index key '0'
                                                    let label = key;
                                                    if (typeof val === 'object' && val !== null && 'field' in val) {
                                                        label = (val as any).field;
                                                    }

                                                    return (
                                                        <div key={i} className="text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                              <span className="font-semibold text-gray-500 min-w-[90px] shrink-0 pt-0.5">
                                {formatKey(label)}:
                              </span>
                                                            <div className="break-all flex-1">
                                                                {renderValue(val)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {a.details && typeof a.details === 'string' && (
                                            <div className="mt-1 text-xs text-gray-600">{a.details}</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ServiceDetailsPanel