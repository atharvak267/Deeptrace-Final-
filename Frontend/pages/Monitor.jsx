import { useState, useEffect } from 'react';
import { Search, BellRing, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Monitor() {
  const [athletes, setAthletes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to use monitoring.');
      setLoading(false);
      return;
    }
    setCurrentUser(user);

    // Load all athletes
    const { data, error } = await supabase
      .from('athletes')
      .select('id, athlete_id, name, sport, subscribers')
      .order('name');

    if (error) {
      console.error('Error loading athletes:', error);
      setError('Could not load athletes. Please try again.');
      setLoading(false);
      return;
    }

    // Mark which ones the current user is subscribed to
    const enriched = (data || []).map(athlete => ({
      ...athlete,
      isMonitored: isSubscribed(athlete.subscribers, user.id),
    }));

    setAthletes(enriched);
    setLoading(false);
  }

  // Check if user ID exists in the comma-separated subscribers field
  function isSubscribed(subscribers, userId) {
    if (!subscribers) return false;
    return subscribers.split(',').map(s => s.trim()).includes(userId);
  }

  // Add or remove user from subscribers field
  async function toggleMonitor(athlete) {
    if (!currentUser) return;
    setTogglingId(athlete.id);

    const currentSubs = athlete.subscribers
      ? athlete.subscribers.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    let newSubs;
    if (athlete.isMonitored) {
      // Remove user from subscribers
      newSubs = currentSubs.filter(id => id !== currentUser.id);
    } else {
      // Add user to subscribers
      newSubs = [...currentSubs, currentUser.id];
    }

    const newSubsString = newSubs.join(',');

    const { error } = await supabase
      .from('athletes')
      .update({ subscribers: newSubsString })
      .eq('id', athlete.id);

    if (error) {
      console.error('Error updating subscription:', error);
      setTogglingId(null);
      return;
    }

    // Update local state immediately so UI responds instantly
    setAthletes(prev =>
      prev.map(a =>
        a.id === athlete.id
          ? { ...a, isMonitored: !a.isMonitored, subscribers: newSubsString }
          : a
      )
    );
    setTogglingId(null);
  }

  const filteredAthletes = athletes.filter(athlete =>
    searchQuery.trim() === '' ||
    athlete.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.sport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const monitoredCount = athletes.filter(a => a.isMonitored).length;

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin" />
          <p className="text-onSurface-muted">Loading athletes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button onClick={loadData} className="btn-primary mt-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-36">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Athlete Monitoring</h1>
        <p className="text-onSurface-muted">
          Get instant alerts when suspicious videos of these athletes are detected.
          {monitoredCount > 0 && (
            <span className="ml-2 text-verdict-authentic font-medium">
              Monitoring {monitoredCount} athlete{monitoredCount > 1 ? 's' : ''}.
            </span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-onSurface-muted" />
        </div>
        <input
          type="text"
          placeholder="Search athletes or sport..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-12 py-3 rounded-soft-sharp bg-[#0A0E14] border border-white/10"
        />
      </div>

      {/* Athletes Grid */}
      {filteredAthletes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className={`glass-card p-6 flex items-center justify-between transition-all ${athlete.isMonitored
                  ? 'border-verdict-authentic shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-verdict-authentic/[0.02]'
                  : 'border-white/10'
                }`}
            >
              <div>
                <h3 className="font-bold text-lg text-white">{athlete.name}</h3>
                <span className="text-xs text-onSurface-muted uppercase tracking-wider">
                  {athlete.sport}
                </span>
                {athlete.isMonitored && (
                  <p className="text-xs text-verdict-authentic mt-1 flex items-center gap-1">
                    <BellRing className="w-3 h-3" /> Monitoring active
                  </p>
                )}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleMonitor(athlete)}
                disabled={togglingId === athlete.id}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#05070A] disabled:opacity-50 ${athlete.isMonitored
                    ? 'bg-verdict-authentic focus:ring-verdict-authentic'
                    : 'bg-gray-700 focus:ring-gray-500'
                  }`}
              >
                <span className="sr-only">Toggle monitoring</span>
                {togglingId === athlete.id ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                ) : (
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${athlete.isMonitored ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
          <Search className="w-12 h-12 text-onSurface-muted opacity-50" />
          <p className="text-white font-medium">No athletes found</p>
          <p className="text-onSurface-muted text-sm">
            Try a different search term.
          </p>
        </div>
      )}

      {/* Bottom Notification Bar */}
      <div className="glass-card p-6 fixed bottom-8 left-8 lg:left-[calc(16rem+2rem)] right-8 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-t-4 border-t-electric-blue z-20 shadow-2xl bg-[#0A0E14]/95 backdrop-blur-xl">
        <div>
          <h3 className="font-bold text-white mb-1">Push Notifications</h3>
          <p className="text-sm text-onSurface-muted">
            Alerts will be sent to your device when a deepfake is detected for monitored athletes.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <BellRing className="w-5 h-5 text-electric-blue" />
          <span className="text-sm font-medium text-white">
            {monitoredCount > 0
              ? `${monitoredCount} athlete${monitoredCount > 1 ? 's' : ''} monitored`
              : 'No athletes monitored yet'}
          </span>
        </div>
      </div>
    </div>
  );
}