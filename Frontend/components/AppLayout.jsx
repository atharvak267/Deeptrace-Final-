import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Clock, Users, Settings, User } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Activity, label: 'Analyze' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/monitor', icon: Users, label: 'Monitor Athletes' },
    { path: '/account', icon: User, label: 'Account' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background-deep text-onSurface flex">
      {/* Sidebar */}
      <div className="w-64 bg-background-surface/50 backdrop-blur-sm border-r border-electric-blue/20 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-electric-blue/20">
          <Shield className="w-8 h-8 text-electric-blue" />
          <span className="font-heading font-bold text-xl text-white">
            Deep<span className="text-electric-blue">Trace</span>
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-soft-sharp transition-all ${
                  isActive 
                    ? 'bg-electric-blue/10 border-l-2 border-electric-blue text-white shadow-[inset_4px_0_0_0_rgba(0,123,255,1)]' 
                    : 'text-onSurface hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-electric-blue' : 'text-onSurface-muted'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
