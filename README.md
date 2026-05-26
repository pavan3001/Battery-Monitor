# Real-Time Battery Monitoring Dashboard

A professional industrial-grade battery monitoring system for Arduino Leonardo and 6S battery packs with real-time web visualization.

## Overview

This dashboard provides real-time monitoring of your 6S battery pack with:
- Live voltage display with millisecond precision
- Animated battery status indicator
- Historical voltage graph
- Connection status monitoring
- Low battery warnings
- Industrial telemetry interface

## System Architecture

```
┌─────────────────┐      Serial       ┌──────────────┐      WebSocket      ┌─────────────┐
│                 │   Voltage:24.5    │              │    Real-time Data    │             │
│  Arduino USB    │ ───────────────> │  Node.js     │ ──────────────────>  │  React.js   │
│  Leonardo       │                   │  Backend     │                      │  Frontend   │
│                 │                   │              │                      │             │
└─────────────────┘                   └──────────────┘                      └─────────────┘
     Hardware                              Server                                Dashboard
```

## Project Structure

```
.
├── backend/                    # Node.js backend server
│   ├── server.js              # Express server with Socket.IO & SerialPort
│   └── package.json           # Backend dependencies
├── src/                       # React frontend
│   ├── App.tsx               # Main application component
│   └── components/           # UI components
│       ├── Header.tsx
│       ├── ConnectionPanel.tsx
│       ├── VoltageDisplay.tsx
│       ├── BatteryIndicator.tsx
│       ├── VoltageChart.tsx
│       └── StatusPanel.tsx
├── arduino/                   # Arduino code
│   └── battery_monitor.ino   # Arduino sketch
├── package.json               # Frontend dependencies
└── README.md
```

## Hardware Setup

### Components Required
- Arduino Leonardo (or other Arduino with USB serial support)
- 6S LiPo Battery Pack (22.2V nominal)
- Resistors for voltage divider:
  - 100kΩ resistor (R1)
  - 20kΩ resistor (R2)
- USB cable (Arduino to PC)

### Circuit Diagram

```
Battery (+) ──┬── R1 (100kΩ) ──┬── GND (Arduino)
              │                 │
              │                 ├── A0 (Arduino)
              │                 │
              └─────────────────┴── R2 (20kΩ) ──┐
                                                │
                                          Battery (-)

Voltage Divider Formula:
V_out = V_battery × (R2 / (R1 + R2))
For R1=100kΩ, R2=20kΩ:
V_out = V_battery × 0.1667
Max input 25.2V → ADC input 4.2V (safe for 5V systems)
```

### Wiring Instructions

1. **Power Connection**:
   - Connect battery POSITIVE to R1 (100kΩ resistor)
   - Connect battery NEGATIVE to Arduino GND

2. **Voltage Divider**:
   - Connect R1 (100kΩ) between battery positive and junction point
   - Connect R2 (20kΩ) between junction point and ground
   - Junction point connects to Arduino A0

3. **Arduino Connection**:
   - Connect junction point to analog pin A0
   - Ensure battery ground connects to Arduino GND
   - Connect Arduino to PC via USB

## Software Installation

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Arduino IDE (or PlatformIO)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Server will run on http://localhost:3001
```

### Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev

# Dashboard will run on http://localhost:5173
```

### Arduino Setup

1. Open `arduino/battery_monitor.ino` in Arduino IDE
2. Select your Arduino board (Tools → Board → Arduino Leonardo)
3. Select the correct COM port (Tools → Port)
4. Adjust resistor values in code if using different divider
5. Upload the sketch to Arduino
6. Open Serial Monitor (Tools → Serial Monitor) to verify output
   - Set baud rate to 9600
   - You should see: "Voltage:XX.XX"

## Usage

### Starting the System

1. Connect Arduino to PC via USB
2. Start the backend server:
   ```bash
   cd backend && npm start
   ```
3. Start the frontend (in a new terminal):
   ```bash
   npm run dev
   ```
