import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import Admin from '@/pages/Admin'
import AdminCabinet from '@/pages/AdminCabinet'
import PartnerCabinet from '@/pages/PartnerCabinet'
import CompanyCabinet from '@/pages/CompanyCabinet'
import KnowledgeDetail from '@/pages/KnowledgeDetail'
import KnowledgeList from '@/pages/KnowledgeList'
import KnowledgeNew from '@/pages/KnowledgeNew'
import KnowledgeEdit from '@/pages/KnowledgeEdit'
import LearningDetail from '@/pages/LearningDetail'
import LearningList from '@/pages/LearningList'
import Login from '@/pages/Login'
import More from '@/pages/More'
import NotFound from '@/pages/NotFound'
import Profile from '@/pages/Profile'
import PartnerDashboard from '@/pages/PartnerDashboard'
import TalentDirectory from '@/pages/TalentDirectory'
import TalentProfile from '@/pages/TalentProfile'
import TaskDetail from '@/pages/TaskDetail'
import TaskNew from '@/pages/TaskNew'
import TasksList from '@/pages/TasksList'
import Workspace from '@/pages/Workspace'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Workspace />} />
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/new" element={<TaskNew />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/knowledge" element={<KnowledgeList />} />
          <Route path="/knowledge/new" element={<KnowledgeNew />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="/knowledge/:id/edit" element={<KnowledgeEdit />} />
          <Route path="/talent" element={<TalentDirectory />} />
          <Route path="/talent/:id" element={<TalentProfile />} />
          <Route path="/learning" element={<LearningList />} />
          <Route path="/learning/:id" element={<LearningDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/more" element={<More />} />
          <Route path="/partner" element={<PartnerDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cabinet" element={<AdminCabinet />} />
          <Route path="/partner-cabinet" element={<PartnerCabinet />} />
          <Route path="/company-cabinet" element={<CompanyCabinet />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
