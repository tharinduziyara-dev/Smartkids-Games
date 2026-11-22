import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { initKidsAdMob } from './admob';

// Detect Android WebView / TWA / Capacitor edge-to-edge containers where
// CSS env(safe-area-inset-top) may still report 0px on some Android versions
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const ua = window.navigator.userAgent || '';
  const isAndroidWebView =
    /Android/i.test(ua) &&
    (/; wv\)/i.test(ua) ||
      'Capacitor' in window ||
      'cordova' in window ||
      'Android' in window);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches;

  if (isAndroidWebView || isStandalone) {
    document.documentElement.style.setProperty('--safe-top-fallback', '28px');
    document.documentElement.style.setProperty('--safe-bottom-fallback', '12px');
  }
}

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
  });
} else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    })
    .catch(() => {});
}

initKidsAdMob();

createRoot(document.getElementById('root')!).render(<App />);
