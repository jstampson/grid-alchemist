import { NextResponse } from 'next/server';

export interface HighscoreEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

// In-memory array for global highscores
let globalHighscores: HighscoreEntry[] = [
  { id: '1', name: 'Alchemist Prime', score: 320, level: 6, date: '2026-07-28' },
  { id: '2', name: 'Midas Master', score: 210, level: 4, date: '2026-07-28' },
  { id: '3', name: 'Chaos Mage', score: 145, level: 3, date: '2026-07-28' },
];

export async function GET() {
  return NextResponse.json(globalHighscores);
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

    globalHighscores.push(newEntry);
    globalHighscores.sort((a, b) => b.score - a.score);
    globalHighscores = globalHighscores.slice(0, 10);

    return NextResponse.json({ success: true, highscores: globalHighscores });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
