const titleInput   = document.getElementById('titleInput');
const titleCounter = document.getElementById('titleCounter');
const descInput    = document.getElementById('descInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const filterBtns   = document.querySelectorAll('.filter-btn');
const counter      = document.getElementById('counter');
const themeToggle  = document.getElementById('themeToggle');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const priorityTabs = document.querySelectorAll('.priority-tab');

const TITLE_MAX = 60;
let currentFilter   = 'all';
let currentPriority = 'low';

const PRIORITIES = {
  low:    { label: 'Низкий',  color: '#38a169' },
  medium: { label: 'Средний', color: '#d69e2e' },
  high:   { label: 'Высокий', color: '#e53e3e' },
};

// ========== Табы приоритета ==========

priorityTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    priorityTabs.forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    currentPriority = tab.dataset.priority;
  });
});

// ========== Счётчик заголовка ==========

titleInput.addEventListener('input', function () {
  const len = titleInput.value.length;
  titleCounter.textContent = len + ' / ' + TITLE_MAX;
  if (len >= TITLE_MAX) {
    titleCounter.classList.add('char-counter--limit');
    titleCounter.classList.remove('char-counter--warning');
  } else if (len >= TITLE_MAX * 0.8) {
    titleCounter.classList.add('char-counter--warning');
    titleCounter.classList.remove('char-counter--limit');
  } else {
    titleCounter.classList.remove('char-counter--warning', 'char-counter--limit');
  }
});

// ========== Авторасширение textarea ==========

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
descInput.addEventListener('input', function () { autoResize(descInput); });

// ========== Тёмная тема ==========

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeToggle.textContent = '🌙';
  }
}

applyTheme(localStorage.getItem('theme') === 'dark');

