import React, { useEffect } from 'react'
import { CreditCard, Banknote, MoreHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { SalePaymentMethod } from '../../../types/sale'

type Props = {
    paymentMethod: SalePaymentMethod
    setPaymentMethod: (m: SalePaymentMethod) => void
    amountTendered: number | ''
    setAmountTendered: (n: number | '') => void
    totalAmount: number
    changeDue: number // We will ignore this for the "Remaining" calculation
    error?: string | null
}

const PaymentForm: React.FC<Props> = ({
                                          paymentMethod,
                                          setPaymentMethod,
                                          amountTendered,
                                          setAmountTendered,
                                          totalAmount,
                                          error,
                                      }) => {

    // 1. Safe numeric conversion
    const tenderedNum = typeof amountTendered === 'number' ? amountTendered : 0;

    // 2. Calculate difference locally to handle negative values (Remaining)
    //    If difference < 0, the customer still owes money.
    //    If difference >= 0, we owe the customer change.
    const difference = tenderedNum - totalAmount;
    const isSufficient = difference >= -0.01; // minimal tolerance for floating point math

    // Auto-fill exact amount when switching to Card
    useEffect(() => {
        if (paymentMethod === 'card') {
            setAmountTendered(totalAmount);
        }
    }, [paymentMethod, totalAmount, setAmountTendered]);

    const getQuickAmounts = () => {
        if (totalAmount <= 0) return [];
        const amounts = [totalAmount];

        const next10 = Math.ceil(totalAmount / 10) * 10;
        if (next10 > totalAmount && !amounts.includes(next10)) amounts.push(next10);

        const next20 = Math.ceil(totalAmount / 20) * 20;
        if (next20 > totalAmount && !amounts.includes(next20)) amounts.push(next20);

        const next50 = Math.ceil(totalAmount / 50) * 50;
        if (next50 > totalAmount && !amounts.includes(next50)) amounts.push(next50);

        const next100 = Math.ceil(totalAmount / 100) * 100;
        if (next100 > totalAmount && !amounts.includes(next100)) amounts.push(next100);

        return amounts.slice(0, 4);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="bg-gray-900 text-white p-6 text-center">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total To Pay</p>
                <div className="text-4xl font-bold tracking-tight">
                    {'\u20b1'}{totalAmount.toFixed(2)}
                </div>
            </div>

            <div className="p-6 space-y-8">

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Payment Method */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'cash', label: 'Cash', icon: Banknote },
                            { id: 'card', label: 'Card', icon: CreditCard },
                            { id: 'other', label: 'Other', icon: MoreHorizontal },
                        ].map((method) => {
                            const Icon = method.icon;
                            const isActive = paymentMethod === method.id;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id as SalePaymentMethod)}
                                    className={`
                    relative flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200
                    ${isActive
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-200'}
                  `}
                                >
                                    <Icon className={`h-6 w-6 mb-2 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">{method.label}</span>
                                    {isActive && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Amount & Calculation */}
                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Amount Tendered</label>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Input */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-lg font-semibold">{'\u20b1'}</span>
                            </div>
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                className={`
                    block w-full pl-8 pr-4 py-3 rounded-xl border-2 text-lg font-semibold shadow-sm outline-none transition-colors
                    ${!isSufficient && amountTendered !== '' ? 'border-orange-300 focus:border-orange-500 text-orange-900' : 'border-gray-200 focus:border-indigo-500 text-gray-900'}
                  `}
                                placeholder="0.00"
                                value={amountTendered}
                                onChange={(e) => setAmountTendered(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            />
                        </div>

                        {/* Result Display (FIXED LOGIC) */}
                        <div className={`
                flex-1 flex items-center justify-between px-5 py-3 rounded-xl border transition-colors duration-300
                ${isSufficient
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                            : 'bg-orange-50 border-orange-100 text-orange-800'}
              `}>
                <span className="text-sm font-medium uppercase tracking-wide opacity-80">
                  {isSufficient ? 'Change Due' : 'Remaining'}
                </span>
                            <span className="text-2xl font-bold">
                  {/* Use Math.abs on the difference to show positive money regardless of +/- */}
                                {'\u20b1'}{Math.abs(difference).toFixed(2)}
                </span>
                        </div>
                    </div>

                    {/* Quick Cash */}
                    {paymentMethod === 'cash' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2">
                            {getQuickAmounts().map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmountTendered(amt)}
                                    className="py-2 px-3 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-medium text-gray-600 transition-colors shadow-sm"
                                >
                                    {'\u20b1'}{amt.toFixed(2)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default PaymentForm