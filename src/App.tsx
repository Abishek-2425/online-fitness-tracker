import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy load pages for better performance
const Auth = React.lazy(() => import('./pages/Auth'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WorkoutPage = React.lazy(() => import('./pages/WorkoutPage'));
const WeightPage = React.lazy(() => import('./pages/WeightPage'));
const WaterPage = React.lazy(() => import('./pages/WaterPage'));
const SleepPage = React.lazy(() => import('./pages/SleepPage'));
const GoalsPage = React.lazy(() => import('./pages/GoalsPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="workouts" element={<WorkoutPage />} />
              <Route path="weight" element={<WeightPage />} />
              <Route path="water" element={<WaterPage />} />
              <Route path="sleep" element={<SleepPage />} />
              <Route path="goals" element={<GoalsPage />} />
            </Route>
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;