// script.js

const API_URL = 'http://localhost:3000/api/employees';

// DOM элементы
const employeesBody = document.getElementById('employeesBody');
const employeeForm = document.getElementById('employeeForm');
const searchInput = document.getElementById('searchInput');
const filterDept = document.getElementById('filterDept');
const filterPos = document.getElementById('filterPos');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');

// Маска для телефона
document.getElementById('phone').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  let formatted = '+7';
  if (value.length > 1) {
    formatted += ' (' + value.slice(1, 4);
    if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
    if (value.length >= 7) formatted += '-' + value.slice(7, 9);
    if (value.length >= 9) formatted += '-' + value.slice(9, 11);
  }
  e.target.value = formatted;
});

// Загрузка сотрудников
async function loadEmployees(url = API_URL) {
  try {
    const res = await fetch(url);
    const employees = await res.json();
    renderEmployees(employees);
  } catch (err) {
    console.error(err);
    employeesBody.innerHTML = `<tr><td colspan="12">Ошибка загрузки</td></tr>`;
  }
}

// Отображение таблицы
function renderEmployees(employees) {
  employeesBody.innerHTML = employees.length
    ? employees.map(emp => `
        <tr class="${emp.is_fired ? 'fired' : ''}">
          <td data-label="ФИО">${emp.full_name}</td>
          <td data-label="Дата рождения">${emp.birth_date || '—'}</td>
          <td data-label="Паспорт">${emp.passport_series_num || '—'}</td>
          <td data-label="Телефон">${emp.phone || '—'}</td>
          <td data-label="Email">${emp.email || '—'}</td>
          <td data-label="Адрес">${emp.address || '—'}</td>
          <td data-label="Отдел">${emp.department}</td>
          <td data-label="Должность">${emp.position}</td>
          <td data-label="Зарплата">${emp.salary ? emp.salary.toFixed(2) + ' ₽' : '—'}</td>
          <td data-label="Принят">${emp.hire_date}</td>
          <td data-label="Статус">${emp.is_fired ? 'Уволен' : 'Работает'}</td>
          <td data-label="Действия" class="actions">
            ${!emp.is_fired ? 
              `<button class="edit-btn" onclick="editEmployee(${emp.id})">✏️</button>` : ''}
            ${!emp.is_fired ? 
              `<button class="fire-btn" onclick="fireEmployee(${emp.id})">🚫 Уволить</button>` : 
              '<span>—</span>'}
          </td>
        </tr>
      `).join('')
    : `<tr><td colspan="12">Сотрудников нет</td></tr>`;
}

// Добавление сотрудника
employeeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = {
    full_name: document.getElementById('full_name').value,
    birth_date: document.getElementById('birth_date').value || null,
    passport_series_num: document.getElementById('passport').value || null,
    phone: document.getElementById('phone').value || null,
    email: document.getElementById('email').value || null,
    address: document.getElementById('address').value || null,
    department: document.getElementById('department').value,
    position: document.getElementById('position').value,
    salary: parseFloat(document.getElementById('salary').value) || null,
    hire_date: document.getElementById('hire_date').value,
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      employeeForm.reset();
      document.getElementById('phone').value = '';
      loadEmployees();
    } else {
      const err = await res.json();
      alert('Ошибка: ' + (err.error || 'Не удалось добавить сотрудника'));
    }
  } catch (err) {
    alert('Ошибка сети');
  }
});

// Увольнение
window.fireEmployee = async (id) => {
  if (!confirm('Уволить сотрудника? Это действие нельзя отменить.')) return;
  try {
    const res = await fetch(`${API_URL}/${id}/fire`, { method: 'PATCH' });
    if (res.ok) loadEmployees();
    else alert('Ошибка при увольнении');
  } catch (err) {
    alert('Ошибка сети');
  }
};

// Редактирование (упрощённо — в будущем можно сделать модальное окно)
window.editEmployee = (id) => {
  alert(`Редактирование сотрудника с ID ${id} — пока не реализовано в UI`);
  // Для полной реализации потребуется форма редактирования.
  // Но API уже поддерживает PUT /api/employees/:id
};

// Поиск при вводе
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = searchInput.value.trim();
    if (q) {
      loadEmployees(`${API_URL}/search?q=${encodeURIComponent(q)}`);
    } else {
      loadEmployees();
    }
  }, 300);
});

// Фильтрация
applyFiltersBtn.addEventListener('click', () => {
  const dept = filterDept.value.trim();
  const pos = filterPos.value.trim();
  let url = API_URL;
  const params = new URLSearchParams();
  if (dept) params.append('department', dept);
  if (pos) params.append('position', pos);
  if (params.toString()) {
    url += '/filter?' + params.toString();
  }
  loadEmployees(url);
});

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  filterDept.value = '';
  filterPos.value = '';
  loadEmployees();
});

// Загрузка при старте
loadEmployees();