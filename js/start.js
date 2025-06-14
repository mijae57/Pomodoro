startBtn.addEventListener("click", () => {
  if (!interval) startTimer();
});

pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

pauseBtnActive.addEventListener("click", pauseTimer);
resetBtnActive.addEventListener("click", resetTimer);

breakBtn.addEventListener("click", () => {
  breakBtn.style.display = "none";
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  pauseBtnActive.disabled = false;
  switchMode();
});

addTodoBtn.addEventListener("click", () => {
  const todoText = todoInput.value.trim();
  const pomoCount = parseInt(pomoCountSelect.value, 10);
  if (!todoText) return;

  addTodoItem(todoText, pomoCount);
  todoInput.value = "";
  pomoCountSelect.value = "1";
  todoInput.focus();
});

document.addEventListener("keydown", (e) => {
  if (isFocusMode && document.fullscreenElement) pauseTimer();
});


updateCountDisplay();
updateDisplay();
loadTodoList();
setupSettingsButton();