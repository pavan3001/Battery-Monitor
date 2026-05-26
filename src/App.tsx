import { useState, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { initializeSocket, closeSocket } from './utils/socketClient';
import Header from './components/Header';
import ConnectionPanel from './components/ConnectionPanel';
import VoltageDisplay from './components/VoltageDisplay';
import BatteryIndicator from './components/BatteryIndicator';
import VoltageChart from './components/VoltageChart';
import StatusPanel from './components/StatusPanel';

const BACKEND_URL = 'http://localhost:3001';

interface VoltageData {
  voltage: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
}

interface PortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);
  const [portList, setPortList] = useState<PortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [currentData, setCurrentData] = useState<VoltageData | null>(null);
  const [voltageHistory, setVoltageHistory] = useState<VoltageData[]>([]);
  const [connectionError, setConnectionError] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(9600);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = initializeSocket();

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('voltage-data', (data: any) => {
      const voltageData: VoltageData = {
        voltage: data.voltage,
        percentage: data.percentage,
        status: data.status,
        timestamp: data.timestamp,
      };
      setCurrentData(voltageData);
      setVoltageHistory(data.history || []);
    });

    newSocket.on('connection-status', (data: { connected: boolean; error?: string }) => {
      setSerialConnected(data.connected);
      if (data.error) {
        setConnectionError(data.error);
      } else {
        setConnectionError('');
      }
    });

    setSocket(newSocket);

    return () => {
      closeSocket();
    };
  }, []);

  // Fetch available ports
  const fetchPorts = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ports`);
      const ports = await response.json();
      setPortList(ports);
      if (ports.length > 0 && !selectedPort) {
        setSelectedPort(ports[0].path);
      }
    } catch (error) {
      console.error('Failed to fetch ports:', error);
    }
  }, [selectedPort]);

  useEffect(() => {
    fetchPorts();
    const interval = setInterval(fetchPorts, 5000);
    return () => clearInterval(interval);
  }, [fetchPorts]);

  const handleConnect = async () => {
    if (!selectedPort) return;
    setConnectionError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portPath: selectedPort, baudRate }),
      });

      const data = await response.json();
      if (!response.ok) {
        setConnectionError(data.error);
      }
    } catch (error: any) {
      setConnectionError(error.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/disconnect`, {
        method: 'POST',
      });
      setCurrentData(null);
      setVoltageHistory([]);
    } catch (error: any) {
      setConnectionError(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'critical':
        return 'text-rose-500';
      default:
        return 'text-gray-400';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage > 50) return 'text-emerald-400';
    if (percentage > 20) return 'text-amber-400';
    return 'text-rose-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header isConnected={isConnected} />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Connection Controls */}
            <div className="lg:col-span-1">
              <ConnectionPanel
                portList={portList}
                selectedPort={selectedPort}
                setSelectedPort={setSelectedPort}
                baudRate={baudRate}
                setBaudRate={setBaudRate}
                serialConnected={serialConnected}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                connectionError={connectionError}
                onRefreshPorts={fetchPorts}
              />
            </div>

            {/* Right Panel - Status */}
            <div className="lg:col-span-2">
              <StatusPanel
                currentData={currentData}
                voltageHistory={voltageHistory}
                serialConnected={serialConnected}
              />
            </div>
          </div>

          {/* Main Display Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Voltage Display */}
            <div className="lg:col-span-1">
              <VoltageDisplay
                voltage={currentData?.voltage || null}
                percentage={currentData?.percentage || null}
                status={currentData?.status || null}
                timestamp={currentData?.timestamp || null}
                connected={serialConnected}
              />
            </div>

            {/* Battery Indicator */}
            <div className="lg:col-span-2">
              <BatteryIndicator
                percentage={currentData?.percentage || null}
                status={currentData?.status || null}
                voltage={currentData?.voltage || null}
                connected={serialConnected}
              />
            </div>
          </div>

          {/* Voltage Chart */}
          <div className="mt-6">
            <VoltageChart history={voltageHistory} connected={serialConnected} />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          {/* Status Indicators */}
          <div className="p-4 text-center text-slate-500 text-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>Socket: {isConnected ? 'Connected' : 'Disconnected'}</span>
              <span className="mx-3">|</span>
              <div className={`w-2 h-2 rounded-full ${serialConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>Serial: {serialConnected ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          
          {/* Credit Line */}
          <div className="py-2 px-4 text-center text-slate-600 text-xs border-t border-slate-800/50 bg-slate-900/30">
            Made with ❤️   by <span className="text-slate-400 font-semibold">Pavan Kumar Kolipakula</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
