import {
  AppCategory,
  ChordQualityId,
  DifficultyLevel,
  EnglishMode,
  GameMode,
  MascotId,
  MathMode,
  RewardKind,
  WardrobeCategory,
} from '../types/game';
import { DictionaryCategory } from '../data/sinhalaDictionary';

export type AppLanguage = 'en' | 'si';

const LANGUAGE_STORAGE_KEY = 'smartkids_language_v1';

export function loadLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'si' ? 'si' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors
  }
}

export const TEXT: Record<
  AppLanguage,
  {
    appName: string;
    appTagline: string;
    header: {
      categories: string;
      switchPlayer: string;
      dictionary: string;
      myRewards: string;
      rewardsShort: string;
      parentLock: string;
      marimba: string;
      piano: string;
      mute: string;
      unmute: string;
      installApp: string;
      installShort: string;
      iosInstallTitle: string;
      iosInstallSubtitle: string;
      iosStep1Prefix: string;
      iosShareWord: string;
      iosStep1Suffix: string;
      iosStep2Prefix: string;
      iosStep2Bold: string;
      gotIt: string;
      offlineBanner: string;
    };
    home: {
      wardrobeBtn: string;
      footerHint: string;
      welcomeMsg: (name: string) => string;
      categoryMsg: Record<AppCategory, (name: string) => string>;
      tapMsg: Record<MascotId, string>;
      studioTitles: Record<AppCategory, { first: string; accent: string }>;
      categories: Record<
        AppCategory,
        { title: string; subtitle: string; cta: string }
      >;
    };
    mascots: Record<MascotId, { name: string; shortLabel: string }>;
    levels: Record<DifficultyLevel, { label: string; summary: string }>;
    common: {
      stars: string;
      round: string;
      streak: string;
      difficultyLevel: string;
      pausedTitle: string;
      resume: string;
      fairyWardrobe: string;
      restartSet: string;
      switchCategory: string;
      playAgain: string;
      needHint: string;
      unlockedPrefix: string;
      backToGames: string;
      allModes: string;
      mathModes: string;
      englishModes: string;
      totalStarsCollected: string;
      dressUpSparkle: string;
      confirmCloseTitle: string;
      confirmCloseMessage: string;
      confirmExitGameMessage: string;
      yes: string;
      no: string;
      quizGameOverTitle: string;
      quizGameOverSubtitle: string;
      tryAgain: string;
      scoreBeforeLoss: (stars: number, total: number) => string;
    };
    music: {
      modes: Record<
        GameMode,
        { title: string; cta: string; subtitle: (lvl: DifficultyLevel, startLen: number, maxLen: number) => string }
      >;
      listenAgain: string;
      listening: string;
      instrumentSound: string;
      listenClosely: string;
      guessPrompt: string;
      melodyPrompt: (len: number) => string;
      melodyTurn: string;
      highLowPrompt: string;
      chordExactPrompt: string;
      chordTypePrompt: string;
      firstSound: string;
      secondSound: string;
      higher: string;
      goesUp: string;
      lower: string;
      goesDown: string;
      chordLabel: string;
      pickRoot: string;
      pickType: string;
      selectRootAndType: string;
      checkPrefix: string;
      keyLabel: (n: number) => string;
      chordQualities: Record<ChordQualityId, { label: string; moodHint: string }>;
      feedback: {
        guessCorrect: (w: string, s: string) => string;
        guessWrong: (w: string, s: string) => string;
        melodyPerfect: string;
        melodyProgress: (left: number) => string;
        melodyOops: string;
        highLowCorrect: (note: string, dir: 'higher' | 'lower') => string;
        highLowWrong: string;
        chordCorrect: (root: string, qual: string) => string;
        chordWrong: (qual: string) => string;
        exactChordCorrect: (root: string, qual: string) => string;
        exactChordRightRoot: (root: string) => string;
        exactChordRightType: (qual: string) => string;
        exactChordWrongBoth: string;
      };
      victoryMascotMsg: string;
      victoryHeading: (name: string) => string;
      victorySubtitle: (levelLabel: string, modeTitle: string) => string;
      footerHighLow: string;
      footerExactChord: string;
      footerChord: (count: number) => string;
      footerSharps: string;
      footerNaturals: (count: number) => string;
    };
    math: {
      modes: Record<
        MathMode,
        { title: string; cta: string; subtitle: (lvl: DifficultyLevel) => string }
      >;
      stageTitles: Record<MathMode, string>;
      initialMsg: string;
      nextMsg: string;
      correctMsg: (expr: string, ans: number) => string;
      wrongMsg: string;
      victoryMascotMsg: string;
      victoryHeading: (name: string) => string;
      victorySubtitle: (levelLabel: string, modeTitle: string) => string;
      footerKeypad: string;
      footerChoices: string;
    };
    english: {
      modes: Record<EnglishMode, { title: string; subtitle: string; cta: string }>;
      stageTitles: Record<EnglishMode, string>;
      dictationPrompt: string;
      namePicturePrompt: string;
      matchWordPrompt: string;
      hearWordAgain: string;
      typeSpellingPlaceholder: string;
      typeWordPlaceholder: string;
      checkSpelling: string;
      checkWord: string;
      lettersCount: (n: number) => string;
      correctTyped: (emoji: string, word: string) => string;
      wrongTyped: string;
      correctMatch: (emoji: string, word: string) => string;
      wrongMatch: (word: string) => string;
      victoryMascotMsg: string;
      victoryHeading: (name: string) => string;
      victorySubtitle: (levelLabel: string, modeTitle: string) => string;
      footerMatch: string;
      footerType: string;
    };
    dictionary: {
      cardSubtitle: string;
      openBtn: string;
      title: string;
      subtitle: string;
      hearBoth: string;
      englishHeader: string;
      sinhalaHeader: string;
      sayLabel: string;
      emptyText: string;
      wordsCount: (count: number) => string;
      categories: Record<DictionaryCategory, string>;
    };
    profiles: {
      title: string;
      subtitle: string;
      addNew: string;
      placeholder: string;
      create: string;
      starterFriend: string;
      savedProfiles: (count: number) => string;
      outfitsCount: (unlocked: number, total: number) => string;
    };
    rewards: {
      title: string;
      subtitle: (name: string, unlocked: number, total: number, stars: number) => string;
      earned: string;
      kinds: Record<RewardKind, string>;
      items: Record<string, { name: string; description: string }>;
    };
    wardrobe: {
      title: string;
      subtitle: (name: string, unlocked: number, total: number, stars: number) => string;
      tapMeMsg: string;
      categories: Record<WardrobeCategory, string>;
      equipped: string;
      tapToWear: string;
      unlockAtStars: (stars: number) => string;
      done: string;
      items: Record<string, string>;
    };
    parental: {
      settingsTitle: string;
      settingsSubtitle: string;
      verifyPrompt: string;
      openSettingsBtn: string;
      timeRemaining: string;
      reset: string;
      playTimeLimit: string;
      minutesUnit: (mins: number) => string;
      changePinLabel: string;
      pinPlaceholder: string;
      savePin: string;
      pinError: string;
      pinSaved: string;
      lockNow: string;
      breakTitle: string;
      breakTimeLimitMsg: (name: string, mins: number) => string;
      breakManualMsg: (name: string) => string;
      parentUnlock: string;
      parentVerification: string;
      hide: string;
      unlockAndReset: string;
      tabPin: string;
      tabMath: string;
      defaultPinHintPrefix: string;
      defaultPinHintSuffix: string;
      enterAnswerPlaceholder: string;
      errNeed4Digits: string;
      errWrongPin: string;
      errEnterNumber: string;
      errWrongMath: string;
    };
    skyRun: {
      cardTitle: string;
      cardSubtitle: string;
      cardCta: string;
      modeTag: string;
      swipeHint: string;
      pauseTitle: string;
      resumeFlight: string;
      exitFlight: string;
      obstacleBlocked: string;
      mathTitle: string;
      mathPrompt: string;
      englishTitle: string;
      englishPrompt: string;
      hearWord: string;
      musicNoteTitle: string;
      musicChordTitle: string;
      musicPrompt: string;
      listenAgain: string;
      magicBlastMsg: string;
      wrongOopsMsg: string;
      gameOverTitle: string;
      gameOverSubtitle: string;
      starsCollectedLabel: string;
      obstaclesClearedLabel: string;
      playAgainBtn: string;
      backToCategoryBtn: string;
      webglFallback: string;
      turnProgressLabel: string;
      earnedTurnsLabel: (count: number) => string;
      nextTurnProgress: (prog: number) => string;
      needTurnsCta: (prog: number) => string;
      playWithTurnCta: (turns: number) => string;
      useOneTurnHint: string;
      rewardPopupTitle: string;
      rewardPopupSubtitle: string;
      rewardPopupPlayBtn: string;
      rewardPopupContinueBtn: string;
      flyAgainWithTurnBtn: (turns: number) => string;
      noTurnsLeftMsg: string;
    };
  }
