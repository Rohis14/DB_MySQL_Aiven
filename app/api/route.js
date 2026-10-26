import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, slug, created_at FROM categories ORDER BY name ASC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
