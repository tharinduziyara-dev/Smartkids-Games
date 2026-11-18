let dualSpeechTimer: number | null = null;

function clearDualTimer(): void {
  if (dualSpeechTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(dualSpeechTimer);
    dualSpeechTimer = null;
  }
}

export function speakWord(word: string, muted: boolean, rate = 0.88): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  clearDualTimer();
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.localService)
    );
    if (preferred) {
      utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore TTS failures on unsupported browsers
  }
}

export function speakSinhalaWord(
  sinhalaText: string,
  phoneticFallback: string,
  muted: boolean,
  rate = 0.84
): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  clearDualTimer();
  try {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const siVoice = voices.find((v) => v.lang.toLowerCase().startsWith('si'));

    const utterance = new SpeechSynthesisUtterance(
      siVoice ? sinhalaText : phoneticFallback.replace(/-/g, ' ')
    );

    if (siVoice) {
      utterance.voice = siVoice;
      utterance.lang = siVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = rate;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore TTS failures on unsupported browsers
  }
}

export function speakBothPronunciations(
  englishWord: string,
  sinhalaText: string,
  sinhalaPhonetic: string,
  muted: boolean
): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  speakWord(englishWord, muted, 0.86);
  dualSpeechTimer = window.setTimeout(() => {
    dualSpeechTimer = null;
    speakSinhalaWord(sinhalaText, sinhalaPhonetic, muted, 0.84);
  }, 1050);
}

export function stopSpeaking(): void {
  clearDualTimer();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
