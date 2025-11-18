import React, { forwardRef } from 'react'
import type { Client } from '../../../types/client'
import type { POSSelectedItem } from '../../../composables/usePOS'

type Props = {
  businessName?: string
  selectedClient: Client | null
  items: POSSelectedItem[]
  subtotal: number
  taxAmount: number
  tipAmount: number
  totalAmount: number
  amountTendered: number | ''
  changeDue: number
  saleId?: string | null
  saleDate?: string | null
}

const ReceiptView = forwardRef<HTMLDivElement, Props>(function ReceiptView(
  {
    businessName = 'Beauty Salon',
    selectedClient,
    items,
    subtotal,
    taxAmount,
    tipAmount,
    totalAmount,
    amountTendered,
    changeDue,
    saleId,
    saleDate,
  },
  ref
) {
  return (
    <div ref={ref as any}>
      <div className="mb-2">
        <div className="text-xl font-semibold">{businessName}</div>
        <div className="text-sm text-gray-500">Receipt</div>
      </div>
      {saleId && (
        <div className="text-sm text-gray-600">Sale ID: <span className="font-mono">{saleId}</span></div>
      )}
      <div className="text-sm">Date: {saleDate ? new Date(saleDate).toLocaleString() : new Date().toLocaleString()}</div>
      {selectedClient && (
        <div className="text-sm">
          Customer: {selectedClient.first_name} {selectedClient.last_name || ''}
        </div>
      )}
      <table className="w-full text-sm mt-3">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left py-1">Item</th>
            <th className="text-right py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={`r-${it.type}-${it.id}`}>
              <td className="py-1">{it.name}</td>
              <td className="py-1 text-right">{it.quantity}</td>
              <td className="py-1 text-right">${it.price.toFixed(2)}</td>
              <td className="py-1 text-right">${(it.price * it.quantity).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Subtotal
            </td>
            <td className="py-1 text-right">${subtotal.toFixed(2)}</td>
          </tr>
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Tax
            </td>
            <td className="py-1 text-right">${taxAmount.toFixed(2)}</td>
          </tr>
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Tip
            </td>
            <td className="py-1 text-right">${(+tipAmount || 0).toFixed(2)}</td>
          </tr>
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Total
            </td>
            <td className="py-1 text-right">${totalAmount.toFixed(2)}</td>
          </tr>
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Tendered
            </td>
            <td className="py-1 text-right">${(typeof amountTendered === 'number' ? amountTendered : 0).toFixed(2)}</td>
          </tr>
          <tr className="total-row">
            <td className="py-1" colSpan={3}>
              Change
            </td>
            <td className="py-1 text-right">${changeDue.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
})

export default ReceiptView
