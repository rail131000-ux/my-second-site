const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const counter = document.getElementById('counter');
const themeToggle = document.getElementById('themeToggle');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const charCounter = document.getElementById('charCounter');

const MAX_LENGTH = 100;
let currentFilter = 'all';

// ========== Счётчик символов ==========

taskInput.addEventListener('input', function () {
  const len = taskInput.value.length;
  charCounter.textContent = len + ' / ' + MAX_LENGTH;

  // Меняем цвет когда осталось мало символов
  if (len >= MAX_LENGTH) {
    charCounter.classList.add('char-counter--limit');
    charCounter.classList.remove('char-counter--warning');
  } else if (len >= MAX_LENGTH * 0.8) {
    charCounter.classList.add('char-counter--warning');
    charCounter.classList.remove('char-counter--limit');
  } else {
    charCounter.classList.remove('char-counter--warning', 'char-counter--limit');
  }
});

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

// ========== Счётчик задач и видимость кнопки ==========

function updateCounter() {
  const all = taskList.querySelectorAll('.task-item');
  const doneItems = taskList.querySelectorAll('.task-item.done');
  const activeCount = all.length - doneItems.length;

  if (all.length === 0) {
    counter.textContent = '';
  } else if (activeCount === 0) {
    counter.textContent = 'Все задачи выполнены! ✅';
  } else {
    counter.textContent = 'Осталось задач: ' + activeCount;
  }

  clearDoneBtn.style.display = doneItems.length > 0 ? 'block' : 'none';
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

// ========== Очистка выполненных задач ==========

clearDoneBtn.addEventListener('click', function () {
  const confirmed = confirm('Удалить все выполненные задачи?');
  if (!confirmed) return;

  const doneItems = taskList.querySelectorAll('.task-item.done');

  doneItems.forEach(function (li) {
    li.classList.add('removing');
    li.addEventListener('animationend', function () {
      li.remove();
      saveTasks();
      updateCounter();
    }, { once: true });
  });
});

// ========== Drag and Drop ==========

let draggedItem = null;
let dragOverItem = null;

function addDragListeners(li) {
  li.setAttribute('draggable', 'true');

  li.addEventListener('dragstart', function () {
    draggedItem = li;
    setTimeout(function () {
      li.classList.add('dragging');
    }, 0);
  });

  li.addEventListener('dragend', function () {
    li.classList.remove('dragging');
    taskList.querySelectorAll('.task-item').forEach(function (item) {
      item.classList.remove('drag-over');
    });
    draggedItem = null;
    dragOverItem = null;
  });

  li.addEventListener('dragover', function (event) {
    event.preventDefault();
    if (li === draggedItem) return;
    if (dragOverItem) dragOverItem.classList.remove('drag-over');
    dragOverItem = li;
    li.classList.add('drag-over');
  });

  li.addEventListener('drop', function (event) {
    event.preventDefault();
    if (!draggedItem || li === draggedItem) return;
    const rect = li.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (event.clientY < midY) {
      taskList.insertBefore(draggedItem, li);
    } else {
      taskList.insertBefore(draggedItem, li.nextSibling);
    }
    saveTasks();
  });
}

// ========== Создание элемента задачи ==========

let taskIdCounter = 0;

function createTaskElement(text, done, animate) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  if (done) li.classList.add('done');

  if (animate) {
    li.classList.add('task-item--animated');
  }

  addDragListeners(li);

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
    input.maxLength = MAX_LENGTH;

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
        alert('Текст задачи не может быть пустым!');
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
      if (event.key === 'Enter') saveEdit();
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

  const li = createTaskElement(text, false, true);
  taskList.appendChild(li);
  saveTasks();
  applyFilter();
  updateCounter();

  taskInput.value = '';
  // Сбрасываем счётчик символов после добавления задачи
  charCounter.textContent = '0 / ' + MAX_LENGTH;
  charCounter.classList.remove('char-counter--warning', 'char-counter--limit');
  taskInput.focus();
}

// ========== Загрузка при открытии страницы ==========

loadTasks().forEach(function (task) {
  const li = createTaskElement(task.text, task.done, false);
  taskList.appendChild(li);
});

applyFilter();
updateCounter();

// ========== Обработчики событий ==========

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') addTask();
});
