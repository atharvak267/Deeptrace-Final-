import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Home from './pages/Home';
import Progress from './pages/Progress';
import Results from './pages/Results';
import History from './pages/History';
import Monitor from './pages/Monitor';
import CommonUser from './pages/CommonUser';
import Account from './pages/Account';

// Protected route wrapper
function ProtectedRoute({ children, session }) {
  if (session === undefined) {
    // Still loading — show nothing yet
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!session) {
    // Not logged in — send to login
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) saveUserToDatabase(session.user);
    });

    // Listen for login and logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) saveUserToDatabase(session.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function saveUserToDatabase(user) {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    // Only insert if user is new
    if (!existing) {
      await supabase.from('users').insert({
        user_id: user.id,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        role: 'fan',
        fcm_token: '',
        monitored_athletes: '',
      });
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no login needed */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/common" element={<CommonUser />} />
        </Route>

        {/* Protected routes — login required */}
        <Route element={
          <ProtectedRoute session={session}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
