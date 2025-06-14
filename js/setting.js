// ============================
// 7. 설정 적용 함수
// ============================
function applyDurations() {
  WORK_DURATION = parseInt(workDurationSelect.value, 10);
  BREAK_DURATION = parseInt(breakDurationSelect.value, 10);
  remaining = isBreak ? BREAK_DURATION : WORK_DURATION;
  updateDisplay();
  updateProgressBar();
}

function setupSettingsButton() {
  const applyBtn = document.querySelector(".settings-container button");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      applyDurations();
    });
  }
}
