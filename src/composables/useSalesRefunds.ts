import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DateRange } from '../components/ui/DateRangePicker'
import { HistoryService } from '../services/historyService'
import type { GetSalesHistoryInput, RefundItemInput, SaleDetails, SaleHistoryItem } from '../types/history'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) }

export function useSalesRefunds() {
  // Filters
  const [range, setRange] = useState<DateRange>(() => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }))
  const [search, setSearch] = useState('')

  // List state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<SaleHistoryItem[]>([])

  // Details state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [details, setDetails] = useState<SaleDetails | null>(null)

  // Refund state
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundQtyByItem, setRefundQtyByItem] = useState<Record<number, number>>({})
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload: GetSalesHistoryInput = {
        start_date: range.start.toISOString(),
        end_date: range.end.toISOString(),
        search_term: search.trim() || null,
      }
      const { data, error } = await HistoryService.getSalesHistory(payload)
      if (error) throw new Error(error)
      setItems(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load sales history')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [range.start.getTime(), range.end.getTime(), search])

  useEffect(() => { load() }, [load])

  const openDetails = useCallback(async (id: string) => {
    setSelectedId(id)
    setDetailsLoading(true)
    setDetailsError(null)
    try {
      const { data, error } = await HistoryService.getSaleDetails(id)
      if (error) throw new Error(error)
      setDetails(data)
      // initialize refund quantities to 0
      const initial: Record<number, number> = {}
      data?.items?.forEach(it => { initial[it.sale_item_id] = 0 })
      setRefundQtyByItem(initial)
    } catch (e: any) {
      setDetails(null)
      setDetailsError(e?.message || 'Failed to load sale details')
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  const closeDetails = () => {
    setSelectedId(null)
    setDetails(null)
    setRefundOpen(false)
    setRefundReason('')
    setRefundQtyByItem({})
    setRefundSubmitting(false)
    setRefundError(null)
  }

  const computedRefundItems: RefundItemInput[] = useMemo(() => {
    if (!details) return []
    return details.items
      .map(it => {
        const qty = Math.max(0, Math.floor(refundQtyByItem[it.sale_item_id] || 0))
        const refund_amount = +(Math.min(qty, it.quantity) * it.price_per_unit).toFixed(2)
        return { sale_item_id: it.sale_item_id, quantity: qty, refund_amount }
      })
      .filter(x => x.quantity > 0 && x.refund_amount > 0)
  }, [details, refundQtyByItem])

  const resetRefund = () => {
    if (!details) return
    const initial: Record<number, number> = {}
    details.items.forEach(it => { initial[it.sale_item_id] = 0 })
    setRefundQtyByItem(initial)
    setRefundReason('')
    setRefundError(null)
  }

  const submitRefund = useCallback(async (accountId?: number | null) => {
    if (!details) {
      setRefundError('No sale selected.')
      return false
    }
    if (accountId === null || accountId === undefined) {
      setRefundError('No account selected. Please switch persona to an account with ID.')
      return false
    }
    if (computedRefundItems.length === 0) {
      setRefundError('Select quantity to refund for at least one item.')
      return false
    }
    try {
      setRefundSubmitting(true)
      setRefundError(null)
      const { data, error } = await HistoryService.processRefund({
        account_id: Number(accountId),
        sale_id: details.id,
        reason: refundReason.trim() || 'Refund',
        items: computedRefundItems,
      })
      if (error || !data) throw new Error(error || 'Failed to process refund')
      // Refresh list and details
      await load()
      await openDetails(details.id)
      setRefundOpen(false)
      return true
    } catch (e: any) {
      setRefundError(e?.message || 'Failed to process refund')
      return false
    } finally {
      setRefundSubmitting(false)
    }
  }, [details, computedRefundItems, refundReason, load, openDetails])

  return {
    // filters
    range, setRange,
    search, setSearch,
    // list
    items, loading, error, reload: load,
    // details
    selectedId, details, detailsLoading, detailsError,
    openDetails, closeDetails,
    // refund state
    refundOpen, setRefundOpen,
    refundReason, setRefundReason,
    refundQtyByItem, setRefundQtyByItem,
    refundSubmitting, setRefundSubmitting,
    refundError, setRefundError,
    computedRefundItems,
    resetRefund,
    submitRefund,
  }
}

export type UseSalesRefunds = ReturnType<typeof useSalesRefunds>
