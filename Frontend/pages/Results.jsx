import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Share2, RefreshCcw, Bell, Download, Copy, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scan_id');

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!scanId) {
      navigate('/home');
      return;
    }
    fetchScan();
  }, [scanId]);

  async function fetchScan() {
    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) {
      console.error('Error fetching scan:', error);
      setError('Could not load results. Please try again.');
    } else {
      setScan(data);
    }
    setLoading(false);
  }

  // Get heatmap URLs as array
  function getHeatmapUrls() {
    if (!scan?.heatmap_urls) return [];
    return scan.heatmap_urls.split(',').filter(url => url.trim() !== '');
  }

  // Copy report to clipboard
  async function copyReport() {
    if (!scan?.report_text) return;
    await navigator.clipboard.writeText(scan.report_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Open PDF in new tab
  function downloadPdf() {
    if (!scan?.pdf_url) return;
    window.open(scan.pdf_url, '_blank');
  }

  const getGaugeColor = (score) => {
    if (!score && score !== 0) return 'text-white stroke-white';
    if (score >= 70) return 'text-verdict-authentic stroke-verdict-authentic';
    if (score >= 40) return 'text-verdict-suspicious stroke-verdict-suspicious';
    return 'text-verdict-deepfake stroke-verdict-deepfake';
  };

  const getVerdictStyle = (verdict) => {
    if (verdict === 'DEEPFAKE') return 'text-verdict-deepfake drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]';
    if (verdict === 'SUSPICIOUS') return 'text-verdict-suspicious drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]';
    if (verdict === 'AUTHENTIC') return 'text-verdict-authentic drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]';
    return 'text-white';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin" />
          <p className="text-onSurface-muted">Loading results...</p>
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
          <h2 className="text-xl font-bold text-white">Could Not Load Results</h2>
          <p className="text-onSurface-muted">{error}</p>
          <button onClick={() => navigate('/home')} className="btn-primary mt-2">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Scan not complete yet
  if (!scan || scan.status !== 'complete') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center max-w-md">
          <Loader2 className="w-12 h-12 text-electric-blue animate-spin" />
          <h2 className="text-xl font-bold text-white">Analysis Still In Progress</h2>
          <p className="text-onSurface-muted">
            Current status: {scan?.status || 'unknown'}
          </p>
          <button
            onClick={() => navigate(`/progress?scan_id=${scanId}`)}
            className="btn-primary mt-2"
          >
            Go to Progress Screen
          </button>
        </div>
      </div>
    );
  }

  const score = scan.score ?? 0;
  const verdict = scan.verdict ?? 'UNKNOWN';
  const heatmapUrls = getHeatmapUrls();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">

      {/* Top Header Card */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-10">

        {/* Score Gauge */}
        <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96" cy="96" r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-surface-bright"
            />
            <circle
              cx="96" cy="96" r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray="553"
              strokeDashoffset={553 - (553 * score) / 100}
              className={`transition-all duration-1000 ease-out ${getGaugeColor(score).split(' ')[1]}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-5xl font-heading font-bold ${getGaugeColor(score).split(' ')[0]}`}>
              {score}
            </span>
            <span className="text-sm text-onSurface-muted">/100</span>
          </div>
        </div>

        {/* Verdict Info */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className={`text-6xl font-heading font-bold tracking-widest ${getVerdictStyle(verdict)}`}>
              {verdict}
            </h1>
            <p className="text-xl font-medium mt-2 text-white">
              {scan.athlete_name}
            </p>
            <a href={scan.video_url}
              target="_blank"
              rel="noreferrer"
              className="text-electric-blue hover:underline text-sm break-all"
            >
              {scan.video_url}
            </a>
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-soft-sharp">
              <span className="block text-xs text-onSurface-muted uppercase tracking-wider">
                Manipulation Type
              </span>
              <span className="font-medium text-white">
                {scan.manipulation_type || 'Analyzing...'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-soft-sharp">
              <span className="block text-xs text-onSurface-muted uppercase tracking-wider">
                Authenticity Score
              </span>
              <span className="font-medium text-white">{score} / 100</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-soft-sharp">
              <span className="block text-xs text-onSurface-muted uppercase tracking-wider">
                Analysis Status
              </span>
              <span className="font-medium text-verdict-authentic">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-verdict-deepfake" />
          Where We Found the Manipulation
        </h2>

        {heatmapUrls.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {heatmapUrls.map((url, index) => (
              <div
                key={index}
                className="glass-card overflow-hidden group border-verdict-deepfake/30"
              >
                <div className="aspect-video bg-surface-bright relative overflow-hidden">
                  <img
                    src={url.trim()}
                    alt={`Heatmap frame ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 flex items-center justify-between bg-[#05070A]">
                  <span className="text-sm font-medium text-white">
                    Heatmap {index + 1}
                  </span>
                  <span className="px-2 py-1 bg-verdict-deepfake/20 text-verdict-deepfake text-xs font-bold rounded">
                    SUSPICIOUS
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No heatmaps yet — backend not built yet
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="glass-card overflow-hidden group border-verdict-deepfake/30"
              >
                <div className="aspect-video bg-surface-bright relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/40 rounded-full blur-2xl group-hover:bg-red-500/60 transition-all"></div>
                  <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-orange-500/50 rounded-full blur-xl"></div>
                  <p className="relative z-10 text-xs text-onSurface-muted text-center px-4">
                    Heatmap will appear after backend is connected
                  </p>
                </div>
                <div className="p-4 flex items-center justify-between bg-[#05070A]">
                  <span className="text-sm font-medium text-white">
                    Frame #{num}
                  </span>
                  <span className="px-2 py-1 bg-verdict-deepfake/20 text-verdict-deepfake text-xs font-bold rounded">
                    PENDING
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-onSurface-muted text-sm px-2">
          Red and orange regions indicate where our AI detected signs of artificial face manipulation.
        </p>
      </div>

      {/* Evidence Report Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-electric-blue" />
          AI-Generated Evidence Report
        </h2>

        <div className="glass-card border-l-4 border-l-electric-blue overflow-hidden flex flex-col">
          <div className="bg-[#05070A] p-4 flex items-center justify-end gap-4 border-b border-white/5 sticky top-0 z-10">
            <button
              onClick={copyReport}
              className="btn-ghost py-1.5 px-3 text-sm"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Report'}
            </button>
            <button
              onClick={downloadPdf}
              disabled={!scan.pdf_url}
              className="btn-primary py-1.5 px-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {scan.pdf_url ? 'Download PDF' : 'PDF Pending'}
            </button>
          </div>
          <div className="p-8 max-h-[400px] overflow-y-auto">
            {scan.report_text ? (
              <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed text-sm">
                {scan.report_text}
              </pre>
            ) : (
              <p className="text-onSurface-muted text-sm text-center py-8">
                Evidence report will appear here after the backend pipeline completes.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
        <button
          onClick={() => {
            const text = `DeepTrace Analysis Result\nAthlete: ${scan.athlete_name}\nVerdict: ${verdict}\nScore: ${score}/100\nVideo: ${scan.video_url}`;
            if (navigator.share) {
              navigator.share({ title: 'DeepTrace Result', text });
            } else {
              navigator.clipboard.writeText(text);
              alert('Result copied to clipboard!');
            }
          }}
          className="btn-ghost flex-1"
        >
          <Share2 className="w-5 h-5" /> Share Result
        </button>
        <button
          onClick={() => navigate('/home')}
          className="btn-ghost flex-1"
        >
          <RefreshCcw className="w-5 h-5" /> Run Another Analysis
        </button>
        <button
          onClick={() => navigate('/monitor')}
          className="btn-primary flex-1 shadow-glow-blue"
        >
          <Bell className="w-5 h-5" /> Set Up Monitoring Alert
        </button>
      </div>

    </div >
  );
}