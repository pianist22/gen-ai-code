document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');

  addBtn.addEventListener('click', () => {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
      const li = document.createElement('li');
      li.textContent = todoText;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'delete-btn';
      delBtn.addEventListener('click', () => {
        todoList.removeChild(li);
      });

      li.appendChild(delBtn);
      todoList.appendChild(li);
      todoInput.value = '';
      todoInput.focus();
    }
  });

  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
});
