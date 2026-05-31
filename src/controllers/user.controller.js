const bcrypt = require('bcryptjs');
const db     = require('../config/database');

// ── GET ALL USERS (admin) ──────────────────────────────────
const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[users.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET ONE USER ───────────────────────────────────────────
const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[users.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── UPDATE USER (admin or self) ────────────────────────────
const update = async (req, res) => {
  const targetId = parseInt(req.params.id);

  // User biasa hanya boleh edit dirinya sendiri
  if (req.user.role !== 'admin' && req.user.id !== targetId) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const { name, email, password, role } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const user = existing[0];

    // Hanya admin yang boleh ganti role
    const newRole = req.user.role === 'admin' && role ? role : user.role;
    const newName  = name  || user.name;
    const newEmail = email || user.email;

    // Cek email duplikat jika email berubah
    if (newEmail !== user.email) {
      const [dup] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, targetId]);
      if (dup.length > 0) {
        return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
      }
    }

    let newPassword = user.password;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
      }
      newPassword = await bcrypt.hash(password, 10);
    }

    await db.query(
      'UPDATE users SET name=?, email=?, password=?, role=?, updated_at=NOW() WHERE id=?',
      [newName, newEmail, newPassword, newRole, targetId]
    );

    return res.json({
      success: true,
      message: 'User berhasil diupdate',
      data: { id: targetId, name: newName, email: newEmail, role: newRole },
    });
  } catch (err) {
    console.error('[users.update]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE USER (admin only) ───────────────────────────────
const remove = async (req, res) => {
  const targetId = parseInt(req.params.id);

  if (targetId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [targetId]);
    return res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('[users.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAll, getOne, update, remove };
