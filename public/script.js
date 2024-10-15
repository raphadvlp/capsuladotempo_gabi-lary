import {
  ref,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-storage.js";
import { storage } from "./firebaseConfig.js"; // Importa o objeto de storage do firebaseConfig.js

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
  const blob = new Blob(recordedChunks, { type: "video/mp4" });

  // Criando uma referência para o arquivo no Firebase Storage
  const storageRef = ref(storage, `videos/${Date.now()}.mp4`);

  // Enviando o arquivo para o Firebase Storage
  const uploadTask = uploadBytesResumable(storageRef, blob);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Monitora o progresso do upload
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    },
    (error) => {
      console.error("Erro no upload:", error);
    },
    () => {
      // Upload completado com sucesso
      console.log("Upload completo!");
    }
  );
});
