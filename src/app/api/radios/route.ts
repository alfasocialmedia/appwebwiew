import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'radios');

export async function GET() {
    try {
        const files = await fs.readdir(DATA_DIR);
        const radios = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));

        return NextResponse.json({ radios });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to list radios' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '');
        const newPath = path.join(DATA_DIR, `${safeName}.json`);
        const defaultPath = path.join(DATA_DIR, 'default.json');

        // Check if already exists
        try {
            await fs.access(newPath);
            return NextResponse.json({ error: 'Radio already exists' }, { status: 409 });
        } catch {
            // Continue if file doesn't exist
        }

        // Copy default config
        const defaultData = await fs.readFile(defaultPath, 'utf-8');
        const config = JSON.parse(defaultData);

        // Update basic info
        config.stationName = name;

        await fs.writeFile(newPath, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true, name: safeName });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create radio' }, { status: 500 });
    }
}
