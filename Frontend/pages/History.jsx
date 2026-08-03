import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to view history.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('scans')
      .select('id, athlete_name, video_url, verdict, score, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      setError('Could not load history. Please try again.');
    } else {
      setScans(data || []);
    }
    setLoading(false);
  }

  const filteredScans = scans.filter(scan => {
    const matchesFilter =
      filter === 'All' ||
      scan.verdict?.toUpperCase() === filter.toUpperCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      scan.athlete_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function timeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const getVerdictStyle = (verdict) => {
    switch (verdict?.toUpperCase()) {
      case 'DEEPFAKE': return 'text-verdict-deepfake border-verdict-deepfake bg-verdict-deepfake/10';
      case 'SUSPICIOUS': return 'text-verdict-suspicious border-verdict-suspicious bg-verdict-suspicious/10';
      case 'AUTHENTIC': return 'text-verdict-authentic border-verdict-authentic bg-verdict-authentic/10';
      default: return 'text-white border-white/20 bg-white/5';
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'text-onSurface-muted';
    if (score >= 70) return 'text-verdict-authentic';
    if (score >= 40) return 'text-verdict-suspicious';
    return 'text-verdict-deepfake';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin" />
          <p className="text-onSurface-muted">Loading your analysis history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchHistory} className="btn-primary mt-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      <h1 className="text-3xl font-heading font-bold">Past Analyses</h1>

      {/* Filter + Search Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-[#0A0E14] border border-white/10 rounded-soft-sharp p-1">
          {['All', 'Deepfake', 'Suspicious', 'Authentic'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-soft-sharp text-sm font-medium transition-all ${filter === f
                  ? 'bg-electric-blue text-white shadow-glow-blue'
                  : 'text-onSurface-muted hover:text-white'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-onSurface-muted" />
          </div>
          <input
            type="text"
            placeholder="Search by athlete name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10 py-2 text-sm rounded-soft-sharp border border-white/10 bg-[#0A0E14]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#05070A]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted">Verdict</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted">Athlete</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted">Source</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted text-center">Score</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted">Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-onSurface-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredScans.map((scan, index) => (
                <tr
                  key={scan.id}
                  className={`hover:bg-white/[0.02] transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#05070A]/30'
                    }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getVerdictStyle(scan.verdict)}`}>
                      {scan.verdict ?? scan.status?.toUpperCase() ?? 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {scan.athlete_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-onSurface-muted max-w-[180px] truncate">
                    <span
                      className="hover:text-electric-blue transition-colors cursor-pointer"
                      onClick={() => window.open(scan.video_url, '_blank')}
                      title={scan.video_url}
                    >
                      {scan.video_url}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-heading font-bold text-lg ${getScoreColor(scan.score)}`}>
                      {scan.score != null ? scan.score : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-onSurface-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(scan.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/results?scan_id=${scan.id}`)}
                      className="btn-ghost py-1 px-3 text-sm"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {filteredScans.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
              <Filter className="w-12 h-12 text-onSurface-muted opacity-50" />
              {scans.length === 0 ? (
                <>
                  <p className="text-white font-medium">No analyses yet</p>
                  <p className="text-onSurface-muted text-sm">
                    Run your first video analysis from the Home screen.
                  </p>
                  <button
                    onClick={() => navigate('/home')}
                    className="btn-primary mt-2"
                  >
                    Analyse a Video
                  </button>
                </>
              ) : (
                <p className="text-onSurface-muted">
                  No results match your current filter or search.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record count */}
      {scans.length > 0 && (
        <p className="text-onSurface-muted text-sm text-right">
          Showing {filteredScans.length} of {scans.length} analyses
        </p>
      )}
    </div>
  );
}