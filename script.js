const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counter = document.getElementById('counter');
const themeToggle = document.getElementById('themeToggle');

let currentFilter = 'all';

// ========== Тёмная тема ==========

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
    themeToggle.title = 'Переключить на светлую тему';
  } else {
    document.body.classList.remove('dark');
    themeToggle.textContent = '🌙';
    themeToggle.title = 'Переключить на тёмную тему';
  }
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'dark');

themeToggle.addEventListener('click', function () {
  const isDark = document.body.classList.contains('dark');
  applyTheme(!isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
});

// ========== Работа с localStorage (задачи) ==========

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

// ========== Счётчик ==========

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

// ========== Фильтрация ==========

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

// ========== Удаление с анимацией ==========

function removeTask(li) {
  li.classList.add('removing');
  li.addEventListener('animationend', function () {
    li.remove();
    saveTasks();
    updateCounter();
  }, { once: true });
}

// ========== Создание элемента задачи ==========
// animate: true — для новых задач (с анимацией)
// animate: false — для загрузки из localStorage (без анимации)

let taskIdCounter = 0;

function createTaskElement(text, done, animate) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (done) li.classList.add('done');

  // Добавляем класс анимации только если animate === true
  if (animate) {
    li.classList.add('task-item--animated');
  }

  const checkboxId = 'task-' + taskIdCounter++;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('task-checkbox');
  checkbox.checked = done;
  checkbox.id = checkboxId;

  checkbox.addEventListener('change', function () {
    li.classList.toggle('done', checkbox.checked);
    saveTasks();
    applyFilter();
    updateCounter();
  });

  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;

  const label = document.createElement('label');
  label.htmlFor = checkboxId;
  label.classList.add('task-label');
  label.appendChild(checkbox);
  label.appendChild(span);

  // ========== Кнопка редактирования ==========

  const editBtn = document.createElement('button');
  editBtn.classList.add('edit-btn');
  editBtn.textContent = '✏️';
  editBtn.title = 'Редактировать задачу';

  editBtn.addEventListener('click', function () {
    const currentText = span.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('edit-input');
    input.value = currentText;

    span.style.display = 'none';
    label.insertBefore(input, span);
    input.focus();
    input.select();

    editBtn.style.display = 'none';

    const saveBtn = document.createElement('button');
    saveBtn.classList.add('save-btn');
    saveBtn.textContent = '✅';
    saveBtn.title = 'Сохранить изменения';

    function saveEdit() {
      const newText = input.value.trim();
      if (newText === '') {
        alert('Текст задачи не может бьть пустым!');
        input.focus();
        return;
      }
      span.textContent = newText;
      span.style.display = '';
      input.remove();
      saveBtn.remove();
      editBtn.style.display = '';
      saveTasks();
    }

    saveBtn.addEventListener('click', saveEdit);

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        saveEdit();
      }
      if (event.key === 'Escape') {
        span.style.display = '';
        input.remove();
        saveBtn.remove();
        editBtn.style.display = '';
      }
    });

    li.insertBefore(saveBtn, deleteBtn);
  });

  // ========== Кнопка удаления ==========

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    removeTask(li);
  });

  li.appendChild(label);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  return li;
}

// ========== Добавление новой задачи ==========

function addTask() {
  const text = taskInput.value.trim();
  if (text === '') {
    alert('Введите текст задачи!');
    return;
  }

  // animate: true — новая задача, анимируем
  const li = createTaskElement(text, false, true);
  taskList.appendChild(li);
  saveTasks();
  applyFilter();
  updateCounter();

  taskInput.value = '';
  taskInput.focus();
}

// ========== Загрузка при открытии страницы ==========

loadTasks().forEach(function (task) {
  // animate: false — задача из localStorage, без анимации
  const li = createTaskElement(task.text, task.done, false);
  taskList.appendChild(li);
});

applyFilter();
updateCounter();

// ========== Обработчики событий ==========

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});
