import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Activity, Clock, LogOut, User } from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Account</h1>
          <p className="text-onSurface-muted mt-1">Manage your profile and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-background-surface/30 border border-white/5 rounded-soft-sharp p-6 shadow-glow-subtle flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-electric-blue/20 rounded-full flex items-center justify-center border-2 border-electric-blue/50">
            <User className="w-12 h-12 text-electric-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-onSurface-muted">{user?.email || 'Loading...'}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-crimson-red/10 text-crimson-red border border-crimson-red/20 rounded-soft hover:bg-crimson-red hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-background-surface/30 border border-white/5 rounded-soft-sharp p-6 shadow-glow-subtle">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/home" className="flex items-center gap-4 p-4 rounded-soft bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-electric-blue/50 group">
                <div className="bg-electric-blue/20 p-3 rounded-full text-electric-blue group-hover:bg-electric-blue group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Analyze Video</h4>
                  <p className="text-sm text-onSurface-muted">Go back to home page</p>
                </div>
              </Link>
              
              <Link to="/history" className="flex items-center gap-4 p-4 rounded-soft bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-electric-blue/50 group">
                <div className="bg-electric-blue/20 p-3 rounded-full text-electric-blue group-hover:bg-electric-blue group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Your History</h4>
                  <p className="text-sm text-onSurface-muted">View past analyses</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