> = {
  en: {
    appName: 'SmartKids',
    appTagline: 'Learn Music, Math, English & Sinhala',
    header: {
      categories: 'Categories',
      switchPlayer: 'Switch',
      dictionary: 'Dictionary',
      myRewards: 'My Rewards',
      rewardsShort: 'Rewards',
      parentLock: 'Parent Lock',
      marimba: 'Marimba',
      piano: 'Piano',
      mute: 'Mute sound',
      unmute: 'Unmute sound',
      installApp: 'Install App',
      installShort: 'Install',
      iosInstallTitle: 'Install SmartKids',
      iosInstallSubtitle: 'Play anytime, 100% offline!',
      iosStep1Prefix: 'Tap the',
      iosShareWord: 'Share',
      iosStep1Suffix: 'button in your Safari bar.',
      iosStep2Prefix: 'Scroll down and tap',
      iosStep2Bold: 'Add to Home Screen',
      gotIt: 'Got it!',
      offlineBanner: 'Offline Mode — All games & saved progress ready',
    },
    home: {
      wardrobeBtn: 'Wardrobe',
      footerHint:
        'Tap your mascot for tricks · Earn stars to unlock My Rewards & Fairy outfits',
      welcomeMsg: (name) => `Hi ${name}! Pick Music, Math, or English!`,
      categoryMsg: {
        music: (name) => `Let’s play Music, ${name}!`,
        math: (name) => `Ready for Math puzzles, ${name}?`,
        english: (name) => `Let’s spell & read together, ${name}!`,
      },
      tapMsg: {
        owl: 'Hoo-hoo! You’ve got this!',
        fairy: 'Sparkle magic! Let’s learn & play!',
        runner_boy: 'On your marks! Ready to jump & learn!',
        runner_girl: 'Go Maya! Let’s race through today’s puzzles!',
      },
      studioTitles: {
        music: { first: 'Music', accent: 'Studio' },
        math: { first: 'Math', accent: 'Quest' },
        english: { first: 'English', accent: 'Garden' },
      },
      categories: {
        music: {
          title: 'Music',
          subtitle:
            'Ear training with Marimba & Piano: Guess the Note, Copy the Melody, High or Low, and Chords.',
          cta: 'Explore Music',
        },
        math: {
          title: 'Math',
          subtitle:
            'Interactive Addition (+), Subtraction (−), Multiplication (×), and Division (÷) challenges.',
          cta: 'Explore Math',
        },
        english: {
          title: 'English',
          subtitle:
            'Listen & spell with Dictation, Name the Picture, and Match the Word picture cards.',
          cta: 'Explore English',
        },
      },
    },
    mascots: {
      owl: { name: 'Ollie the Owl', shortLabel: 'Ollie Owl' },
      fairy: { name: 'Sparkle the Fairy', shortLabel: 'Sparkle Fairy' },
      runner_boy: { name: 'Leo the Runner', shortLabel: 'Leo (Boy)' },
      runner_girl: { name: 'Maya the Runner', shortLabel: 'Maya (Girl)' },
    },
    levels: {
      beginner: {
        label: 'Beginner',
        summary: 'Single-digit basics · 5-key Music (C–G) · Short 3–4 letter words',
      },
      intermediate: {
        label: 'Intermediate',
        summary: '2-digit Math & tables · 7-note Music (C–B) · 5–6 letter vocabulary',
      },
      advanced: {
        label: 'Advanced',
        summary: 'Larger Math · 12-note Chromatic Music & 6 Chords · 6–8 letter words',
      },
      extreme: {
        label: 'Extreme',
        summary: 'Multi-step Math · Exact Chromatic Chords · Challenging spelling',
      },
    },
    common: {
      stars: 'Stars',
      round: 'Round',
      streak: 'Streak',
      difficultyLevel: 'Difficulty Level',
      pausedTitle: 'Game Paused',
      resume: 'Resume',
      fairyWardrobe: 'Fairy Wardrobe',
      restartSet: 'Restart Set',
      switchCategory: 'Switch Category',
      playAgain: 'Play Again',
      needHint: 'Need a Hint?',
      unlockedPrefix: 'Unlocked:',
      backToGames: 'Back to Games',
      allModes: 'All Modes',
      mathModes: 'Math Modes',
      englishModes: 'English Modes',
      totalStarsCollected: 'Total Stars Collected',
      dressUpSparkle: 'Dress Up Sparkle in Wardrobe',
      confirmCloseTitle: 'Are you sure?',
      confirmCloseMessage: 'Do you want to close this window?',
      confirmExitGameMessage: 'Do you want to close this game?',
      yes: 'Yes',
      no: 'No',
      quizGameOverTitle: 'Game Over',
      quizGameOverSubtitle:
        'Oops! One wrong answer ends the quiz and 3D Flight will not unlock. Answer every question right on the first try!',
      tryAgain: 'Try Again',
      scoreBeforeLoss: (stars, total) => `Correct Before Loss: ${stars} / ${total}`,
    },
    music: {
      modes: {
        GUESS_NOTE: {
          title: 'Guess the Note',
          cta: 'Play Notes',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Hear a mystery note and tap the matching C–G / Sa–Pa key.'
              : lvl === 'intermediate'
              ? 'Hear a mystery note from the full 7-note octave (C–B / Sa–Ni).'
              : 'Master the full 12-note Chromatic Scale including sharps & flats!',
        },
        COPY_MELODY: {
          title: 'Copy the Melody',
          cta: 'Play Melody',
          subtitle: (_lvl, startLen, maxLen) =>
            `Listen closely by ear (${startLen}–${maxLen} notes) and play it back in order!`,
        },
        HIGH_LOW: {
          title: 'High or Low?',
          cta: 'Play Pitch',
          subtitle: (lvl) =>
            lvl === 'extreme'
              ? 'Spot subtle 1–2 semitone half-step pitch shifts by ear!'
              : 'Listen to two notes and decide if the second sound goes up or down.',
        },
        GUESS_CHORD: {
          title: 'Guess the Chord',
          cta: 'Play Chords',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Is the chord bright & happy (Major) or soft & dreamy (Minor)?'
              : lvl === 'intermediate'
              ? 'Identify Major, Minor, Diminished, and Augmented chords by ear.'
              : lvl === 'advanced'
              ? 'Spot 6 chord colors including Sus4 and Dominant 7th chords!'
              : 'Name the exact chord: both Root Note (C–B) and Chord Type!',
        },
      },
      listenAgain: 'Listen Again',
      listening: 'Listening...',
      instrumentSound: 'Instrument Sound',
      listenClosely: 'Listen closely!',
      guessPrompt: 'Listen by ear! Which key is this note?',
      melodyPrompt: (len) => `Listen carefully (${len} notes)...`,
      melodyTurn: 'Your turn! Play the melody back.',
      highLowPrompt: 'Is the 2nd note Higher or Lower?',
      chordExactPrompt: 'Name the exact Root Note and Chord Type!',
      chordTypePrompt: 'What type of chord do you hear?',
      firstSound: 'First Sound',
      secondSound: 'Second Sound',
      higher: 'Higher',
      goesUp: 'Goes Up',
      lower: 'Lower',
      goesDown: 'Goes Down',
      chordLabel: 'Chord:',
      pickRoot: '1. Pick the Root Note (C – B)',
      pickType: '2. Pick the Chord Type',
      selectRootAndType: 'Select Root & Type',
      checkPrefix: 'Check:',
      keyLabel: (n) => `Key ${n}`,
      chordQualities: {
        major: { label: 'Major', moodHint: 'Bright & Happy' },
        minor: { label: 'Minor', moodHint: 'Soft & Dreamy' },
        diminished: { label: 'Diminished', moodHint: 'Tense & Spooky' },
        augmented: { label: 'Augmented', moodHint: 'Floaty & Cosmic' },
        sus4: { label: 'Sus4', moodHint: 'Open & Waiting' },
        dom7: { label: 'Dominant 7th', moodHint: 'Jazzy & Bluesy' },
        maj7: { label: 'Major 7th', moodHint: 'Lush & Warm' },
      },
      feedback: {
        guessCorrect: (w, s) => `Awesome! That’s ${w} (${s})!`,
        guessWrong: (w, s) => `That was ${w} (${s}). Try again!`,
        melodyPerfect: 'Hoo-ray! Perfect melody memory!',
        melodyProgress: (left) => `Nice! ${left} more to go...`,
        melodyOops: 'Oops! Listen to the melody again!',
        highLowCorrect: (note, dir) =>
          `Yes! ${note} is ${dir === 'higher' ? 'Higher ↑' : 'Lower ↓'}!`,
        highLowWrong: 'Hmm, listen again to the 2nd note!',
        chordCorrect: (root, qual) => `Spot on! That was ${root} ${qual}!`,
        chordWrong: (qual) => `Not ${qual}! Listen to the chord mood again.`,
        exactChordCorrect: (root, qual) => `Bullseye! Exact chord: ${root} ${qual}!`,
        exactChordRightRoot: (root) => `Right root (${root})! Check the chord type.`,
        exactChordRightType: (qual) => `Right type (${qual})! Listen to the root note.`,
        exactChordWrongBoth: 'Not quite! Listen closely to the root and chord color.',
      },
      victoryMascotMsg: 'You’re a musical superstar!',
      victoryHeading: (name) => `Amazing Ears, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) => `You beat ${lvlLabel} ${modeTitle}!`,
      footerHighLow: 'Up / Down Arrows to Answer · Space to Listen Again · Esc Pause',
      footerExactChord:
        'Keys 1–7 Pick Type · Enter Check Chord · Space Listen Again · Esc Pause',
      footerChord: (count) =>
        `Keys 1–${count} Choose Chord · Space Listen Again · Esc Pause`,
      footerSharps:
        'Keys A–J (Naturals) & W/E/T/Y/U (Sharps) · Space Listen Again · Esc Pause',
      footerNaturals: (count) =>
        `Keys 1–${count} to Play · Space to Listen Again · Esc Pause`,
    },
    math: {
      modes: {
        ADDITION: {
          title: 'Addition (+)',
          cta: 'Play +',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Add single-digit numbers together!'
              : lvl === 'extreme'
              ? 'Multi-step multiplication & addition puzzles.'
              : 'Practice adding bigger numbers fast.',
        },
        SUBTRACTION: {
          title: 'Subtraction (−)',
          cta: 'Play −',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Subtract single-digit numbers cleanly.'
              : lvl === 'extreme'
              ? 'Multi-step multiply & subtract challenges.'
              : 'Find the difference with confidence.',
        },
        MULTIPLICATION: {
          title: 'Multiplication (×)',
          cta: 'Play ×',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Easy 1×1 through 5×5 times tables!'
              : lvl === 'extreme'
              ? 'Parentheses & multi-step multiplication.'
              : 'Master your times tables step by step.',
        },
        DIVISION: {
          title: 'Division (÷)',
          cta: 'Play ÷',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'Share numbers equally into small groups.'
              : lvl === 'extreme'
              ? 'Combine division & addition in two steps!'
              : 'Solve clean whole-number division.',
        },
        MIXED: {
          title: 'Mixed Challenge',
          cta: 'Play Mixed',
          subtitle: () =>
            'All four operations (+, −, ×, ÷) mixed together for ultimate practice!',
        },
      },
      stageTitles: {
        ADDITION: 'Addition (+)',
        SUBTRACTION: 'Subtraction (−)',
        MULTIPLICATION: 'Multiplication (×)',
        DIVISION: 'Division (÷)',
        MIXED: 'Mixed Math Challenge',
      },
      initialMsg: 'Solve the math puzzle!',
      nextMsg: 'Here comes the next problem!',
      correctMsg: (expr, ans) => `Correct! ${expr} = ${ans}!`,
      wrongMsg: 'Not quite! Try counting carefully again.',
      victoryMascotMsg: 'Math genius!',
      victoryHeading: (name) => `Awesome Math, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) => `You completed ${lvlLabel} ${modeTitle}!`,
      footerKeypad: 'Type numbers & Enter to Check · Esc Pause',
      footerChoices: 'Keys 1–4 to Answer · Esc Pause',
    },
    english: {
      modes: {
        DICTATION: {
          title: 'Dictation',
          subtitle:
            'Hear the spoken word clearly and type the exact English spelling.',
          cta: 'Play Dictation',
        },
        NAME_PICTURE: {
          title: 'Name the Picture',
          subtitle:
            'Look at the bright picture icon and type the English word for it.',
          cta: 'Play Pictures',
        },
        MATCH_WORD: {
          title: 'Match the Word',
          subtitle: 'Read the English word and tap the matching picture card!',
          cta: 'Play Matching',
        },
      },
      stageTitles: {
        DICTATION: 'Dictation Spelling',
        NAME_PICTURE: 'Name the Picture',
        MATCH_WORD: 'Match the Word',
      },
      dictationPrompt: 'Listen carefully and type the spelling!',
      namePicturePrompt: 'What is this picture called in English?',
      matchWordPrompt: 'Tap the picture that matches the word!',
      hearWordAgain: 'Hear Word Again',
      typeSpellingPlaceholder: 'Type the spelling here...',
      typeWordPlaceholder: 'Type the English word...',
      checkSpelling: 'Check Spelling',
      checkWord: 'Check Word',
      lettersCount: (n) => `${n} letters`,
      correctTyped: (emoji, word) => `Yes! ${emoji} ${word.toUpperCase()}!`,
      wrongTyped: 'Oops! Check the letters and try again!',
      correctMatch: (emoji, word) => `Spot on! ${emoji} is ${word}!`,
      wrongMatch: (word) => `That picture is "${word}" — try another!`,
      victoryMascotMsg: 'Word wizard!',
      victoryHeading: (name) => `Super Speller, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) => `You completed ${lvlLabel} ${modeTitle}!`,
      footerMatch: 'Tap the matching picture · Esc Pause',
      footerType: 'Type your answer & press Enter · Esc Pause',
    },
    dictionary: {
      cardSubtitle:
        'Look up words with Sinhala meanings and hear both English & Sinhala pronunciations!',
      openBtn: 'Open Dictionary',
      title: 'Picture Dictionary',
      subtitle: 'English ↔ සිංහල (Sinhala) with both pronunciations',
      hearBoth: 'Hear Both',
      englishHeader: 'English Word & Sound',
      sinhalaHeader: 'සිංහල (Sinhala Meaning)',
      sayLabel: 'Say:',
      emptyText: 'No words available in this category yet.',
      wordsCount: (count) => `${count} Words`,
      categories: {
        All: 'All',
        Animals: 'Animals',
        Nature: 'Nature',
        Food: 'Food',
        Objects: 'Objects',
        Music: 'Music',
        People: 'People',
        Actions: 'Actions',
      },
    },
    profiles: {
      title: 'Players',
      subtitle: 'Save stars, characters & outfits for each player',
      addNew: 'Add a New Player',
      placeholder: 'Enter player name...',
      create: 'Create',
      starterFriend: 'Starter Friend:',
      savedProfiles: (count) => `Saved Profiles (${count})`,
      outfitsCount: (unlocked, total) => `${unlocked}/${total} Outfits`,
    },
    rewards: {
      title: 'My Rewards',
      subtitle: (name, unlocked, total, stars) =>
        `${name} · ${unlocked}/${total} Unlocked · ${stars} Stars`,
      earned: 'Earned!',
      kinds: {
        trophy: 'Trophy',
        badge: 'Badge',
        sticker: 'Sticker',
      },
      items: {
        reward_first_star: {
          name: 'First Sparkle Sticker',
          description: 'Earn your very first star!',
        },
        reward_music_maestro: {
          name: 'Music Maestro Badge',
          description: 'Complete a Music round set',
        },
        reward_math_whiz: {
          name: 'Math Whiz Trophy',
          description: 'Complete a Math round set',
        },
        reward_english_star: {
          name: 'Spelling Star Sticker',
          description: 'Complete an English round set',
        },
        reward_rising_5: {
          name: 'Rising Star Badge',
          description: 'Collect 5 total stars',
        },
        reward_streak_5: {
          name: '5-in-a-Row Streak Sticker',
          description: 'Get 5 answers right in a row',
        },
        reward_golden_10: {
          name: 'Golden Owl Trophy',
          description: 'Collect 10 total stars',
        },
        reward_rainbow_20: {
          name: 'Rainbow Crown Medal',
          description: 'Collect 20 total stars',
        },
        reward_extreme_hero: {
          name: 'Extreme Explorer Trophy',
          description: 'Beat any game on Extreme level',
        },
        reward_genius_35: {
          name: 'Super Genius Cup',
          description: 'Collect 35 total stars',
        },
      },
    },
    wardrobe: {
      title: 'Fairy Wardrobe',
      subtitle: (name, unlocked, total, stars) =>
        `${name} · ${unlocked}/${total} Unlocked · ${stars} Stars`,
      tapMeMsg: 'Tap me to twirl!',
      categories: {
        dress: 'Dresses',
        shoes: 'Shoes',
        crown: 'Crowns',
        wings: 'Wings',
      },
      equipped: 'Equipped',
      tapToWear: 'Tap to wear',
      unlockAtStars: (stars) => `Unlock at ${stars} Stars`,
      done: 'Done Dressing Up',
      items: {
        dress_petal: 'Pink Blossom Dress',
        dress_starlight: 'Starlight Gown',
        dress_rainbow: 'Rainbow Prism Gown',
        dress_emerald: 'Emerald Melody Gown',
        shoes_ballet: 'Rose Slippers',
        shoes_crystal: 'Sky Crystal Shoes',
        shoes_gold: 'Golden Star Boots',
        crown_flower: 'Daisy Clip',
        crown_silver: 'Silver Note Tiara',
        crown_royal: 'Golden Gem Crown',
        crown_rainbow: 'Rainbow Star Halo',
        wings_dewdrop: 'Dewdrop Wings',
        wings_butterfly: 'Sunset Butterfly Wings',
        wings_aurora: 'Aurora Prism Wings',
      },
    },
    parental: {
      settingsTitle: 'Parent Lock',
      settingsSubtitle: 'Screen time limit & Parent PIN',
      verifyPrompt:
        'Verify with your Parent PIN or solve a grown-up math problem to open Parent Settings.',
      openSettingsBtn: 'Open Parent Settings',
      timeRemaining: 'Time Remaining',
      reset: 'Reset',
      playTimeLimit: 'Play Time Limit',
      minutesUnit: (mins) => `${mins}m`,
      changePinLabel: 'Set / Change 4-Digit Parent PIN',
      pinPlaceholder: '4 digits (e.g. 1234)',
      savePin: 'Save PIN',
      pinError: 'Parent PIN must be exactly 4 digits (0–9).',
      pinSaved: 'Parent PIN updated!',
      lockNow: 'Lock Screen Now',
      breakTitle: 'Time for a Break!',
      breakTimeLimitMsg: (name, mins) =>
        `Great job today, ${name}! You finished ${mins} minutes of play. Time to rest your eyes and stretch!`,
      breakManualMsg: (name) =>
        `Screen time is resting right now, ${name}. Ask a grown-up when it’s time to play again!`,
      parentUnlock: 'Parent Unlock',
      parentVerification: 'Parent Verification',
      hide: 'Hide',
      unlockAndReset: 'Unlock & Reset Timer',
      tabPin: 'Parent PIN',
      tabMath: 'Grown-Up Math',
      defaultPinHintPrefix: 'Default PIN is',
      defaultPinHintSuffix: '(you can change it inside)',
      enterAnswerPlaceholder: 'Enter answer...',
      errNeed4Digits: 'Please enter all 4 digits of the Parent PIN.',
      errWrongPin: 'Incorrect PIN. Try again or switch to Grown-Up Math.',
      errEnterNumber: 'Please enter the number answer.',
      errWrongMath: 'That answer did not match. Try solving the new problem.',
    },
    skyRun: {
      cardTitle: 'Fairy Sky Flight (3D)',
      cardSubtitle:
        'Fly through clouds, grab stars, and blast obstacles with magic answers!',
      cardCta: 'Fly in 3D Sky',
      modeTag: '3D Endless Flight',
      swipeHint: 'Swipe or drag (or use Arrow keys) to fly left, right, up & down',
      pauseTitle: 'Flight Paused',
      resumeFlight: 'Resume Flight',
      exitFlight: 'Exit Flight',
      obstacleBlocked: 'Obstacle Ahead! Answer to cast magic!',
      mathTitle: 'Magic Math Blast',
      mathPrompt: 'Solve the equation to blast the obstacle:',
      englishTitle: 'Magic Spelling Shield',
      englishPrompt: 'Pick the correct English spelling for this picture:',
      hearWord: 'Hear Word',
      musicNoteTitle: 'Magic Note Blast',
      musicChordTitle: 'Magic Chord Blast',
      musicPrompt: 'Listen closely and pick the matching sound:',
      listenAgain: 'Listen Again',
      magicBlastMsg: 'Sparkle Blast! Keep flying!',
      wrongOopsMsg: 'Oops! Watch out ahead!',
      gameOverTitle: 'Flight Complete!',
      gameOverSubtitle: 'Great flying through the sky!',
      starsCollectedLabel: 'Stars Earned',
      obstaclesClearedLabel: 'Obstacles Blasted',
      playAgainBtn: 'Fly Again',
      backToCategoryBtn: 'Back to Games',
      webglFallback: '3D Sky Flight needs WebGL graphics enabled on your device.',
      turnProgressLabel: '3D Flight Turn',
      earnedTurnsLabel: (count) => `${count} ${count === 1 ? 'Turn' : 'Turns'} Ready`,
      nextTurnProgress: (prog) => `Next turn: ${prog}/5`,
      needTurnsCta: (_prog) => `Win a 5/5 Quiz to Unlock`,
      playWithTurnCta: (turns) => `Play Fairy Sky Flight (3D) · ${turns}`,
      useOneTurnHint: 'Answer all 5 questions right on the first try to unlock 1 free 3D flight turn',
      rewardPopupTitle: '3D Flight Turn Earned!',
      rewardPopupSubtitle:
        'Awesome job! You answered all 5 questions right on the first click and unlocked a free turn of Fairy Sky Flight (3D)!',
      rewardPopupPlayBtn: 'Play Fairy Sky Flight (3D)',
      rewardPopupContinueBtn: 'Keep Playing',
      flyAgainWithTurnBtn: (turns) => `Fly Again (${turns} Left)`,
      noTurnsLeftMsg:
        'No 3D flight turns left! Give 5 correct answers in Music, Math, or English to earn another turn.',
    },
  },
  si: {
    appName: 'SmartKids',
    appTagline: 'සංගීතය, ගණිතය, ඉංග්‍රීසි සහ සිංහල ඉගෙන ගමු',
    header: {
      categories: 'විෂයන්',
      switchPlayer: 'මාරු කරන්න',
      dictionary: 'ශබ්දකෝෂය',
      myRewards: 'මගේ තෑගි',
      rewardsShort: 'තෑගි',
      parentLock: 'දෙමාපිය අගුල',
      marimba: 'මැරිම්බා',
      piano: 'පියානෝ',
      mute: 'හඬ නවතන්න',
      unmute: 'හඬ දමන්න',
      installApp: 'ඇප් එක දාගන්න',
      installShort: 'දාගන්න',
      iosInstallTitle: 'SmartKids ඇප් එක දාගන්න',
      iosInstallSubtitle: 'අන්තර්ජාලය නැතිව 100% ක්‍රීඩා කරන්න!',
      iosStep1Prefix: 'Safari හි',
      iosShareWord: 'Share',
      iosStep1Suffix: 'බොත්තම ඔබන්න.',
      iosStep2Prefix: 'පහළට ගොස්',
      iosStep2Bold: 'Add to Home Screen',
      gotIt: 'හරි, තේරුණා!',
      offlineBanner: 'නොබැඳි ප්‍රකාරය — සියලු ක්‍රීඩා සහ ප්‍රගතිය සූදානම්',
    },
    home: {
      wardrobeBtn: 'ඇඳුම් පෙට්ටිය',
      footerHint:
        'විනෝද දස්කම් බලන්න චරිතය ඔබන්න · තරු එකතු කර තෑගි සහ ඇඳුම් අගුළු අරින්න',
      welcomeMsg: (name) => `ආයුබෝවන් ${name}! සංගීතය, ගණිතය හෝ ඉංග්‍රීසි තෝරන්න!`,
      categoryMsg: {
        music: (name) => `අපි සංගීතය සෙල්ලම් කරමු, ${name}!`,
        math: (name) => `ගණිත ප්‍රහේලිකා විසඳන්න සූදානම්ද, ${name}?`,
        english: (name) => `අපි එකට ඉංග්‍රීසි ඉගෙන ගමු, ${name}!`,
      },
      tapMsg: {
        owl: 'හූ-හූ! ඔබට පුළුවන්!',
        fairy: 'මැජික් දීප්තිය! අපි සෙල්ලම් කරමු!',
        runner_boy: 'සූදානම්! අපි පැනලා ඉගෙන ගමු!',
        runner_girl: 'දුවමු මායා! අද ප්‍රහේලිකා ජයගමු!',
      },
      studioTitles: {
        music: { first: 'සංගීත', accent: 'මැදිරිය' },
        math: { first: 'ගණිත', accent: 'ගවේෂණය' },
        english: { first: 'ඉංග්‍රීසි', accent: 'උයන' },
      },
      categories: {
        music: {
          title: 'සංගීතය',
          subtitle:
            'මැරිම්බා සහ පියානෝ සමඟ සවන්දීමේ පුහුණුව: ස්වරය, තාලය, උස් පහත් හා කෝඩ් හඳුනාගන්න.',
          cta: 'සංගීතයට යන්න',
        },
        math: {
          title: 'ගණිතය',
          subtitle:
            'එකතු කිරීම (+), අඩු කිරීම (−), ගුණ කිරීම (×) සහ බෙදීම (÷) ක්‍රීඩා.',
          cta: 'ගණිතයට යන්න',
        },
        english: {
          title: 'ඉංග්‍රීසි',
          subtitle:
            'අසා ලිවීම, පින්තූරය නම් කිරීම සහ වචන ගැලපීමෙන් ඉංග්‍රීසි ඉගෙන ගන්න.',
          cta: 'ඉංග්‍රීසියට යන්න',
        },
      },
    },
    mascots: {
      owl: { name: 'ඔලී බකමූණා', shortLabel: 'ඔලී බකමූණා' },
      fairy: { name: 'ස්පාර්ක්ල් සුරංගනාවි', shortLabel: 'සුරංගනාවි' },
      runner_boy: { name: 'ලියෝ (පිරිමි)', shortLabel: 'ලියෝ' },
      runner_girl: { name: 'මායා (ගැහැණු)', shortLabel: 'මායා' },
    },
    levels: {
      beginner: {
        label: 'ආරම්භක',
        summary: 'තනි ඉලක්කම් ගණිතය · ස්වර 5 සංගීතය (C–G) · කෙටි අකුරු 3–4 වචන',
      },
      intermediate: {
        label: 'මධ්‍යම',
        summary: 'ඉලක්කම් 2 ගණිතය · ස්වර 7 සංගීතය (C–B) · අකුරු 5–6 වචන',
      },
      advanced: {
        label: 'උසස්',
        summary: 'විශාල ගණිතය · ස්වර 12 හා කෝඩ් 6 සංගීතය · අකුරු 6–8 වචන',
      },
      extreme: {
        label: 'අති උසස්',
        summary: 'පියවර කිහිපයක ගණිතය · නිවැරදි කෝඩ් හඳුනාගැනීම · දිගු වචන',
      },
    },
    common: {
      stars: 'තරු',
      round: 'වටය',
      streak: 'පිට පිට',
      difficultyLevel: 'අපහසුතා මට්ටම',
      pausedTitle: 'ක්‍රීඩාව නවතා ඇත',
      resume: 'දිගටම කරන්න',
      fairyWardrobe: 'සුරංගනා ඇඳුම් පෙට්ටිය',
      restartSet: 'නැවත අරඹන්න',
      switchCategory: 'විෂය මාරු කරන්න',
      playAgain: 'නැවත ක්‍රීඩා කරන්න',
      needHint: 'ඉඟියක් ඕනෑද?',
      unlockedPrefix: 'අගුළු ඇරුණා:',
      backToGames: 'ක්‍රීඩා වෙත යන්න',
      allModes: 'සියලු ක්‍රීඩා',
      mathModes: 'ගණිත ක්‍රීඩා',
      englishModes: 'ඉංග්‍රීසි ක්‍රීඩා',
      totalStarsCollected: 'මුළු තරු ගණන',
      dressUpSparkle: 'ඇඳුම් පෙට්ටියෙන් සුරංගනාවි සරසන්න',
      confirmCloseTitle: 'ඔබට විශ්වාසද?',
      confirmCloseMessage: 'ඔබට මෙය වැසීමට අවශ්‍යද?',
      confirmExitGameMessage: 'ඔබට මෙම ක්‍රීඩාවෙන් ඉවත් වීමට අවශ්‍යද?',
      yes: 'ඔව්',
      no: 'නැහැ',
      quizGameOverTitle: 'ක්‍රීඩාව අවසන්!',
      quizGameOverSubtitle:
        'එක් වැරදි පිළිතුරකින් ක්‍රීඩාව අවසන් වන අතර 3D ක්‍රීඩාව අගුළු නොඇරේ. සෑම ප්‍රශ්නයකටම පළමු වරටම නිවැරදිව පිළිතුරු දෙන්න!',
      tryAgain: 'නැවත උත්සාහ කරන්න',
      scoreBeforeLoss: (stars, total) => `නිවැරදි පිළිතුරු: ${stars} / ${total}`,
    },
    music: {
      modes: {
        GUESS_NOTE: {
          title: 'ස්වරය හඳුනාගන්න',
          cta: 'ස්වර සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'හඬ අසා ගැලපෙන C–G / Sa–Pa යතුර ඔබන්න.'
              : lvl === 'intermediate'
              ? 'සම්පූර්ණ ස්වර 7න් (C–B / Sa–Ni) හඬ හඳුනාගන්න.'
              : 'Sharps සහ Flats ඇතුළු ස්වර 12ම ප්‍රගුණ කරන්න!',
        },
        COPY_MELODY: {
          title: 'තාලය අනුකරණය කරන්න',
          cta: 'තාල සෙල්ලම් කරන්න',
          subtitle: (_lvl, startLen, maxLen) =>
            `හොඳින් අසා (ස්වර ${startLen}–${maxLen}) එම අනුපිළිවෙලටම වාදනය කරන්න!`,
        },
        HIGH_LOW: {
          title: 'උස් ද? පහත් ද?',
          cta: 'හඬ උස්-පහත්',
          subtitle: (lvl) =>
            lvl === 'extreme'
              ? 'ඉතා සියුම් 1–2 අර්ධ ස්වර වෙනස්කම් කනෙන් හඳුනාගන්න!'
              : 'ස්වර දෙකක් අසා දෙවන හඬ ඉහළට යනවාද පහළට යනවාද තෝරන්න.',
        },
        GUESS_CHORD: {
          title: 'කෝඩ් එක හඳුනාගන්න',
          cta: 'කෝඩ් සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'කෝඩ් එක ප්‍රීතිමත් (Major) ද සෞම්‍ය (Minor) ද කියා සොයන්න!'
              : lvl === 'intermediate'
              ? 'Major, Minor, Diminished සහ Augmented කෝඩ් හඳුනාගන්න.'
              : lvl === 'advanced'
              ? 'Sus4 සහ Dominant 7th ඇතුළු කෝඩ් වර්ග 6ක් හඳුනාගන්න!'
              : 'නිවැරදි මුල් ස්වරය (C–B) සහ කෝඩ් වර්ගය දෙකම තෝරන්න!',
        },
      },
      listenAgain: 'නැවත අසන්න',
      listening: 'අසමින්...',
      instrumentSound: 'සංගීත භාණ්ඩය',
      listenClosely: 'හොඳින් සවන් දෙන්න!',
      guessPrompt: 'කනෙන් අසන්න! මෙය කුමන යතුරේ ස්වරයද?',
      melodyPrompt: (len) => `හොඳින් අසන්න (ස්වර ${len})...`,
      melodyTurn: 'දැන් ඔබේ වාරය! තාලය නැවත වාදනය කරන්න.',
      highLowPrompt: '2වන ස්වරය උස් ද පහත් ද?',
      chordExactPrompt: 'නිවැරදි මුල් ස්වරය සහ කෝඩ් වර්ගය තෝරන්න!',
      chordTypePrompt: 'ඔබට ඇසෙන කෝඩ් වර්ගය කුමක්ද?',
      firstSound: 'පළමු හඬ',
      secondSound: 'දෙවන හඬ',
      higher: 'උස් හඬ',
      goesUp: 'ඉහළට යයි',
      lower: 'පහත් හඬ',
      goesDown: 'පහළට යයි',
      chordLabel: 'කෝඩ් එක:',
      pickRoot: '1. මුල් ස්වරය තෝරන්න (C – B)',
      pickType: '2. කෝඩ් වර්ගය තෝරන්න',
      selectRootAndType: 'ස්වරය සහ වර්ගය තෝරන්න',
      checkPrefix: 'පරීක්ෂා කරන්න:',
      keyLabel: (n) => `යතුර ${n}`,
      chordQualities: {
        major: { label: 'Major', moodHint: 'ප්‍රීතිමත් හා දීප්තිමත්' },
        minor: { label: 'Minor', moodHint: 'සෞම්‍ය හා සිහිනමය' },
        diminished: { label: 'Diminished', moodHint: 'තියුණු හා ගුප්ත' },
        augmented: { label: 'Augmented', moodHint: 'පාවෙන අභ්‍යවකාශ හඬක්' },
        sus4: { label: 'Sus4', moodHint: 'විවෘත හා බලාපොරොත්තු' },
        dom7: { label: 'Dominant 7th', moodHint: 'ජෑස් හා බ්ලූස්' },
        maj7: { label: 'Major 7th', moodHint: 'උණුසුම් හා සුමට' },
      },
      feedback: {
        guessCorrect: (w, s) => `නියමයි! එය ${w} (${s}) ස්වරයයි!`,
        guessWrong: (w, s) => `එය ${w} (${s}). නැවත උත්සාහ කරන්න!`,
        melodyPerfect: 'හූ-රේ! තාලය හරියටම මතක තියාගත්තා!',
        melodyProgress: (left) => `හොඳයි! තව ${left}ක් ඉතිරියි...`,
        melodyOops: 'අයියෝ! තාලය නැවත අසන්න!',
        highLowCorrect: (note, dir) =>
          `ඔව්! ${note} යනු ${dir === 'higher' ? 'උස් හඬක් ↑' : 'පහත් හඬක් ↓'}!`,
        highLowWrong: 'හ්ම්, 2වන ස්වරය නැවත අසා බලන්න!',
        chordCorrect: (root, qual) => `හරියටම හරි! එය ${root} ${qual}!`,
        chordWrong: (qual) => `${qual} නොවේ! නැවත කෝඩ් හඬට සවන් දෙන්න.`,
        exactChordCorrect: (root, qual) => `සුපිරි! නිවැරදි කෝඩ්: ${root} ${qual}!`,
        exactChordRightRoot: (root) => `මුල් ස්වරය (${root}) හරි! කෝඩ් වර්ගය බලන්න.`,
        exactChordRightType: (qual) => `වර්ගය (${qual}) හරි! මුල් ස්වරය අසන්න.`,
        exactChordWrongBoth: 'හරියටම නැහැ! මුල් ස්වරය හා කෝඩ් හඬ හොඳින් අසන්න.',
      },
      victoryMascotMsg: 'ඔබ සංගීත තරුවක්!',
      victoryHeading: (name) => `හරිම දක්ෂයි, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) =>
        `ඔබ ${lvlLabel} ${modeTitle} ජයගත්තා!`,
      footerHighLow: 'උඩ / පහළ ඊතල: පිළිතුර · Space: නැවත අසන්න · Esc: නවතන්න',
      footerExactChord:
        'යතුරු 1–7: වර්ගය · Enter: පරීක්ෂා කරන්න · Space: නැවත අසන්න · Esc: නවතන්න',
      footerChord: (count) =>
        `යතුරු 1–${count}: කෝඩ් තෝරන්න · Space: නැවත අසන්න · Esc: නවතන්න`,
      footerSharps:
        'A–J සහ W/E/T/Y/U: වාදනය · Space: නැවත අසන්න · Esc: නවතන්න',
      footerNaturals: (count) =>
        `යතුරු 1–${count}: වාදනය · Space: නැවත අසන්න · Esc: නවතන්න`,
    },
    math: {
      modes: {
        ADDITION: {
          title: 'එකතු කිරීම (+)',
          cta: '+ සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'තනි ඉලක්කම් එකට එකතු කරන්න!'
              : lvl === 'extreme'
              ? 'ගුණ කිරීම සහ එකතු කිරීම මිශ්‍ර ගැටලු.'
              : 'විශාල සංඛ්‍යා ඉක්මනින් එකතු කරන්න.',
        },
        SUBTRACTION: {
          title: 'අඩු කිරීම (−)',
          cta: '− සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'සරල ඉලක්කම් පහසුවෙන් අඩු කරන්න.'
              : lvl === 'extreme'
              ? 'ගුණ කිරීම සහ අඩු කිරීම මිශ්‍ර අභියෝග.'
              : 'නිවැරදිව වෙනස සොයාගන්න.',
        },
        MULTIPLICATION: {
          title: 'ගුණ කිරීම (×)',
          cta: '× සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'පහසු 1×1 සිට 5×5 දක්වා ගුණ කිරීම!'
              : lvl === 'extreme'
              ? 'වරහන් සහ පියවර කිහිපයක ගුණ කිරීම්.'
              : 'ගුණ කිරීමේ වගු පියවරෙන් පියවර ජයගන්න.',
        },
        DIVISION: {
          title: 'බෙදීම (÷)',
          cta: '÷ සෙල්ලම් කරන්න',
          subtitle: (lvl) =>
            lvl === 'beginner'
              ? 'සංඛ්‍යා සමාන කොටස්වලට බෙදන්න.'
              : lvl === 'extreme'
              ? 'පියවර දෙකකින් බෙදීම හා එකතු කිරීම!'
              : 'පූර්ණ සංඛ්‍යා බෙදීම් විසඳන්න.',
        },
        MIXED: {
          title: 'මිශ්‍ර ගණිත අභියෝගය',
          cta: 'මිශ්‍ර සෙල්ලම්',
          subtitle: () =>
            'එකතු, අඩු, ගුණ, බෙදීම් (+, −, ×, ÷) සියල්ල එකට!',
        },
      },
      stageTitles: {
        ADDITION: 'එකතු කිරීම (+)',
        SUBTRACTION: 'අඩු කිරීම (−)',
        MULTIPLICATION: 'ගුණ කිරීම (×)',
        DIVISION: 'බෙදීම (÷)',
        MIXED: 'මිශ්‍ර ගණිත අභියෝගය',
      },
      initialMsg: 'ගණිත ගැටලුව විසඳන්න!',
      nextMsg: 'ඊළඟ ගණිත ගැටලුව මෙන්න!',
      correctMsg: (expr, ans) => `නිවැරදියි! ${expr} = ${ans}!`,
      wrongMsg: 'හරියටම නැහැ! නැවත හොඳින් ගණන් කරන්න.',
      victoryMascotMsg: 'ගණිත විශාරදයෙක්!',
      victoryHeading: (name) => `සුපිරි ගණිතය, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) =>
        `ඔබ ${lvlLabel} ${modeTitle} සම්පූර්ණ කළා!`,
      footerKeypad: 'ඉලක්කම් ටයිප් කර Enter ඔබන්න · Esc: නවතන්න',
      footerChoices: 'පිළිතුරට යතුරු 1–4 ඔබන්න · Esc: නවතන්න',
    },
    english: {
      modes: {
        DICTATION: {
          title: 'අසා ලිවීම (Dictation)',
          subtitle: 'ඉංග්‍රීසි වචනය අසා නිවැරදි ඉංග්‍රීසි අක්ෂර ලියන්න.',
          cta: 'අසා ලියන්න',
        },
        NAME_PICTURE: {
          title: 'පින්තූරය නම් කරන්න',
          subtitle: 'පින්තූරය බලා එහි ඉංග්‍රීසි වචනය ලියන්න.',
          cta: 'පින්තූර සෙල්ලම',
        },
        MATCH_WORD: {
          title: 'වචනය ගලපන්න',
          subtitle: 'ඉංග්‍රීසි වචනය කියවා ගැලපෙන පින්තූර කාඩ්පත ඔබන්න!',
          cta: 'ගැලපීම සෙල්ලම්',
        },
      },
      stageTitles: {
        DICTATION: 'අසා ලිවීම (Dictation)',
        NAME_PICTURE: 'පින්තූරය නම් කරන්න',
        MATCH_WORD: 'වචනය ගලපන්න',
      },
      dictationPrompt: 'හොඳින් අසා ඉංග්‍රීසි අක්ෂර ටයිප් කරන්න!',
      namePicturePrompt: 'මෙම පින්තූරයට ඉංග්‍රීසියෙන් කියන්නේ කුමක්ද?',
      matchWordPrompt: 'වචනයට ගැලපෙන පින්තූරය ඔබන්න!',
      hearWordAgain: 'වචනය නැවත අසන්න',
      typeSpellingPlaceholder: 'ඉංග්‍රීසි වචනය මෙතන ලියන්න...',
      typeWordPlaceholder: 'ඉංග්‍රීසි වචනය ලියන්න...',
      checkSpelling: 'අක්ෂර පරීක්ෂා කරන්න',
      checkWord: 'වචනය පරීක්ෂා කරන්න',
      lettersCount: (n) => `අකුරු ${n}ක්`,
      correctTyped: (emoji, word) => `නියමයි! ${emoji} ${word.toUpperCase()}!`,
      wrongTyped: 'අයියෝ! අක්ෂර පරීක්ෂා කර නැවත උත්සාහ කරන්න!',
      correctMatch: (emoji, word) => `හරියටම හරි! ${emoji} යනු ${word}!`,
      wrongMatch: (word) => `එම පින්තූරය "${word}" — වෙනත් එකක් බලන්න!`,
      victoryMascotMsg: 'වචන මැජික්කරු!',
      victoryHeading: (name) => `දක්ෂ ඉංග්‍රීසි, ${name}!`,
      victorySubtitle: (lvlLabel, modeTitle) =>
        `ඔබ ${lvlLabel} ${modeTitle} සම්පූර්ණ කළා!`,
      footerMatch: 'ගැලපෙන පින්තූරය ඔබන්න · Esc: නවතන්න',
      footerType: 'පිළිතුර ලියා Enter ඔබන්න · Esc: නවතන්න',
    },
    dictionary: {
      cardSubtitle:
        'සිංහල තේරුම් සමඟ වචන බලන්න, ඉංග්‍රීසි හා සිංහල උච්චාරණ දෙකම අසන්න!',
      openBtn: 'ශබ්දකෝෂය අරින්න',
      title: 'පින්තූර ශබ්දකෝෂය',
      subtitle: 'English ↔ සිංහල — උච්චාරණ දෙකම සමඟ',
      hearBoth: 'දෙකම අසන්න',
      englishHeader: 'ඉංග්‍රීසි වචනය සහ හඬ',
      sinhalaHeader: 'සිංහල තේරුම',
      sayLabel: 'කියන්න:',
      emptyText: 'මෙම කාණ්ඩයේ වචන තවම නැත.',
      wordsCount: (count) => `වචන ${count}`,
      categories: {
        All: 'සියල්ල',
        Animals: 'සතුන්',
        Nature: 'ස්වභාවධර්මය',
        Food: 'ආහාර',
        Objects: 'භාණ්ඩ',
        Music: 'සංගීතය',
        People: 'මිනිසුන්',
        Actions: 'ක්‍රියා',
      },
    },
    profiles: {
      title: 'ක්‍රීඩකයින්',
      subtitle: 'සෑම ක්‍රීඩකයෙකුගේම තරු, චරිත සහ ඇඳුම් වෙනම සුරකින්න',
      addNew: 'නව ක්‍රීඩකයෙකු එක් කරන්න',
      placeholder: 'ක්‍රීඩකයාගේ නම ලියන්න...',
      create: 'සාදන්න',
      starterFriend: 'මුල් මිතුරා:',
      savedProfiles: (count) => `සුරැකි ක්‍රීඩකයින් (${count})`,
      outfitsCount: (unlocked, total) => `ඇඳුම් ${unlocked}/${total}`,
    },
    rewards: {
      title: 'මගේ තෑගි',
      subtitle: (name, unlocked, total, stars) =>
        `${name} · ${unlocked}/${total} අගුළු ඇරුණා · තරු ${stars}`,
      earned: 'ලබාගත්තා!',
      kinds: {
        trophy: 'කුසලානය',
        badge: 'පදක්කම',
        sticker: 'ස්ටිකරය',
      },
      items: {
        reward_first_star: {
          name: 'පළමු දීප්ති ස්ටිකරය',
          description: 'ඔබේ පළමු තරුව දිනාගන්න!',
        },
        reward_music_maestro: {
          name: 'සංගීත විශාරද පදක්කම',
          description: 'සංගීත ක්‍රීඩා වටයක් සම්පූර්ණ කරන්න',
        },
        reward_math_whiz: {
          name: 'ගණිත දක්ෂ කුසලානය',
          description: 'ගණිත ක්‍රීඩා වටයක් සම්පූර්ණ කරන්න',
        },
        reward_english_star: {
          name: 'අක්ෂර තරු ස්ටිකරය',
          description: 'ඉංග්‍රීසි ක්‍රීඩා වටයක් සම්පූර්ණ කරන්න',
        },
        reward_rising_5: {
          name: 'නැගී එන තරු පදක්කම',
          description: 'මුළු තරු 5ක් එකතු කරන්න',
        },
        reward_streak_5: {
          name: 'පිට පිට 5 ජය ස්ටිකරය',
          description: 'පිට පිට පිළිතුරු 5ක් නිවැරදිව දෙන්න',
        },
        reward_golden_10: {
          name: 'රන් බකමූණු කුසලානය',
          description: 'මුළු තරු 10ක් එකතු කරන්න',
        },
        reward_rainbow_20: {
          name: 'දේදුනු කිරුළු පදක්කම',
          description: 'මුළු තරු 20ක් එකතු කරන්න',
        },
        reward_extreme_hero: {
          name: 'අති උසස් වීර කුසලානය',
          description: 'ඕනෑම ක්‍රීඩාවක් අති උසස් මට්ටමෙන් දිනන්න',
        },
        reward_genius_35: {
          name: 'සුපිරි බුද්ධි කුසලානය',
          description: 'මුළු තරු 35ක් එකතු කරන්න',
        },
      },
    },
    wardrobe: {
      title: 'සුරංගනා ඇඳුම් පෙට්ටිය',
      subtitle: (name, unlocked, total, stars) =>
        `${name} · ${unlocked}/${total} අගුළු ඇරුණා · තරු ${stars}`,
      tapMeMsg: 'කැරකෙන්න මාව ඔබන්න!',
      categories: {
        dress: 'ඇඳුම්',
        shoes: 'සපත්තු',
        crown: 'කිරුළු',
        wings: 'පියාපත්',
      },
      equipped: 'පැළඳ ඇත',
      tapToWear: 'පැළඳීමට ඔබන්න',
      unlockAtStars: (stars) => `තරු ${stars}න් අගුළු අරින්න`,
      done: 'සැරසී අවසන්',
      items: {
        dress_petal: 'රෝස මල් ගවුම',
        dress_starlight: 'තරු එළිය ගවුම',
        dress_rainbow: 'දේදුනු දිදුලන ගවුම',
        dress_emerald: 'මරකත සංගීත ගවුම',
        shoes_ballet: 'රෝස සපත්තු',
        shoes_crystal: 'අහස් පළිඟු සපත්තු',
        shoes_gold: 'රන් තරු සපත්තු',
        crown_flower: 'ඩේසි මල් ක්ලිප් එක',
        crown_silver: 'රිදී ස්වර ඔටුන්න',
        crown_royal: 'රන් මැණික් ඔටුන්න',
        crown_rainbow: 'දේදුනු තරු වළල්ල',
        wings_dewdrop: 'පිනි බිඳු පියාපත්',
        wings_butterfly: 'සමනල පියාපත්',
        wings_aurora: 'අරෝරා දීප්ති පියාපත්',
      },
    },
    parental: {
      settingsTitle: 'දෙමාපිය අගුල',
      settingsSubtitle: 'තිර කාල සීමාව සහ දෙමාපිය PIN අංකය',
      verifyPrompt:
        'දෙමාපිය සැකසුම් විවෘත කිරීමට ඔබේ PIN අංකය හෝ වැඩිහිටි ගණිත ගැටලුව විසඳන්න.',
      openSettingsBtn: 'දෙමාපිය සැකසුම් අරින්න',
      timeRemaining: 'ඉතිරි කාලය',
      reset: 'යළි පිහිටුවන්න',
      playTimeLimit: 'ක්‍රීඩා කාල සීමාව',
      minutesUnit: (mins) => `මිනි ${mins}`,
      changePinLabel: 'ඉලක්කම් 4 දෙමාපිය PIN සකසන්න / මාරු කරන්න',
      pinPlaceholder: 'ඉලක්කම් 4 (උදා: 1234)',
      savePin: 'PIN සුරකින්න',
      pinError: 'දෙමාපිය PIN අංකය හරියටම ඉලක්කම් 4ක් (0–9) විය යුතුය.',
      pinSaved: 'දෙමාපිය PIN යාවත්කාලීන විය!',
      lockNow: 'දැන් තිරය අගුළු දමන්න',
      breakTitle: 'විවේක ගැනීමට වෙලාවයි!',
      breakTimeLimitMsg: (name, mins) =>
        `හරිම අගෙයි, ${name}! ඔබ අද මිනිත්තු ${mins}ක ක්‍රීඩා කාලය සම්පූර්ණ කළා. දැන් ඇස්වලට විවේකයක් දෙන්න!`,
      breakManualMsg: (name) =>
        `දැන් තිරය විවේක ගනිමින් සිටී, ${name}. නැවත ක්‍රීඩා කිරීමට වැඩිහිටියෙකුගෙන් අසන්න!`,
      parentUnlock: 'දෙමාපියන් අගුළු අරින්න',
      parentVerification: 'දෙමාපිය තහවුරු කිරීම',
      hide: 'සඟවන්න',
      unlockAndReset: 'අගුළු ඇර කාලය අරඹන්න',
      tabPin: 'දෙමාපිය PIN',
      tabMath: 'වැඩිහිටි ගණිතය',
      defaultPinHintPrefix: 'මූලික PIN අංකය',
      defaultPinHintSuffix: '(ඇතුළතදී මාරු කළ හැක)',
      enterAnswerPlaceholder: 'පිළිතුර ලියන්න...',
      errNeed4Digits: 'කරුණාකර ඉලක්කම් 4 PIN අංකයම ඇතුළත් කරන්න.',
      errWrongPin: 'PIN අංකය වැරදියි. නැවත බලන්න හෝ වැඩිහිටි ගණිතය භාවිතා කරන්න.',
      errEnterNumber: 'කරුණාකර සංඛ්‍යාත්මක පිළිතුර ඇතුළත් කරන්න.',
      errWrongMath: 'එම පිළිතුර නොගැලපේ. අලුත් ගැටලුව විසඳා බලන්න.',
    },
    skyRun: {
      cardTitle: 'සුරංගනා අහස් පියාසැරිය (3D)',
      cardSubtitle:
        'වලාකුළු අතරින් පියාසර කර තරු එකතු කර මැජික් පිළිතුරු වලින් බාධක බිඳින්න!',
      cardCta: '3D අහසේ පියාසර කරන්න',
      modeTag: '3D පියාසැරි ක්‍රීඩාව',
      swipeHint: 'වමට, දකුණට, උඩට හා පහළට පියාසර කිරීමට Swipe හෝ ඊතල යතුරු ඔබන්න',
      pauseTitle: 'පියාසැරිය නවතා ඇත',
      resumeFlight: 'පියාසැරිය දිගටම කරන්න',
      exitFlight: 'පිටවන්න',
      obstacleBlocked: 'ඉදිරියේ බාධකයක්! මැජික් දමන්න පිළිතුරු දෙන්න!',
      mathTitle: 'මැජික් ගණිත ප්‍රහාරය',
      mathPrompt: 'බාධකය විනාශ කිරීමට ගණිත ගැටලුව විසඳන්න:',
      englishTitle: 'මැජික් ඉංග්‍රීසි අක්ෂර',
      englishPrompt: 'පින්තූරයට ගැලපෙන නිවැරදි ඉංග්‍රීසි අක්ෂර තෝරන්න:',
      hearWord: 'වචනය අසන්න',
      musicNoteTitle: 'මැජික් ස්වර ප්‍රහාරය',
      musicChordTitle: 'මැජික් කෝඩ් ප්‍රහාරය',
      musicPrompt: 'හඬ හොඳින් අසා ගැලපෙන පිළිතුර තෝරන්න:',
      listenAgain: 'නැවත අසන්න',
      magicBlastMsg: 'සුපිරි මැජික්! ඉදිරියට පියාසර කරන්න!',
      wrongOopsMsg: 'අයියෝ! හදවතක් අඩු වුණා!',
      gameOverTitle: 'පියාසැරිය අවසන්!',
      gameOverSubtitle: 'අහසේ හරිම ලස්සනට පියාසර කළා!',
      starsCollectedLabel: 'දිනූ තරු ගණන',
      obstaclesClearedLabel: 'බිඳ දැමූ බාධක',
      playAgainBtn: 'නැවත පියාසර කරන්න',
      backToCategoryBtn: 'ක්‍රීඩා වෙත යන්න',
      webglFallback: '3D අහස් පියාසැරිය සඳහා WebGL ග්‍රැෆික්ස් අවශ්‍ය වේ.',
      turnProgressLabel: '3D පියාසැරි වාරය',
      earnedTurnsLabel: (count) => `සූදානම් වාර: ${count}`,
      nextTurnProgress: (prog) => `ඊළඟ වාරය: ${prog}/5`,
      needTurnsCta: (_prog) => `අගුළු ඇරීමට 5/5 දිනන්න`,
      playWithTurnCta: (turns) => `Fairy Sky Flight (3D) ක්‍රීඩා කරන්න · ${turns}`,
      useOneTurnHint: 'ප්‍රශ්න 5ම පළමු වරටම නිවැරදිව විසඳා නොමිලේ 3D පියාසැරි වාරයක් දිනාගන්න',
      rewardPopupTitle: '3D පියාසැරි වාරයක් දිනාගත්තා!',
      rewardPopupSubtitle:
        'නියමයි! ඔබ ප්‍රශ්න 5ම පළමු වරටම නිවැරදිව පිළිතුරු දී Fairy Sky Flight (3D) නොමිලේ වාරයක් දිනා ගත්තා!',
      rewardPopupPlayBtn: 'Play Fairy Sky Flight (3D)',
      rewardPopupContinueBtn: 'දිගටම සෙල්ලම් කරන්න',
      flyAgainWithTurnBtn: (turns) => `නැවත පියාසර කරන්න (${turns}ක් ඉතිරියි)`,
      noTurnsLeftMsg:
        'තව 3D පියාසැරි වාර නැත! අලුත් වාරයක් දිනා ගැනීමට සංගීතය, ගණිතය හෝ ඉංග්‍රීසි ප්‍රශ්න 5කට නිවැරදිව පිළිතුරු දෙන්න.',
    },
  },
};
