// Находим элементы на странице
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// Функция: добавить новую задачу
function addTask() {
  const text = taskInput.value.trim(); // Убираем лишние пробелы

  // Если поле пустое — ничего не делаем
  if (text === '') {
    alert('Введите текст задачи!');
    return;
  }

  // Создаём элемент <li> для задачи
  const li = document.createElement('li');
  li.classList.add('task-item');

  // Текст задачи — клик по нему отмечает задачу выполненной
  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = text;
  span.addEventListener('click', function () {
    li.classList.toggle('done'); // Переключаем класс done
  });

  // Кнопка удаления задачи
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    li.remove(); // Удаляем задачу из списка
  });

  // Добавляем текст и кнопку внутрь <li>
  li.appendChild(span);
  li.appendChild(deleteBtn);

  // Добавляем <li> в список
  taskList.appendChild(li);

  // Очищаем поле ввода
  taskInput.value = '';
  taskInput.focus(); // Возвращаем фокус на поле
}

// Добавить задачу по клику на кнопку
addBtn.addEventListener('click', addTask);

// Добавить задачу по нажатию Enter
taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});
