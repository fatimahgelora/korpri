import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import MarathonLanding from './index';
import LoginPage from './components/LoginPage';
import RegistrationWizard from './components/RegistrationWizard';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SwaggerDocs from './components/SwaggerDocs';
import RaceManagement from './components/RaceManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MarathonLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationWizard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/api-docs" 
        element={
          <AdminProtectedRoute>
            <SwaggerDocs />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/race-management" 
        element={
          <AdminProtectedRoute>
            <RaceManagement />
          </AdminProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default App;