# 🔋 Battery Monitor System - Complete Guide

A **real-time battery voltage monitoring dashboard** that displays live voltage data from a 6S LiPo battery pack connected via Arduino.

---

## 📋 What This Project Does

This is a **complete battery monitoring solution** that:
- 📊 Displays **real-time voltage** readings from your battery
- 📈 Shows **battery percentage** and **health status** (Normal/Warning/Critical)
- 📉 Tracks **voltage history** with interactive charts
- 🔌 Automatically **detects and connects** to Arduino via USB
- 🎨 Provides a **beautiful, modern dashboard** interface

**Perfect for:** LiPo battery packs, RC vehicles, drones, power systems monitoring

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | Interactive web dashboard |
| **Frontend Build** | Vite | Fast development & bundling |
| **Frontend UI** | Tailwind CSS | Modern styling |
| **Frontend Charts** | Recharts | Real-time voltage graphs |
| **Real-time** | Socket.IO | Live data streaming |
| **Backend** | Node.js + Express | Server handling |
| **Serial** | SerialPort library | Read Arduino USB data |
| **Hardware** | Arduino Leonardo | Reads battery voltage |

---

## 📁 Project Structure Explained

```
project/
│
├── 📂 backend/                    # Server code (Port 3001)
│   ├── server.js                 # Main server - handles serial & data
│   └── package.json              # Dependencies list
│
├── 📂 src/                        # Frontend React code
│   ├── App.tsx                   # Main application
│   ├── index.css                 # Global styles
│   ├── main.tsx                  # Entry point
│   │
│   ├── 📂 components/            # UI parts
│   │   ├── Header.tsx            # Top bar with status
│   │   ├── ConnectionPanel.tsx   # Port selection controls
│   │   ├── VoltageDisplay.tsx    # Large voltage number
│   │   ├── BatteryIndicator.tsx  # Battery % visual
│   │   ├── VoltageChart.tsx      # Real-time graph
│   │   └── StatusPanel.tsx       # Info panel
│   │
│   └── 📂 utils/
│       └── socketClient.ts       # Socket.IO handler
│
├── 📂 arduino/                    # Hardware code
│   └── battery_monitor.ino       # Arduino program
│
├── 🔧 Configuration Files
│   ├── vite.config.ts            # Build settings
│   ├── tsconfig.json             # TypeScript config
│   ├── package.json              # Frontend dependencies
│   ├── tailwind.config.js        # Styling settings
│   └── eslint.config.js          # Code quality
│
└── README.md                      # Original setup guide
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Upload Arduino Code

1. **Connect Arduino** to computer via USB
2. Open **Arduino IDE** → Load `arduino/battery_monitor.ino`
3. **Tools → Board → Arduino Leonardo**
4. **Tools → Port → COM3** (your port)
5. Click **Upload** (→ arrow)
6. **Tools → Serial Monitor** → Set to 9600 baud
7. You should see: `Voltage:22.5` (your actual voltage)

### Step 2: Start Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

**Expected:** `Battery Monitor Backend running on port 3001`

### Step 3: Start Frontend (Terminal 2)

```bash
npm install
npm run dev
```

**Expected:** `VITE v5.4.8 ready in ...ms → Local: http://localhost:5173`

### Step 4: Open Dashboard

1. **Browser:** http://localhost:5173
2. **Select COM port** from dropdown
3. Click **"Connect"** button
4. 📊 **Real-time data appears!**

---

## 🔌 Hardware Setup Explained

### What You Need

- Arduino Leonardo (or compatible board with USB)
- 6S LiPo Battery (22.2V nominal, 19.8-25.2V range)
- USB Cable (Computer to Arduino)
- Resistors: 100kΩ and 20kΩ
- Breadboard (optional)

### Simple Wiring Diagram

```
    Battery Pack
        │
    (+) │  (-) ← Both sides
        │   │
        ├─◀─┤
        │   │
    100kΩ 20kΩ  (Resistors divide voltage)
        │   │
        A0  GND ← Connect to Arduino
        │   │
    Arduino Leonardo
```

