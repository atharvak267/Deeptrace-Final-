import { Link } from 'react-router-dom';
import { Shield, Play, ArrowRight, Video, FileText, Bell, CheckCircle2, Activity } from 'lucide-react';

export default function Landing() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-[#0A0F1E]/90 backdrop-blur-md border-b border-electric-blue z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Shield className="w-8 h-8 text-electric-blue" />
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              Deep<span className="text-electric-blue">Trace</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-onSurface font-medium">
            <a href="#features" className="hover:text-electric-blue hover:underline underline-offset-4 decoration-2 transition-all">Features</a>
            <a href="#how-it-works" className="hover:text-electric-blue hover:underline underline-offset-4 decoration-2 transition-all">How It Works</a>
            <a href="#for-organizations" className="hover:text-electric-blue hover:underline underline-offset-4 decoration-2 transition-all">For Organizations</a>
            <Link to="/common" className="hover:text-electric-blue hover:underline underline-offset-4 decoration-2 transition-all">For Everyone</Link>
          </div>
          
          <div>
            <Link to="/login" className="btn-primary shadow-glow-blue">
              Analyze a Video
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center bg-background-deep overflow-hidden">
        {/* Hexagonal grid overlay placeholder */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#007BFF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-tight mb-6 tracking-tight">
              Every Frame Tells<br />the <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-electric-glow">Truth</span>.
            </h1>
            <p className="text-xl text-onSurface-muted mb-10 leading-relaxed font-sans">
              DeepTrace detects AI-manipulated athlete videos in minutes — with visual evidence, legal reports, and real-time alerts.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/login" className="btn-primary text-lg px-8 py-4">
                Start Analyzing <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-ghost text-lg px-8 py-4">
                See How It Works
              </a>
            </div>
          </div>
          
          <div className="relative lg:ml-auto w-full max-w-md">
            {/* Phone/Browser Mockup */}
            <div className="glass-card p-6 border-electric-blue/50 relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-electric-blue/20 to-electric-glow/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm font-bold tracking-widest text-onSurface-muted">ANALYSIS RESULT</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center py-4">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-surface-bright" />
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray="553" strokeDashoffset="425" className="text-verdict-deepfake transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-heading font-bold text-verdict-deepfake">23</span>
                      <span className="text-sm text-onSurface-muted">/100</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-heading font-bold mt-4 text-verdict-deepfake drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] tracking-widest">DEEPFAKE</h2>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-white/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05070A]/80 z-10"></div>
                  {/* Mock Heatmap */}
                  <div className="w-full h-40 bg-surface-bright relative">
                    <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-500/40 rounded-full blur-xl"></div>
                    <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-orange-500/50 rounded-full blur-lg"></div>
                  </div>
                  <div className="absolute bottom-2 left-3 z-20">
                    <span className="text-xs font-bold text-white bg-red-500/80 px-2 py-1 rounded">FRAME #142 HIGHLIGHTED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full bg-background-surface border-y border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
          {[
            { num: '3', suffix: ' Mins', label: 'to Analyze Any Video' },
            { num: '2', suffix: ' Layers', label: 'Dual AI Detection' },
            { num: '100', suffix: '%', label: 'Legal Evidence Generated' },
            { num: '24/7', suffix: '', label: 'Real-Time Alerts' },
          ].map((stat, i) => (
            <div key={i} className={`flex flex-col items-center text-center ${i !== 0 ? 'pl-8' : ''}`}>
              <div className="text-4xl font-heading font-bold text-electric-blue mb-2 drop-shadow-glow-blue">
                {stat.num}<span className="text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-sm font-medium text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-4xl font-heading font-bold mb-12 text-center">The Problem Is <span className="text-electric-glow">Already Here</span>.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Video, title: 'Fake Endorsements', desc: 'Athletes\' likenesses used in fake brand deals without consent or compensation.' },
            { icon: Activity, title: 'Reputation Attacks', desc: 'AI-generated controversy videos spreading virally before anyone can act.' },
            { icon: Shield, title: 'No Tool Existed', desc: 'Generic deepfake detectors don\'t know who the athlete is or where the fake is.' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 border-l-4 border-l-electric-blue hover:-translate-y-1 transition-transform">
              <item.icon className="w-10 h-10 text-electric-blue mb-6" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-onSurface-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto w-full relative">
        <h2 className="text-4xl font-heading font-bold mb-16 text-center">How DeepTrace <span className="text-electric-blue">Works</span>.</h2>
        <div className="relative grid md:grid-cols-4 gap-8">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-electric-blue/20 -z-10 transform -translate-y-1/2"></div>
          
          {[
            { step: '01', title: 'Paste Any Video URL', desc: 'From YouTube, Instagram, or Twitter.' },
            { step: '02', title: 'AI Analyzes Every Frame', desc: 'Gemini Vision plus DeepFace dual layer detection.' },
            { step: '03', title: 'See Exactly Where It\'s Fake', desc: 'Visual heatmap overlay on suspicious frames.' },
            { step: '04', title: 'Download Legal Evidence', desc: 'Formal PDF report generated instantly.' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-6 flex flex-col items-center text-center relative bg-[#05070A] border-electric-blue/50">
              <div className="w-12 h-12 rounded-full bg-electric-blue/10 border border-electric-blue flex items-center justify-center text-electric-blue font-bold text-lg mb-6 shadow-glow-blue z-10">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-onSurface-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two User Types */}
      <section className="py-24 w-full border-t border-white/5 bg-background-surface">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 relative">
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10"></div>
          
          <div className="p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-start relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/10 rounded-bl-full blur-3xl group-hover:bg-[#00D4FF]/20 transition-all"></div>
            <span className="text-[#00D4FF] font-bold tracking-widest text-sm mb-4">FOR SPORTS ORGANIZATIONS</span>
            <h2 className="text-3xl font-heading font-bold mb-6">Monitor & Protect at Scale</h2>
            <ul className="space-y-4 mb-8">
              {['Monitor specific athletes 24/7', 'Get instant alerts for viral fakes', 'Download formal legal reports', 'Full API access'].map((li, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00D4FF]" />
                  <span className="text-slate-300">{li}</span>
                </li>
              ))}
            </ul>
            <Link to="/login" className="btn-primary bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF] hover:bg-[#00D4FF] hover:text-background-deep mt-auto">
              Organization Dashboard
            </Link>
          </div>

          <div className="p-12 flex flex-col items-start relative group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-electric-blue/10 rounded-br-full blur-3xl group-hover:bg-electric-blue/20 transition-all"></div>
            <span className="text-electric-blue font-bold tracking-widest text-sm mb-4">FOR EVERYONE</span>
            <h2 className="text-3xl font-heading font-bold mb-6">Find the Truth Instantly</h2>
            <ul className="space-y-4 mb-8">
              {['Paste any viral video link', 'Get a simple Real or Fake answer', 'Share your result instantly', 'No account needed'].map((li, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-blue" />
                  <span className="text-slate-300">{li}</span>
                </li>
              ))}
            </ul>
            <Link to="/common" className="btn-primary mt-auto">
              Try Common Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0A0F1E] border-t border-electric-blue pt-12 pb-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-electric-blue" />
            <span className="font-heading font-bold text-xl text-white">Deep<span className="text-electric-blue">Trace</span></span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-electric-blue transition-colors">Privacy</a>
            <a href="#" className="hover:text-electric-blue transition-colors">Terms</a>
            <a href="#" className="hover:text-electric-blue transition-colors">Contact</a>
          </div>
          <div className="text-electric-glow font-heading italic font-bold">
            Trace the truth behind every frame.
          </div>
        </div>
        <div className="text-center text-xs text-onSurface-muted pt-6 border-t border-white/5">
          &copy; {new Date().getFullYear()} DeepTrace Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
