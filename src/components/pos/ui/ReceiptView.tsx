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
        // Wrapper: Centered, with paper shadow for screen viewing
        <div className="flex justify-center p-4 bg-gray-100 min-h-full">
            <div
                ref={ref}
                className="bg-white w-full max-w-[80mm] p-6 shadow-lg text-xs font-mono leading-relaxed text-black"
                style={{ printColorAdjust: 'exact' }} // Forces browsers to print background colors/borders correctly
            >

                {/* --- Header --- */}
                <div className="text-center mb-6 space-y-1">
                    <div className="text-xl font-bold uppercase tracking-wider border-b-2 border-black pb-2 mb-2">
                        {businessName}
                    </div>
                    <div className="text-[10px] uppercase text-gray-600">
                        Thank you for your visit
                    </div>
                </div>

                {/* --- Meta Data --- */}
                <div className="mb-4 space-y-1 border-b border-dashed border-black pb-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{saleDate ? new Date(saleDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span>{saleDate ? new Date(saleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString()}</span>
                    </div>
                    {saleId && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Order #:</span>
                            <span>{saleId.slice(0, 8).toUpperCase()}</span>
                        </div>
                    )}
                    {selectedClient && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span className="truncate max-w-[120px]">{selectedClient.first_name} {selectedClient.last_name?.charAt(0)}.</span>
                        </div>
                    )}
                </div>

                {/* --- Items Table --- */}
                <table className="w-full mb-4">
                    <thead>
                    <tr className="border-b border-black text-left">
                        <th className="py-1 font-bold w-1/2">Item</th>
                        <th className="py-1 font-bold text-center w-1/6">Qty</th>
                        <th className="py-1 font-bold text-right w-1/3">Price</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-dotted divide-gray-300">
                    {items.map((it) => (
                        <tr key={`r-${it.type}-${it.id}`}>
                            <td className="py-2 pr-1 align-top">
                                <div className="font-semibold">{it.name}</div>
                            </td>
                            <td className="py-2 text-center align-top">{it.quantity}</td>
                            <td className="py-2 text-right align-top">
                                {'\u20b1'}{(it.price * it.quantity).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* --- Totals Section --- */}
                <div className="space-y-1 border-t border-dashed border-black pt-3 mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{'\u20b1'}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>{'\u20b1'}{taxAmount.toFixed(2)}</span>
                    </div>
                    {tipAmount > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Tip</span>
                            <span>{'\u20b1'}{tipAmount.toFixed(2)}</span>
                        </div>
                    )}

                    {/* GRAND TOTAL */}
                    <div className="flex justify-between text-lg font-bold border-t border-black border-b border-black py-2 mt-2">
                        <span>TOTAL</span>
                        <span>{'\u20b1'}{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* --- Payment Details --- */}
                <div className="mb-8 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>Cash/Card Tendered</span>
                        <span>{'\u20b1'}{(typeof amountTendered === 'number' ? amountTendered : 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Change Due</span>
                        <span>{'\u20b1'}{changeDue.toFixed(2)}</span>
                    </div>
                </div>

                {/* --- Footer / Barcode Simulation --- */}
                <div className="text-center space-y-3">
                    <div className="text-[10px] text-gray-500">
                        Returns accepted within 30 days with receipt.
                    </div>

                    {/* Fake Barcode using CSS gradient */}
                    <div
                        className="h-12 w-full opacity-80"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                90deg,
                black 0px,
                black 2px,
                transparent 2px,
                transparent 4px,
                black 4px,
                black 6px,
                transparent 6px,
                transparent 9px,
                black 9px,
                black 10px,
                transparent 10px,
                transparent 12px
              )`
                        }}
                    />
                    <div className="text-[9px] tracking-[0.2em]">
                        {saleId || '0000-0000'}
                    </div>
                </div>

            </div>
        </div>
    )
})

export default ReceiptView