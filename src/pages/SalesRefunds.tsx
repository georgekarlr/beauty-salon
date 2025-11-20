import React from 'react'
import {
    FileText,
    RefreshCw,
    Search,
    RotateCcw,
    ChevronRight,
    Receipt,
    AlertCircle,
    Calendar, CheckCircle2
} from 'lucide-react'
import DateRangePicker from '../components/ui/DateRangePicker'
import Modal from '../components/ui/Modal'
import { useSalesRefunds } from '../composables/useSalesRefunds'
import { useAuth } from '../contexts/AuthContext'

// --- Helpers ---
function currency(n?: number | null) {
    const v = typeof n === 'number' ? n : 0
    return v.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })
}

function fmtDate(iso: string) {
    try {
        const d = new Date(iso)
        if (isNaN(d.getTime())) return iso
        return d.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        })
    } catch {
        return iso
    }
}

// --- Status Badge Component ---
const SaleStatusBadge = ({ total, refunded }: { total: number, refunded: number }) => {
    if (refunded >= total && total > 0) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Refunded</span>
    }
    if (refunded > 0) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Partial Refund</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Completed</span>
}

const SalesRefunds: React.FC = () => {
    const { persona } = useAuth()
    const {
        range, setRange,
        search, setSearch,
        items, loading, error, reload,
        selectedId, details, detailsLoading, detailsError,
        openDetails, closeDetails,
        refundOpen, setRefundOpen,
        refundReason, setRefundReason,
        refundQtyByItem, setRefundQtyByItem,
        refundSubmitting,
        refundError,
        computedRefundItems,
        submitRefund,
    } = useSalesRefunds()

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

            {/* --- Header --- */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales & Refunds</h1>
                            <p className="text-sm text-gray-500">Manage transactions and process returns</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <DateRangePicker value={range} onChange={setRange} />
                        <button
                            onClick={reload}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-all text-sm font-medium"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* --- Filters --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by customer name or receipt ID..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        />
                    </div>
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Clear Filter
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* --- Main Table --- */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Refunded</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Revenue</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                                            <span>Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                <Receipt className="w-8 h-8" />
                                            </div>
                                            <p className="text-gray-900 font-medium">No sales found</p>
                                            <p className="text-sm text-gray-500">Try adjusting your date range or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map(sale => (
                                    <tr
                                        key={sale.id}
                                        onClick={() => openDetails(sale.id)}
                                        className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {fmtDate(sale.sale_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{sale.customer_name}</div>
                                            <div className="text-xs text-gray-400">ID: {sale.id.slice(0,8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            {currency(sale.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            {sale.total_refund > 0 ? (
                                                <span className="text-red-600 font-medium">-{currency(sale.total_refund)}</span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                                            {currency(sale.net_revenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <SaleStatusBadge total={sale.total_amount} refunded={sale.total_refund} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Details Modal --- */}
            <Modal
                isOpen={!!selectedId}
                onClose={closeDetails}
                title="Transaction Details"
                footer={(
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                        {details && (
                            <div className="text-sm text-gray-500">
                                Total Paid: <span className="font-bold text-gray-900 text-lg ml-1">{currency(details.total_amount)}</span>
                            </div>
                        )}
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={closeDetails}
                                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close
                            </button>
                            {details && (
                                <button
                                    onClick={() => setRefundOpen(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium shadow-sm transition-colors"
                                >
                                    Request Refund
                                </button>
                            )}
                        </div>
                    </div>
                )}
            >
                {detailsLoading ? (
                    <div className="p-8 text-center text-gray-500">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-400" />
                        Loading transaction details...
                    </div>
                ) : detailsError ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {detailsError}
                    </div>
                ) : details && (
                    <div className="space-y-6">
                        {/* Receipt Header Info */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold">Customer</p>
                                <p className="font-semibold text-gray-900">{details.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold">Sale ID</p>
                                <p className="font-mono text-gray-700">{details.id.slice(0, 12)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold">Date</p>
                                <p className="text-gray-700">{fmtDate(details.sale_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold">Payment Method</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 uppercase">
                       {details.payment_method}
                    </span>
                            </div>
                        </div>

                        {/* Receipt Items Table */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-gray-400" /> Purchased Items
                            </h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Item</th>
                                        <th className="px-4 py-2 text-right font-medium">Qty</th>
                                        <th className="px-4 py-2 text-right font-medium">Price</th>
                                        <th className="px-4 py-2 text-right font-medium">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {details.items.map(it => (
                                        <tr key={it.sale_item_id}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{it.item_name}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">x{it.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{currency(it.price_per_unit)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{currency(it.total_price)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-medium text-gray-700">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-xs uppercase text-gray-500">Subtotal</td>
                                        <td className="px-4 py-2 text-right">{currency(details.subtotal)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-4 py-1 text-right text-xs uppercase text-gray-500">Tax</td>
                                        <td className="px-4 py-1 text-right text-xs">{currency(details.tax_amount)}</td>
                                    </tr>
                                    {details.tip_amount > 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-1 text-right text-xs uppercase text-gray-500">Tip</td>
                                            <td className="px-4 py-1 text-right text-xs">{currency(details.tip_amount)}</td>
                                        </tr>
                                    )}
                                    <tr className="border-t border-gray-200 text-base text-gray-900">
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold">Grand Total</td>
                                        <td className="px-4 py-3 text-right font-bold">{currency(details.total_amount)}</td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Previous Refunds Section */}
                        {details.refunds.length > 0 && (
                            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                                <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> Refund History
                                </h4>
                                <div className="space-y-2">
                                    {details.refunds.map((r, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg border border-rose-100 flex justify-between items-center text-sm shadow-sm">
                                            <div>
                                                <p className="font-medium text-gray-900">{r.reason}</p>
                                                <p className="text-xs text-gray-500">{fmtDate(r.refund_date)}</p>
                                            </div>
                                            <span className="font-bold text-rose-600">-{currency(r.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* --- Refund Modal --- */}
            <Modal
                isOpen={refundOpen}
                onClose={() => setRefundOpen(false)}
                title="Process New Refund"
                footer={(
                    <div className="flex flex-col w-full gap-4">
                        <div className="flex justify-between items-center bg-rose-50 p-3 rounded-lg border border-rose-100">
                            <span className="text-sm font-medium text-rose-800">Total Refund Amount</span>
                            <span className="text-xl font-bold text-rose-700">
                  {currency(computedRefundItems.reduce((sum, it) => sum + it.refund_amount, 0))}
                </span>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                disabled={refundSubmitting}
                                onClick={() => setRefundOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={refundSubmitting}
                                onClick={() => submitRefund(persona?.id ?? null)}
                                className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {refundSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Confirm Refund
                            </button>
                        </div>
                    </div>
                )}
            >
                {refundError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {refundError}
                    </div>
                )}

                {details && (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund</label>
                            <input
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="e.g. Customer changed mind, Defective product..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Items to Return</label>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="text-left font-medium px-4 py-2">Item</th>
                                        <th className="text-center font-medium px-4 py-2">Purchased</th>
                                        <th className="text-center font-medium px-4 py-2">Return Qty</th>
                                        <th className="text-right font-medium px-4 py-2">Refund</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {details.items.map(it => {
                                        const qty = Math.max(0, Math.floor(refundQtyByItem[it.sale_item_id] || 0))
                                        const amount = +(Math.min(qty, it.quantity) * it.price_per_unit).toFixed(2)
                                        const isSelected = qty > 0;

                                        return (
                                            <tr key={it.sale_item_id} className={isSelected ? 'bg-rose-50/30' : ''}>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {it.item_name}
                                                    <div className="text-xs text-gray-500 font-normal">{currency(it.price_per_unit)} / unit</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-500">{it.quantity}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={it.quantity}
                                                            value={qty}
                                                            onChange={(e) => setRefundQtyByItem(prev => ({ ...prev, [it.sale_item_id]: Math.max(0, Math.min(it.quantity, parseInt(e.target.value || '0', 10) || 0)) }))}
                                                            className={`w-16 text-center px-2 py-1 border rounded-md font-semibold outline-none focus:ring-2 focus:ring-rose-500 ${qty > 0 ? 'border-rose-300 text-rose-700' : 'border-gray-300 text-gray-500'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-rose-700">
                                                    {amount > 0 ? currency(amount) : '-'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default SalesRefunds