const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// --- Работа с localStorage ---

// Загрузить задачи из localStorage (возвращает массив объектов)
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  return saved ? JSON.parse(saved) : [];
}

// Сохранить текущие задачи в localStorage
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
    saveTasks(); // Сохраняем после отметки выполненной
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    li.remove();
    saveTasks(); // Сохраняем после удаления
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
  saveTasks(); // Сохраняем после добавления

  taskInput.value = '';
  taskInput.focus();
}

// --- Загрузка задач при открытии страницы ---

loadTasks().forEach(function (task) {
  const li = createTaskElement(task.text, task.done);
  taskList.appendChild(li);
});

// --- Обработчики событий ---

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});
