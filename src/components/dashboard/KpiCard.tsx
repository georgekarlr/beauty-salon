import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Props = {
    title: string;
    value: string;
    icon?: React.ElementType; // Allow passing a Lucide icon component
    trend?: number; // Percentage change (e.g., 12.5 or -5)
    color?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'orange'; // Theme color
};

const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
};

const KpiCard: React.FC<Props> = ({ title, value, icon: Icon, trend, color = 'indigo' }) => {

    // Determine trend color and icon
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                </div>

                {/* Icon Box */}
                {Icon && (
                    <div className={`p-2.5 rounded-lg ${colorStyles[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Trend Footer */}
            {trend !== undefined && (
                <div className="mt-4 flex items-center text-xs font-medium">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded 
                        ${isPositive ? 'text-emerald-700 bg-emerald-50' : ''}
                        ${isNegative ? 'text-red-700 bg-red-50' : ''}
                        ${!isPositive && !isNegative ? 'text-gray-600 bg-gray-100' : ''}
                    `}>
                        {isPositive && <TrendingUp className="w-3 h-3" />}
                        {isNegative && <TrendingDown className="w-3 h-3" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}

                        {Math.abs(trend)}%
                    </span>
                    <span className="text-gray-400 ml-2">from last month</span>
                </div>
            )}
        </div>
    );
};

export default KpiCard;