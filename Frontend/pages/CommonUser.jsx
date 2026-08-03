import { useState } from 'react';
import { Shield, Search, Zap, Clock, UserX, Share2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CommonUser() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, result

  const handleCheck = (e) => {
    e.preventDefault();
    if (!url) return;
    
    setStatus('analyzing');
    setTimeout(() => {
      setStatus('result');
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <Shield className="w-6 h-6" />
        <span className="font-heading font-bold tracking-wider">DeepTrace</span>
      </Link>

      {status === 'idle' && (
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">Is This Video <span className="text-electric-blue drop-shadow-glow-blue">Real?</span></h1>
          <p className="text-xl text-onSurface-muted mb-12">Paste any video link and we will tell you in minutes.</p>

          <form onSubmit={handleCheck} className="w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-electric-blue to-electric-glow rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-2 bg-[#05070A] p-2 rounded-xl border border-white/10">
              <div className="w-full flex items-center pl-4">
                <LinkIcon className="w-5 h-5 text-onSurface-muted flex-shrink-0" />
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white px-4 py-4 placeholder:text-white/20"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full sm:w-auto btn-primary py-4 px-8 whitespace-nowrap rounded-lg shadow-glow-blue">
                Check This Video
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { icon: UserX, text: 'No Account Needed' },
              { icon: Clock, text: 'Results in Minutes' },
              { icon: Zap, text: 'AI Powered' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-onSurface-muted">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-electric-blue" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-electric-blue/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-electric-blue rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-10 h-10 text-electric-blue animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Analyzing Video...</h2>
          <p className="text-onSurface-muted">Scanning frames for AI manipulation</p>
        </div>
      )}

      {status === 'result' && (
        <div className="w-full max-w-lg">
          <div className="glass-card p-10 flex flex-col items-center text-center border-verdict-deepfake shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <h2 className="text-6xl font-heading font-bold text-verdict-deepfake drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] tracking-widest mb-6">
              DEEPFAKE
            </h2>
            
            <p className="text-lg text-white mb-8">
              Our AI analysis indicates this video has been <strong className="text-verdict-deepfake">digitally manipulated</strong>. The person's face was likely altered using AI software.
            </p>
            
            <div className="w-full flex flex-col gap-4">
              <button className="btn-primary w-full bg-[#111415] border border-electric-blue hover:bg-electric-blue/10">
                <Share2 className="w-5 h-5" /> Share This Result
              </button>
              <button onClick={() => {setUrl(''); setStatus('idle');}} className="text-sm text-onSurface-muted hover:text-white transition-colors py-2">
                Check another video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
