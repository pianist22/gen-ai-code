document.addEventListener("DOMContentLoaded", function() {
    const todoInput = document.getElementById("todo-input");
    const addBtn = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");

    function createTodoItem(text) {
        const li = document.createElement("li");
        li.textContent = text;
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "delete-btn";
        delBtn.onclick = function() {
            todoList.removeChild(li);
        };
        li.appendChild(delBtn);
        return li;
    }

    addBtn.addEventListener("click", function() {
        const value = todoInput.value.trim();
        if (value) {
            const item = createTodoItem(value);
            todoList.appendChild(item);
            todoInput.value = "";
            todoInput.focus();
        }
    });

    todoInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            addBtn.click();
        }
    });
});
