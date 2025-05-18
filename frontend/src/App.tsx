import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import LoadingSpinner from './components/LoadingSpinner';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { ToastContainer, toast } from 'react-toastify';

interface User {
  username: string;
  userId: string;
}


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser({
        username: currentUser.username,
        userId: currentUser.userId
      });
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (err) {
      console.error('Sign out failed', err);
      toast.error('Sign out failed');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading application..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Event Reminder</Link>
          <div className="space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm hidden md:inline">Hello, {user.username}</span>
                <button 
                  onClick={handleSignOut} 
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <div className="space-y-8">
                  <EventForm />
                  <EventList />
                </div>
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/auth" 
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Auth setUser={setUser} />
              )
            } 
          />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
