import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export interface HighscoreEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

// In-memory fallback array for global highscores
let globalHighscores: HighscoreEntry[] = [
  { id: '1', name: 'Alchemist Prime', score: 320, level: 6, date: '2026-07-28' },
  { id: '2', name: 'Midas Master', score: 210, level: 4, date: '2026-07-28' },
  { id: '3', name: 'Chaos Mage', score: 145, level: 3, date: '2026-07-28' },
];

/**
 * Erstellt dynamisch den Redis-Client mit Support für Upstash & Vercel KV Env-Variablen.
 * Gibt null zurück, falls keine Keys konfiguriert sind.
 */
function getRedisClient(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      return null;
    }

    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const redis = getRedisClient();
    if (redis) {
      const rawScores = await redis.zrange<string[]>('highscores', 0, 9, { rev: true });

      if (rawScores && rawScores.length > 0) {
        const parsed: HighscoreEntry[] = rawScores.map((item) => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return { id: '1', name: String(item), score: 0, level: 1, date: '' };
            }
          }
          return item as unknown as HighscoreEntry;
        });
        return NextResponse.json(parsed);
      }
    }
  } catch {
    // Abgefangen: Verhindert Crashes bei Verbindungsproblemen
  }

  return NextResponse.json(globalHighscores || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, score, level } = body;

    if (typeof score !== 'number' || typeof level !== 'number') {
      return NextResponse.json({ error: 'Ungültige Daten' }, { status: 400 });
    }

    const newEntry: HighscoreEntry = {
      id: `hs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: (name || 'Anonymer Alchemist').trim().slice(0, 18),
      score,
      level,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.zadd('highscores', {
          score: newEntry.score,
          member: JSON.stringify(newEntry),
        });

        const updatedRaw = await redis.zrange<string[]>('highscores', 0, 9, { rev: true });
        if (updatedRaw && updatedRaw.length > 0) {
          const parsed: HighscoreEntry[] = updatedRaw.map((item) => {
            if (typeof item === 'string') {
              try {
                return JSON.parse(item);
              } catch {
                return { id: '1', name: String(item), score: 0, level: 1, date: '' };
              }
            }
            return item as unknown as HighscoreEntry;
          });
          return NextResponse.json({ success: true, highscores: parsed });
        }
      }
    } catch {
      // In-Memory Fallback bei Redis-Fehlern
    }

    globalHighscores.push(newEntry);
    globalHighscores.sort((a, b) => b.score - a.score);
    globalHighscores = globalHighscores.slice(0, 10);

    return NextResponse.json({ success: true, highscores: globalHighscores });
  } catch {
    return NextResponse.json({ success: true, highscores: globalHighscores || [] });
  }
}
