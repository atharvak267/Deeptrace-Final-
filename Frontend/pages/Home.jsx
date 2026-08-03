import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, ChevronDown, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Home() {
  const navigate = useNavigate();

  // Form state
  const [url, setUrl] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data state
  const [athletes, setAthletes] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  // Load athletes and recent scans on page load
  useEffect(() => {
    loadAthletes();
    loadRecentScans();
  }, []);

  // Load athletes from Supabase
  async function loadAthletes() {
    const { data, error } = await supabase
      .from('athletes')
      .select('athlete_id, name, sport')
      .order('name');

    if (error) {
      console.error('Error loading athletes:', error);
    } else {
      setAthletes(data || []);
    }
  }

  // Load recent scans from Supabase
  async function loadRecentScans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scans')
      .select('id, athlete_name, video_url, verdict, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error loading scans:', error);
    } else {
      setRecentScans(data || []);
    }
  }

  // Format time ago
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }

  // Verdict color helper
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'DEEPFAKE': return 'text-verdict-deepfake border-verdict-deepfake bg-verdict-deepfake/10';
      case 'SUSPICIOUS': return 'text-verdict-suspicious border-verdict-suspicious bg-verdict-suspicious/10';
      case 'AUTHENTIC': return 'text-verdict-authentic border-verdict-authentic bg-verdict-authentic/10';
      default: return 'text-white border-white/20 bg-white/5';
    }
  };

  // Handle analyze button
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    // Determine athlete name
    const athleteName = customName.trim() ||
      athletes.find(a => a.athlete_id === selectedAthlete)?.name ||
      '';

    if (!url) {
      setError('Please paste a video URL.');
      return;
    }
    if (!athleteName) {
      setError('Please select an athlete or type a person name.');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to analyze a video.');
        setLoading(false);
        return;
      }

      // Create scan row in Supabase
      const { data, error: insertError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          video_url: url,
          athlete_name: athleteName,
          status: 'queued',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        setError('Failed to start analysis. Please try again.');
        setLoading(false);
        return;
      }

      // Navigate to progress with scan ID
      // Call backend directly to trigger analysis

      await fetch('https://deeptrace-production.up.railway.app/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: String(data.id),
          video_url: url,
          athlete_name: athleteName,
        }),
      }).catch(err => console.warn('Backend call failed:', err));
      // Still navigate — backend might have received it


      // Navigate to progress with scan ID
      navigate(`/progress?scan_id=${data.id}`);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-heading font-bold mb-8">Analyze a Video</h1>

        <form onSubmit={handleAnalyze} className="flex flex-col gap-6">

          {/* URL Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-onSurface-muted" />
            </div>
            <input
              type="text"
              placeholder="Paste a YouTube, Instagram, or Twitter video URL here"
              className="input-field w-full pl-12 py-4 text-lg rounded-t-soft-sharp"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          {/* Athlete Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-onSurface-muted font-medium uppercase tracking-wider">
                Select Athlete
              </label>
              <div className="relative">
                <select
                  className="input-field w-full appearance-none rounded-soft-sharp cursor-pointer pr-10"
                  value={selectedAthlete}
                  onChange={(e) => {
                    setSelectedAthlete(e.target.value);
                    setCustomName('');
                  }}
                >
                  <option value="">Select monitored athlete...</option>
                  {athletes.map((athlete) => (
                    <option key={athlete.athlete_id} value={athlete.athlete_id}>
                      {athlete.name} — {athlete.sport}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-onSurface-muted" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-onSurface-muted font-medium uppercase tracking-wider">
                Or Type Any Person's Name
              </label>
              <input
                type="text"
                placeholder="E.g. Michael Jordan"
                className="input-field w-full rounded-soft-sharp"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setSelectedAthlete('');
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-4 mt-4 text-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            {loading ? 'Starting Analysis...' : 'Analyze This Video'}
          </button>

        </form>
      </div>

      {/* Recent Scans */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-electric-blue" />
          Recent Scans
        </h2>

        <div className="flex flex-col gap-3">
          {recentScans.length === 0 ? (
            <div className="glass-card p-6 text-center text-onSurface-muted">
              No scans yet. Analyze your first video above.
            </div>
          ) : (
            recentScans.map((scan) => (
              <div
                key={scan.id}
                className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => navigate(`/results?scan_id=${scan.id}`)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-white">{scan.athlete_name}</span>
                  <span className="text-onSurface-muted text-sm">
                    {scan.video_url.length > 40
                      ? scan.video_url.substring(0, 40) + '...'
                      : scan.video_url}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-onSurface-muted text-sm">
                    {timeAgo(scan.created_at)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getVerdictColor(scan.verdict || scan.status)}`}>
                    {scan.verdict || scan.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}