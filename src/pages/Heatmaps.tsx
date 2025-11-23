import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { MousePointerClick, Monitor, Smartphone, Tablet, Eye } from 'lucide-react'

interface Heatmap {
    id: number
    page_url: string
    heatmap_type: string
    device_type: string
    session_count: number
    generated_at: string
}

export default function Heatmaps() {
    const navigate = useNavigate()
    const [heatmaps, setHeatmaps] = useState<Heatmap[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHeatmaps()
    }, [])

    const fetchHeatmaps = async () => {
        try {
            const response = await api.get('/heatmaps/')
            setHeatmaps(response.data)
        } catch (error) {
            console.error('Failed to fetch heatmaps', error)
        } finally {
            setLoading(false)
        }
    }

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'mobile': return <Smartphone size={16} />
            case 'tablet': return <Tablet size={16} />
            default: return <Monitor size={16} />
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Heatmaps" />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Heatmaps</h2>
                            <p className="text-gray-600">Visualize where users click, move, and scroll</p>
                        </div>
                        <button
                            onClick={() => navigate('/heatmaps/viewer')}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                        >
                            <Eye size={20} />
                            Open Heatmap Viewer
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading heatmaps...</p>
                    ) : heatmaps.length === 0 ? (
                        <div className="text-center py-12">
                            <MousePointerClick size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No heatmaps yet</h3>
                            <p className="text-gray-600 mb-4">Heatmaps will be generated as users interact with your site</p>
                            <button
                                onClick={() => navigate('/heatmaps/viewer')}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-primary-700"
                            >
                                <Eye size={20} />
                                Open Heatmap Viewer
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {heatmaps.map((heatmap) => (
                                <div key={heatmap.id} className="card hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                            <MousePointerClick size={24} />
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 capitalize">
                                            {heatmap.heatmap_type}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={heatmap.page_url}>
                                        {heatmap.page_url}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                                        <div className="flex items-center gap-1">
                                            {getDeviceIcon(heatmap.device_type)}
                                            <span className="capitalize">{heatmap.device_type}</span>
                                        </div>
                                        <div>
                                            {heatmap.session_count} sessions
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            {new Date(heatmap.generated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* View All Button */}
                            <button
                                onClick={() => navigate('/heatmaps/viewer')}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-600 transition-colors min-h-[200px]"
                            >
                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                    <Eye size={32} />
                                </div>
                                <span className="font-medium">Open Heatmap Viewer</span>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
