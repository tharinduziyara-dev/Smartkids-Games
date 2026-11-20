import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { initKidsAdMob } from './admob';

registerSW({
  immediate: true,
});

initKidsAdMob();

createRoot(document.getElementById('root')!).render(<App />);
