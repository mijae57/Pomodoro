// 음악 설정
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
    userMusicOption.disabled = false;
    userMusicOption.value = fileURL;
    userMusicOption.textContent = `사용자 곡: ${file.name}`;
    musicSelect.value = fileURL;
    audioSource.src = fileURL;
    audioPlayer.load();
  } else {
    userMusicOption.disabled = true;
    userMusicOption.value = "";
    userMusicOption.textContent = "사용자 곡 없음";
  }
});