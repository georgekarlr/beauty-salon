import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    Loader2,
    CalendarRange,
    DollarSign,
    ShoppingBag,
    CalendarCheck,
    Plus
} from 'lucide-react'
import { DashboardService } from '../services/dashboardService.ts'
import type { DashboardData } from '../types/dashboard'
import KpiCard from '../components/dashboard/KpiCard'
import AppointmentsList from '../components/dashboard/AppointmentsList'
import RecentClientsList from '../components/dashboard/RecentClientsList'
import LowStockList from '../components/dashboard/LowStockList'
import { getTodaysDateRange } from '../utils/dateAndTime.ts'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Helper for greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dateRange] = useState(getTodaysDateRange()) // Fixed to today for now
    const { persona } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            const { data, error } = await DashboardService.getDashboardData(dateRange)
            if (error) {
                setError(error)
                setData(null)
            } else {
                setData(data)
            }
            setLoading(false)
        }
        fetchData()
    }, [dateRange])

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400 animate-in fade-in">
                    <Loader2 className="w-10 h-10 mb-4 animate-spin text-indigo-500" />
                    <p className="font-medium">Gathering your business insights...</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="p-6 rounded-xl bg-red-50 border border-red-100 text-red-800 flex flex-col items-center text-center">
                    <p className="font-bold text-lg mb-1">Unable to load dashboard</p>
                    <p className="text-sm opacity-80">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50">
                        Retry
                    </button>
                </div>
            )
        }

        if (!data) return null;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* --- KPI Cards Row --- */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <KpiCard
                        title="Total Sales Today"
                        value={`\u20b1${data.kpis.total_sales.toFixed(2)}`}
                        icon={DollarSign}
                        color="emerald"
                        trend={12} // Mock trend data
                    />
                    <KpiCard
                        title="Transactions"
                        value={data.kpis.sales_count.toString()}
                        icon={ShoppingBag}
                        color="blue"
                        trend={-5} // Mock trend data
                    />
                    <KpiCard
                        title="Appointments"
                        value={data.kpis.appointments_count.toString()}
                        icon={CalendarCheck}
                        color="purple"
                        trend={0}
                    />
                </div>

                {/* --- Main Content (Left) --- */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Today's Schedule */}
                    <div className="h-full">
                        <AppointmentsList appointments={data.todays_appointments} />
                    </div>
                </div>

                {/* --- Sidebar (Right) --- */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* New Clients */}
                    <RecentClientsList clients={data.recent_clients} />

                    {/* Inventory Alerts */}
                    <LowStockList products={data.low_stock_products} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

            {/* --- Header Section --- */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Greeting & Date */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 hidden md:block">
                            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {getGreeting()}, {persona?.personName || 'Boss!'}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <CalendarRange className="w-3.5 h-3.5" />
                                <span>Overview for <span className="font-semibold text-gray-700">Today</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div>
                        <button
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => navigate('/pos')}
                            disabled={!persona}
                            title={!persona ? "Please login/select persona first" : "Start Point of Sale"}
                        >
                            <Plus className="w-4 h-4" />
                            New Sale
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Dashboard Content --- */}
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>

        </div>
    )
}

export default DashboardPage