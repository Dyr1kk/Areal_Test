// routes/employees.js
const express = require('express');
const db = require('../db/connect');
const router = express.Router();

// ─── 1. Получить всех сотрудников ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении списка сотрудников' });
  }
});

// ─── 2. Поиск по ФИО (регистронезависимый, частичное совпадение) ─────
router.get('/search', async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) {
    return res.json([]);
  }
  try {
    const result = await db.query(
      `SELECT * FROM employees 
       WHERE LOWER(full_name) LIKE LOWER($1) 
       ORDER BY id`,
      [`%${q.trim()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка поиска сотрудников' });
  }
});

// ─── 3. Фильтрация по отделу и/или должности ─────────────────────
router.get('/filter', async (req, res) => {
  const { department, position } = req.query;
  let query = 'SELECT * FROM employees WHERE true';
  const params = [];
  let index = 1;

  if (department) {
    query += ` AND department = $${index++}`;
    params.push(department);
  }
  if (position) {
    query += ` AND position = $${index++}`;
    params.push(position);
  }
  query += ' ORDER BY id';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка фильтрации сотрудников' });
  }
});

// ─── 4. Создать нового сотрудника ────────────────────────────────
router.post('/', async (req, res) => {
  const {
    full_name,
    birth_date,
    passport_series_num,
    phone,
    email,
    address,
    department,
    position,
    salary,
    hire_date
  } = req.body;

  // Валидация минимума
  if (!full_name || !hire_date) {
    return res.status(400).json({ error: 'ФИО и дата приёма обязательны' });
  }

  try {
    const result = await db.query(
      `INSERT INTO employees (
        full_name, birth_date, passport_series_num,
        phone, email, address, department,
        position, salary, hire_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        full_name, birth_date, passport_series_num,
        phone, email, address, department,
        position, salary, hire_date
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      // Уникальное нарушение (например, паспорт)
      return res.status(400).json({ error: 'Сотрудник с таким паспортом уже существует' });
    }
    res.status(500).json({ error: 'Ошибка создания сотрудника' });
  }
});

// ─── 5. Редактировать сотрудника ────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    birth_date,
    passport_series_num,
    phone,
    email,
    address,
    department,
    position,
    salary,
    hire_date
  } = req.body;

  // Сначала проверим, уволен ли сотрудник
  try {
    const check = await db.query('SELECT is_fired FROM employees WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }
    if (check.rows[0].is_fired) {
      return res.status(403).json({ error: 'Нельзя редактировать уволенного сотрудника' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка проверки статуса сотрудника' });
  }

  try {
    const result = await db.query(
      `UPDATE employees SET
        full_name = $1, birth_date = $2, passport_series_num = $3,
        phone = $4, email = $5, address = $6, department = $7,
        position = $8, salary = $9, hire_date = $10
       WHERE id = $11
       RETURNING *`,
      [
        full_name, birth_date, passport_series_num,
        phone, email, address, department,
        position, salary, hire_date,
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Паспорт уже используется другим сотрудником' });
    }
    res.status(500).json({ error: 'Ошибка обновления сотрудника' });
  }
});

// ─── 6. Уволить сотрудника ───────────────────────────────────────
router.patch('/:id/fire', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE employees SET is_fired = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка увольнения сотрудника' });
  }
});

module.exports = router;