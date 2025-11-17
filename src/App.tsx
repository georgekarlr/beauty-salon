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
import Reports from './pages/Reports'
import CalendarPage from './pages/Calendar'
import Services from './pages/Services'
import Products from './pages/Products'
import Clients from './pages/Clients'
import Staff from './pages/Staff'
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
                  <CalendarPage />
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
                  <Staff />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/products" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/management/services" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Services />
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
                  <Reports />
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