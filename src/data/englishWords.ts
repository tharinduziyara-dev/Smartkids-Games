import { DifficultyLevel } from '../types/game';

export interface EnglishWordItem {
  word: string;
  emoji: string;
  hint: string;
}

export const ENGLISH_WORDS: Record<DifficultyLevel, EnglishWordItem[]> = {
  beginner: [
    { word: 'cat', emoji: '🐱', hint: 'A furry pet that says meow' },
    { word: 'dog', emoji: '🐶', hint: 'A friendly pet that barks' },
    { word: 'sun', emoji: '☀️', hint: 'Bright yellow star in the sky' },
    { word: 'hat', emoji: '🎩', hint: 'You wear this on your head' },
    { word: 'bus', emoji: '🚌', hint: 'Big vehicle that carries kids to school' },
    { word: 'bee', emoji: '🐝', hint: 'A buzzing insect that makes honey' },
    { word: 'fox', emoji: '🦊', hint: 'Clever orange forest animal' },
    { word: 'pig', emoji: '🐷', hint: 'Pink farm animal that says oink' },
    { word: 'owl', emoji: '🦉', hint: 'Wise bird that hoots at night' },
    { word: 'car', emoji: '🚗', hint: 'Has four wheels and drives on roads' },
    { word: 'moon', emoji: '🌙', hint: 'Shines softly in the night sky' },
    { word: 'star', emoji: '⭐', hint: 'Twinkles brightly at night' },
    { word: 'tree', emoji: '🌳', hint: 'Tall plant with trunk and leaves' },
    { word: 'fish', emoji: '🐟', hint: 'Swims underwater with fins' },
    { word: 'frog', emoji: '🐸', hint: 'Green pond jumper that says ribbit' },
    { word: 'duck', emoji: '🦆', hint: 'Water bird that says quack' },
    { word: 'cake', emoji: '🎂', hint: 'Sweet birthday treat with candles' },
    { word: 'book', emoji: '📖', hint: 'Full of pages and stories to read' },
  ],
  intermediate: [
    { word: 'apple', emoji: '🍎', hint: 'Crisp red fruit' },
    { word: 'train', emoji: '🚂', hint: 'Rides along iron tracks' },
    { word: 'piano', emoji: '🎹', hint: 'Musical keyboard instrument' },
    { word: 'robot', emoji: '🤖', hint: 'Friendly mechanical helper' },
    { word: 'tiger', emoji: '🐯', hint: 'Big striped jungle cat' },
    { word: 'cloud', emoji: '☁️', hint: 'Fluffy white shape in the sky' },
    { word: 'grape', emoji: '🍇', hint: 'Small purple bunch of fruit' },
    { word: 'house', emoji: '🏠', hint: 'A cozy place where families live' },
    { word: 'rocket', emoji: '🚀', hint: 'Blasts astronauts into space' },
    { word: 'guitar', emoji: '🎸', hint: 'Musical instrument with six strings' },
    { word: 'turtle', emoji: '🐢', hint: 'Slow reptile with a hard shell' },
    { word: 'banana', emoji: '🍌', hint: 'Curved yellow fruit' },
    { word: 'pencil', emoji: '✏️', hint: 'Used for writing and drawing' },
    { word: 'flower', emoji: '🌸', hint: 'Colorful blooming plant' },
    { word: 'monkey', emoji: '🐵', hint: 'Playful animal that swings in trees' },
    { word: 'cheese', emoji: '🧀', hint: 'Yellow dairy food mice love' },
  ],
  advanced: [
    { word: 'dolphin', emoji: '🐬', hint: 'Smart leaping ocean mammal' },
    { word: 'rainbow', emoji: '🌈', hint: 'Colorful arc after the rain' },
    { word: 'bicycle', emoji: '🚲', hint: 'Two-wheeled pedal ride' },
    { word: 'volcano', emoji: '🌋', hint: 'Mountain that erupts lava' },
    { word: 'penguin', emoji: '🐧', hint: 'Tuxedo bird that loves icy water' },
    { word: 'pumpkin', emoji: '🎃', hint: 'Big round orange autumn gourd' },
    { word: 'unicorn', emoji: '🦄', hint: 'Magical horse with one horn' },
    { word: 'compass', emoji: '🧭', hint: 'Tool that always points north' },
    { word: 'balloon', emoji: '🎈', hint: 'Party float filled with air' },
    { word: 'diamond', emoji: '💎', hint: 'Sparkling precious jewel' },
    { word: 'giraffe', emoji: '🦒', hint: 'Tallest animal with a long neck' },
    { word: 'octopus', emoji: '🐙', hint: 'Ocean creature with eight arms' },
    { word: 'sandwich', emoji: '🥪', hint: 'Tasty filling between slices of bread' },
    { word: 'treasure', emoji: '🪙', hint: 'Gold coins hidden in a chest' },
  ],
  extreme: [
    { word: 'astronaut', emoji: '👩‍🚀', hint: 'Explorer who travels to space' },
    { word: 'crocodile', emoji: '🐊', hint: 'Long scaly river reptile' },
    { word: 'telescope', emoji: '🔭', hint: 'Lens tool for viewing distant stars' },
    { word: 'butterfly', emoji: '🦋', hint: 'Insect with colorful painted wings' },
    { word: 'strawberry', emoji: '🍓', hint: 'Sweet red berry with tiny seeds' },
    { word: 'parachute', emoji: '🪂', hint: 'Canopy that slows a skydiver down' },
    { word: 'watermelon', emoji: '🍉', hint: 'Giant green summer fruit, red inside' },
    { word: 'helicopter', emoji: '🚁', hint: 'Aircraft with spinning top blades' },
    { word: 'microphone', emoji: '🎤', hint: 'Makes a singer’s voice louder' },
    { word: 'lighthouse', emoji: '🗼', hint: 'Tower guiding ships near the coast' },
    { word: 'chameleon', emoji: '🦎', hint: 'Lizard that changes its colors' },
    { word: 'pineapple', emoji: '🍍', hint: 'Spiky tropical yellow fruit' },
    { word: 'stethoscope', emoji: '🩺', hint: 'Doctor’s tool for listening to heartbeats' },
    { word: 'magnifying', emoji: '🔍', hint: 'Glass used for making tiny things look big' },
  ],
};

export function pickEnglishRound(
  level: DifficultyLevel,
  prevWord?: string,
  optionsCount = 4
): { target: EnglishWordItem; choices: EnglishWordItem[] } {
  const pool = ENGLISH_WORDS[level];
  const filtered = pool.filter((item) => item.word !== prevWord);
  const candidates = filtered.length > 0 ? filtered : pool;
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  const distractors = pool
    .filter((item) => item.word !== target.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, optionsCount - 1);

  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}
