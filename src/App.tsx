import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PersonaProtectedRoute from './components/PersonaProtectedRoute'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PlaceholderPage from './pages/PlaceholderPage'
import Clients from './pages/Clients'
import PersonaManagement from './pages/PersonaManagement'
import {
  BarChart3,
  FileText,
  Calendar,
  Settings,
  CreditCard,
  Users,
  User,
  Package,
  Scissors
} from 'lucide-react'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Calendar"
                    description="View and manage appointments and schedules."
                    icon={Calendar}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/pos" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Point Of Sales"
                    description="Process sales, refunds, and manage checkout operations."
                    icon={CreditCard}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Management nested routes */}
          <Route path="/management/sales-refunds" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Sales & Refunds"
                    description="Manage sales transactions and handle refunds."
                    icon={FileText}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/clients" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/staff" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Staff"
                    description="Manage staff profiles, roles, and permissions."
                    icon={User}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/products" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Products"
                    description="Maintain product catalog, inventory, and pricing."
                    icon={Package}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/services" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Services"
                    description="Configure service offerings, durations, and pricing."
                    icon={Scissors}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />






          <Route path="/settings" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage 
                    title="Settings" 
                    description="Configure your application settings and preferences."
                    icon={Settings}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PlaceholderPage
                    title="Reports"
                    description="Analyze business performance with comprehensive reports."
                    icon={BarChart3}
                  />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/persona-management" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PersonaManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App