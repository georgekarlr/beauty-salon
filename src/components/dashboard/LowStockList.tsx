import React from 'react';
import type { LowStockProduct } from '../../types/dashboard';
import { Archive } from 'lucide-react';

type Props = { products: LowStockProduct[]; };

const LowStockList: React.FC<Props> = ({ products }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
            <Archive className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
        </div>
        {products.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well-stocked.</p>
        ) : (
            <ul className="space-y-2">
                {products.map(p => (
                    <li key={p.id} className="text-sm">
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-red-600">Only {p.stock_quantity} left in stock.</p>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default LowStockList;