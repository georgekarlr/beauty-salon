import React from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><BarChart3 className="w-5 h-5" /></div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-500">Analyze business performance: sales, staff, inventory and clients.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-gray-500">Gross Sales</div>
          <div className="text-xl font-semibold">{currency(financial?.gross_sales)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-gray-500">Refunds</div>
          <div className="text-xl font-semibold">{currency(financial?.total_refunds)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-gray-500">Net Sales</div>
          <div className="text-xl font-semibold">{currency(financial?.net_sales)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-xs text-gray-500">Tips</div>
          <div className="text-xl font-semibold">{currency(financial?.total_tips)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales by Item */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Sales by Item</h3>
            <span className="text-xs text-gray-500">Top 10 by revenue</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2">Item</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((row) => (
                  <tr key={`${row.item_type}-${row.item_id}`} className="border-t border-gray-100">
                    <td className="py-2 pr-2 text-gray-900">{row.item_name || '—'}</td>
                    <td className="py-2 pr-2 capitalize">{row.item_type}</td>
                    <td className="py-2 pr-2 text-right">{row.total_quantity_sold}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.total_revenue)}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Staff Performance</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2">Staff</th>
                  <th className="py-2 pr-2 text-right">Appts</th>
                  <th className="py-2 pr-2 text-right">Services</th>
                  <th className="py-2 pr-2 text-right">Products</th>
                  <th className="py-2 pr-2 text-right">Tips</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((row) => (
                  <tr key={row.staff_id} className="border-t border-gray-100">
                    <td className="py-2 pr-2 text-gray-900">{row.staff_name || '—'}</td>
                    <td className="py-2 pr-2 text-right">{row.total_appointments}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.services_revenue)}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.products_revenue)}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.total_tips)}</td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Top Clients</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2">Client</th>
                  <th className="py-2 pr-2 text-right">Visits</th>
                  <th className="py-2 pr-2 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((row) => (
                  <tr key={row.customer_id} className="border-t border-gray-100">
                    <td className="py-2 pr-2 text-gray-900">{row.customer_name}</td>
                    <td className="py-2 pr-2 text-right">{row.total_visits}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.total_spent)}</td>
                  </tr>
                ))}
                {topClients.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Value */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Inventory Value</h3>
            <span className="text-xs text-gray-500">Top 10 by value</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2">Product</th>
                  <th className="py-2 pr-2">SKU</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Cost</th>
                  <th className="py-2 pr-2 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 10).map((row) => (
                  <tr key={row.product_id} className="border-t border-gray-100">
                    <td className="py-2 pr-2 text-gray-900">{row.product_name}</td>
                    <td className="py-2 pr-2">{row.sku || '—'}</td>
                    <td className="py-2 pr-2 text-right">{row.stock_quantity}</td>
                    <td className="py-2 pr-2 text-right">{row.cost_price == null ? '—' : currency(row.cost_price)}</td>
                    <td className="py-2 pr-2 text-right">{currency(row.total_value)}</td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-500">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Low Stock</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-2">Product</th>
                  <th className="py-2 pr-2">SKU</th>
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((row: any) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="py-2 pr-2 text-gray-900">{row.name}</td>
                    <td className="py-2 pr-2">{row.sku || '—'}</td>
                    <td className="py-2 pr-2 text-right">{row.stock_quantity}</td>
                    <td className="py-2 pr-2 text-right">{row.low_stock_threshold}</td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-500">No low stock items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500">Loading reports…</div>
      )}
    </div>
  )
}

export default Reports
