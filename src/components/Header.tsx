import { Activity, Battery } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
}

function Header({ isConnected }: HeaderProps) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded-xl border border-slate-700">
                <Battery className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Battery Monitor
              </h1>
              <p className="text-slate-400 text-sm"> </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}>
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Time</p>
              <p className="text-sm font-mono text-slate-300 mt-1">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
