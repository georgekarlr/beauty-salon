import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    LayoutDashboard,
    User,
    Settings,
    FileText,
    BarChart3,
    Calendar,
    X,
    CreditCard,
    Users,
    Package,
    Scissors,
    ChevronDown
} from 'lucide-react'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

type NavItem = {
    name: string
    href?: string
    icon?: React.ComponentType<any>
    children?: NavItem[]
}

const baseNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Point Of Sales', href: '/pos', icon: CreditCard },
    {
        name: 'Management',
        children: [
            { name: 'Sales & Refunds', href: '/management/sales-refunds', icon: FileText },
            { name: 'Clients', href: '/management/clients', icon: Users },
            { name: 'Staff', href: '/management/staff', icon: User },
            { name: 'Products', href: '/management/products', icon: Package },
            { name: 'Services', href: '/management/services', icon: Scissors },
        ],
    },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation()
    const { persona } = useAuth()
    const navigation = baseNavigation

    // Track which nested sections are open; default all sections with children to open
    const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() =>
        Object.fromEntries(
            navigation
                .filter((item) => item.children && item.children.length > 0)
                .map((item) => [item.name, true])
        )
    )

    const toggleSection = (name: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [name]: !prev[name],
        }))
    }

    return (
        <>
            {/* Backdrop - shown on all screen sizes when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Your App</h1>
                            {persona && (
                                <p className="text-xs text-gray-500">
                                    {persona.personName || (persona.type === 'admin' ? 'Admin' : (persona.loginName || 'Staff'))} Portal
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            if (item.children && item.children.length > 0) {
                                const isSectionOpen = openSections[item.name] ?? true

                                // Section with nested items
                                return (
                                    <div key={item.name} className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(item.name)}
                                            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            <span>{item.name}</span>
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform duration-200 ${
                                                    isSectionOpen ? 'rotate-180' : 'rotate-0'
                                                }`}
                                            />
                                        </button>

                                        {isSectionOpen && (
                                            <div className="mt-1 space-y-1">
                                                {item.children.map((child) => {
                                                    const isActive = location.pathname === child.href
                                                    const Icon = child.icon!
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            to={child.href!}
                                                            onClick={onClose}
                                                            className={`
                                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ml-2
                                ${isActive
                                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                            }
                              `}
                                                        >
                                                            <Icon className={`
                                h-5 w-5 mr-3 flex-shrink-0
                                ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                              `} />
                                                            {child.name}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            const isActive = location.pathname === item.href
                            const Icon = item.icon!
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href!}
                                    onClick={onClose}
                                    className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }
                  `}
                                >
                                    <Icon className={`
                    h-5 w-5 mr-3 flex-shrink-0
                    ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Sidebar