import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'radios');

const getConfigPath = (subdomain: string) => {
  // Sanitize subdomain to prevent directory traversal
  const safeSubdomain = subdomain.replace(/[^a-zA-Z0-9-_]/g, '');
  return path.join(DATA_DIR, `${safeSubdomain || 'default'}.json`);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || 'default';

    const configPath = getConfigPath(subdomain);

    // Check if file exists
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json({ error: 'Radio not found' }, { status: 404 });
    }

    const data = await fs.readFile(configPath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || 'default';
    const body = await request.json();

    const configPath = getConfigPath(subdomain);
    await fs.writeFile(configPath, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
