'use client';

import { useEffect, useState } from 'react';

const emptyForm = { name: '', description: '', price: '', category_id: '' };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch data produk dan kategori secara paralel
  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [resProducts, resCategories] = await Promise.all([
        fetch('/api/products'),
        fetch('/api'),
      ]);

      if (!resProducts.ok) {
        const err = await resProducts.json().catch(() => ({}));
        throw new Error(err.error || `Gagal memuat produk (${resProducts.status})`);
      }
      if (!resCategories.ok) {
        const err = await resCategories.json().catch(() => ({}));
        throw new Error(err.error || `Gagal memuat kategori (${resCategories.status})`);
      }

      const dataProducts = await resProducts.json();
      const dataCategories = await resCategories.json();

      setProducts(dataProducts);
      setCategories(dataCategories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menyimpan data');
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal menghapus data');
      }
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>CRUD Produk</h1>
      <p className="subtitle">Next.js + MySQL (Aiven)</p>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <h3>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Nama Produk</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Misal: Kopi Susu"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="category_id">Kategori</label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled> Pilih Kategori </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi singkat produk (opsional)"
            />
          </div>

          <div className="form-row">
            <label htmlFor="price">Harga (Rp)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="status">
        {loading ? 'Memuat data...' : `${products.length} produk ditemukan`}
      </div>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th>Harga</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category_name || '-'}</td>
              <td>{p.description}</td>
              <td>Rp {Number(p.price).toLocaleString('id-ID')}</td>
              <td>
                <button className="btn-edit" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && products.length === 0 && (
        <div className="empty">Belum ada produk. Tambahkan produk pertama di atas.</div>
      )}
    </main>
  );
}