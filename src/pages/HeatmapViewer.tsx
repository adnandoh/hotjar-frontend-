import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { MousePointerClick, Monitor, Smartphone, Tablet, Calendar } from 'lucide-react'

interface HeatmapPoint {
    x: number
    y: number
    value: number
    width?: number
}

interface HeatmapData {
    site_id: number
    page_url: string
    heatmap_type: string
    device_type: string
    data: HeatmapPoint[]
    max: number
    session_count: number
    total_events: number
    available_pages: string[]
}

export default function HeatmapViewer() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [sites, setSites] = useState<any[]>([])
    const [selectedSite, setSelectedSite] = useState<number | null>(null)
    const [selectedPage, setSelectedPage] = useState('/')
    const [heatmapType, setHeatmapType] = useState<'click' | 'scroll' | 'move'>('click')
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [dateRange, setDateRange] = useState(7)
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
    const [loading, setLoading] = useState(false)
    const [canvasSize] = useState({ width: 1200, height: 800 })

    useEffect(() => {
        fetchSites()
    }, [])

    useEffect(() => {
        if (selectedSite) {
            fetchHeatmapData()
        }
    }, [selectedSite, selectedPage, heatmapType, deviceType, dateRange])

    useEffect(() => {
        if (heatmapData && canvasRef.current) {
            renderHeatmap()
        }
    }, [heatmapData, canvasSize])

    const fetchSites = async () => {
        try {
            const response = await api.get('/sites/')
            setSites(response.data)
            if (response.data.length > 0) {
                setSelectedSite(response.data[0].id)
            }
        } catch (error) {
            console.error('Failed to fetch sites', error)
        }
    }

    const fetchHeatmapData = async () => {
        if (!selectedSite) return

        try {
            setLoading(true)
            const response = await api.get(`/heatmaps/data/${selectedSite}/`, {
                params: {
                    page_url: selectedPage,
                    type: heatmapType,
                    device: deviceType,
                    days: dateRange
                }
            })
            setHeatmapData(response.data)
        } catch (error) {
            console.error('Failed to fetch heatmap data', error)
        } finally {
            setLoading(false)
        }
    }

    const renderHeatmap = () => {
        const canvas = canvasRef.current
        if (!canvas || !heatmapData) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw background
        ctx.fillStyle = '#f9fafb'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw grid
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        for (let x = 0; x < canvas.width; x += 100) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, canvas.height)
            ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += 100) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(canvas.width, y)
            ctx.stroke()
        }

        if (heatmapData.data.length === 0) {
            // No data message
            ctx.fillStyle = '#6b7280'
            ctx.font = '20px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('No heatmap data available for this page', canvas.width / 2, canvas.height / 2)
            return
        }

        // Render heatmap based on type
        if (heatmapType === 'scroll') {
            renderScrollHeatmap(ctx, canvas)
        } else {
            renderPointHeatmap(ctx, canvas)
        }
    }

    const renderPointHeatmap = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!heatmapData) return

        // Create radial gradient for each point
        heatmapData.data.forEach(point => {
            const intensity = point.value / heatmapData.max
            const radius = 30 + (intensity * 20) // Radius based on intensity

            // Scale coordinates to canvas size
            const x = (point.x / 1920) * canvas.width
            const y = (point.y / 1080) * canvas.height

            // Create gradient
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)

            // Color based on intensity (blue -> green -> yellow -> red)
            if (intensity < 0.25) {
                gradient.addColorStop(0, `rgba(59, 130, 246, ${0.6 * intensity * 4})`)
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
            } else if (intensity < 0.5) {
                gradient.addColorStop(0, `rgba(34, 197, 94, ${0.6 * (intensity - 0.25) * 4})`)
                gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
            } else if (intensity < 0.75) {
                gradient.addColorStop(0, `rgba(234, 179, 8, ${0.7 * (intensity - 0.5) * 4})`)
                gradient.addColorStop(1, 'rgba(234, 179, 8, 0)')
            } else {
                gradient.addColorStop(0, `rgba(239, 68, 68, ${0.8 * (intensity - 0.75) * 4})`)
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
            }

            ctx.fillStyle = gradient
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
        })

        // Draw points on top
        heatmapData.data.forEach(point => {
            const x = (point.x / 1920) * canvas.width
            const y = (point.y / 1080) * canvas.height
            const intensity = point.value / heatmapData.max

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fillStyle = intensity > 0.5 ? '#ffffff' : '#000000'
            ctx.fill()
        })
    }

    const renderScrollHeatmap = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!heatmapData) return

        // Sort by Y position
        const sortedData = [...heatmapData.data].sort((a, b) => a.y - b.y)

        sortedData.forEach(point => {
            const intensity = point.value / heatmapData.max
            const y = (point.y / 3000) * canvas.height // Assume max scroll of 3000px
            const height = 50

            // Color based on intensity
            let color
            if (intensity < 0.25) {
                color = `rgba(59, 130, 246, ${0.3 + intensity * 2})`
            } else if (intensity < 0.5) {
                color = `rgba(34, 197, 94, ${0.3 + (intensity - 0.25) * 2})`
            } else if (intensity < 0.75) {
                color = `rgba(234, 179, 8, ${0.4 + (intensity - 0.5) * 2})`
            } else {
                color = `rgba(239, 68, 68, ${0.5 + (intensity - 0.75) * 2})`
            }

            ctx.fillStyle = color
            ctx.fillRect(0, y, canvas.width, height)

            // Draw percentage text
            const percentage = ((point.value / heatmapData.session_count) * 100).toFixed(0)
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 14px sans-serif'
            ctx.fillText(`${percentage}% reached`, 10, y + 30)
        })
    }

    const getHeatmapTypeIcon = (type: string) => {
        switch (type) {
            case 'click':
                return <MousePointerClick size={16} />
            case 'scroll':
                return <Calendar size={16} />
            case 'move':
                return <MousePointerClick size={16} />
            default:
                return <MousePointerClick size={16} />
        }
    }

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'desktop':
                return <Monitor size={16} />
            case 'tablet':
                return <Tablet size={16} />
            case 'mobile':
                return <Smartphone size={16} />
            default:
                return <Monitor size={16} />
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Heatmap Viewer" />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Controls */}
                    <div className="card mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Site Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                                <select
                                    value={selectedSite || ''}
                                    onChange={(e) => setSelectedSite(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Page Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                                <select
                                    value={selectedPage}
                                    onChange={(e) => setSelectedPage(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    {heatmapData?.available_pages.map(page => (
                                        <option key={page} value={page}>{page}</option>
                                    )) || <option value="/">/</option>}
                                </select>
                            </div>

                            {/* Heatmap Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="flex gap-2">
                                    {(['click', 'scroll', 'move'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setHeatmapType(type)}
                                            className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${heatmapType === type
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getHeatmapTypeIcon(type)}
                                            <span className="text-sm capitalize">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Device Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                                <div className="flex gap-2">
                                    {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                                        <button
                                            key={device}
                                            onClick={() => setDeviceType(device)}
                                            className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${deviceType === device
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getDeviceIcon(device)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value={1}>Last 24 hours</option>
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                    <option value={90}>Last 90 days</option>
                                </select>
                            </div>
                        </div>

                        {/* Stats */}
                        {heatmapData && (
                            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Sessions</p>
                                    <p className="text-2xl font-bold text-gray-900">{heatmapData.session_count.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{heatmapData.total_events.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Data Points</p>
                                    <p className="text-2xl font-bold text-gray-900">{heatmapData.data.length.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Heatmap Canvas */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {heatmapType.charAt(0).toUpperCase() + heatmapType.slice(1)} Heatmap
                            </h3>
                            {loading && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                    <span className="text-sm">Loading...</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                            <canvas
                                ref={canvasRef}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                className="w-full"
                                style={{ maxHeight: '600px' }}
                            />
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex items-center justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.6)' }}></div>
                                <span className="text-sm text-gray-600">Low</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: 'rgba(34, 197, 94, 0.6)' }}></div>
                                <span className="text-sm text-gray-600">Medium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: 'rgba(234, 179, 8, 0.7)' }}></div>
                                <span className="text-sm text-gray-600">High</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.8)' }}></div>
                                <span className="text-sm text-gray-600">Very High</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
