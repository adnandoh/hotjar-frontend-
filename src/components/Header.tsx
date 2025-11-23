import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
    title: string
}

export default function Header({ title }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={18} />
                    </div>
                </button>
            </div>
        </header>
    )
}
