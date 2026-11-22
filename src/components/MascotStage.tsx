import { EquippedWardrobe, MascotId, MascotMood } from '../types/game';
import { MusicalOwl } from './MusicalOwl';
import { MusicalFairy } from './MusicalFairy';
import { ExtraCharacterId, MascotCharacter } from './MascotCharacters';

interface MascotStageProps {
  mascot: MascotId;
  mood: MascotMood;
  message?: string;
  size?: 'avatar' | 'sm' | 'md' | 'lg' | 'xl';
  streak?: number;
  equipped?: EquippedWardrobe;
  interactive?: boolean;
  variant?: 'menu' | 'gameplay';
  onTap?: () => void;
}

export function MascotStage({
  mascot,
  mood,
  message,
  size = 'md',
  streak = 0,
  equipped,
  interactive = true,
  variant = 'menu',
  onTap,
}: MascotStageProps) {
  const isGameplay = variant === 'gameplay';

  if (mascot === 'fairy') {
    return (
      <MusicalFairy
        mood={mood}
        message={message}
        size={size}
        streak={streak}
        equipped={equipped}
        interactive={interactive}
        enableFullScreenFly={isGameplay}
        onTap={onTap}
      />
    );
  }

  if (mascot === 'owl') {
    return (
      <MusicalOwl
        mood={mood}
        message={message}
        size={size}
        streak={streak}
        interactive={interactive}
        enableFullScreenFly={isGameplay}
        onTap={onTap}
      />
    );
  }

  return (
    <MascotCharacter
      characterId={mascot as ExtraCharacterId}
      mood={mood}
      message={message}
      size={size}
      streak={streak}
      interactive={interactive}
      onTap={onTap}
    />
  );
}
