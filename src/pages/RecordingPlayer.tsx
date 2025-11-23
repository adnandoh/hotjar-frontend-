import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import api from '../api/axios'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, AlertCircle, MousePointerClick } from 'lucide-react'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'

interface RecordingData {
    recording_id: string
    session_id: string
    duration: number
    event_count: number
    events: any[]
    has_errors: boolean
    has_rage_clicks: boolean
    created_at: string
}

export default function RecordingPlayerWithRRWeb() {
    const { id } = useParams()
    const navigate = useNavigate()
    const playerRef = useRef<HTMLDivElement>(null)
    const [recording, setRecording] = useState<RecordingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [player, setPlayer] = useState<any>(null)

    useEffect(() => {
        if (id) {
            fetchRecording()
        }
    }, [id])

    useEffect(() => {
        if (recording && playerRef.current && !player) {
            initializePlayer()
        }
    }, [recording])

    const fetchRecording = async () => {
        try {
            const response = await api.get(`/recordings/data/${id}/`)
            setRecording(response.data)
        } catch (error) {
            console.error('Failed to fetch recording', error)
        } finally {
            setLoading(false)
        }
    }

    const initializePlayer = () => {
        if (!recording || !playerRef.current) return

        // Clear previous player
        playerRef.current.innerHTML = ''

        // Initialize rrweb player
        const newPlayer = new rrwebPlayer({
            target: playerRef.current,
            props: {
                events: recording.events,
                width: 1024,
                height: 768,
                autoPlay: false,
                showController: true,
                speedOption: [1, 2, 4, 8],
                tags: {
                    error: 'Error',
                    rage_click: 'Rage Click'
                }
            }
        })

        setPlayer(newPlayer)
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Recording Player" />

                <main className="flex-1 overflow-y-auto p-6">
                    <button
                        onClick={() => navigate('/recordings')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={20} />
                        Back to Recordings
                    </button>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : recording ? (
                        <>
                            {/* Recording Info */}
                            <div className="card mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Recording {recording.recording_id.substring(0, 12)}...
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Duration: {formatDuration(recording.duration)}</span>
                                            <span>Events: {recording.event_count.toLocaleString()}</span>
                                            <span>Session: {recording.session_id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {recording.has_errors && (
                                            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                                                <AlertCircle size={14} />
                                                Has Errors
                                            </span>
                                        )}
                                        {recording.has_rage_clicks && (
                                            <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                                <MousePointerClick size={14} />
                                                Rage Clicks
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Player */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Playback</h3>
                                {recording.events && recording.events.length > 0 ? (
                                    <div
                                        ref={playerRef}
                                        className="rrweb-player-container bg-gray-100 rounded-lg overflow-hidden"
                                        style={{ minHeight: '600px' }}
                                    />
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <Play size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600">No recording data available</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Make sure the tracking script is using rrweb recording
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Recording Details */}
                            <div className="card mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recording Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Recording ID</p>
                                        <p className="font-mono text-sm text-gray-900">{recording.recording_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Session ID</p>
                                        <p className="font-mono text-sm text-gray-900">{recording.session_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Created At</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(recording.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Events</p>
                                        <p className="text-sm text-gray-900">{recording.event_count}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Recording not found</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
