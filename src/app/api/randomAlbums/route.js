import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'albumTitles.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const albumTitles = fileContent.split('\n').map(title => title.trim()).filter(title => title);

  // Select 9 random album titles
  const selectedTitles = [];
  while (selectedTitles.length < 9) {
    const randomIndex = Math.floor(Math.random() * albumTitles.length);
    const selectedTitle = albumTitles[randomIndex];
    if (!selectedTitles.includes(selectedTitle)) {
      selectedTitles.push(selectedTitle);
    }
  }

  return NextResponse.json({ titles: selectedTitles });
}