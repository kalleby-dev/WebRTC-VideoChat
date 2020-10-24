const webSocket = new WebSocket("ws://127.0.0.1:3000");
const midiaParam = {
  video:{
    frameRate: 30,
    width: { min: 400, ideal: 720, max: 1280 },
    aspectRatio: 1.3333
  },
  audio: true
};

let username;
function getUsername(){
  username = document.querySelector("#user-name").value;
}

function onBtnJoin(){
  document.querySelector(".video-grid").style.display = "block";
  getUsername();
  startStream();
}

// Envia informações para o servidor Socket
function sendData(data){
  data.username = username;
  webSocket.send(JSON.stringify(data));
}

// Recebe e envia os dados da video-chamada
let localStream;
function startStream(){
  navigator.mediaDevices.getUserMedia(midiaParam).then(stream => {
    localStream = stream;
    playLocalVideo(localStream);

    peerConnection = createPeerConnection(localStream);
    peerConnection.onaddstream = (remote) => playRemoteVideo(remote.stream);

    peerConnection.onicecandidate = (iceCandidate) => getCandidate(iceCandidate);

    webSocket.onmessage = (msg) => handleSignalling(peerConnection, JSON.parse(msg.data));
    
    sendData({
      type: "join_call"
    });
    console.log(peerConnection);
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
        ]
      }
    ]
  };
  const peer = new RTCPeerConnection(config);
  peer.addStream(stream);
  return peer;
}

function getCandidate(iceCandidate){
  if(iceCandidate.candidate === null) return;

  sendData({
    type: "send_candidate",
    candidate: iceCandidate.candidate
  });
}

// Cria e envia a resposta da chamada para o servidor socket
function createAnswer(peerConnection){
  peerConnection.createAnswer((answer) =>{
    sendData({
      type: "send_answer",
      answer: answer
    });

    peerConnection.setLocalDescription(answer);
  }, (error) => console.error(error));
}

// Captura as informações do socket
function handleSignalling(peerConnection, data){
  console.log("Socket says: " + data);
  switch (data.type) {
    case "offer":
      peerConnection.setRemoteDescription(data.offer);
      createAnswer(peerConnection);
      break;
    
    case "candidate":
      peerConnection.addIceCandidate(data.candidate);
      break
  }
}

// Mutar o proprio microfone
let isAudio = true;
function onBtnMuteAudio(){
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enabled = isAudio;
}

// Desligar a camera
let isVideo = true;
function onBtnDisableVideo(){
  isVideo = !isVideo;
  localStream.getVideoTracks()[0].enabled = isVideo;
}
