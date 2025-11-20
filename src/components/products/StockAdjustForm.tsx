import React, { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ClipboardList, Calculator } from 'lucide-react'

type Props = {
    currentStock?: number // Added to show calculation preview
    onSubmit: (amount: number, reason: string) => void
    onCancel: () => void
}

const StockAdjustForm: React.FC<Props> = ({ currentStock = 0, onSubmit, onCancel }) => {
    // 'add' or 'remove' mode handles the negative math for us
    const [mode, setMode] = useState<'add' | 'remove'>('add')
    const [value, setValue] = useState<string>('') // Keep as string to handle empty state better
    const [reason, setReason] = useState<string>('')

    // Computed final amount to send
    const adjustmentAmount = useMemo(() => {
        const num = parseInt(value) || 0;
        return mode === 'add' ? num : -num;
    }, [value, mode]);

    const isValid = Math.abs(adjustmentAmount) > 0 && reason.trim().length > 0;
    const newStockTotal = currentStock + adjustmentAmount;

    // Quick reason suggestions
    const suggestions = mode === 'add'
        ? ['New Delivery', 'Return Restock', 'Audit Correction']
        : ['Damaged / Expired', 'Theft / Loss', 'Internal Use'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) onSubmit(adjustmentAmount, reason);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- Mode Toggles --- */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                <button
                    type="button"
                    onClick={() => setMode('add')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${mode === 'add'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ArrowUp className="w-4 h-4" /> Add Stock
                </button>
                <button
                    type="button"
                    onClick={() => setMode('remove')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${mode === 'remove'
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ArrowDown className="w-4 h-4" /> Remove Stock
                </button>
            </div>

            {/* --- Amount Input & Preview --- */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-6">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Quantity
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 text-gray-900 placeholder-gray-300"
                        placeholder="0"
                        autoFocus
                    />
                </div>

                {/* Calculation Preview */}
                <div className="text-right opacity-80">
                    <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mb-1">
                        <Calculator className="w-3 h-3" /> New Balance
                    </div>
                    <div className={`text-xl font-bold ${mode === 'add' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {newStockTotal}
                    </div>
                    <div className="text-xs text-gray-400">
                        Prev: {currentStock}
                    </div>
                </div>
            </div>

            {/* --- Reason Input --- */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reason for adjustment</label>
                <div className="relative">
                    <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full pl-9 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                        placeholder="Type or select a reason..."
                    />
                    <ClipboardList className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setReason(s)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isValid}
                    className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${mode === 'add'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'}`
                    }
                >
                    {mode === 'add' ? 'Add Stock' : 'Remove Stock'}
                </button>
            </div>
        </form>
    )
}

export default StockAdjustForm