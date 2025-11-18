import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { DashboardService } from '../services/dashboardService.ts'
import type { DashboardData } from '../types/dashboard'
import KpiCard from '../components/dashboard/KpiCard'
import AppointmentsList from '../components/dashboard/AppointmentsList'
import RecentClientsList from '../components/dashboard/RecentClientsList'
import LowStockList from '../components/dashboard/LowStockList'
import {getTodaysDateRange } from '../utils/dateAndTime.ts'
// import POSModal from '../components/pos/POSModal'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/*// Helper to get start and end of today
const getTodaysDateRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return { start_datetime: start.toISOString(), end_datetime: end.toISOString() }
}*/

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // In a real app, this state would control the date range picker
    const [dateRange, setDateRange] = useState(getTodaysDateRange())
    const { persona } = useAuth()
    // const [posOpen, setPosOpen] = useState(false)
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
    }, [dateRange]) // Re-fetch when the date range changes

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20 text-gray-500">
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Loading dashboard...
                </div>
            )
        }

        if (error) {
            return <div className="p-4 rounded-md bg-red-50 text-red-700">{error}</div>
        }

        if (!data) {
            return <div className="text-center text-gray-500 py-10">No dashboard data available.</div>
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs Section */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <KpiCard title="Total Sales" value={`$${data.kpis.total_sales.toFixed(2)}`} />
                    <KpiCard title="Sales Count" value={data.kpis.sales_count.toString()} />
                    <KpiCard title="Appointments" value={data.kpis.appointments_count.toString()} />
                </div>

                {/* Main Content Section */}
                <div className="lg:col-span-2 space-y-6">
                    <AppointmentsList appointments={data.todays_appointments} />
                </div>

                {/* Sidebar Section */}
                <div className="lg:col-span-1 space-y-6">
                    <RecentClientsList clients={data.recent_clients} />
                    <LowStockList products={data.low_stock_products} />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        A quick overview of your business for today.
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
                        onClick={() => navigate('/pos')}
                        disabled={!persona}
                    >New Sale</button>
                </div>
            </div>
            {/* In a real app, you'd have a date range picker component here that updates the 'dateRange' state */}
            {renderContent()}
            {/* <POSModal isOpen={posOpen} onClose={() => setPosOpen(false)} accountId={Number(persona?.id || 0)} /> */}
        </div>
    )
}

export default DashboardPage