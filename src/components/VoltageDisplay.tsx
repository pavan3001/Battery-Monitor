import { Zap, Clock } from 'lucide-react';

interface VoltageDisplayProps {
  voltage: number | null;
  percentage: number | null;
  status: 'normal' | 'warning' | 'critical' | null;
  timestamp: number | null;
  connected: boolean;
}

function VoltageDisplay({
  voltage,
  percentage,
  status,
  timestamp,
  connected,
}: VoltageDisplayProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'from-emerald-400 to-teal-400';
      case 'warning':
        return 'from-amber-400 to-orange-400';
      case 'critical':
        return 'from-rose-400 to-red-500';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'normal':
        return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30';
      case 'warning':
        return 'from-amber-500/10 to-orange-500/10 border-amber-500/30';
      case 'critical':
        return 'from-rose-500/10 to-red-500/10 border-rose-500/30';
      default:
        return 'from-slate-800 to-slate-900 border-slate-700';
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div
      className={`bg-gradient-to-br ${getStatusBg()} backdrop-blur-sm border rounded-2xl p-6 h-full transition-all duration-500`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-200">Live Voltage</h2>
      </div>

      {/* Large Voltage Display */}
      <div className="text-center my-8">
        <div className="relative inline-block">
          {connected && voltage !== null ? (
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} blur-3xl opacity-30 transform scale-150`}
              />
              <div className="relative">
                <div
                  className={`text-7xl font-bold bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}
                >
                  {voltage.toFixed(2)}
                </div>
                <div className="text-2xl text-slate-400 font-medium mt-1">
                  Volts
                </div>
              </div>
            </>
          ) : (
            <div className="relative">
              <div className="text-7xl font-bold text-slate-600">--.-</div>
              <div className="text-2xl text-slate-600 font-medium mt-1">
                Volts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Percentage */}
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Charge Level</span>
          <span
            className={`text-lg font-semibold ${
              percentage && percentage > 50
                ? 'text-emerald-400'
                : percentage && percentage > 20
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}
          >
            {percentage !== null ? `${percentage.toFixed(1)}%` : '--.- %'}
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500`}
            style={{ width: `${percentage || 0}%` }}
          />
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
        <Clock className="w-4 h-4" />
        <span className="font-mono">
          {timestamp ? formatTime(timestamp) : '--:--:--'}
        </span>
      </div>

      {/* Status indicator */}
      {connected && status && (
        <div className="mt-4 text-center">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              status === 'normal'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : status === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'normal'
                  ? 'bg-emerald-400'
                  : status === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
              } ${
                status === 'critical' ? 'animate-pulse' : ''
              }`}
            />
            {status === 'normal'
              ? 'Normal Operation'
              : status === 'warning'
                ? 'Low Battery Warning'
                : 'Critical Battery Level'}
          </span>
        </div>
      )}
    </div>
  );
}

export default VoltageDisplay;
