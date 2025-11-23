import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Heatmaps from './pages/Heatmaps'
import HeatmapViewer from './pages/HeatmapViewer'
import Recordings from './pages/Recordings'
import RecordingPlayer from './pages/RecordingPlayer'
import Sites from './pages/Sites'
import Funnels from './pages/Funnels'
import FunnelAnalytics from './pages/FunnelAnalytics'
import Forms from './pages/Forms'
import Surveys from './pages/Surveys'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/heatmaps" element={<Heatmaps />} />
        <Route path="/heatmaps/viewer" element={<HeatmapViewer />} />
        <Route path="/recordings" element={<Recordings />} />
        <Route path="/recordings/:id" element={<RecordingPlayer />} />
        <Route path="/sites" element={<Sites />} />
        <Route path="/funnels" element={<Funnels />} />
        <Route path="/funnels/:id/analytics" element={<FunnelAnalytics />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/surveys" element={<Surveys />} />
      </Routes>
    </div>
  )
}

export default App
