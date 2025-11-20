import React from 'react'
import {
    BarChart3,
    RefreshCw,
    TrendingUp,
    DollarSign,
    Users,
    Package,
    AlertTriangle,
    ShoppingBag,
    Crown,
    Wallet, CheckCircle2
} from 'lucide-react'
import DateRangePicker, { type DateRange } from '../components/ui/DateRangePicker'
import { ReportsService } from '../services/reportsService'
import type { FinancialOverview, SalesSummaryItem, StaffPerformanceItem, InventoryValueItem, TopClientItem } from '../types/reports'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) }

const Reports: React.FC = () => {
    const [range, setRange] = React.useState<DateRange>(() => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }))
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [financial, setFinancial] = React.useState<FinancialOverview | null>(null)
    const [sales, setSales] = React.useState<SalesSummaryItem[]>([])
    const [staff, setStaff] = React.useState<StaffPerformanceItem[]>([])
    const [inventory, setInventory] = React.useState<InventoryValueItem[]>([])
    const [lowStock, setLowStock] = React.useState<any[]>([])
    const [topClients, setTopClients] = React.useState<TopClientItem[]>([])

    const load = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [f, s, st, inv, ls, tc] = await Promise.all([
                ReportsService.getFinancialOverview({ startDate: range.start, endDate: range.end }),
                ReportsService.getSalesSummary({ startDate: range.start, endDate: range.end }),
                ReportsService.getStaffPerformance({ startDate: range.start, endDate: range.end }),
                ReportsService.getInventoryValue(),
                ReportsService.getLowStock(),
                ReportsService.getTopClients({ startDate: range.start, endDate: range.end, limit: 10 }),
            ])
            if (f.error || s.error || st.error || inv.error || ls.error || tc.error) {
                throw new Error(f.error || s.error || st.error || inv.error || ls.error || tc.error || 'Failed to load reports')
            }
            setFinancial(f.data)
            setSales(s.data)
            setStaff(st.data)
            setInventory(inv.data)
            setLowStock(ls.data)
            setTopClients(tc.data)
        } catch (e: any) {
            setError(e?.message || 'Failed to load reports')
            setFinancial(null)
            setSales([])
            setStaff([])
            setInventory([])
            setLowStock([])
            setTopClients([])
        } finally {
            setLoading(false)
        }
    }, [range.start.getTime(), range.end.getTime()])

    React.useEffect(() => { load() }, [load])

    const currency = (n?: number | null) => {
        const val = typeof n === 'number' ? n : 0
        return val.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-200">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
                            <p className="text-sm text-gray-500">Business performance overview</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <DateRangePicker value={range} onChange={setRange} />
                        <button
                            onClick={load}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-all text-sm font-medium"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="max-w-7xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                            <DollarSign className="w-4 h-4" /> Gross Sales
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{currency(financial?.gross_sales)}</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                            <RefreshCw className="w-4 h-4" /> Refunds
                        </div>
                        <div className="text-2xl font-bold text-red-600">{currency(financial?.total_refunds)}</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-indigo-100 bg-indigo-50/50 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-2">
                            <TrendingUp className="w-4 h-4" /> Net Revenue
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">{currency(financial?.net_sales)}</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                            <Wallet className="w-4 h-4" /> Tips Collected
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{currency(financial?.total_tips)}</div>
                    </div>
                </div>

                {/* Middle Row: 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Top Selling Items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-purple-500" /> Top Selling Items
                            </h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Item</th>
                                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                                    <th className="px-4 py-3 font-medium text-right">Rev</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {sales.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[140px]" title={row.item_name || ''}>
                                            {row.item_name}
                                            <div className="text-[10px] text-gray-400 uppercase">{row.item_type}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">{row.total_quantity_sold}</td>
                                        <td className="px-4 py-3 text-right font-medium">{currency(row.total_revenue)}</td>
                                    </tr>
                                ))}
                                {sales.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No sales recorded</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. Staff Performance */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Team Performance
                            </h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Staff</th>
                                    <th className="px-4 py-3 font-medium text-right">Total</th>
                                    <th className="px-4 py-3 font-medium text-right">Tips</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {staff.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.staff_name}</td>
                                        <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                            {currency(row.services_revenue + row.products_revenue)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">{currency(row.total_tips)}</td>
                                    </tr>
                                ))}
                                {staff.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No staff data</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Top Clients */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" /> Top Clients
                            </h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Client</th>
                                    <th className="px-4 py-3 font-medium text-right">Visits</th>
                                    <th className="px-4 py-3 font-medium text-right">Spent</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {topClients.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.customer_name}</td>
                                        <td className="px-4 py-3 text-right">{row.total_visits}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{currency(row.total_spent)}</td>
                                    </tr>
                                ))}
                                {topClients.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No client data</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Inventory Value */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-600" /> Inventory Valuation
                            </h3>
                            <span className="text-xs text-gray-500">Highest Value Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium text-right">On Hand</th>
                                    <th className="px-5 py-3 font-medium text-right">Unit Cost</th>
                                    <th className="px-5 py-3 font-medium text-right">Total Value</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {inventory.slice(0, 8).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {row.product_name}
                                            <div className="text-[10px] text-gray-400 font-mono">{row.sku}</div>
                                        </td>
                                        <td className="px-5 py-3 text-right">{row.stock_quantity}</td>
                                        <td className="px-5 py-3 text-right text-gray-600">{currency(row.cost_price)}</td>
                                        <td className="px-5 py-3 text-right font-bold text-gray-800">{currency(row.total_value)}</td>
                                    </tr>
                                ))}
                                {inventory.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Inventory empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Alerts
                            </h3>
                            {lowStock.length > 0 && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{lowStock.length} Items</span>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Product</th>
                                    <th className="px-5 py-3 font-medium text-right">Current</th>
                                    <th className="px-5 py-3 font-medium text-right">Threshold</th>
                                    <th className="px-5 py-3 font-medium text-center">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {lowStock.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-3 font-medium text-gray-900">{row.name}</td>
                                        <td className="px-5 py-3 text-right font-bold text-red-600">{row.stock_quantity}</td>
                                        <td className="px-5 py-3 text-right text-gray-600">{row.low_stock_threshold}</td>
                                        <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                           RESTOCK
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                {lowStock.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-emerald-500">
                                                <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" /> {/* Need import */}
                                                <span className="text-gray-500">Stock levels healthy</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {loading && (
                <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse z-50">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Updating Report Data...
                </div>
            )}
        </div>
    )
}

export default Reports