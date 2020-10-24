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
let peerConnection;
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

    peerConnection = createPeerConnection(localStream);
    peerConnection.ontrack = (remoteStream) => playRemoteVideo(remoteStream);

  })
  .catch(error => {
    console.error(error);
  });
}

function playLocalVideo(stream){
  document.querySelector("#local-video").srcObject = stream;
}

function playRemoteVideo(stream){
  document.querySelector("#remote-video").srcObject = stream;
}

function createPeerConnection(stream){
  let config = {
    iceServers: [
      {
        "urls": [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ]
      }
    ]
  };
  const peer = new RTCPeerConnection(config);
  peer.addStream(stream);
  console.log(peer);
  return peer;
}
