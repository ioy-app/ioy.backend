import db from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Тип данных — как у тебя в проекте
interface Game {
  title: string;
  description: string;
  tags: string[];
  creator_id: number;
}

// Базы для генерации
const prefixes = ['Eternal', 'Shadow', 'Neon', 'Quantum', 'Cyber', 'Stellar', 'Arcane', 'Void', 'Nexus', 'Chrono'];
const nouns = ['Legends', 'Chronicles', 'Odyssey', 'Requiem', 'Empire', 'Legacy', 'Awakening', 'Ascension', 'Fate', 'Horizon'];
const suffixes = ['Online', 'Saga', 'Unleashed', 'Remastered', 'Definitive Edition', '2077', 'Infinity', 'Zero', 'Prime', 'Revolution'];

const tagSets = [
  ['action', 'shooter', 'fps'],
  ['rpg', 'open-world', 'story-rich'],
  ['strategy', 'turn-based', '4x'],
  ['puzzle', 'casual', 'relaxing'],
  ['horror', 'survival', 'atmospheric'],
  ['racing', 'arcade', 'multiplayer'],
  ['simulation', 'management', 'realistic'],
  ['adventure', 'exploration', 'narrative'],
  ['platformer', 'retro', 'pixel'],
  ['fighting', 'competitive', 'esports'],
  ['roguelike', 'procedural', 'permadeath'],
  ['stealth', 'tactical', 'single-player'],
];

const descriptions = [
  'Погрузитесь в захватывающий мир, где каждое решение меняет ход истории.',
  'Динамичные сражения, глубокая прокачка и нелинейный сюжет ждут вас.',
  'Создайте свою империю, развивайте технологии и доминируйте на карте.',
  'Расслабляющая атмосфера и вдумчивые головоломки для спокойного вечера.',
  'Выживайте в жутком мире, где каждый звук может стать последним.',
  'Гонки на пределе возможностей — от городских улиц до космических трасс.',
  'Управляйте фермой, городом или космической станцией с реалистичной физикой.',
  'Исследуйте древние руины, раскрывайте тайны и спасайте мир.',
  'Платформер в стиле 90-х с современными механиками и саундтреком.',
  'Сражайтесь один на один в киберспортивной арене с глобальным рейтингом.',
  'Каждый запуск — новая вселенная. Смерть окончательна. Выживите.',
  'Станьте тенью: проникайте на базы, избегайте охраны, выполняйте миссии.',
];

function generateUniqueTitle(usedTitles: Set<string>): string {
  let attempts = 0;
  while (attempts < 100) {
    const parts = [
      prefixes[Math.floor(Math.random() * prefixes.length)],
      nouns[Math.floor(Math.random() * nouns.length)],
      suffixes[Math.floor(Math.random() * suffixes.length)]
    ];
    // Удаляем "Definitive Edition" из середины, оставляем только в конце
    const title = parts.filter(p => p !== 'Definitive Edition').join(' ') +
      (Math.random() > 0.7 ? ' Definitive Edition' : '');
    
    if (!usedTitles.has(title)) {
      usedTitles.add(title);
      return title;
    }
    attempts++;
  }
  // Fallback — добавляем номер, если коллизии
  return `Game ${Date.now() + Math.random()}`;
}

async function generateGames(count: number): Game[] {
  const games: Game[] = [];
  const usedTitles = new Set<string>();

  for (let i = 0; i < count; i++) {
    const title = generateUniqueTitle(usedTitles);
    const tagSet = tagSets[Math.floor(Math.random() * tagSets.length)];
    const tags = [...new Set([
      ...tagSet.slice(0, 2), // Берём 2 основных тега
      ...tagSets[Math.floor(Math.random() * tagSets.length)].slice(0, 1) // + 1 случайный
    ])];

    const game: Game = {
      title,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      tags,
      creator_id: Math.floor(Math.random() * 3) + 1 // 1, 2 или 3
    };

    await db.query(`
        INSERT INTO "games" (
            title,
            description,
            tags,
            creater_id
        )
        VALUES (
            $1,
            $2,
            $3,
            $4
        )
    `, [ title, game.description, tags, game.creator_id ]);
  }

  return games;
}

// Генерация и запись
const games = generateGames(1000);
console.log(games);