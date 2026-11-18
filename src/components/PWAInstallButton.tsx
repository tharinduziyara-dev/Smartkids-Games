import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../audio/soundEngine';
import { AppLanguage, TEXT } from '../i18n/translations';

interface PWAInstallButtonProps {
  language?: AppLanguage;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = 'en',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = TEXT[language].header;

  // Hide when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop native install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          soundEngine.playTapPop();
          void install();
        }}
        style={{
          background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
          boxShadow: '0 4px 0 0 #3730A3',
        }}
        className="toy-btn min-h-[44px] px-3 sm:px-3.5 py-2 rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-white/60 cursor-pointer whitespace-nowrap"
        aria-label="Install SmartKids App for Offline Play"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{t.installApp}</span>
      </button>
    );
  }

  // iOS Safari guided Add-to-Home-Screen prompt
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            soundEngine.playTapPop();
            setShowIOSGuide(true);
          }}
          style={{
            background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
            boxShadow: '0 4px 0 0 #3730A3',
          }}
          className="toy-btn min-h-[44px] px-3 sm:px-3.5 py-2 rounded-2xl text-white font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-white/60 cursor-pointer whitespace-nowrap"
          aria-label="Install SmartKids on iPhone or iPad"
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t.installApp}</span>
          <span className="sm:hidden">{t.installShort}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="clay-surface w-full max-w-sm rounded-[30px] p-6 border-2 border-white relative">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Close install instructions"
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {t.iosInstallTitle}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {t.iosInstallSubtitle}
                  </p>
                </div>
              </div>

              <ol className="space-y-2.5 text-sm text-slate-700 bg-white/80 rounded-2xl p-4 border border-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-display font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    {t.iosStep1Prefix}{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
                      <Share className="w-3.5 h-3.5" /> {t.iosShareWord}
                    </span>{' '}
                    {t.iosStep1Suffix}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-display font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    {t.iosStep2Prefix}{' '}
                    <strong className="text-slate-900">{t.iosStep2Bold}</strong>.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                style={{
                  background: 'linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)',
                  boxShadow: '0 4px 0 0 #3730A3',
                }}
                className="toy-btn mt-4 w-full min-h-[44px] rounded-2xl text-white font-display text-sm font-bold border-2 border-white/50 cursor-pointer"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
