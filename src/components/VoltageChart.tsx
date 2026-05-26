import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface VoltageData {
  voltage: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
}

interface VoltageChartProps {
  history: VoltageData[];
  connected: boolean;
}

function VoltageChart({ history, connected }: VoltageChartProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const chartData = history.map((d) => ({
    ...d,
    time: formatTime(d.timestamp),
    formattedTime: new Date(d.timestamp).toLocaleTimeString(),
  }));

  const minVoltage = 19.8;
  const maxVoltage = 25.2;
  const warningVoltage = 21.0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-lg font-bold text-cyan-400">
              {data.voltage?.toFixed(2)}V
            </p>
            <p className="text-sm text-slate-300">
              Charge: {data.percentage?.toFixed(1)}%
            </p>
            <p
              className={`text-xs ${
                data.status === 'normal'
                  ? 'text-emerald-400'
                  : data.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}
            >
              Status: {data.status?.toUpperCase()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-200">Voltage History</h2>
        </div>
        {history.length > 0 && (
          <span className="text-sm text-slate-500">
            Last {history.length} readings
          </span>
        )}
      </div>

      {/* Warning Level Indicator */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <div className="flex-1">
          <span className="text-xs text-slate-400">Warning Level: </span>
          <span className="text-sm font-semibold text-amber-400">
            {warningVoltage}V (3.5V/cell)
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Min: {minVoltage}V | Max: {maxVoltage}V
        </span>
      </div>

      {/* Chart */}
      <div className="h-80">
        {connected && history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minVoltage - 0.5, maxVoltage + 0.5]}
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value) => `${value}V`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={warningVoltage}
                stroke="#fbbf24"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={minVoltage}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                y={maxVoltage}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="voltage"
                stroke="none"
                fill="url(#voltageGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="voltage"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#22d3ee',
                  stroke: '#0e7490',
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Waiting for data...</p>
              <p className="text-sm mt-2">Connect to a device to view voltage history</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Current
            </p>
            <p className="text-xl font-mono text-cyan-400">
              {history[history.length - 1]?.voltage.toFixed(2)}V
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Min
            </p>
            <p className="text-xl font-mono text-rose-400">
              {Math.min(...history.map((h) => h.voltage)).toFixed(2)}V
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Max
            </p>
            <p className="text-xl font-mono text-emerald-400">
              {Math.max(...history.map((h) => h.voltage)).toFixed(2)}V
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Average
            </p>
            <p className="text-xl font-mono text-slate-300">
              {(
                history.reduce((sum, h) => sum + h.voltage, 0) / history.length
              ).toFixed(2)}
              V
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoltageChart;
