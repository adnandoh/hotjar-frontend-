import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { Plus, TrendingDown, Trash2, BarChart3 } from 'lucide-react'

interface Funnel {
    id: number
    name: string
    steps: { name: string; url: string }[]
    created_at: string
}

export default function Funnels() {
    const navigate = useNavigate()
    const [funnels, setFunnels] = useState<Funnel[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newFunnel, setNewFunnel] = useState({ name: '', steps: [{ name: '', url: '' }] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFunnels()
    }, [])

    const fetchFunnels = async () => {
        try {
            const response = await api.get('/funnels/')
            setFunnels(response.data)
        } catch (error) {
            console.error('Failed to fetch funnels', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddFunnel = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Get first site ID (in a real app, user would select)
            const sitesResponse = await api.get('/sites/')
            if (sitesResponse.data.length === 0) {
                alert('Please create a site first')
                return
            }

            const response = await api.post('/funnels/', {
                ...newFunnel,
                site: sitesResponse.data[0].id
            })
            setFunnels([...funnels, response.data])
            setShowAddModal(false)
            setNewFunnel({ name: '', steps: [{ name: '', url: '' }] })
        } catch (error) {
            console.error('Failed to add funnel', error)
        }
    }

    const handleDeleteFunnel = async (id: number) => {
        if (!confirm('Are you sure you want to delete this funnel?')) return
        try {
            await api.delete(`/funnels/${id}/`)
            setFunnels(funnels.filter(f => f.id !== id))
        } catch (error) {
            console.error('Failed to delete funnel', error)
        }
    }

    const addStep = () => {
        setNewFunnel({
            ...newFunnel,
            steps: [...newFunnel.steps, { name: '', url: '' }]
        })
    }

    const removeStep = (index: number) => {
        setNewFunnel({
            ...newFunnel,
            steps: newFunnel.steps.filter((_, i) => i !== index)
        })
    }

    const updateStep = (index: number, field: 'name' | 'url', value: string) => {
        const updatedSteps = [...newFunnel.steps]
        updatedSteps[index][field] = value
        setNewFunnel({ ...newFunnel, steps: updatedSteps })
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Funnels" />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Conversion Funnels</h2>
                            <p className="text-gray-600">Track user journeys through your site</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                        >
                            <Plus size={20} /> Create Funnel
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading funnels...</p>
                    ) : funnels.length === 0 ? (
                        <div className="text-center py-12">
                            <TrendingDown size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No funnels yet</h3>
                            <p className="text-gray-600 mb-4">Create your first funnel to track conversions</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-primary-700"
                            >
                                <Plus size={20} /> Create Funnel
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {funnels.map((funnel) => (
                                <div key={funnel.id} className="card">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">{funnel.name}</h3>
                                        <button
                                            onClick={() => handleDeleteFunnel(funnel.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {funnel.steps.map((step, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{step.url}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                        <button
                                            onClick={() => navigate(`/funnels/${funnel.id}/analytics`)}
                                            className="w-full bg-primary-50 text-primary-600 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-100 transition-colors"
                                        >
                                            <BarChart3 size={16} />
                                            View Analytics
                                        </button>
                                        <p className="text-xs text-gray-500 text-center">
                                            Created {new Date(funnel.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">Create New Funnel</h3>
                                <form onSubmit={handleAddFunnel}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Funnel Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={newFunnel.name}
                                            onChange={e => setNewFunnel({ ...newFunnel, name: e.target.value })}
                                            placeholder="e.g., Checkout Flow"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Funnel Steps</label>
                                        {newFunnel.steps.map((step, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <div className="w-8 h-10 bg-primary-100 text-primary-600 rounded flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Step name"
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={step.name}
                                                    onChange={e => updateStep(index, 'name', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="URL path (e.g., /checkout)"
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={step.url}
                                                    onChange={e => updateStep(index, 'url', e.target.value)}
                                                />
                                                {newFunnel.steps.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStep(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addStep}
                                            className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                                        >
                                            + Add Step
                                        </button>
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
                                            Create Funnel
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
