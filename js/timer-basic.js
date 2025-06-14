
const timerDisplay = document.getElementById("timer");
const bigTimerDisplay = document.getElementById("big-timer");
const startBtn = document.getElementById("start");
const bellSound = new Audio("./sound/bell.mp3");

const pauseBtn = document.getElementById("pause-init");
const resetBtn = document.getElementById("reset-init");

const pauseBtnActive = document.getElementById("pause-active");
const resetBtnActive = document.getElementById("reset-active");

const breakBtn = document.getElementById("break-button");

const countDisplay = document.getElementById("count");
const container = document.getElementById("pomodoro-container");
const activeView = document.getElementById("active-view");
const progressBar = document.getElementById("progress-bar");

const focusModeCheckbox = document.getElementById("focus-mode-checkbox");

const workDurationSelect = document.getElementById("work-duration-select");
const breakDurationSelect = document.getElementById("break-duration-select");

let WORK_DURATION = 10;
let BREAK_DURATION = 7;

let remaining = WORK_DURATION;
let isBreak = false;
let interval = null;
let workCount = parseInt(localStorage.getItem("workCount")) || 0;
let isFocusMode = false;

const todoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo");
const todoList = document.getElementById("todo-list");
const pomoCountSelect = document.getElementById("pomo-count");

const musicSelect = document.getElementById("music-select");
const userMusicOption = document.getElementById("user-music-option");
const audioPlayer = document.getElementById("audio-player");
const audioSource = audioPlayer.querySelector("source");
const audioUpload = document.getElementById("audio-upload");

function updateDisplay() {
  let minutes = Math.floor(remaining / 60);
  let seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerDisplay.textContent = timeStr;
  if (bigTimerDisplay) bigTimerDisplay.textContent = timeStr;
}

function updateCountDisplay() {
  countDisplay.textContent = workCount;
}

function updateProgressBar() {
  const total = isBreak ? BREAK_DURATION : WORK_DURATION;
  const percent = ((total - remaining) / total) * 100;
  progressBar.style.width = `${percent}%`;
}

function startTimer() {
  if (interval) return;

  isFocusMode = focusModeCheckbox.checked;
  if (isFocusMode && !document.fullscreenElement) requestFullscreen();

  container.style.display = "none";
  activeView.style.display = "flex";
  document.body.classList.add("mini");

  interval = setInterval(() => {
    if (remaining > 0) {
      remaining--;
      updateDisplay();
      updateProgressBar();
      if (remaining === 6) bellSound.play();
    } else {
      clearInterval(interval);
      interval = null;

      if (isBreak) {
        workCount++;
        saveWorkCount();
        updateCountDisplay();

        isBreak = false;
        remaining = WORK_DURATION;
        updateDisplay();
        updateProgressBar();

        activeView.style.display = "none";
        container.style.display = "flex";
        document.body.className = "work";
        exitFullscreen();
      } else {
        askBreakConfirmation();
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  bellSound.pause();
  bellSound.currentTime = 0;

  activeView.style.display = "none";
  container.style.display = "flex";
  document.body.className = isBreak ? "break" : "work";
  breakBtn.style.display = "none";

  if (isFocusMode) exitFullscreen();
}

function resetTimer() {
  pauseTimer();
  startBtn.disabled = false;
  pauseBtn.disabled = false;
  pauseBtnActive.disabled = false;
  isBreak = false;

  remaining = WORK_DURATION;
  workCount = 0;
  saveWorkCount();
  updateDisplay();
  updateCountDisplay();
  progressBar.style.width = "0%";

  document.body.className = "work";
  breakBtn.style.display = "none";

  todoList.innerHTML = "";
  saveTodoList();

  if (isFocusMode) exitFullscreen();
}

function switchMode() {
  isBreak = !isBreak;

  if (!isBreak) {
    workCount++;
    saveWorkCount();
    updateCountDisplay();
  }

  remaining = isBreak ? BREAK_DURATION : WORK_DURATION;

  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  document.body.className = isBreak ? "break mini" : "work mini";
  updateDisplay();
  updateProgressBar();
  startTimer();
}

function askBreakConfirmation() {
  pauseTimer();
  if (isFocusMode && document.fullscreenElement) {
    activeView.style.display = "flex";
    setTimeout(() => {
      breakBtn.style.display = "inline-block";
    }, 100);
  } else {
    breakBtn.style.display = "inline-block";
  }

  startBtn.disabled = true;
  pauseBtn.disabled = true;
  pauseBtnActive.disabled = true;
}

function requestFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isFocusMode) pauseTimer();
});

function saveWorkCount() {
  localStorage.setItem("workCount", workCount);
}






