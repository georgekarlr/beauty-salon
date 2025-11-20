import React, { useState, useMemo } from 'react'
import { Search, Package, Scissors, Plus, AlertCircle } from 'lucide-react'
import type { Service } from '../../../types/service'
import type { Product } from '../../../types/product'
import type { POSSelectedItem } from '../../../composables/usePOS'

type Props = {
    services: Service[]
    products: Product[]
    onAdd: (item: POSSelectedItem) => void
}

const ItemsPicker: React.FC<Props> = ({ services, products, onAdd }) => {
    const [query, setQuery] = useState('')

    // Filter logic
    const filteredServices = useMemo(() =>
            services.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
        [services, query])

    const filteredProducts = useMemo(() =>
            products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
        [products, query])

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">

            {/* Header & Search */}
            <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50 rounded-t-xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Search items..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 h-full min-h-[400px]">

                {/* --- Services Column --- */}
                <div className="flex flex-col">
                    <div className="px-4 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-indigo-500" />
                        <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Services</h4>
                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {filteredServices.length}
            </span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[500px] p-3 space-y-2 custom-scrollbar">
                        {filteredServices.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">No services found</div>
                        )}
                        {filteredServices.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => onAdd({ id: s.id, name: s.name, price: s.price, type: 'service', quantity: 1 })}
                                className="w-full group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-300 hover:shadow-sm bg-white hover:bg-indigo-50/30 transition-all duration-200 text-left"
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800 group-hover:text-indigo-700">{s.name}</span>
                                    <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600">
                    ${s.price.toFixed(2)}
                  </span>
                                </div>
                                <div className="bg-gray-50 group-hover:bg-white p-1.5 rounded-md border border-gray-100 group-hover:border-indigo-200 transition-colors">
                                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Products Column --- */}
                <div className="flex flex-col">
                    <div className="px-4 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center gap-2">
                        <Package className="h-4 w-4 text-emerald-500" />
                        <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Products</h4>
                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {filteredProducts.length}
            </span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[500px] p-3 space-y-2 custom-scrollbar">
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">No products found</div>
                        )}
                        {filteredProducts.map((p) => {
                            const isOutOfStock = p.stock_quantity <= 0;
                            const isLowStock = p.stock_quantity > 0 && p.stock_quantity < 5;

                            return (
                                <button
                                    key={p.id}
                                    disabled={isOutOfStock}
                                    onClick={() => onAdd({ id: p.id, name: p.name, price: p.retail_price, type: 'product', quantity: 1 })}
                                    className={`w-full group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left
                    ${isOutOfStock
                                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                        : 'border-gray-100 bg-white hover:border-emerald-300 hover:shadow-sm hover:bg-emerald-50/30'
                                    }`}
                                >
                                    <div className="flex flex-col w-full pr-3">
                                        <div className="flex justify-between items-start">
                      <span className={`font-medium ${isOutOfStock ? 'text-gray-500' : 'text-gray-800 group-hover:text-emerald-800'}`}>
                        {p.name}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-bold ${isOutOfStock ? 'text-gray-400' : 'text-gray-500 group-hover:text-emerald-600'}`}>
                         ${p.retail_price.toFixed(2)}
                      </span>
                                            <span className="text-gray-300 text-xs">|</span>

                                            {/* Stock Logic Display */}
                                            <div className="flex items-center text-xs">
                                                {isOutOfStock ? (
                                                    <span className="text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Out of stock
                          </span>
                                                ) : (
                                                    <span className={`${isLowStock ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
                            {p.stock_quantity} in stock
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!isOutOfStock && (
                                        <div className="bg-gray-50 group-hover:bg-white p-1.5 rounded-md border border-gray-100 group-hover:border-emerald-200 transition-colors shrink-0">
                                            <Plus className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemsPicker