import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'

interface Survey {
    id: number
    name: string
    questions: any[]
    trigger_type: string
    is_active: boolean
    created_at: string
}

export default function Surveys() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newSurvey, setNewSurvey] = useState({
        name: '',
        questions: [{ type: 'text', question: '' }],
        trigger_type: 'page_load',
        trigger_config: {},
        targeting_rules: {},
        is_active: true
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSurveys()
    }, [])

    const fetchSurveys = async () => {
        try {
            const response = await api.get('/surveys/surveys/')
            setSurveys(response.data)
        } catch (error) {
            console.error('Failed to fetch surveys', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSurvey = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Get first site ID
            const sitesResponse = await api.get('/sites/')
            if (sitesResponse.data.length === 0) {
                alert('Please create a site first')
                return
            }

            const response = await api.post('/surveys/surveys/', {
                ...newSurvey,
                site: sitesResponse.data[0].id
            })
            setSurveys([...surveys, response.data])
            setShowAddModal(false)
            setNewSurvey({
                name: '',
                questions: [{ type: 'text', question: '' }],
                trigger_type: 'page_load',
                trigger_config: {},
                targeting_rules: {},
                is_active: true
            })
        } catch (error) {
            console.error('Failed to add survey', error)
        }
    }

    const handleDeleteSurvey = async (id: number) => {
        if (!confirm('Are you sure you want to delete this survey?')) return
        try {
            await api.delete(`/surveys/surveys/${id}/`)
            setSurveys(surveys.filter(s => s.id !== id))
        } catch (error) {
            console.error('Failed to delete survey', error)
        }
    }

    const addQuestion = () => {
        setNewSurvey({
            ...newSurvey,
            questions: [...newSurvey.questions, { type: 'text', question: '' }]
        })
    }

    const updateQuestion = (index: number, value: string) => {
        const updatedQuestions = [...newSurvey.questions]
        updatedQuestions[index].question = value
        setNewSurvey({ ...newSurvey, questions: updatedQuestions })
    }

    const updateQuestionType = (index: number, type: string) => {
        const updatedQuestions = [...newSurvey.questions]
        updatedQuestions[index].type = type
        setNewSurvey({ ...newSurvey, questions: updatedQuestions })
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Surveys" />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Surveys</h2>
                            <p className="text-gray-600">Collect feedback from your users</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
                        >
                            <Plus size={20} /> Create Survey
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading surveys...</p>
                    ) : surveys.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
                            <p className="text-gray-600 mb-4">Create your first survey to collect user feedback</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-primary-700"
                            >
                                <Plus size={20} /> Create Survey
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {surveys.map((survey) => (
                                <div key={survey.id} className="card">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{survey.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{survey.trigger_type.replace('_', ' ')}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSurvey(survey.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">{survey.questions.length} questions</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${survey.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className="text-sm text-gray-600">{survey.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Created {new Date(survey.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">Create New Survey</h3>
                                <form onSubmit={handleAddSurvey}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Survey Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={newSurvey.name}
                                            onChange={e => setNewSurvey({ ...newSurvey, name: e.target.value })}
                                            placeholder="e.g., Customer Satisfaction Survey"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={newSurvey.trigger_type}
                                            onChange={e => setNewSurvey({ ...newSurvey, trigger_type: e.target.value })}
                                        >
                                            <option value="page_load">On Page Load</option>
                                            <option value="exit_intent">On Exit Intent</option>
                                            <option value="time_delay">After Time Delay</option>
                                            <option value="scroll">On Scroll Percentage</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                                        {newSurvey.questions.map((q, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <select
                                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={q.type}
                                                    onChange={e => updateQuestionType(index, e.target.value)}
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="rating">Rating</option>
                                                    <option value="yes_no">Yes/No</option>
                                                    <option value="nps">NPS</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter your question"
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                                                    value={q.question}
                                                    onChange={e => updateQuestion(index, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                                        >
                                            + Add Question
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
                                            Create Survey
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
