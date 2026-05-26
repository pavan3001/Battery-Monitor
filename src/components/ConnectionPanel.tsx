import { useState, useEffect } from 'react';
import { Usb, RefreshCw, Plug, PlugZap } from 'lucide-react';

interface PortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
}

interface ConnectionPanelProps {
  portList: PortInfo[];
  selectedPort: string;
  setSelectedPort: (port: string) => void;
  baudRate: number;
  setBaudRate: (rate: number) => void;
  serialConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connectionError: string;
  onRefreshPorts: () => void;
}

function ConnectionPanel({
  portList,
  selectedPort,
  setSelectedPort,
  baudRate,
  setBaudRate,
  serialConnected,
  onConnect,
  onDisconnect,
  connectionError,
  onRefreshPorts,
}: ConnectionPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshPorts();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <Usb className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-slate-200">Connection Settings</h2>
      </div>

      {/* Port Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            COM Port
          </label>
          <div className="flex gap-2">
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              disabled={serialConnected}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
            >
              {portList.length === 0 ? (
                <option value="">No ports available</option>
              ) : (
                <>
                  <option value="">Select a port...</option>
                  {portList.map((port) => (
                    <option key={port.path} value={port.path}>
                      {port.path}
                      {port.manufacturer ? ` - ${port.manufacturer}` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            <button
              onClick={handleRefresh}
              disabled={serialConnected || isRefreshing}
              className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-slate-300 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Baud Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Baud Rate
          </label>
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(parseInt(e.target.value))}
            disabled={serialConnected}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
          >
            <option value={9600}>9600</option>
            <option value={19200}>19200</option>
            <option value={38400}>38400</option>
            <option value={57600}>57600</option>
            <option value={115200}>115200</option>
          </select>
        </div>

        {/* Connect/Disconnect Button */}
        <button
          onClick={serialConnected ? onDisconnect : onConnect}
          disabled={!serialConnected && !selectedPort}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            serialConnected
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {serialConnected ? (
            <>
              <PlugZap className="w-5 h-5" />
              Disconnect
            </>
          ) : (
            <>
              <Plug className="w-5 h-5" />
              Connect
            </>
          )}
        </button>

        {/* Connection Status */}
        {connectionError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
            <p className="text-sm text-rose-400">{connectionError}</p>
          </div>
        )}

        {serialConnected && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-sm text-emerald-400">
                Connected to {selectedPort}
              </p>
            </div>
          </div>
        )}

        {/* Port Info */}
        {portList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
              Available Ports
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {portList.map((port) => (
                <div
                  key={port.path}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    selectedPort === port.path
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}
                >
                  <span className="text-sm text-slate-300 font-mono">
                    {port.path}
                  </span>
                  {selectedPort === port.path && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionPanel;
