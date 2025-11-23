import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { Users, Play, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardStats {
    total_sessions: number
    active_users: number
    total_recordings: number
    avg_session_duration: number
    top_pages: { page_url: string; count: number }[]
    recent_recordings: any[]
    sessions_trend: { date: string; count: number }[]
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState(7)

    useEffect(() => {
        fetchDashboardStats()
    }, [dateRange])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/analytics/dashboard/?days=${dateRange}`)
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Dashboard" />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Date Range Selector */}
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value={1}>Last 24 hours</option>
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : stats ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.total_sessions.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="text-blue-600" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Active Users</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.active_users.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="text-green-600" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Recordings</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.total_recordings.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Play className="text-purple-600" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Avg. Duration</p>
                                            <p className="text-3xl font-bold text-gray-900">{formatDuration(stats.avg_session_duration)}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Clock className="text-orange-600" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Sessions Trend */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Trend</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={stats.sessions_trend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                name="Sessions"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Top Pages */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={stats.top_pages.slice(0, 5)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="page_url"
                                                tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8b5cf6" name="Views" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Recordings */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Recordings</h3>
                                {stats.recent_recordings.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No recordings yet</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Page</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duration</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recent_recordings.map((recording, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm text-gray-900">{recording.user}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-xs">{recording.page}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">{recording.duration}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-500">
                                                            {new Date(recording.timestamp).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Failed to load dashboard data</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
