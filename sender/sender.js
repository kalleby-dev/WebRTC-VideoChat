const webSocket = new WebSocket("ws://127.0.0.1:3000");

let username;
function onBtnSend(){
  username = document.querySelector("#user-name").value;
  sendData({ type: "store_user" });
}

function onBtnCall(){
  document.querySelector(".video-grid").style.display = "block";
  startStream();
}

// Envia informações para o servidor Socket
function sendData(data){
  data.username = username;
  webSocket.send(JSON.stringify(data));
  console.log("Enviando: " + username + " para o socket");
}

// Recebe e envia os dados da video-chamada
let localStream;
function startStream(){
  console.log("Inciando chamada");

  navigator.mediaDevices.getUserMedia({
    video:{
      frameRate: 30,
      width: { min: 400, ideal: 720, max: 1280 },
      aspectRatio: 1.3333
    },
    audio: true
  })
  .then(stream => {
    localStream = stream;
    playLocalVideo(localStream);
  })
  .catch(error => {
    console.error(error);
  });
}

function playLocalVideo(stream){
  document.querySelector("#local-video").srcObject = stream;
}