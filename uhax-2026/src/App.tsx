import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CreateAssignment from './pages/CreateAssignment';
import PendingAssignments from './pages/PendingAssignments';
import MathTutor from './pages/MathTutor';
import StudyCompanion from './pages/StudyCompanion';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="create-assignment" element={<CreateAssignment />} />
            <Route path="pending-assignments" element={<PendingAssignments />} />
            <Route path="tutor" element={<MathTutor />} />
            <Route path="study" element={<StudyCompanion />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
