import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface VoltageData {
  voltage: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
}

interface StatusPanelProps {
  currentData: VoltageData | null;
  voltageHistory: VoltageData[];
  serialConnected: boolean;
}

function StatusPanel({ currentData, voltageHistory, serialConnected }: StatusPanelProps) {
  const stats = serialConnected && voltageHistory.length > 0
    ? {
        min: Math.min(...voltageHistory.map(h => h.voltage)),
        max: Math.max(...voltageHistory.map(h => h.voltage)),
        avg: voltageHistory.reduce((sum, h) => sum + h.voltage, 0) / voltageHistory.length,
        count: voltageHistory.length,
      }
    : null;

  const formatDuration = () => {
    if (!voltageHistory.length) return '--:--:--';
    const start = voltageHistory[0].timestamp;
    const end = voltageHistory[voltageHistory.length - 1].timestamp;
    const diff = Math.floor((end - start) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const lastUpdate = currentData?.timestamp
    ? new Date(currentData.timestamp)
    : null;

  const timeSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-200">System Status</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Average Voltage */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Voltage</p>
          </div>
          <p className="text-2xl font-mono text-slate-200">
            {stats ? stats.avg.toFixed(2) : '--.-'}V
          </p>
        </div>

        {/* Min Voltage */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-3 h-1 bg-slate-500 rounded" />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Min Voltage</p>
          </div>
          <p className="text-2xl font-mono text-rose-400">
            {stats ? stats.min.toFixed(2) : '--.-'}V
          </p>
        </div>

        {/* Max Voltage */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-3 h-1 bg-slate-500 rounded" />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Max Voltage</p>
          </div>
          <p className="text-2xl font-mono text-emerald-400">
            {stats ? stats.max.toFixed(2) : '--.-'}V
          </p>
        </div>

        {/* Readings Count */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Readings</p>
          </div>
          <p className="text-2xl font-mono text-cyan-400">
            {stats ? stats.count : '--'}
          </p>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {/* Duration */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Session Duration</p>
          </div>
          <p className="text-2xl font-mono text-slate-200">{formatDuration()}</p>
        </div>

        {/* Last Update */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${
                serialConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`} />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Last Update</p>
          </div>
          <p className="text-lg font-mono text-slate-300">
            {lastUpdate
              ? lastUpdate.toLocaleTimeString()
              : '--:--:--'}
          </p>
          {timeSinceUpdate !== null && serialConnected && (
            <p className="text-xs text-slate-500 mt-1">
              {timeSinceUpdate < 2
                ? 'Just now'
                : `${timeSinceUpdate} seconds ago`}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 md:col-span-1 col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${
              currentData?.status === 'normal'
                ? 'text-emerald-400'
                : currentData?.status === 'warning'
                  ? 'text-amber-400'
                  : currentData?.status === 'critical'
                    ? 'text-rose-400'
                    : 'text-slate-500'
            }`}>
              {serialConnected
                ? currentData?.status === 'normal'
                  ? 'Normal'
                  : currentData?.status === 'warning'
                    ? 'Low Battery'
                    : currentData?.status === 'critical'
                      ? 'Critical'
                      : 'Monitoring...'
                : 'Disconnected'}
            </span>
            {currentData?.status === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;
