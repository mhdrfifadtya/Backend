const db = require('../config/database');

// ── GET ALL PRODUCTS ──────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const like = `%${search}%`;

    const [rows] = await db.query(
      `SELECT p.*, u.name AS created_by_name
       FROM products p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.name LIKE ? OR p.description LIKE ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [like, like, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM products WHERE name LIKE ? OR description LIKE ?',
      [like, like]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET ONE PRODUCT ───────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name AS created_by_name
       FROM products p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── CREATE PRODUCT ────────────────────────────────────────
const create = async (req, res) => {
  const { name, description, price, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name dan price wajib diisi' });
  }
  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ success: false, message: 'Price harus angka positif' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, created_by) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, Number(price), parseInt(stock) || 0, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    return res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data: rows[0] });
  } catch (err) {
    console.error('[create]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── UPDATE PRODUCT ────────────────────────────────────────
const update = async (req, res) => {
  const { name, description, price, stock } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Hanya admin atau pemilik yang boleh update
    const product = existing[0];
    if (req.user.role !== 'admin' && product.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const updatedName  = name        ?? product.name;
    const updatedDesc  = description ?? product.description;
    const updatedPrice = price       !== undefined ? Number(price) : product.price;
    const updatedStock = stock       !== undefined ? parseInt(stock) : product.stock;

    await db.query(
      'UPDATE products SET name=?, description=?, price=?, stock=?, updated_at=NOW() WHERE id=?',
      [updatedName, updatedDesc, updatedPrice, updatedStock, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Produk berhasil diupdate', data: rows[0] });
  } catch (err) {
    console.error('[update]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE PRODUCT ────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const product = existing[0];
    if (req.user.role !== 'admin' && product.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('[remove]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, create, update, remove };
