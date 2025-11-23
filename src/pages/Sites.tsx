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
}

export default function Sites() {
    const [sites, setSites] = useState<Site[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newSite, setNewSite] = useState({ name: '', domain: '' })
    const [loading, setLoading] = useState(true)

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
            const scriptTag = `<script src="http://localhost:8000/api/heatmaps/tracking-script/${siteId}/"></script>`;

            alert(`Add this to your website's <head> section:\n\n${scriptTag}\n\nOr use inline:\n\n<script>\n${script}\n</script>`);
        } catch (error) {
            console.error('Failed to get tracking script', error);
            alert('Failed to get tracking script');
        }
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
                </main>
            </div>
        </div>
    )
}
