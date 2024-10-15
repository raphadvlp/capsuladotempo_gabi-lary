let mediaRecorder;
let recordedChunks = [];

// Obtém a referência dos botões e do vídeo
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const videoPreview = document.getElementById("videoPreview");

// Inicia a gravação
startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  videoPreview.srcObject = stream; // Define o stream como fonte do vídeo para pré-visualização
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    recordedChunks = []; // Limpa os chunks gravados

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
          alert(`Vídeo enviado com sucesso! Acesse: ${downloadURL}`);
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
