interface BatteryIndicatorProps {
  percentage: number | null;
  status: 'normal' | 'warning' | 'critical' | null;
  voltage: number | null;
  connected: boolean;
}

function BatteryIndicator({
  percentage,
  status,
  voltage,
  connected,
}: BatteryIndicatorProps) {
  const segments = 10;
  const filledSegments = percentage ? Math.round((percentage / 100) * segments) : 0;

  const getStatusColor = (index: number) => {
    if (!connected || !percentage) {
      return 'bg-slate-700';
    }

    if (index > filledSegments - 1) {
      return 'bg-slate-700';
    }

    switch (status) {
      case 'normal':
        return 'bg-emerald-400';
      case 'warning':
        return 'bg-amber-400';
      case 'critical':
        return 'bg-rose-500';
      default:
        return 'bg-slate-600';
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case 'normal':
        return 'shadow-[0_0_40px_rgba(52,211,153,0.3)]';
      case 'warning':
        return 'shadow-[0_0_40px_rgba(251,191,36,0.3)]';
      case 'critical':
        return 'shadow-[0_0_40px_rgba(239,68,68,0.3)]';
      default:
        return '';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'normal':
        return 'border-emerald-500/50';
      case 'warning':
        return 'border-amber-500/50';
      case 'critical':
        return 'border-rose-500/50';
      default:
        return 'border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
        </svg>
        <h2 className="text-lg font-semibold text-slate-200">Battery Status</h2>
      </div>

      {/* Large Battery Visual */}
      <div className="flex items-center justify-center py-6">
        <div className={`relative transition-all duration-500 ${getGlowColor()}`}>
          {/* Battery Body */}
          <div className={`relative w-64 h-36 rounded-2xl border-4 ${getBorderColor()} bg-slate-900 overflow-hidden`}>
            {/* Battery Fill */}
            {connected && percentage !== null ? (
              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                  status === 'normal'
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    : status === 'warning'
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                      : 'bg-gradient-to-t from-rose-500 to-rose-400'
                }`}
                style={{ height: `${percentage}%` }}
              >
                {/* Animated waves */}
                {status !== 'critical' && (
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent animate-pulse" />
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <span className="text-slate-600 text-lg">No Data</span>
              </div>
            )}

            {/* Segments overlay */}
            <div className="absolute inset-0 flex flex-col justify-evenly px-2 py-2">
              {[...Array(segments)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded transition-all duration-300 ${
                    i >= segments - filledSegments
                      ? 'bg-transparent'
                      : 'bg-slate-900/40'
                  }`}
                />
              ))}
            </div>

            {/* Percentage overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${
                connected && percentage !== null
                  ? status === 'normal'
                    ? 'text-white'
                    : 'text-slate-900'
                  : 'text-slate-600'
              }`}>
                {connected && percentage !== null ? `${percentage.toFixed(0)}%` : '--%'}
              </span>
            </div>
          </div>

          {/* Battery Terminal */}
          <div
            className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 rounded-r-lg border-2 border-l-0 ${getBorderColor()} bg-slate-800`}
          />
        </div>
      </div>

      {/* Status Segments */}
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
        <div className="flex gap-1">
          {[...Array(segments)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded transition-all duration-300 ${getStatusColor(i)} ${
                i >= segments - filledSegments && connected && percentage !== null
                  ? 'animate-pulse'
                  : ''
              }`}
              style={{
                animationDelay: `${i * 50}ms`,
                animationDuration: status === 'critical' ? '500ms' : '2s',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Voltage and Status Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Cell Voltage
          </p>
          <p className="text-2xl font-mono text-slate-200">
            {connected && voltage !== null
              ? (voltage / 6).toFixed(2)
              : '--.-'}{' '}
            <span className="text-sm text-slate-500">V/cell</span>
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Status
          </p>
          <p
            className={`text-lg font-semibold ${
              status === 'normal'
                ? 'text-emerald-400'
                : status === 'warning'
                  ? 'text-amber-400'
                  : status === 'critical'
                    ? 'text-rose-400'
                    : 'text-slate-500'
            }`}
          >
            {connected && status
              ? status === 'normal'
                ? 'Normal'
                : status === 'warning'
                  ? 'Warning'
                  : 'Critical'
              : 'Offline'}
          </p>
        </div>
      </div>

      {/* Warning Message */}
      {connected && status === 'critical' && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 animate-pulse">
          <p className="text-sm text-rose-400 text-center font-medium">
            Battery level critical! Please recharge immediately.
          </p>
        </div>
      )}
    </div>
  );
}

export default BatteryIndicator;
