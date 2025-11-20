import React from 'react';
import type { LowStockProduct } from '../../types/dashboard';
import { AlertTriangle, PackageOpen, ArrowRight, ShoppingCart } from 'lucide-react';

type Props = {
    products: LowStockProduct[];
};

const LowStockList: React.FC<Props> = ({ products }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">

            {/* --- Header --- */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
                </div>
                {products.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        {products.length} Critical
                    </span>
                )}
            </div>

            {/* --- List --- */}
            <div className="flex-1 overflow-y-auto max-h-[350px] p-0 custom-scrollbar">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="bg-emerald-50 p-3 rounded-full mb-3">
                            <PackageOpen className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Inventory Healthy</p>
                        <p className="text-xs">No items below threshold.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {products.map((p) => {
                            // Determine urgency
                            const isCritical = p.stock_quantity <= 2;
                            // Mock threshold for visual bar (assuming 10 is the warning level)
                            const percentage = Math.min((p.stock_quantity / 10) * 100, 100);

                            return (
                                <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex-1 pr-4">
                                        <div className="flex justify-between mb-1">
                                            <h4 className="font-medium text-gray-900 text-sm truncate">{p.name}</h4>
                                            <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                                                {p.stock_quantity} left
                                            </span>
                                        </div>

                                        {/* Visual Stock Bar */}
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Action */}
                                    <button
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Restock Item"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- Footer --- */}
            {products.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 w-full">
                        View Inventory Report <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LowStockList;