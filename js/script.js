// ======= 상수 및 변수 선언 =======
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

// 추가: 설정 선택값 요소
const workDurationSelect = document.getElementById("work-duration-select");
const breakDurationSelect = document.getElementById("break-duration-select");

let WORK_DURATION = 10 ; // 기본 25분 (초 단위)
let BREAK_DURATION = 7 ; // 기본 5분 (초 단위)

let remaining = WORK_DURATION;
let isBreak = false;
let interval = null;
let workCount = parseInt(localStorage.getItem("workCount")) || 0;
let isFocusMode = false;

// TODO 리스트 관련 요소
const todoInput = document.getElementById("todo-input");
const addTodoBtn = document.getElementById("add-todo");
const todoList = document.getElementById("todo-list");
const pomoCountSelect = document.getElementById("pomo-count");

// ======= 타이머 표시 관련 함수 =======
function updateDisplay() {
  let minutes = Math.floor(remaining / 60);
  let seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
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

// ======= 전체화면 관련 함수 =======
function requestFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    return elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    return elem.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isFocusMode) {
    pauseTimer();
  }
});

// ======= 타이머 동작 관련 함수 =======
function startTimer() {
  if (interval) return;

  isFocusMode = focusModeCheckbox.checked;

  if (isFocusMode && !document.fullscreenElement) {
    requestFullscreen();
  }

  container.style.display = "none";
  activeView.style.display = "flex";
  document.body.classList.add("mini");

  interval = setInterval(() => {
    if (remaining > 0) {
      remaining--;
      updateDisplay();
      updateProgressBar();

      if (remaining === 6) {
        bellSound.play();
      }
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

  if (isFocusMode) {
    exitFullscreen();
  }
}

function resetTimer() {
  pauseTimer();

  startBtn.disabled = false;
  pauseBtn.disabled = false;
  pauseBtnActive.disabled = false;
  isBreak = false;

  // 세션 시간 다시 설정된 값 적용
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

  if (isFocusMode) {
    exitFullscreen();
  }
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

// ======= 작업 완료 카운트 저장 =======
function saveWorkCount() {
  localStorage.setItem("workCount", workCount);
}

// ======= TODO LIST 관련 함수 =======
function saveTodoList() {
  const todos = [];
  todoList.querySelectorAll("li").forEach((li) => {
    const fullText = li.textContent;
    const required = parseInt(li.getAttribute("data-required"), 10);
    const textOnly = fullText.replace(/\s*-\s*\d+\s*코인$/, "");
    todos.push({
      text: textOnly,
      required: required,
    });
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

// ======= 설정 적용 함수 =======
function applyDurations() {
  // 선택된 값 분 -> 초 단위로 변환
  WORK_DURATION = parseInt(workDurationSelect.value, 10) ;
  BREAK_DURATION = parseInt(breakDurationSelect.value, 10) ;

  // 현재 타이머가 휴식 모드인지 집중 모드인지에 따라 remaining 조정
  remaining = isBreak ? BREAK_DURATION : WORK_DURATION;

  updateDisplay();
  updateProgressBar();
}

// ======= 이벤트 리스너 등록 =======
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

// 설정창 확인 버튼에 이벤트 연결
function setupSettingsButton() {
  const applyBtn = document.querySelector(".settings-container button");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      applyDurations();
      // 타이머가 동작중이면 새로 설정된 시간으로 재설정하지 않음
      // 동작 중일 때 즉시 반영하려면 여기서 pauseTimer() 후 재시작 로직 필요
    });
  }
}

// ======= 초기 실행 코드 =======
updateCountDisplay();
updateDisplay();
loadTodoList();
setupSettingsButton();

document.addEventListener("keydown", (e) => {
  if (isFocusMode && document.fullscreenElement) {
    pauseTimer();
  }
});

const musicSelect = document.getElementById("music-select");
const userMusicOption = document.getElementById("user-music-option");
const audioPlayer = document.getElementById("audio-player");
const audioSource = audioPlayer.querySelector("source");
const audioUpload = document.getElementById("audio-upload");

musicSelect.addEventListener("change", () => {
  const selectedMusic = musicSelect.value;
  if (selectedMusic) {
    audioSource.src = selectedMusic;
    audioPlayer.load();
  }
});

audioUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (file) {
    const fileURL = URL.createObjectURL(file);

    // 사용자 곡 옵션 활성화 및 설정
    userMusicOption.disabled = false;
    userMusicOption.value = fileURL;
    userMusicOption.textContent = `사용자 곡: ${file.name}`;

    // 선택되도록 설정
    musicSelect.value = fileURL;

    // 오디오에 반영
    audioSource.src = fileURL;
    audioPlayer.load();
  } else {
    // 파일 선택 취소 시 다시 비활성화
    userMusicOption.disabled = true;
    userMusicOption.value = "";
    userMusicOption.textContent = "사용자 곡 없음";
  }
});
