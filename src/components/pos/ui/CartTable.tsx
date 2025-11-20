import React, { useMemo } from 'react'
import { Trash2, Plus, Minus, ShoppingCart, Tag } from 'lucide-react'
import type { POSSelectedItem } from '../../../composables/usePOS'
import type { UUID } from '../../../types/client'

type Props = {
    items: POSSelectedItem[]
    updateQty: (id: UUID, type: 'product' | 'service', qty: number) => void
    removeItem: (id: UUID, type: 'product' | 'service') => void
}

const CartTable: React.FC<Props> = ({ items, updateQty, removeItem }) => {

    const grandTotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }, [items])

    if (items.length === 0) {
        return (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <ShoppingCart className="h-12 w-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">Cart is empty</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {items.map((it) => (
                    <div
                        key={`${it.type}-${it.id}`}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200 gap-3 sm:gap-0"
                    >

                        {/* 1. Item Info (Name & Unit Price) */}
                        <div className="flex-1 min-w-0 pr-6 sm:pr-4">
                            <div className="flex items-center gap-2">
                                <div className={`hidden sm:block p-1.5 rounded-md shrink-0 ${it.type === 'service' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <Tag className="h-3.5 w-3.5" />
                                </div>
                                <h5 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{it.name}</h5>
                            </div>
                            <div className="sm:ml-8 text-xs text-gray-500 mt-1 sm:mt-0">
                                ${it.price.toFixed(2)} <span className="sm:hidden">per unit</span>
                            </div>
                        </div>

                        {/* 2. Controls Row (Qty & Total) */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">

                            {/* Quantity Stepper */}
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => {
                                        if (it.quantity > 1) updateQty(it.id, it.type, it.quantity - 1)
                                    }}
                                    disabled={it.quantity <= 1}
                                    className="p-2 sm:p-1.5 hover:bg-white hover:text-indigo-600 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>

                                <div className="w-8 text-center text-sm font-semibold text-gray-700 tabular-nums">
                                    {it.quantity}
                                </div>

                                <button
                                    onClick={() => updateQty(it.id, it.type, it.quantity + 1)}
                                    className="p-2 sm:p-1.5 hover:bg-white hover:text-indigo-600 rounded-r-lg transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Total Price */}
                            <div className="text-right min-w-[60px]">
                                <div className="font-bold text-gray-900 text-sm sm:text-base">
                                    ${(it.price * it.quantity).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* 3. Delete Button
                Mobile: Absolute Top Right (Always visible)
                Desktop: Inline Right (Visible on Hover)
            */}
                        <button
                            onClick={() => removeItem(it.id, it.type)}
                            className="absolute top-2 right-2 sm:static p-2 text-gray-400 text-red-500 sm:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Items count</span>
                    <span className="font-medium">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200/60">
                    <span>Total</span>
                    <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}

export default CartTable