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

// Глобальный счётчик для уникальных id чекбоксов
let taskIdCounter = 0;

function createTaskElement(text, done) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (done) li.classList.add('done');

  // Уникальный id для связки checkbox и label
  const checkboxId = 'task-' + taskIdCounter++;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('task-checkbox');
  checkbox.checked = done;
  checkbox.id = checkboxId; // Присваиваем id чекбоксу

  checkbox.addEventListener('change', function () {
    li.classList.toggle('done', checkbox.checked);
    saveTasks();
    applyFilter();
    updateCounter();
  });

  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;

  // <label> оборачивает чекбокс и текст — клик в любом месте переключает чекбокс
  const label = document.createElement('label');
  label.htmlFor = checkboxId; // Связываем label с нужным чекбоксом
  label.classList.add('task-label');
  label.appendChild(checkbox);
  label.appendChild(span);

  // Крестик остаётся СНАРУЖИ label — он работает независимо
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    li.remove();
    saveTasks();
    updateCounter();
  });

  li.appendChild(label);     // 1. label (внутри: чекбокс + текст)
  li.appendChild(deleteBtn); // 2. крестик снаружи
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
