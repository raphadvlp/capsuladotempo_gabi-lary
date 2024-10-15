let mediaRecorder;
let recordedChunks = [];

// Obtém a referência dos botões
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

// Inicia a gravação
startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    recordedChunks = []; // Limpa os chunks gravados

    // Verifica o tamanho do blob
    console.log("Tamanho do vídeo gravado:", blob.size);

    // Envio do vídeo para o Firebase Storage
    const storageRef = storage.ref(`videos/${Date.now()}.webm`);
    const uploadTask = storageRef.put(blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Erro no upload:", error);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("Arquivo disponível em:", downloadURL);
        });
      }
    );
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});

// Para a gravação
stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
});