themeToggle.addEventListener('click', function () {
  const isDark = document.body.classList.contains('dark');
  applyTheme(!isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
});

// ========== localStorage ==========

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  const tasks = [];
  taskList.querySelectorAll('.task-item').forEach(function (li) {
    tasks.push({
      title:       li.dataset.title,
      description: li.dataset.description,
      done:        li.classList.contains('done'),
      priority:    li.dataset.priority || 'low',
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ========== Счётчик задач ==========

function updateCounter() {
  const all       = taskList.querySelectorAll('.task-item');
  const doneItems = taskList.querySelectorAll('.task-item.done');
  const active    = all.length - doneItems.length;

  if (all.length === 0)    counter.textContent = '';
  else if (active === 0)   counter.textContent = 'Все задачи выполнены! ✅';
  else                     counter.textContent = 'Осталось: ' + active;

  clearDoneBtn.style.display = doneItems.length > 0 ? 'block' : 'none';
}

// ========== Фильтрация ==========

function applyFilter() {
  taskList.querySelectorAll('.task-item').forEach(function (li) {
    const isDone = li.classList.contains('done');
    if      (currentFilter === 'all')    li.classList.remove('hidden');
    else if (currentFilter === 'active') li.classList.toggle('hidden', isDone);
    else if (currentFilter === 'done')   li.classList.toggle('hidden', !isDone);
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

// ========== Удаление ==========

function removeTask(li) {
  li.classList.add('removing');
  li.addEventListener('animationend', function () {
    li.remove(); saveTasks(); updateCounter();
  }, { once: true });
}

clearDoneBtn.addEventListener('click', function () {
  if (!confirm('Удалить все выполненные?')) return;
  taskList.querySelectorAll('.task-item.done').forEach(function (li) {
    li.classList.add('removing');
    li.addEventListener('animationend', function () {
      li.remove(); saveTasks(); updateCounter();
    }, { once: true });
  });
});

// ========== Drag and Drop ==========

let draggedItem = null;

function addDragListeners(li) {
  li.setAttribute('draggable', 'true');

  li.addEventListener('dragstart', function () {
    draggedItem = li;
    setTimeout(function () { li.classList.add('dragging'); }, 0);
  });

  li.addEventListener('dragend', function () {
    li.classList.remove('dragging');
    taskList.querySelectorAll('.task-item').forEach(function (i) { i.classList.remove('drag-over'); });
    draggedItem = null;
  });

  li.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (li === draggedItem) return;
    taskList.querySelectorAll('.task-item').forEach(function (i) { i.classList.remove('drag-over'); });
    li.classList.add('drag-over');
  });

  li.addEventListener('drop', function (e) {
    e.preventDefault();
    if (!draggedItem || li === draggedItem) return;
    const midY = li.getBoundingClientRect().top + li.getBoundingClientRect().height / 2;
    taskList.insertBefore(draggedItem, e.clientY < midY ? li : li.nextSibling);
    saveTasks();
  });
}

// ========== Создание элемента задачи ==========

let taskIdCounter = 0;

function createTaskElement(title, description, done, animate, priority) {
  const p = PRIORITIES[priority] ? priority : 'low';

  const li = document.createElement('li');
  li.classList.add('task-item');
  li.dataset.priority    = p;
  li.dataset.title       = title;
  li.dataset.description = description || '';
  if (done)    li.classList.add('done');
  if (animate) li.classList.add('task-item--animated');

  addDragListeners(li);

  // ---------- Закрытая часть (всегда видно) ----------

  const summary = document.createElement('div');
  summary.classList.add('task-summary');

  // Полоска приоритета
  const badge = document.createElement('span');
  badge.classList.add('priority-badge');
  badge.style.backgroundColor = PRIORITIES[p].color;
  badge.title = 'Приоритет: ' + PRIORITIES[p].label + '. Нажмите, чтобы сменить';

  // Клик по полоске — меняет приоритет
  badge.addEventListener('click', function (e) {
    e.stopPropagation();
    const order = ['low', 'medium', 'high'];
    const next = order[(order.indexOf(li.dataset.priority) + 1) % order.length];
    li.dataset.priority = next;
    badge.style.backgroundColor = PRIORITIES[next].color;
    badge.title = 'Приоритет: ' + PRIORITIES[next].label + '. Нажмите, чтобы сменить';
    saveTasks();
  });

  const checkboxId = 'task-' + taskIdCounter++;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('task-checkbox');
  checkbox.checked = done;
  checkbox.id = checkboxId;
  checkbox.addEventListener('click', function (e) { e.stopPropagation(); });
  checkbox.addEventListener('change', function () {
    li.classList.toggle('done', checkbox.checked);
    saveTasks(); applyFilter(); updateCounter();
  });

  // Заголовок задачи
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('task-title');
  titleSpan.textContent = title;

  // Стрелка раскрытия
  const arrow = document.createElement('span');
  arrow.classList.add('task-arrow');
  arrow.textContent = '❯';

  const label = document.createElement('label');
  label.htmlFor = checkboxId;
  label.classList.add('task-label');
  label.appendChild(checkbox);
  label.appendChild(titleSpan);
  label.addEventListener('click', function (e) { e.stopPropagation(); });

  summary.appendChild(badge);
  summary.appendChild(label);
  summary.appendChild(arrow);

  // ---------- Раскрывающаяся часть ----------

  const details = document.createElement('div');
  details.classList.add('task-details');

  // Текст описания
  const descSpan = document.createElement('p');
  descSpan.classList.add('task-desc');
  descSpan.textContent = description || '';
  if (!description) descSpan.classList.add('task-desc--empty');

  // Блок кнопок
  const actions = document.createElement('div');
  actions.classList.add('task-actions');

  const editBtn = document.createElement('button');
  editBtn.classList.add('edit-btn');
  editBtn.textContent = '✏️ Редактировать';

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '× Удалить';
  deleteBtn.addEventListener('click', function (e) { e.stopPropagation(); removeTask(li); });

  // Редактирование
  editBtn.addEventListener('click', function (e) {
    e.stopPropagation();

    // Создаём форму редактирования
    const editForm = document.createElement('div');
    editForm.classList.add('edit-form');

    const editTitleInput = document.createElement('input');
    editTitleInput.type = 'text';
    editTitleInput.classList.add('edit-title-input');
    editTitleInput.value = li.dataset.title;
    editTitleInput.maxLength = TITLE_MAX;
    editTitleInput.placeholder = 'Заголовок';

    const editDescTextarea = document.createElement('textarea');
    editDescTextarea.classList.add('edit-desc-textarea');
    editDescTextarea.value = li.dataset.description;
    editDescTextarea.placeholder = 'Описание';
    editDescTextarea.rows = 3;

    const editActions = document.createElement('div');
    editActions.classList.add('edit-form-actions');

    const saveBtn = document.createElement('button');
    saveBtn.classList.add('save-btn');
    saveBtn.textContent = 'Сохранить';

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.textContent = 'Отмена';

    function closeEdit() {
      editForm.remove();
      actions.style.display = '';
    }

    saveBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const newTitle = editTitleInput.value.trim();
      if (!newTitle) { alert('Заголовок не может быть пустым!'); return; }
      const newDesc = editDescTextarea.value.trim();

      li.dataset.title = newTitle;
      li.dataset.description = newDesc;
      titleSpan.textContent = newTitle;
      descSpan.textContent = newDesc;
      if (!newDesc) descSpan.classList.add('task-desc--empty');
      else          descSpan.classList.remove('task-desc--empty');

      saveTasks();
      closeEdit();
    });

    cancelBtn.addEventListener('click', function (e) { e.stopPropagation(); closeEdit(); });

    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    editForm.appendChild(editTitleInput);
    editForm.appendChild(editDescTextarea);
    editForm.appendChild(editActions);

    actions.style.display = 'none';
    details.appendChild(editForm);
    editTitleInput.focus();
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  details.appendChild(descSpan);
  details.appendChild(actions);

  li.appendChild(summary);
  li.appendChild(details);

  // ---------- Раскрытие / закрытие по клику на summary ----------

  summary.addEventListener('click', function () {
    const isOpen = li.classList.toggle('expanded');
    arrow.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  });

  return li;
}

// ========== Добавление задачи ==========

function addTask() {
  const title = titleInput.value.trim();
  if (!title) { alert('Введите заголовок задачи!'); titleInput.focus(); return; }

  const desc = descInput.value.trim();
  const li = createTaskElement(title, desc, false, true, currentPriority);
  taskList.appendChild(li);
  saveTasks(); applyFilter(); updateCounter();

  titleInput.value = '';
  titleCounter.textContent = '0 / ' + TITLE_MAX;
  titleCounter.classList.remove('char-counter--warning', 'char-counter--limit');
  descInput.value = '';
  descInput.style.height = '';
  titleInput.focus();
}

// ========== Загрузка ==========

loadTasks().forEach(function (task) {
  // Обратная совместимость: если задача сохранена со старым форматом (только text),
  // используем его как заголовок
  const title = task.title || task.text || 'Без названия';
  const desc  = task.description || '';
  taskList.appendChild(createTaskElement(title, desc, task.done, false, task.priority));
});

applyFilter();
updateCounter();

addBtn.addEventListener('click', addTask);

titleInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); descInput.focus(); }
});

descInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask(); }
});