**What the resistors do:**
- Battery voltage (22.2V) is **too high** for Arduino (max 5V)
- **Voltage divider** reduces it to safe level (~4.2V)
- Arduino measures this safe voltage at pin A0
- Arduino calculates real battery voltage using math

### Pin Mapping

| What | Where | Notes |
|-----|-------|-------|
| Battery + | Through 100kΩ resistor | Protects Arduino |
| Voltage sensor | Arduino A0 | Analog input |
| Resistor junction | Arduino A0 | Read point |
| Battery - / GND | Arduino GND | Common ground |

---

## 📊 How Data Flows (Step by Step)

```
1. Arduino reads battery voltage every 100ms
   ↓
2. Arduino sends via USB: "Voltage:22.5"
   ↓
3. Backend receives on serial port
   ↓
4. Backend parses: voltage = 22.5
   ↓
5. Backend calculates:
   - Percentage: (22.5 - 19.8) / (25.2 - 19.8) × 100 = 75%
   - Status: if 22.5 >= 21.0 then "normal"
   ↓
6. Backend broadcasts via Socket.IO (real-time connection)
   ↓
7. Frontend receives live update
   ↓
8. Display updates:
   - Voltage number changes to "22.5V"
   - Battery bar shows "75%"
   - Color turns 🟢 Green (normal)
   - Chart adds new point
```

---

## 🎯 Each Component Explained

### Frontend Components (What You See)

| Component | Shows | Color Code |
|-----------|-------|-----------|
| **Header** | Socket connected ✅/❌ | Top right dot |
| **ConnectionPanel** | COM ports, Connect button | Left sidebar |
| **VoltageDisplay** | Large voltage number (22.5V) | Color: voltage status |
| **BatteryIndicator** | Battery percentage (75%) | Animated bar |
| **VoltageChart** | Last 100 readings | Line graph |
| **StatusPanel** | Info: readings count, port | Right panel |

### Backend API (What Happens Behind Scenes)

| Endpoint | Does What |
|----------|-----------|
| `GET /api/ports` | Lists all available COM ports |
| `POST /api/connect` | Opens USB connection to Arduino |
| `POST /api/disconnect` | Closes connection, stops data |
| `GET /api/status` | Returns current status (connected? voltage?) |
| `GET /api/debug` | Shows technical debug info |

---

## 🟢 Battery Status Colors & Meanings

| Status | Voltage | Color | What It Means | Action |
|--------|---------|-------|---------------|--------|
| **Normal** | ≥ 21.0V | 🟢 Green | Battery healthy | Keep using |
| **Warning** | 19.8-21.0V | 🟡 Amber | Battery getting low | Charge soon |
| **Critical** | < 19.8V | 🔴 Red | Battery too low | **STOP IMMEDIATELY** |

---

## 🐛 Troubleshooting Guide

### Problem: "No ports available"

**What this means:** Arduino not detected

**How to fix:**
1. Check USB cable is plugged in both ways
2. Try a different USB cable (sometimes cables fail)
3. Try a different USB port on computer
4. Restart computer
5. In Arduino IDE: **Tools → Port** - does it show your port?

### Problem: "Connection Failed"

**What this means:** Backend can't open serial port

**How to fix:**
1. Check Arduino code uploaded successfully
2. Open Arduino IDE Serial Monitor (9600 baud)
3. Do you see `Voltage:XX.X`? Yes = Good, No = Re-upload code
4. Make sure nobody else has the port open
5. Restart Arduino IDE

### Problem: "Backend won't start - EADDRINUSE"

**What this means:** Port 3001 already in use

