import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { AppLanguage, TEXT } from '../i18n/translations';

interface OfflineIndicatorProps {
  language?: AppLanguage;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  language = 'en',
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        bottom: 'calc(var(--safe-bottom) + 1rem)',
        left: 'calc(var(--safe-left) + 1rem)',
        boxShadow: '0 4px 0 0 #B45309, 0 10px 20px -4px rgba(15, 23, 42, 0.25)',
      }}
      className="fixed z-50 flex items-center gap-2 rounded-2xl bg-amber-400 border-2 border-white px-3.5 py-2 text-xs sm:text-sm font-display font-bold text-amber-950"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{TEXT[language].header.offlineBanner}</span>
    </div>
  );
};
