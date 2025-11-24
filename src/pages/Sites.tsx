import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { Plus, Code, Trash2 } from 'lucide-react'

interface Site {
    id: number
    name: string
    domain: string
    tracking_id: string
    created_at: string
    connection_status: 'connected' | 'inactive' | 'never_connected'
    is_connected: boolean
    last_activity_at: string | null
}

export default function Sites() {
    const [sites, setSites] = useState<Site[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showTrackingModal, setShowTrackingModal] = useState(false)
    const [trackingCode, setTrackingCode] = useState({ script: '', scriptTag: '' })
    const [newSite, setNewSite] = useState({ name: '', domain: '' })
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchSites()
    }, [])

    const fetchSites = async () => {
        try {
            const response = await api.get('/sites/')
            setSites(response.data)
        } catch (error) {
            console.error('Failed to fetch sites', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await api.post('/sites/', newSite)
            setSites([...sites, response.data])
            setShowAddModal(false)
            setNewSite({ name: '', domain: '' })
        } catch (error) {
            console.error('Failed to add site', error)
        }
    }

    const handleDeleteSite = async (id: number) => {
        if (!confirm('Are you sure you want to delete this site?')) return
        try {
            await api.delete(`/sites/${id}/`)
            setSites(sites.filter(s => s.id !== id))
        } catch (error) {
            console.error('Failed to delete site', error)
        }
    }

    const getTrackingCode = async (siteId: number) => {
        try {
            const response = await api.get(`/heatmaps/tracking-script/${siteId}/`, {
                headers: { 'Accept': 'application/javascript' }
            });

            const script = response.data;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const scriptTag = `<script src="${apiUrl}/heatmaps/tracking-script/${siteId}/"></script>`;

            setTrackingCode({ script, scriptTag });
            setShowTrackingModal(true);
            setCopied(false);
        } catch (error: any) {
            console.error('Failed to get tracking script', error);
            const errorMessage = error.response?.data?.detail || error.response?.data || error.message || 'Unknown error';
            alert(`Failed to get tracking script:\n\n${errorMessage}`);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    // Auto-refresh sites every 10 seconds to update connection status
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSites()
        }, 10000) // Refresh every 10 seconds

        return () => clearInterval(interval)
    }, [])

    // Helper function to render connection status badge
    const renderStatusBadge = (status: string) => {
        const statusConfig = {
            connected: {
                text: 'Connected to Hotjar Clone',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                dotColor: 'bg-green-500'
            },
            inactive: {
                text: 'Inactive',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                dotColor: 'bg-yellow-500'
            },
            never_connected: {
                text: 'Not Connected',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-600',
                dotColor: 'bg-gray-400'
            }
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.never_connected

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor} text-xs font-medium`}>
                <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
                {config.text}
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Sites" />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Sites</h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                        >
                            <Plus size={20} /> Add New Site
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading sites...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sites.map((site) => (
                                <div key={site.id} className="card relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{site.name}</h3>
                                            <p className="text-gray-500 text-sm mb-4">{site.domain}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSite(site.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto mb-4">
                                        {site.tracking_id}
                                    </div>

                                    {/* Connection Status Badge */}
                                    <div className="mb-4">
                                        {renderStatusBadge(site.connection_status)}
                                    </div>

                                    <button
                                        onClick={() => getTrackingCode(site.id)}
                                        className="w-full border border-gray-300 text-gray-700 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                                    >
                                        <Code size={16} /> Get Tracking Code
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                                <h3 className="text-xl font-bold mb-4">Add New Site</h3>
                                <form onSubmit={handleAddSite}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={newSite.name}
                                            onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="example.com"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={newSite.domain}
                                            onChange={e => setNewSite({ ...newSite, domain: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                        >
                                            Add Site
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Tracking Code Modal */}
                    {showTrackingModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold text-gray-900">Tracking Code</h3>
                                        <button
                                            onClick={() => setShowTrackingModal(false)}
                                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mt-2">Add this code to your website to start tracking</p>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {/* Script Tag Option */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-lg font-semibold text-gray-900">Option 1: Script Tag (Recommended)</h4>
                                            <button
                                                onClick={() => copyToClipboard(trackingCode.scriptTag)}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
                                            >
                                                <Code size={16} />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Add this to your website's <code className="bg-gray-100 px-2 py-1 rounded">&lt;head&gt;</code> section:
                                        </p>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                            <pre className="text-sm font-mono">{trackingCode.scriptTag}</pre>
                                        </div>
                                    </div>

                                    {/* Inline Script Option */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-lg font-semibold text-gray-900">Option 2: Inline Script</h4>
                                            <button
                                                onClick={() => copyToClipboard(`<script>\n${trackingCode.script}\n</script>`)}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                            >
                                                <Code size={16} />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Or paste this inline code directly:
                                        </p>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
                                            <pre className="text-xs font-mono whitespace-pre-wrap">{trackingCode.script}</pre>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setShowTrackingModal(false)}
                                        className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
