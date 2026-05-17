/**
 * Chaukas Pothole Detection Service
 * Captures accelerometer data and sends potential hazard events to the backend.
 */

class PotholeDetectionService {
    constructor(apiBaseUrl = 'http://localhost:8000/api') {
        this.apiBaseUrl = apiBaseUrl;
        this.isMonitoring = false;
        this.threshold = 15.0; // m/s^2 (Standard is ~9.8, so 15 is a jolt)
        this.lastEventTime = 0;
        this.minInterval = 1000; // 1 second debounce
        this.onHazardDetected = null;
    }

    startMonitoring(callback) {
        if (this.isMonitoring) return;
        this.onHazardDetected = callback;

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this.handleMotion.bind(this));
            this.isMonitoring = true;
            console.log("Pothole Monitoring Started: Accelerometer active");
        } else {
            console.warn("DeviceMotionEvent is not supported on this device/browser.");
        }
    }

    stopMonitoring() {
        window.removeEventListener('devicemotion', this.handleMotion.bind(this));
        this.isMonitoring = false;
        console.log("Pothole Monitoring Stopped");
    }

    handleMotion(event) {
        const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
        const totalAccel = Math.sqrt(x*x + y*y + z*z);

        if (totalAccel > this.threshold) {
            const now = Date.now();
            if (now - this.lastEventTime > this.minInterval) {
                this.lastEventTime = now;
                this.captureAndReport(totalAccel);
            }
        }
    }

    async captureAndReport(magnitude) {
        // Get current position
        navigator.geolocation.getCurrentPosition(async (position) => {
            const payload = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accel_z: magnitude,
                speed: position.coords.speed || 0,
                timestamp: new Date().toISOString()
            };

            console.log("Potential Pothole Detected!", payload);
            
            if (this.onHazardDetected) {
                this.onHazardDetected(payload);
            }

            try {
                const response = await fetch(`${this.apiBaseUrl}/potholes/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                console.log("Backend response:", result);
            } catch (error) {
                console.error("Failed to report pothole:", error);
            }
        });
    }

    /**
     * Simulation method for development/demo purposes
     */
    simulateImpact() {
        console.log("Simulating Pothole Impact...");
        const mockMagnitude = 18.5 + (Math.random() * 15);
        this.captureAndReport(mockMagnitude);
    }

    /**
     * Voice Alert System using Web Speech API
     */
    speakAlert(message) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech to prioritize the new alert
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech Synthesis not supported in this browser.");
        }
    }
}

export const potholeService = new PotholeDetectionService();
