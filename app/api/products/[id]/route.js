import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// GET /api/products/:id -> get one product dengan data kategori
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.category_id, 
        c.name AS category_name, 
        p.created_at 
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/:id -> update a product
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category_id } = body;

    // Validasi wajib isi untuk name, price, dan category_id
    if (!name || price === undefined || price === '' || !category_id) {
      return NextResponse.json(
        { error: 'Field "name", "price", dan "category_id" wajib diisi' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?',
      [name, description || null, price, category_id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      id: Number(id),
      name,
      description,
      price,
      category_id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/:id -> delete a product
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}