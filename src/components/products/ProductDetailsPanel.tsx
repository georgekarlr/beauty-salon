import React from 'react'
import type { UUID } from '../../types/product'
import { useProductDetails } from '../../hooks/useProductDetails'
import {
    Package,
    DollarSign,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Tag,
    Hash,
    Clock,
    ArrowRight
} from 'lucide-react'

type Props = {
    productId: UUID
}

// 1. Helper: Make database keys readable (e.g. "stock_quantity" -> "Stock Quantity")
const formatKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// 2. Helper: Recursive value renderer
const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400 italic">Empty</span>;

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    // Handle Arrays (e.g. tags)
    if (Array.isArray(value)) {
        return <span className="text-gray-800">{value.join(', ')}</span>;
    }

    // Handle "Diff" Objects { old: 10, new: 20 }
    if (typeof value === 'object' && 'old' in value && 'new' in value) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <span className="line-through text-red-400 text-xs">{String(value.old)}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-bold text-emerald-700 text-sm">{String(value.new)}</span>
            </div>
        );
    }

    // Handle Standard Objects (Recurse if needed, or JSON stringify if too complex)
    if (typeof value === 'object') {
        return <span className="font-mono text-xs text-gray-500">{JSON.stringify(value)}</span>;
    }

    // Handle standard strings/numbers
    return <span className="text-gray-800 font-medium">{String(value)}</span>;
}

const ProductDetailsPanel: React.FC<Props> = ({ productId }) => {
    const { data, loading, error } = useProductDetails(productId)

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

    if (!data) return <div className="text-gray-500 p-4">No product data found.</div>;

    const isLowStock = data.stock_quantity <= data.low_stock_threshold;

    return (
        <div className="flex flex-col h-full max-h-[80vh]">

            {/* --- Header & Metrics (Fixed at top) --- */}
            <div className="shrink-0 space-y-6 pr-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            {data.brand && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {data.brand}</span>}
                            {data.sku && <span className="flex items-center gap-1 font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs"><Hash className="w-3 h-3" /> {data.sku}</span>}
                        </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5
            ${isLowStock ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                    >
                        {isLowStock ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            <DollarSign className="w-3 h-3" /> Price
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">Retail</span>
                            <span className="text-lg font-bold text-gray-900">${Number(data.retail_price).toFixed(2)}</span>
                        </div>
                        {data.cost_price != null && (
                            <div className="flex justify-between items-end mt-1 pt-1 border-t border-gray-200/50">
                                <span className="text-xs text-gray-500">Cost</span>
                                <span className="text-xs font-medium text-gray-600">${Number(data.cost_price).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            <Package className="w-3 h-3" /> Stock
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">Quantity</span>
                            <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{data.stock_quantity}</span>
                        </div>
                        <div className="flex justify-between items-end mt-1 pt-1 border-t border-gray-200/50">
                            <span className="text-xs text-gray-500">Min Limit</span>
                            <span className="text-xs font-medium text-gray-600">{data.low_stock_threshold}</span>
                        </div>
                    </div>
                </div>

                {data.description && (
                    <div className="text-sm text-gray-600 bg-white p-3 border border-gray-100 rounded-lg italic">
                        "{data.description}"
                    </div>
                )}
            </div>

            {/* --- Activity Timeline (Scrollable Area) --- */}
            <div className="flex-1 min-h-0 mt-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-bold text-gray-900">History Log</h4>
                </div>

                {/* SCROLLABLE CONTAINER */}
                <div className="overflow-y-auto pr-2 -mr-2 flex-1 custom-scrollbar max-h-[250px]">
                    <div className="relative border-l-2 border-gray-100 ml-2 space-y-6 pl-6 py-2">
                        {(!data.activity_history || data.activity_history.length === 0) ? (
                            <div className="text-sm text-gray-400 italic py-4">No recorded activity yet.</div>
                        ) : (
                            data.activity_history.map((a, idx) => (
                                <div key={idx} className="relative group">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-300 group-hover:bg-indigo-400 transition-colors" />

                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-gray-800">{a.action}</span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString()}
                      </span>
                                        </div>

                                        {/* Render Details */}
                                        {a.details && typeof a.details === 'object' && Object.keys(a.details).length > 0 && (
                                            <div className="mt-2 bg-gray-50/80 rounded-md p-2.5 border border-gray-100 space-y-2">
                                                {Object.entries(a.details).map(([key, val], i) => (
                                                    <div key={i} className="text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                            <span className="font-semibold text-gray-500 min-w-[90px] shrink-0">
                              {formatKey(key)}:
                            </span>
                                                        <div className="break-all">
                                                            {renderValue(val)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Fallback for string details */}
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

export default ProductDetailsPanel