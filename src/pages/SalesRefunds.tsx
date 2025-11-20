import React from 'react'
import { FileText, RefreshCw, Search, RotateCcw } from 'lucide-react'
import DateRangePicker from '../components/ui/DateRangePicker'
import Modal from '../components/ui/Modal'
import { useSalesRefunds } from '../composables/useSalesRefunds'
import { useAuth } from '../contexts/AuthContext'
// UI-only page: all data logic is inside the useSalesRefunds composable

function currency(n?: number | null) {
  const v = typeof n === 'number' ? n : 0
  return v.toLocaleString(undefined, { style: 'currency', currency: 'PHP' })
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString()
  } catch {
    return iso
  }
}

const SalesRefunds: React.FC = () => {
  const { persona } = useAuth()
  const {
    // filters
    range, setRange,
    search, setSearch,
    // list
    items, loading, error, reload,
    // details
    selectedId, details, detailsLoading, detailsError,
    openDetails, closeDetails,
    // refund
    refundOpen, setRefundOpen,
    refundReason, setRefundReason,
    refundQtyByItem, setRefundQtyByItem,
    refundSubmitting, setRefundSubmitting,
    refundError, setRefundError,
    computedRefundItems,
    submitRefund,
  } = useSalesRefunds()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><FileText className="w-5 h-5" /></div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Sales & Refunds</h1>
          <p className="text-sm text-gray-500">Review past sales, view receipts, and process refunds.</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <button onClick={reload} className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales by customer or receipt ID"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button onClick={() => setSearch('')} className="inline-flex items-center gap-1.5 text-xs text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200 text-sm text-gray-600 flex items-center justify-between">
          <div>{items.length} records</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-medium px-4 py-2">Date</th>
                <th className="text-left font-medium px-4 py-2">Customer</th>
                <th className="text-right font-medium px-4 py-2">Total</th>
                <th className="text-right font-medium px-4 py-2">Refunded</th>
                <th className="text-right font-medium px-4 py-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {items.map(sale => (
                <tr key={sale.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => openDetails(sale.id)}>
                  <td className="px-4 py-2">{fmtDate(sale.sale_date)}</td>
                  <td className="px-4 py-2">{sale.customer_name}</td>
                  <td className="px-4 py-2 text-right">{currency(sale.total_amount)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{currency(sale.total_refund)}</td>
                  <td className="px-4 py-2 text-right font-medium">{currency(sale.net_revenue)}</td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No sales found for the selected period.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={!!selectedId} onClose={closeDetails} title={details ? `Sale #${details.id.slice(0, 8)} — ${fmtDate(details.sale_date)}` : 'Sale details'}
        footer={(
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: <span className="font-medium">{currency(details?.total_amount)}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRefundOpen(true)} className="px-3 py-1.5 text-sm text-white bg-rose-600 hover:bg-rose-700 rounded-md">Process Refund</button>
              <button onClick={closeDetails} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Close</button>
            </div>
          </div>
        )}
      >
        {detailsLoading && <div className="text-sm text-gray-500">Loading details...</div>}
        {detailsError && <div className="text-sm text-red-600">{detailsError}</div>}
        {details && !detailsLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div className="text-gray-500">Customer</div><div className="font-medium">{details.customer_name}</div>
              <div className="text-gray-500">Payment</div><div className="font-medium uppercase">{details.payment_method}</div>
              <div className="text-gray-500">Subtotal</div><div>{currency(details.subtotal)}</div>
              <div className="text-gray-500">Tax</div><div>{currency(details.tax_amount)}</div>
              <div className="text-gray-500">Tip</div><div>{currency(details.tip_amount)}</div>
              <div className="text-gray-500">Tendered</div><div>{currency(details.amount_tendered)}</div>
              <div className="text-gray-500">Change</div><div>{currency(details.change_due)}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Items</div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Item</th>
                      <th className="text-right font-medium px-3 py-2">Qty</th>
                      <th className="text-right font-medium px-3 py-2">Unit</th>
                      <th className="text-right font-medium px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.items.map(it => (
                      <tr key={it.sale_item_id} className="border-t">
                        <td className="px-3 py-2">{it.item_name}</td>
                        <td className="px-3 py-2 text-right">{it.quantity}</td>
                        <td className="px-3 py-2 text-right">{currency(it.price_per_unit)}</td>
                        <td className="px-3 py-2 text-right">{currency(it.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Refunds</div>
              {details.refunds.length === 0 ? (
                <div className="text-sm text-gray-500">No refunds recorded.</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left font-medium px-3 py-2">Date</th>
                        <th className="text-left font-medium px-3 py-2">Reason</th>
                        <th className="text-right font-medium px-3 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.refunds.map((r, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{fmtDate(r.refund_date)}</td>
                          <td className="px-3 py-2">{r.reason}</td>
                          <td className="px-3 py-2 text-right text-red-600">{currency(r.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Process Refund"
        footer={(
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Refund total: <span className="font-semibold text-rose-700">
              {currency(computedRefundItems.reduce((sum, it) => sum + it.refund_amount, 0))}
            </span></div>
            <div className="flex items-center gap-2">
              <button disabled={refundSubmitting} onClick={() => submitRefund(persona?.id ?? null)} className="px-3 py-1.5 text-sm text-white bg-rose-600 hover:bg-rose-700 rounded-md disabled:opacity-60">Submit Refund</button>
              <button disabled={refundSubmitting} onClick={() => setRefundOpen(false)} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
            </div>
          </div>
        )}
      >
        {refundError && <div className="text-sm text-red-600 mb-2">{refundError}</div>}
        {!details && <div className="text-sm text-gray-500">No sale selected.</div>}
        {details && (
          <div className="space-y-4">
            <div className="text-sm">
              <label className="block text-gray-600 mb-1">Reason</label>
              <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Reason for refund" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Select quantities to refund</div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Item</th>
                      <th className="text-right font-medium px-3 py-2">Purchased</th>
                      <th className="text-right font-medium px-3 py-2">Unit</th>
                      <th className="text-right font-medium px-3 py-2">Refund Qty</th>
                      <th className="text-right font-medium px-3 py-2">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.items.map(it => {
                      const qty = Math.max(0, Math.floor(refundQtyByItem[it.sale_item_id] || 0))
                      const amount = +(Math.min(qty, it.quantity) * it.price_per_unit).toFixed(2)
                      return (
                        <tr key={it.sale_item_id} className="border-t">
                          <td className="px-3 py-2">{it.item_name}</td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">{currency(it.price_per_unit)}</td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              max={it.quantity}
                              value={qty}
                              onChange={(e) => setRefundQtyByItem(prev => ({ ...prev, [it.sale_item_id]: Math.max(0, Math.min(it.quantity, parseInt(e.target.value || '0', 10) || 0)) }))}
                              className="w-24 text-right px-2 py-1 border border-gray-300 rounded-md"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">{currency(amount)}</td>
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
