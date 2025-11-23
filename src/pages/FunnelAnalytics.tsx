import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { ArrowLeft, TrendingDown, Users, Percent } from 'lucide-react'

interface FunnelStep {
    step_number: number
    step_name: string
    step_url: string
    sessions: number
    conversion_rate: number
    drop_off_count: number
    drop_off_rate: number
    overall_conversion: number
}

interface FunnelAnalytics {
    funnel_id: number
    funnel_name: string
    total_sessions: number
    steps: FunnelStep[]
    overall_conversion: number
}

export default function FunnelAnalytics() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchAnalytics()
        }
    }, [id])

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/analytics/funnels/${id}/`)
            setAnalytics(response.data)
        } catch (error) {
            console.error('Failed to fetch funnel analytics', error)
        } finally {
            setLoading(false)
        }
    }

    const getStepColor = (conversionRate: number) => {
        if (conversionRate >= 70) return 'bg-green-500'
        if (conversionRate >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getStepWidth = (sessions: number, totalSessions: number) => {
        const percentage = (sessions / totalSessions) * 100
        return Math.max(percentage, 10) // Minimum 10% width for visibility
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Funnel Analytics" />

                <main className="flex-1 overflow-y-auto p-6">
                    <button
                        onClick={() => navigate('/funnels')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={20} />
                        Back to Funnels
                    </button>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Header Stats */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{analytics.funnel_name}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="card">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Users className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Sessions</p>
                                                <p className="text-2xl font-bold text-gray-900">{analytics.total_sessions.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Percent className="text-green-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Overall Conversion</p>
                                                <p className="text-2xl font-bold text-gray-900">{analytics.overall_conversion.toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <TrendingDown className="text-purple-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Funnel Steps</p>
                                                <p className="text-2xl font-bold text-gray-900">{analytics.steps.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Funnel Visualization */}
                            <div className="card mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Funnel Flow</h3>
                                <div className="space-y-6">
                                    {analytics.steps.map((step, index) => (
                                        <div key={step.step_number}>
                                            {/* Step Bar */}
                                            <div className="relative">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                        {step.step_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{step.step_name}</h4>
                                                        <p className="text-sm text-gray-500">{step.step_url}</p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="ml-12 bg-gray-200 rounded-full h-12 relative overflow-hidden">
                                                    <div
                                                        className={`h-full ${getStepColor(step.conversion_rate)} transition-all duration-500 flex items-center justify-between px-4`}
                                                        style={{ width: `${getStepWidth(step.sessions, analytics.total_sessions)}%` }}
                                                    >
                                                        <span className="text-white font-semibold">
                                                            {step.sessions.toLocaleString()} sessions
                                                        </span>
                                                        <span className="text-white font-bold">
                                                            {step.overall_conversion.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="ml-12 mt-2 grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Step Conversion:</span>
                                                        <span className="ml-2 font-semibold text-gray-900">{step.conversion_rate.toFixed(2)}%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Drop-off:</span>
                                                        <span className="ml-2 font-semibold text-red-600">
                                                            {step.drop_off_count.toLocaleString()} ({step.drop_off_rate.toFixed(2)}%)
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Overall:</span>
                                                        <span className="ml-2 font-semibold text-gray-900">{step.overall_conversion.toFixed(2)}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Arrow between steps */}
                                            {index < analytics.steps.length - 1 && (
                                                <div className="ml-16 my-4 flex items-center gap-2 text-gray-400">
                                                    <div className="w-px h-8 bg-gray-300"></div>
                                                    <TrendingDown size={20} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Stats Table */}
                            <div className="card">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Step</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Sessions</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Step Conv.</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Overall Conv.</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Drop-off</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.steps.map((step) => (
                                                <tr key={step.step_number} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{step.step_number}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-900">{step.step_name}</td>
                                                    <td className="py-3 px-4 text-sm text-right text-gray-900">{step.sessions.toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-sm text-right">
                                                        <span className={`font-semibold ${step.conversion_rate >= 70 ? 'text-green-600' : step.conversion_rate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                            {step.conversion_rate.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                                        {step.overall_conversion.toFixed(2)}%
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-right text-red-600">
                                                        {step.drop_off_count.toLocaleString()} ({step.drop_off_rate.toFixed(2)}%)
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Failed to load funnel analytics</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
