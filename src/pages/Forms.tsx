import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { FileText, TrendingUp, TrendingDown } from 'lucide-react'

interface FormAnalytics {
    id: number
    form_id: string
    page_url: string
    completion_rate: number
    abandonment_rate: number
    avg_time_to_complete: number
    field_analytics: any
}

export default function Forms() {
    const [forms, setForms] = useState<FormAnalytics[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchForms()
    }, [])

    const fetchForms = async () => {
        try {
            const response = await api.get('/forms/')
            setForms(response.data)
        } catch (error) {
            console.error('Failed to fetch forms', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Form Analytics" />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Form Analytics</h2>
                        <p className="text-gray-600">Track form performance and user interactions</p>
                    </div>

                    {loading ? (
                        <p>Loading form analytics...</p>
                    ) : forms.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No form data yet</h3>
                            <p className="text-gray-600">Form analytics will appear here once users interact with forms on your site</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {forms.map((form) => (
                                <div key={form.id} className="card">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{form.form_id}</h3>
                                            <p className="text-sm text-gray-500">{form.page_url}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                                                <TrendingUp size={16} className="text-green-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {form.completion_rate.toFixed(1)}%
                                            </p>
                                        </div>

                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Abandonment Rate</span>
                                                <TrendingDown size={16} className="text-red-600" />
                                            </div>
                                            <p className="text-2xl font-bold text-red-600">
                                                {form.abandonment_rate.toFixed(1)}%
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Avg. Time to Complete</span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatTime(form.avg_time_to_complete)}
                                            </p>
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
