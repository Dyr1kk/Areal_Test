// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Простой тестовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'HR Employee System API is running!' });
});

// Проверка подключения к БД через API
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS now');
    res.json({ db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});