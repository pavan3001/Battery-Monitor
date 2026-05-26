# Battery Monitor - Complete Setup Guide

This guide walks you through setting up and running the complete battery monitoring system.

## Quick Start

### 1. Arduino Setup (Required First)

1. Open `arduino/battery_monitor.ino` in Arduino IDE
2. Select Board: **Tools → Board → Arduino Leonardo**
3. Select Port: **Tools → Port → [Your COM Port]**
4. Click **Upload** ⬆️
5. Verify in **Tools → Serial Monitor** (9600 baud):
   - Should display: `"Voltage:XX.XX"`

### 2. Backend Server (Terminal 1)

```bash
cd backend
npm install
npm start
```

Expected output:
```
Battery Monitor Backend running on port 3001
```

### 3. Frontend Dashboard (Terminal 2)

```bash
npm install
npm run dev
```

Expected output:
```
Local: http://localhost:5173
```

### 4. Open Dashboard

Open browser to: **http://localhost:5173**

### 5. Connect Arduino

1. Select COM port from dropdown
2. Click "Connect"
3. Wait for data to stream in

## Hardware Connections

### Voltage Divider Circuit

```
Battery (+) ──┬── R1 (100kΩ) ──┬── GND
              │                 │
              │          A0 ──→ Arduino
              │                 │
              └───── R2 (20kΩ) ─┴──→ GND
```

### Pin Mapping

| Component | Arduino Pin | Notes |
|-----------|-------------|-------|
| Battery + | R1 Input | Through 100kΩ resistor |
| Battery - | GND | Common ground |
| Voltage Divider | A0 | Analog input |

## Directory Structure

```
project/
├── backend/                 # Node.js server
│   ├── server.js           # Main server file
│   └── package.json
├── src/                    # React frontend
│   ├── App.tsx            # Main app
│   ├── components/        # UI components
│   ├── utils/
│   │   └── socketClient.ts # Socket.IO client
│   └── index.css
├── arduino/               # Arduino code
│   └── battery_monitor.ino
├── dist/                  # Build output
├── vite.config.ts        # Vite configuration
└── README.md
```

## Troubleshooting

### Build Errors

If you see import errors, run:
```bash
npm install
npm run build
```

### Connection Issues

1. **No COM ports showing**
   - Check Arduino USB connection
   - Try different USB port on PC
   - Install CH340 driver if needed

2. **"Connection failed" error**
   - Stop any Serial Monitor windows
   - Restart backend server
   - Check Arduino is powered

3. **No voltage data appearing**
   - Verify Arduino sketch uploaded successfully
   - Check voltage divider circuit connections
   - Open Serial Monitor to see raw data

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

## Testing Checklist

- [ ] Arduino uploads successfully
- [ ] Serial Monitor shows voltage data
- [ ] Backend server starts on port 3001
- [ ] Frontend runs on localhost:5173
- [ ] Can select COM port from dropdown
- [ ] Connect button works
- [ ] Voltage displays in real-time
- [ ] Chart updates with history
- [ ] Status indicator changes color

## Performance Tips

- Keep browser developer tools closed for better performance
- Don't open Serial Monitor while dashboard is connected
- Restart backend if Socket.IO connection drops

## Build for Production

```bash
npm run build
```

Output files in `dist/` directory. Deploy the entire `dist` folder to your web server.

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main React component, handles state |
| `src/utils/socketClient.ts` | Socket.IO connection management |
| `src/components/VoltageChart.tsx` | Real-time graph display |
| `backend/server.js` | Express server & serial communication |
| `arduino/battery_monitor.ino` | Arduino firmware |

## API Endpoints

### Connecting to Arduino
```bash
POST http://localhost:3001/api/connect
Body: {"portPath": "COM3", "baudRate": 9600}
```

### Disconnecting
```bash
POST http://localhost:3001/api/disconnect
```

### List Available Ports
```bash
GET http://localhost:3001/api/ports
```

## Socket.IO Events

**Server → Client:**
- `voltage-data`: {voltage, percentage, status, timestamp, history}
- `connection-status`: {connected, error}

## Need Help?

1. Check Arduino Serial Monitor output
2. Check backend console for errors
3. Check browser console (F12)
4. Verify all connections
5. Try restarting backend server

## Safety Reminders

⚠️ LiPo batteries can be dangerous if mishandled:
- Never discharge below 3.0V per cell (18V for 6S)
- Use proper charging equipment
- Store in safe location
- Never short circuit terminals
