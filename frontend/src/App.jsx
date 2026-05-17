import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import * as THREE from 'three';
import { supabase } from './lib/supabaseClient';

// Helper for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Components
import EarthScene from './components/EarthScene';
import { CrisisMarkers } from './components/CrisisMarkers';
import CrisisDashboard from './components/CrisisDashboard';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NewsPage from './pages/NewsPage';
import EmergencyPage from './pages/EmergencyPage';
import EscalationPage from './pages/EscalationPage';
import ResourcesPage from './pages/ResourcesPage';
import Login from './components/Login';
import IncidentReport from './components/IncidentReport';
import AdminDashboard from './pages/AdminDashboard';
import SeverityEnginePage from './pages/SeverityEnginePage';
import HotspotPage from './pages/HotspotPage';
import CommunityPage from './pages/CommunityPage';
import DocumentationPage from './pages/DocumentationPage';
import EVAwarenessPage from './pages/EVAwarenessPage';
import PotholeAwarenessPage from './pages/PotholeAwarenessPage';
import CrashDetectionPage from './pages/CrashDetectionPage';
import RepairEstimatorPage from './pages/RepairEstimatorPage';
import NightWatchPage from './pages/NightWatchPage';
import MedicalCardPage from './pages/MedicalCardPage';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';

const CameraController = () => {
  const location = useLocation();
  const { camera } = useThree();

  useEffect(() => {
    // Target position based on route
    const targetX = location.pathname === '/landing' ? 2.5 : 5;
    const targetZ = location.pathname === '/landing' ? 5.0 : 8;

    // Animate camera to new position
    let startX = camera.position.x;
    let startZ = camera.position.z;
    let startTime = Date.now();
    let duration = 1500; // 1.5s transition

    const animate = () => {
      let now = Date.now();
      let progress = Math.min((now - startTime) / duration, 1);
      // Ease out cubic
      let ease = 1 - Math.pow(1 - progress, 3);

      camera.position.x = startX + (targetX - startX) * ease;
      camera.position.z = startZ + (targetZ - startZ) * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();

  }, [location, camera]);

  return null;
};

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-crisis-deep text-crisis-red font-mono animate-pulse">
      LOADING...
    </div>;
  }

  // Always require login for protected routes
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/landing" replace />;
  }

  if (userOnly && profile?.role !== 'user') {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const MainApp = () => {
  const { user, loading, signOut } = useAuth();
  const [rotation, setRotation] = useState(0);
  const [isSystemOnline, setIsSystemOnline] = useState(false);
  const [bootFlash, setBootFlash] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isSystemOnline) {
      // 1. Trigger Visual Flash
      setBootFlash(true);
      setTimeout(() => setBootFlash(false), 500);

      // 2. Play Audio Cue (Futuristic Chirp)
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {
        console.error("Audio play failed", e);
      }
    }
  }, [isSystemOnline]);

  // --- Debug: Test Notification ---
  const showTestNotification = () => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Chaukas: System Test', {
          body: 'This is a test notification to verify your browser settings. If you see this, notifications are working!',
          icon: '/vite.svg',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          tag: 'test-sync'
        });
      });
    } else {
      alert("Notification permission not granted or SW not ready.");
    }
  };

  useEffect(() => {
    const registerPush = async () => {
      if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          const sw = registration || await navigator.serviceWorker.register('/sw.js');

          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;

          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const subscription = await sw.pushManager.getSubscription() || await sw.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
            });

            // Sync with backend
            const apiUrl = import.meta.env.VITE_BACKEND_URL || '';
            const fetchUrl = apiUrl ? `${apiUrl}/api/crisis/subscribe` : '/api/crisis/subscribe';
            await fetch(fetchUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                subscription: subscription
              })
            });
            console.log("Push System: OPERATIONAL");
          } else {
            console.warn("Push System: Permission DENIED");
          }
        } catch (err) {
          console.error("Push registration error:", err);
        }
      } else {
        console.warn("Push System: Browser NOT SUPPORTED / Secure Context Required");
      }
    };
    registerPush();
  }, [user]);

  // --- Global Location Tracking is now handled by LocationProvider ---

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-crisis-deep text-crisis-red font-mono animate-pulse">
        INITIALIZING CHAUKAS — ROAD SAFETY COMMAND...
      </div>
    );
  }

  const isLoginPage  = location.pathname === '/login';
  const isLandingPage = location.pathname === '/landing' || location.pathname === '/';
  const showSidebar  = !isLoginPage && !isLandingPage && !!user;

  return (
    <div className="flex bg-gray-900 min-h-screen">

      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main content */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${showSidebar ? 'ml-60' : ''}`}
           style={{ minHeight: '100vh' }}>

        {/* Boot Flash */}
        <div className={`fixed inset-0 z-50 pointer-events-none bg-green-500/20 mix-blend-screen transition-opacity duration-500 ${bootFlash ? 'opacity-100' : 'opacity-0'}`}/>

        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to={localStorage.getItem('chaukas_last_route') || '/landing'} replace />} />
          <Route path="/landing" element={
            <div className="relative w-screen h-screen overflow-hidden">
              <LandingPage onSystemInitialize={() => setIsSystemOnline(true)} />
              <div className="absolute inset-0 z-0 pointer-events-auto">
                <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
                  <color attach="background" args={['#000000']} />
                  <ambientLight intensity={1.5} color="#8080ff" />
                  <spotLight position={[50,50,50]} angle={0.2} penumbra={1} intensity={50} color="#ffffff" />
                  <pointLight position={[-20,0,-20]} intensity={20} color="#ff3b30" />
                  <pointLight position={[20,10,20]} intensity={10} color="#40c9ff" />
                  <CameraController />
                  <Suspense fallback={null}>
                    <group><EarthScene setRotation={setRotation} /><CrisisMarkers /></group>
                    <Stars radius={200} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
                  </Suspense>
                  <OrbitControls enableZoom={false} enablePan={false} enableRotate rotateSpeed={0.5} target={[0,0,0]} />
                </Canvas>
              </div>
              <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40" />
            </div>
          } />
          <Route path="/login" element={user ? <Navigate to={localStorage.getItem('chaukas_last_route') || '/landing'} /> : <Login />} />

          {/* Protected */}
          <Route path="/intelligence" element={<ProtectedRoute><CrisisDashboard /></ProtectedRoute>} />
          <Route path="/report"       element={<ProtectedRoute><IncidentReport /></ProtectedRoute>} />
          <Route path="/coordination" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
          <Route path="/analytics"    element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/news"         element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
          <Route path="/emergency"    element={<ProtectedRoute userOnly={true}><EmergencyPage /></ProtectedRoute>} />
          <Route path="/admin"        element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/severity"     element={<ProtectedRoute><SeverityEnginePage /></ProtectedRoute>} />
          <Route path="/escalation"   element={<ProtectedRoute><EscalationPage /></ProtectedRoute>} />
          <Route path="/hotspot"      element={<ProtectedRoute><HotspotPage /></ProtectedRoute>} />
          <Route path="/resources"    element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/community"    element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/docs"         element={<DocumentationPage />} />
          <Route path="/ev-awareness" element={<ProtectedRoute><EVAwarenessPage /></ProtectedRoute>} />
          <Route path="/potholes"     element={<ProtectedRoute><PotholeAwarenessPage /></ProtectedRoute>} />
          {/* New Feature Routes */}
          <Route path="/crash-sos"        element={<ProtectedRoute><CrashDetectionPage /></ProtectedRoute>} />
          <Route path="/repair-estimator" element={<ProtectedRoute><RepairEstimatorPage /></ProtectedRoute>} />
          <Route path="/night-watch"      element={<ProtectedRoute><NightWatchPage /></ProtectedRoute>} />
          <Route path="/medical-card"     element={<ProtectedRoute><MedicalCardPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <LanguageProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </LanguageProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
