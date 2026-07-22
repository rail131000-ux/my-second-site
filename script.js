const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Текущий активный фильтр (по умолчанию — «Все»)
let currentFilter = 'all';

// --- Работа с localStorage ---

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  const items = taskList.querySelectorAll('.task-item');
  const tasks = [];

  items.forEach(function (li) {
    tasks.push({
      text: li.querySelector('.task-text').textContent,
      done: li.classList.contains('done'),
    });
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- Фильтрация ---

// Применяет текущий фильтр ко всем задачам
function applyFilter() {
  const items = taskList.querySelectorAll('.task-item');

  items.forEach(function (li) {
    const isDone = li.classList.contains('done');

    if (currentFilter === 'all') {
      li.classList.remove('hidden');
    } else if (currentFilter === 'active') {
      // Показываем только НЕвыполненные
      li.classList.toggle('hidden', isDone);
    } else if (currentFilter === 'done') {
      // Показываем только выполненные
      li.classList.toggle('hidden', !isDone);
    }
  });
}

// Обработчики кликов по кнопкам фильтра
filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    // Убираем класс active у всех кнопок
    filterBtns.forEach(function (b) { b.classList.remove('active'); });
    // Добавляем active на нажатую
    btn.classList.add('active');
    // Запоминаем выбранный фильтр
    currentFilter = btn.dataset.filter;
    // Применяем фильтр
    applyFilter();
  });
});

// --- Создание элемента задачи ---

function createTaskElement(text, done) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (done) li.classList.add('done');

  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;
  span.addEventListener('click', function () {
    li.classList.toggle('done');
    saveTasks();
    applyFilter(); // Перефильтруем после смены статуса
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    li.remove();
    saveTasks();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  return li;
}

// --- Добавление новой задачи ---

function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    alert('Введите текст задачи!');
    return;
  }

  const li = createTaskElement(text, false);
  taskList.appendChild(li);
  saveTasks();
  applyFilter(); // Применяем фильтр к новой задаче

  taskInput.value = '';
  taskInput.focus();
}

// --- Загрузка задач при открытии страницы ---

loadTasks().forEach(function (task) {
  const li = createTaskElement(task.text, task.done);
  taskList.appendChild(li);
});

// Применяем фильтр после загрузки
applyFilter();

// --- Обработчики событий ---

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});
