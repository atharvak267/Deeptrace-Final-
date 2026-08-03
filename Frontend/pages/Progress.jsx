import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Progress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scan_id');

  const [currentStep, setCurrentStep] = useState(0);
  const [statusText, setStatusText] = useState('Starting analysis...');
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    'Video Downloaded',
    'Frames Extracted',
    'Faces Detected',
    'DeepFace Analysis',
    'Gemini Vision Analysis',
    'Heatmap Generated',
    'Report Written',
    'Results Ready',
  ];

  // Map backend status to step index
  const statusToStep = {
    queued: 0,
    processing: 1,
    downloading: 1,
    extracting: 2,
    detecting: 3,
    deepface: 4,
    gemini: 5,
    heatmap: 6,
    report: 7,
    complete: 8,
  };

  useEffect(() => {
    // If no scan_id in URL — go back to home
    if (!scanId) {
      navigate('/home');
      return;
    }

    // Subscribe to real-time changes on this scan row
    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          const scan = payload.new;
          const status = scan.status;

          // Update step based on status
          const step = statusToStep[status] ?? 0;
          setCurrentStep(step);
          setStatusText(`Analyzing: ${steps[step] || 'Processing'}...`);

          // If complete navigate to results
          if (status === 'complete') {
            setStatusText('Analysis Complete!');
            setCurrentStep(steps.length);
            setTimeout(() => {
              navigate(`/results?scan_id=${scanId}`);
            }, 1000);
          }

          // If failed show error
          if (status === 'failed') {
            setFailed(true);
            setErrorMessage(scan.error_message || 'Analysis failed. Please try again.');
          }
        }
      )
      .subscribe();

    // Also do an initial fetch in case status already changed
    async function checkInitialStatus() {
      const { data, error } = await supabase
        .from('scans')
        .select('status, error_message')
        .eq('id', scanId)
        .single();

      if (error) {
        console.error('Error fetching scan:', error);
        return;
      }

      if (data) {
        const status = data.status;
        const step = statusToStep[status] ?? 0;
        setCurrentStep(step);
        setStatusText(`Analyzing: ${steps[step] || 'Processing'}...`);

        if (status === 'complete') {
          navigate(`/results?scan_id=${scanId}`);
        }
        if (status === 'failed') {
          setFailed(true);
          setErrorMessage(data.error_message || 'Analysis failed.');
        }
      }
    }

    checkInitialStatus();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div className="glass-card w-full max-w-lg p-10 flex flex-col items-center border-electric-blue/50 shadow-glow-blue relative overflow-hidden">

        {/* Animated background glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[60px] animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center w-full">

          {/* Failed State */}
          {failed ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-3xl">✕</span>
              </div>
              <h2 className="text-xl font-bold text-red-400">Analysis Failed</h2>
              <p className="text-onSurface-muted text-sm">{errorMessage}</p>
              <button
                onClick={() => navigate('/home')}
                className="btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Spinner */}
              <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                <svg className="w-full h-full animate-spin text-electric-blue" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="200" strokeDashoffset="100" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-electric-blue border-r-electric-blue border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <Loader2 className="absolute w-8 h-8 text-electric-blue animate-pulse" />
              </div>

              <h2 className="text-xl font-heading font-bold text-white mb-8 text-center h-8">
                {statusText}
              </h2>

              {/* Steps */}
              <div className="w-full max-w-sm flex flex-col gap-4">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-6 h-6">
                        {isCompleted && (
                          <CheckCircle2 className="w-6 h-6 text-verdict-authentic drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                        {isCurrent && (
                          <>
                            <div className="absolute w-6 h-6 bg-electric-blue/30 rounded-full animate-ping"></div>
                            <div className="w-3 h-3 bg-electric-blue rounded-full shadow-glow-blue"></div>
                          </>
                        )}
                        {isPending && (
                          <Circle className="w-5 h-5 text-onSurface-muted" />
                        )}
                      </div>
                      <span className={`font-medium ${isCompleted ? 'text-white' :
                        isCurrent ? 'text-electric-blue drop-shadow-glow-blue' :
                          'text-onSurface-muted'
                        }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Scan ID display for debugging */}
              <div className="mt-6 text-xs text-onSurface-muted">
                Scan ID: {scanId}
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 w-full text-center">
                <p className="text-sm text-onSurface-muted uppercase tracking-wider font-bold">
                  This usually takes 2 to 3 minutes<br />
                  <span className="text-electric-blue">Do not close this tab</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
