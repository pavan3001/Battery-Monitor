import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow all localhost origins (for Vite port variations)
      if (!origin || origin.match(/^http:\/\/localhost(:\d+)?$/)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

let serialPort = null;
let parser = null;
let isConnected = false;
let voltageHistory = [];
const MAX_HISTORY = 100;

// 6S battery pack voltage ranges
const BATTERY_CONFIG = {
  minVoltage: 19.8,    // 3.3V per cell (low)
  maxVoltage: 25.2,    // 4.2V per cell (full)
  warningVoltage: 21.0, // 3.5V per cell (warning)
};

// Get available COM ports
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      pnpId: port.pnpId,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to serial port
app.post('/api/connect', async (req, res) => {
  const { portPath, baudRate = 9600 } = req.body;

  if (isConnected) {
    return res.status(400).json({ error: 'Already connected to a port' });
  }

  try {
    serialPort = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false,
      // Enable hardware handshaking for more reliable data
      rtscts: true,
      dtr: true,
      dsr: true,
    });

    await new Promise((resolve, reject) => {
      serialPort.open((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    console.log(`\n=== Serial Connection Established ===`);
    console.log(`Port: ${portPath}`);
    console.log(`Baud Rate: ${baudRate}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`===================================\n`);

    parser.on('data', (data) => {
      try {
        const voltage = parseVoltage(data);
        if (voltage !== null && !isNaN(voltage) && voltage > 0) {
          const timestamp = Date.now();
          const percentage = calculatePercentage(voltage);
          const status = getBatteryStatus(voltage);

          voltageHistory.push({ voltage, timestamp, percentage, status });
          if (voltageHistory.length > MAX_HISTORY) {
            voltageHistory.shift();
          }

          // Emit to all connected clients
          io.emit('voltage-data', {
            voltage,
            percentage,
            status, 
            timestamp,
            history: voltageHistory,
          });

          console.log(`[${new Date().toISOString()}] Voltage: ${voltage}V, Status: ${status}`);
        }
      } catch (err) {
        console.error('Error processing data:', err.message, 'Data:', data);
      }
    });

    serialPort.on('error', (err) => {
      console.error('Serial port error:', err);
      isConnected = false;
      io.emit('connection-status', {
        connected: false,
        error: err.message,
      });
      
      // Attempt to reconnect after 2 seconds
      setTimeout(() => {
        if (!isConnected && serialPort) {
          console.log('Attempting to reconnect...');
          try {
            serialPort.open((openErr) => {
              if (openErr) {
                console.error('Reconnection failed:', openErr.message);
              } else {
                console.log('Reconnected successfully');
                isConnected = true;
              }
            });
          } catch (reconnectErr) {
            console.error('Reconnect error:', reconnectErr.message);
          }
        }
      }, 2000);
    });

    serialPort.on('close', () => {
      console.log('Serial port closed');
      isConnected = false;
      io.emit('connection-status', {
        connected: false,
        error: 'Connection closed',
      });
    });

    isConnected = true;
    res.json({ success: true, message: `Connected to ${portPath}` });
    io.emit('connection-status', { connected: true });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect from serial port
app.post('/api/disconnect', async (req, res) => {
  if (!isConnected || !serialPort) {
    return res.status(400).json({ error: 'Not connected' });
  }

  try {
    await new Promise((resolve, reject) => {
      serialPort.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    serialPort = null;
    parser = null;
    isConnected = false;
    voltageHistory = [];

    res.json({ success: true, message: 'Disconnected' });
    io.emit('connection-status', { connected: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse voltage from serial data (supports multiple formats)
function parseVoltage(data) {
  try {
    const str = data.toString().trim();
    
    // Format: "Voltage:24.5" or "Voltage: 24.5"
    let match = str.match(/Voltage:\s*(\d+\.?\d*)/i);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    // Format: "24.5V" or "24.5"
    match = str.match(/^(\d+\.?\d*)\s*V?$/);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    // Format: "V:24.5" or "V: 24.5"
    match = str.match(/V:\s*(\d+\.?\d*)/i);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    // Last resort: extract first number
    match = str.match(/(\d+\.?\d*)/);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      // Validate it's a reasonable voltage (10V - 30V for battery packs)
      if (val >= 10 && val <= 30) {
        return val;
      }
    }
    
    return null;
  } catch (err) {
    console.error('Parse voltage error:', err.message);
    return null;
  }
}

// Calculate battery percentage based on voltage
function calculatePercentage(voltage) {
  const { minVoltage, maxVoltage } = BATTERY_CONFIG;
  const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
  return Math.max(0, Math.min(100, percentage));
}

// Determine battery status
function getBatteryStatus(voltage) {
  const { minVoltage, maxVoltage, warningVoltage } = BATTERY_CONFIG;

  if (voltage >= warningVoltage) {
    return 'normal';
  } else if (voltage >= minVoltage) {
    return 'warning';
  } else {
    return 'critical';
  }
}

// Get current connection status
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    currentPort: serialPort?.path || null,
    historyLength: voltageHistory.length,
    lastVoltage: voltageHistory.length > 0 ? voltageHistory[voltageHistory.length - 1].voltage : null,
    lastUpdate: voltageHistory.length > 0 ? voltageHistory[voltageHistory.length - 1].timestamp : null,
  });
});

// Add endpoint for debug info
app.get('/api/debug', (req, res) => {
  res.json({
    isConnected,
    serialPortPath: serialPort?.path || null,
    serialPortOpen: serialPort?.isOpen || false,
    voltageHistoryCount: voltageHistory.length,
    batteryConfig: BATTERY_CONFIG,
    connectedClients: io.engine.clientsCount,
  });
});

const startPort = process.env.PORT || 3001;
let currentPort = startPort;
let isListening = false;

function tryListen(port) {
  if (isListening) {
    console.log(`Already listening on a port, skipping port ${port}`);
    return;
  }

  httpServer.listen(port, () => {
    isListening = true;
    console.log(`Battery Monitor Backend running on port ${port}`);
  });
}

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    if (currentPort < startPort + 5) {
      // Try only next 5 ports
      currentPort++;
      console.log(`Port ${currentPort - 1} is in use, trying ${currentPort}...`);
      setTimeout(() => tryListen(currentPort), 300);
    } else {
      console.error(`Could not find an available port between ${startPort} and ${currentPort}`);
      process.exit(1);
    }
  } else {
    console.error('Server error:', err);
    throw err;
  }
});

tryListen(currentPort);
