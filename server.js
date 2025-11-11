// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const employeesRouter = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Маршруты
app.use('/api/employees', employeesRouter);

// Главная страница
app.get('/', (req, res) => {
  res.json({ message: 'HR Employee System API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});