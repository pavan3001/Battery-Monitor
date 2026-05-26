/*
 * Battery Voltage Monitor - Arduino Leonardo
 *
 * Reads battery voltage from analog pin and sends data via serial.
 * Designed for 6S battery pack (22.2V nominal, 19.8V-25.2V range)
 *
 * Hardware:
 * - Arduino Leonardo
 * - Voltage divider circuit on A0
 * - 6S LiPo battery pack
 *
 * Serial Output Format: "Voltage:XX.X"
 */

// Configuration
const int VOLTAGE_PIN = A0;        // Analog pin for voltage reading
const float VREF = 5.0;            // Reference voltage (5V for Arduino Leonardo)
const int ADC_MAX = 1023;          // 10-bit ADC (0-1023)
const unsigned long SEND_INTERVAL = 100; // Send data every 100ms

// Voltage divider resistor values (adjust based on your circuit)
// For 6S battery (max 25.2V), we need to divide to <= 5V
// Using R1 = 100kΩ, R2 = 20kΩ gives ratio of 0.1667
// Max input = 25.2V * 0.1667 = 4.2V (safe for 5V ADC)
const float R1 = 100000.0;  // 100kΩ resistor (high side)
const float R2 = 20000.0;   // 20kΩ resistor (low side)
const float VOLTAGE_DIVIDER_RATIO = R2 / (R1 + R2); // ~0.1667

// Calibration factor (adjust if needed)
const float CALIBRATION_FACTOR = 1.0;

// Timing
unsigned long lastSendTime = 0;

// Smoothing - number of samples for moving average
const int SMOOTH_SAMPLES = 10;
int readings[SMOOTH_SAMPLES];
int readIndex = 0;
int total = 0;
int average = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);

  // Wait for serial connection (Leonardo-specific)
  // Comment out for standalone operation
  // while (!Serial) {
  //   delay(10);
  // }

  // Set voltage pin as input
  pinMode(VOLTAGE_PIN, INPUT);

  // Initialize smoothing array
  for (int i = 0; i < SMOOTH_SAMPLES; i++) {
    readings[i] = 0;
  }

  // Startup delay
  delay(1000);

  // Send startup message
  Serial.println("Battery Monitor Started");
  Serial.println("Ready to read voltage...");
}

void loop() {
  // Read voltage with smoothing
  float voltage = readSmoothedVoltage();

  // Send data at regular intervals
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendVoltageData(voltage);
    lastSendTime = millis();
  }

  // Small delay for stability
  delay(10);
}

/*
 * Reads voltage from analog pin with smoothing (moving average)
 * Returns actual battery voltage
 */
float readSmoothedVoltage() {
  // Read raw ADC value
  int rawADC = analogRead(VOLTAGE_PIN);

  // Apply smoothing
  total = total - readings[readIndex];  // Remove oldest reading
  readings[readIndex] = rawADC;         // Store new reading
  total = total + readings[readIndex];  // Add new reading
  readIndex = (readIndex + 1) % SMOOTH_SAMPLES;  // Advance index

  // Calculate average
  average = total / SMOOTH_SAMPLES;

  // Convert ADC value to voltage
  // ADC reading -> ADC voltage (0-5V) -> Battery voltage
  float adcVoltage = (average * VREF) / ADC_MAX;
  float batteryVoltage = (adcVoltage / VOLTAGE_DIVIDER_RATIO) * CALIBRATION_FACTOR;

  return batteryVoltage;
}

/*
 * Reads raw voltage without smoothing
 * Useful for debugging
 */
float readRawVoltage() {
  int rawADC = analogRead(VOLTAGE_PIN);
  float adcVoltage = (rawADC * VREF) / ADC_MAX;
  float batteryVoltage = (adcVoltage / VOLTAGE_DIVIDER_RATIO) * CALIBRATION_FACTOR;
  return batteryVoltage;
}

/*
 * Sends voltage data over serial in format: "Voltage:XX.X"
 */
void sendVoltageData(float voltage) {
  Serial.print("Voltage:");
  Serial.println(voltage, 2);
}

/*
 * Optional: Send detailed diagnostic data
 * Uncomment and use for debugging
 */
void sendDiagnosticData(float voltage) {
  int rawADC = analogRead(VOLTAGE_PIN);
  float adcVoltage = (rawADC * VREF) / ADC_MAX;

  Serial.print("Raw ADC: ");
  Serial.print(rawADC);
  Serial.print(" | ADC Voltage: ");
  Serial.print(adcVoltage, 3);
  Serial.print("V | Battery: ");
  Serial.print(voltage, 2);
  Serial.println("V");
}

/*
 * Calculate cell voltage (assuming 6S pack)
 */
float getCellVoltage(float totalVoltage) {
  return totalVoltage / 6.0;
}

/*
 * Determine battery status
 * Returns: 0 = critical, 1 = warning, 2 = normal
 */
int getBatteryStatus(float voltage) {
  if (voltage < 19.8) return 0;      // Critical (< 3.3V/cell)
  else if (voltage < 21.0) return 1; // Warning (< 3.5V/cell)
  else return 2;                     // Normal (>= 3.5V/cell)
}

/*
 * Optional: Add LED status indicator
 */
void updateStatusLED(float voltage) {
  int status = getBatteryStatus(voltage);

  // You can add LED indicators here
  // Example:
  // digitalWrite(LED_GREEN, status == 2 ? HIGH : LOW);
  // digitalWrite(LED_YELLOW, status == 1 ? HIGH : LOW);
  // digitalWrite(LED_RED, status == 0 ? HIGH : LOW);
}
