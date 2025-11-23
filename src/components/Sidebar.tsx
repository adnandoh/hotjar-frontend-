import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, MousePointerClick, Play, Globe, TrendingDown, FileText, MessageSquare, Settings, LogOut, HelpCircle } from 'lucide-react'

export default function Sidebar() {
    const navigation = [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Heatmaps', to: '/heatmaps', icon: MousePointerClick },
        { name: 'Recordings', to: '/recordings', icon: Play },
        { name: 'Funnels', to: '/funnels', icon: TrendingDown },
        { name: 'Forms', to: '/forms', icon: FileText },
        { name: 'Surveys', to: '/surveys', icon: MessageSquare },
        { name: 'Sites', to: '/sites', icon: Globe },
    ]

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                        <MousePointerClick className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold text-gradient">Hotjar Clone</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.name}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <Icon size={20} className="mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-200 space-y-1">
                <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                    <Settings size={20} className="mr-3" />
                    <span className="font-medium">Settings</span>
                </button>
                <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                    <HelpCircle size={20} className="mr-3" />
                    <span className="font-medium">Help</span>
                </button>
                <button
                    onClick={() => {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                    <LogOut size={20} className="mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}
