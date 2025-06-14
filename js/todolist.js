function saveTodoList() {
  const todos = [];
  todoList.querySelectorAll("li").forEach((li) => {
    const fullText = li.textContent;
    const required = parseInt(li.getAttribute("data-required"), 10);
    const textOnly = fullText.replace(/\s*-\s*\d+\s*코인$/, "");
    todos.push({ text: textOnly, required });
  });
  localStorage.setItem("todoList", JSON.stringify(todos));
}

function loadTodoList() {
  const todos = JSON.parse(localStorage.getItem("todoList")) || [];
  todos.forEach(({ text, required }) => {
    addTodoItem(text, required);
  });
}

function addTodoItem(todoText, requiredCount) {
  const li = document.createElement("li");
  li.textContent = `${todoText} - ${requiredCount} 코인`;
  li.setAttribute("data-required", requiredCount);

  li.addEventListener("click", () => {
    const required = parseInt(li.getAttribute("data-required"), 10);
    if (workCount >= required) {
      workCount -= required;
      saveWorkCount();
      updateCountDisplay();

      todoList.removeChild(li);
      saveTodoList();
    } else {
      alert(`완료된 세션이 ${required}개 이상이어야 삭제할 수 있습니다.`);
    }
  });

  todoList.appendChild(li);
  saveTodoList();
}