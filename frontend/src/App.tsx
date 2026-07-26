import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import MasterData from './pages/MasterData'
import Assessments from './pages/Assessments'
import AssessmentWizard from './pages/AssessmentWizard'
import Report from './pages/Report'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="master" element={<MasterData />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/:id/fill" element={<AssessmentWizard />} />
        <Route path="assessments/:id/report" element={<Report />} />
      </Route>
    </Routes>
  )
}

export default App

