let mediaRecorder;
let recordedChunks = [];
let recordingTime = 0;
let recordingInterval;

const video = document.getElementById("video");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const uploadButton = document.getElementById("uploadFirebase");
const timerDisplay = document.getElementById("timer");

startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    video.srcObject = null;
    video.src = url;
    video.controls = true;
    uploadButton.disabled = false; // Ativa o botão de upload

    // Reinicia os chunks gravados
    recordedChunks = [];
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;

  // Inicia o contador de tempo
  recordingTime = 0;
  timerDisplay.textContent = "Tempo de Gravação: 0s";
  recordingInterval = setInterval(() => {
    recordingTime++;
    timerDisplay.textContent = `Tempo de Gravação: ${recordingTime}s`;

    // Para a gravação após 60 segundos
    if (recordingTime >= 60) {
      stopRecording();
    }
  }, 1000);
});

stopButton.addEventListener("click", stopRecording);

function stopRecording() {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;

  // Para o contador de tempo
  clearInterval(recordingInterval);
}

// Função para upload para Firebase
uploadButton.addEventListener("click", () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });

  // Cria uma referência ao local de armazenamento no Firebase
  const storageRef = storage.ref(`videos/${new Date().toISOString()}.webm`);

  // Faz o upload do vídeo
  const uploadTask = storageRef.put(blob);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload está ${progress}% completo`);
    },
    (error) => {
      console.error("Erro no upload:", error);
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log("Video URL:", downloadURL);
        alert("Upload realizado com sucesso! URL: " + downloadURL);
      });
    }
  );
});