**How to fix:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Try again
npm run dev
```

### Problem: "Frontend shows port 5174 or 5175"

**What this means:** Normal! Vite finds next available port

**It's fine:**
- Port 5173 is busy (maybe from old run)
- Vite automatically uses 5174, 5175, etc.
- Just use whatever port Vite shows
- Next time you restart, it might use 5173 again

### Problem: "Data not updating on screen"

**What this means:** Frontend not receiving data

**How to fix:**
1. **Check browser console:**
   - Press **F12** on keyboard
   - Look for red error messages
   - Screenshot and check what it says
2. **Check if backend is running:**
   - Terminal should show: `Battery Monitor Backend running on port 3001`
   - If not, start it
3. **Check Arduino serial connection:**
   - Open Arduino IDE Serial Monitor
   - Should show `Voltage:XX.X` every 100ms
4. **Try disconnecting and reconnecting:**
   - Click "Disconnect" button
   - Click "Connect" again

---

## 🔧 Advanced Configuration

### Change Backend Port

**File:** `backend/server.js` (line ~275)

```javascript
const startPort = process.env.PORT || 3001;  // Change 3001 to 3500
```

### Change Battery Voltage Ranges

**File:** `backend/server.js` (line ~26)

```javascript
const BATTERY_CONFIG = {
  minVoltage: 19.8,      // Absolute minimum (no more power)
  maxVoltage: 25.2,      // Absolute maximum (fully charged)
  warningVoltage: 21.0,  // When to show warning (should charge)
};
```

**For different battery:**
- 4S LiPo: min=13.2, max=16.8, warning=14.0
- 3S LiPo: min=9.9, max=12.6, warning=10.5

### Change Serial Baud Rate

**File:** `arduino/battery_monitor.ino` (line ~11)

```cpp
const unsigned long SEND_INTERVAL = 100; // Send every 100ms (100 = faster, 500 = slower)
```

Then in frontend: Use dropdown in Connection Panel to select same baud rate

---

## 📦 What Each Dependency Does

### Backend Dependencies (Node.js)

```
express        → Web server (handles /api/ports, /api/connect, etc.)
socket.io      → Real-time communication (live voltage updates)
serialport     → Read USB data from Arduino
cors           → Allow frontend to talk to backend
```

### Frontend Dependencies (React)

```
react          → Website framework
react-dom      → Display React in browser
socket.io-client → Connect to backend for live data
recharts       → Draw charts (voltage history graph)
tailwindcss    → Beautiful styling (colors, layout)
lucide-react   → Icons (plug icon, battery icon, etc.)
typescript     → Write safe JavaScript code
vite           → Build fast website
```

---

## 📝 File Guide - What Each File Does

| File Name | Language | What It Does |
|-----------|----------|-------------|
| `backend/server.js` | JavaScript | Main backend server - listens for Arduino data, broadcasts to frontend |
| `backend/package.json` | JSON | Lists what packages backend needs |
| `src/App.tsx` | TypeScript+React | Main dashboard - organizes all components |
| `src/components/Header.tsx` | TypeScript+React | Top bar showing connection status |
| `src/components/ConnectionPanel.tsx` | TypeScript+React | Left sidebar - select port & connect |
| `src/components/VoltageDisplay.tsx` | TypeScript+React | Large voltage number with color |
| `src/components/BatteryIndicator.tsx` | TypeScript+React | Battery percentage bar visual |
| `src/components/VoltageChart.tsx` | TypeScript+React | Line graph of voltage history |
| `src/components/StatusPanel.tsx` | TypeScript+React | Info panel - shows status |
| `src/utils/socketClient.ts` | TypeScript | Connects to backend via Socket.IO |
| `src/index.css` | CSS | Global styling |
| `arduino/battery_monitor.ino` | C/Arduino | Reads battery, sends "Voltage:XX.X" to USB |
| `vite.config.ts` | TypeScript | How to build frontend |
| `tailwind.config.js` | JavaScript | Styling settings (colors, spacing) |
| `tsconfig.json` | JSON | TypeScript settings |
| `package.json` | JSON | Frontend dependencies list |

---

## 🎓 How to Understand This Code

### If You're New to Programming:

1. **Start with:** Arduino code (`battery_monitor.ino`)
   - Simple: read voltage, print it, repeat
   - Good basics: variables, functions, loops

2. **Then:** Backend server (`backend/server.js`)
   - JavaScript instead of C
   - Same concepts: listen for data, process it, send it

3. **Finally:** Frontend React (`src/App.tsx`)
   - How to display data on a website
   - How to handle clicks (connect button)
   - How to update display live

### Key Concepts to Learn:

**JavaScript/TypeScript:**
- Variables (`let x = 22.5`)
- Functions (`function calcPercent(voltage) {}`)
- Objects (`{ voltage: 22.5, status: "normal" }`)
- Async/Await (waiting for data)

**React:**
- Components (reusable pieces of website)
- Hooks like `useState` (remember data)
- Hooks like `useEffect` (run code when things happen)

**Arduino:**
- Analog reading (`analogRead(A0)`)
- Serial communication (`Serial.println()`)
- Loops (`while` or `loop()`)

**Hardware:**
- Voltage divider math
- Serial port communication
- USB data transfer

---

## 💡 Tips & Best Practices

### Battery Care:
1. **Always charge safely** - Don't let drop below 19.8V
2. **Store at 3.8V/cell** - When not using for weeks
3. **Charge slowly** - 1C rate is safest (1C = battery capacity in amps)
4. **Balance charge** - Use balance charger for multi-cell packs
5. **Keep cool** - Over 60°C damages batteries

### Monitoring:
1. **Check daily** - Makes problems obvious early
2. **Note trends** - Voltage dropping faster? Battery aging
3. **Monitor temperature** - Hot battery = bad
4. **Stop if voltage dips fast** - Possible short circuit

### Development:
1. **Read the code** - Comments explain what happens
2. **Use console.log()** - In backend, see `console.log()` in terminal
3. **Use F12 console** - In frontend, see `console.log()` in browser
4. **Search for errors** - Errors always have messages
5. **Try small changes** - Change one thing, see what happens

---

## 🚦 Status Indicator Meanings

### Top Right Dot (Socket Connection)

| Color | Means | Fix |
|-------|-------|-----|
| 🟢 Green | Frontend connected to backend | ✅ All good |
| 🔴 Red | Frontend can't reach backend | Backend not running? Check port |

### Left Panel Dot (Serial Connection)

| Color | Means | Fix |
|-------|-------|-----|
| 🟢 Green | Arduino connected & streaming | ✅ All good |
| 🔴 Red | Arduino not connected | Check USB cable, COM port |

---

## 🤝 Common Questions

**Q: How often does it update?**
A: Every 100ms (10 times per second) when connected

**Q: Can I use different Arduino?**
A: Yes! Any Arduino with USB and analog pin works. Update baud rate if needed.

**Q: Can I monitor multiple batteries?**
A: Yes! Run multiple instances on different COM ports, different ports, or modify code

**Q: How long does data stay?**
A: Last 100 readings (~10 seconds at 100ms interval). Then oldest is removed.

**Q: Can I export data?**
A: Currently no, but data is in browser memory. You could add export button.

**Q: Does it work on phone?**
A: No, needs browser on same computer (WebUSB not supported yet)

---

## ⚡ Quick Command Reference

```bash
# Start backend
cd backend && npm run dev

# Start frontend
npm run dev

# Kill all Node processes
taskkill /F /IM node.exe

# Check if port is in use
netstat -ano | findstr :3001

# Check if Arduino is connected
# (Arduino IDE → Tools → Port)

# View backend logs
# (See output in terminal)

# View frontend errors
# (Browser F12 → Console tab)
```

---

## 🎨 Customization Ideas

- Change colors (Tailwind CSS)
- Add alarms (beep when low voltage)
- Export data to CSV
- Add multiple battery tracking
- Send alerts to phone
- Dark/Light mode toggle
- History storage (database)

---

## 📄 License

This project is free to use for personal and educational purposes.

---

**Made with ❤️ for battery enthusiasts!**

*Last Updated: May 27, 2026*