4. Open browser to http://localhost:5173

### Connecting to Arduino

1. Open the dashboard in your browser
2. Select the COM port from the dropdown
3. Click "Connect"
4. Voltage data will start streaming in real-time

### Dashboard Features

- **Live Voltage Display**: Large real-time voltage reading
- **Battery Percentage**: Visual charge level indicator
- **Status Indicator**: Green/Yellow/Red status based on voltage
- **Historical Graph**: Rolling 100-point voltage history
- **Connection Controls**: COM port selection and connect/disconnect
- **Statistics**: Min/Max/Average voltage, session duration

## Battery Voltage Ranges (6S Pack)

| Status | Voltage Range | Per Cell | Indicator |
|--------|---------------|----------|-----------|
| Normal | 21.0V - 25.2V | 3.5V - 4.2V | Green |
| Warning | 19.8V - 21.0V | 3.3V - 3.5V | Yellow |
| Critical | < 19.8V | < 3.3V | Red |

## Configuration

### Backend Configuration (server.js)

```javascript
const BATTERY_CONFIG = {
  minVoltage: 19.8,      // Minimum safe voltage
  maxVoltage: 25.2,      // Maximum voltage (full charge)
  warningVoltage: 21.0,  // Warning threshold
};

const MAX_HISTORY = 100; // Number of data points to store
```

### Arduino Configuration (battery_monitor.ino)

```cpp
// Voltage divider resistors
const float R1 = 100000.0;  // 100kΩ
const float R2 = 20000.0;   // 20kΩ

// Calibration (adjust if needed)
const float CALIBRATION_FACTOR = 1.0;

// Data sending interval
const unsigned long SEND_INTERVAL = 100; // milliseconds
```

## Calibration

If voltage readings are inaccurate:

1. Use a multimeter to measure actual battery voltage
2. Compare with dashboard reading
3. Adjust `CALIBRATION_FACTOR` in Arduino code:
   ```cpp
   const float CALIBRATION_FACTOR = actualVoltage / displayedVoltage;
   ```
4. Re-upload Arduino sketch

## Troubleshooting

### No COM Ports Available
- Check Arduino USB connection
- Try a different USB port
- Check if Arduino drivers are installed
- Restart the backend server

### Connection Failed
- Port may be in use by another application
- Close Arduino Serial Monitor
- Disconnect and reconnect Arduino USB

### Voltage Readings Are Wrong
- Verify voltage divider circuit
- Check resistor values in Arduino code match your circuit
- Apply calibration factor

### No Data Streaming
- Verify Arduino is sending "Voltage:XX.XX" format
- Check baud rate matches (default: 9600)
- Look at backend console for error messages

## API Endpoints

### Backend REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ports` | GET | List available COM ports |
| `/api/connect` | POST | Connect to specified port |
| `/api/disconnect` | POST | Disconnect from current port |
| `/api/status` | GET | Get connection status |

### Socket.IO Events

| Event | Direction | Data |
|-------|-----------|------|
| `voltage-data` | Server → Client | `{ voltage, percentage, status, timestamp, history }` |
| `connection-status` | Server → Client | `{ connected: boolean, error?: string }` |

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, serialport
- **Hardware**: Arduino Leonardo, 6S LiPo Battery

## Safety Notes

⚠️ **Important Safety Warnings**

- **High Voltage**: LiPo batteries can deliver high currents. Handle with care.
- **Short Circuit Protection**: Always use proper fuses and protection circuits.
- **Fire Hazard**: Monitor batteries during charging and discharging. Use LiPo-safe bags.
- **Proper Disposal**: Recycle LiPo batteries properly. Do not incinerate.
- **Voltage Limits**: Never exceed rated voltage limits. Overcharging can cause fire.

## License

MIT License - Use at your own risk.

## Contributing

Feel free to submit issues and pull requests to improve this project.

## Support

For issues and questions, please open a GitHub issue.
#   B a t t e r y - M o n i t o r  
 