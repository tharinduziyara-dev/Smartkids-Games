import { EquippedWardrobe, MascotId, MascotMood } from '../types/game';
import { MusicalOwl } from './MusicalOwl';
import { MusicalFairy } from './MusicalFairy';
import { RunnerKid } from './RunnerKid';

interface MascotStageProps {
  mascot: MascotId;
  mood: MascotMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
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

  if (mascot === 'runner_boy' || mascot === 'runner_girl') {
    return (
      <RunnerKid
        gender={mascot === 'runner_boy' ? 'boy' : 'girl'}
        mood={mood}
        message={message}
        size={size}
        streak={streak}
        interactive={interactive}
        trackMode={isGameplay}
        onTap={onTap}
      />
    );
  }

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
