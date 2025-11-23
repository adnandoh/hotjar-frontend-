import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { Play, Monitor, Smartphone, Tablet, AlertCircle, MousePointerClick, Search, Calendar, Filter } from 'lucide-react'

interface Recording {
    recording_id: string
    session: {
        id: string
        device_type: string
    }
    duration: number
    event_count: number
    has_errors: boolean
    has_rage_clicks: boolean
    created_at: string
}

export default function RecordingsWithFilters() {
    const navigate = useNavigate()
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([])
    const [loading, setLoading] = useState(true)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [deviceFilter, setDeviceFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')
    const [errorFilter, setErrorFilter] = useState(false)
    const [rageClickFilter, setRageClickFilter] = useState(false)
    const [minDuration, setMinDuration] = useState<number>(0)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        fetchRecordings()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [recordings, searchQuery, deviceFilter, dateFilter, errorFilter, rageClickFilter, minDuration])

    const fetchRecordings = async () => {
        try {
            const response = await api.get('/recordings/')
            setRecordings(response.data)
        } catch (error) {
            console.error('Failed to fetch recordings', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...recordings]

        // Search filter (by recording ID)
        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.recording_id.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Device filter
        if (deviceFilter !== 'all') {
            filtered = filtered.filter(r => r.session.device_type === deviceFilter)
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date()
            const filterDate = new Date()

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0)
                    break
                case 'week':
                    filterDate.setDate(now.getDate() - 7)
                    break
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1)
                    break
            }

            filtered = filtered.filter(r => new Date(r.created_at) >= filterDate)
        }

        // Error filter
        if (errorFilter) {
            filtered = filtered.filter(r => r.has_errors)
        }

        // Rage click filter
        if (rageClickFilter) {
            filtered = filtered.filter(r => r.has_rage_clicks)
        }

        // Duration filter
        if (minDuration > 0) {
            filtered = filtered.filter(r => r.duration >= minDuration)
        }

        setFilteredRecordings(filtered)
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDeviceFilter('all')
        setDateFilter('all')
        setErrorFilter(false)
        setRageClickFilter(false)
        setMinDuration(0)
    }

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'mobile': return <Smartphone size={16} className="text-blue-600" />
            case 'tablet': return <Tablet size={16} className="text-purple-600" />
            default: return <Monitor size={16} className="text-green-600" />
        }
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const activeFilterCount = [
        deviceFilter !== 'all',
        dateFilter !== 'all',
        errorFilter,
        rageClickFilter,
        minDuration > 0,
        searchQuery !== ''
    ].filter(Boolean).length

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Session Recordings" />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Header with Search and Filters */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Session Recordings</h2>
                                <p className="text-gray-600">
                                    {filteredRecordings.length} of {recordings.length} recordings
                                    {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showFilters || activeFilterCount > 0
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter size={20} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by recording ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Device Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                                        <select
                                            value={deviceFilter}
                                            onChange={(e) => setDeviceFilter(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">All Devices</option>
                                            <option value="desktop">Desktop</option>
                                            <option value="tablet">Tablet</option>
                                            <option value="mobile">Mobile</option>
                                        </select>
                                    </div>

                                    {/* Date Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">Last 7 Days</option>
                                            <option value="month">Last 30 Days</option>
                                        </select>
                                    </div>

                                    {/* Duration Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration (seconds)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={minDuration}
                                            onChange={(e) => setMinDuration(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Quick Filters */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={errorFilter}
                                                    onChange={(e) => setErrorFilter(e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700">Has Errors</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={rageClickFilter}
                                                    onChange={(e) => setRageClickFilter(e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-gray-700">Has Rage Clicks</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recordings List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filteredRecordings.length === 0 ? (
                        <div className="text-center py-12">
                            <Play size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {recordings.length === 0 ? 'No recordings yet' : 'No recordings match your filters'}
                            </h3>
                            <p className="text-gray-600">
                                {recordings.length === 0
                                    ? 'Recordings will appear here once users visit your site'
                                    : 'Try adjusting your filters to see more results'
                                }
                            </p>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredRecordings.map((recording) => (
                                <div
                                    key={recording.recording_id}
                                    onClick={() => navigate(`/recordings/${recording.recording_id}`)}
                                    className="card hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                <Play size={24} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {recording.recording_id.substring(0, 8)}...
                                                    </h3>
                                                    {recording.has_errors && (
                                                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                            <AlertCircle size={12} />
                                                            Errors
                                                        </span>
                                                    )}
                                                    {recording.has_rage_clicks && (
                                                        <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                                            <MousePointerClick size={12} />
                                                            Rage Clicks
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        {getDeviceIcon(recording.session.device_type)}
                                                        <span className="capitalize">{recording.session.device_type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(recording.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div>{formatDuration(recording.duration)}</div>
                                                    <div>{recording.event_count} events</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-primary-600 group-hover:text-primary-700">
                                            <Play size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
