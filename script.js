const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counter = document.getElementById('counter');

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

// --- Счётчик ---

function updateCounter() {
  const all = taskList.querySelectorAll('.task-item');
  const activeCount = taskList.querySelectorAll('.task-item:not(.done)').length;

  if (all.length === 0) {
    counter.textContent = '';
  } else if (activeCount === 0) {
    counter.textContent = 'Все задачи выполнены! ✅';
  } else {
    counter.textContent = 'Осталось задач: ' + activeCount;
  }
}

// --- Фильтрация ---

function applyFilter() {
  const items = taskList.querySelectorAll('.task-item');
  items.forEach(function (li) {
    const isDone = li.classList.contains('done');
    if (currentFilter === 'all') {
      li.classList.remove('hidden');
    } else if (currentFilter === 'active') {
      li.classList.toggle('hidden', isDone);
    } else if (currentFilter === 'done') {
      li.classList.toggle('hidden', !isDone);
    }
  });
}

filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    filterBtns.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilter();
  });
});

// --- Создание элемента задачи ---

function createTaskElement(text, done) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (done) li.classList.add('done');

  // Чекбокс слева от текста
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('task-checkbox');
  checkbox.checked = done; // Если задача уже выполнена — ставим птичку

  checkbox.addEventListener('change', function () {
    // Переключаем класс done на задаче в зависимости от состояния чекбокса
    li.classList.toggle('done', checkbox.checked);
    saveTasks();
    applyFilter();
    updateCounter();
  });

  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    li.remove();
    saveTasks();
    updateCounter();
  });

  li.appendChild(checkbox);  // 1. чекбокс
  li.appendChild(span);      // 2. текст
  li.appendChild(deleteBtn); // 3. крестик
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
  applyFilter();
  updateCounter();

  taskInput.value = '';
  taskInput.focus();
}

// --- Загрузка при открытии страницы ---

loadTasks().forEach(function (task) {
  const li = createTaskElement(task.text, task.done);
  taskList.appendChild(li);
});

applyFilter();
updateCounter();

// --- Обработчики событий ---

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});
