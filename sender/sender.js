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
}

// Recebe e envia os dados da video-chamada
let localStream;
let peerConnection;
function startStream(){
  navigator.mediaDevices.getUserMedia(midiaParam).then(stream => {
    localStream = stream;
    playLocalVideo(localStream);

    peerConnection = createPeerConnection(localStream);
    peerConnection.ontrack = (remoteStream) => playRemoteVideo(remoteStream);

    peerConnection.onicecandidate = (iceCandidate) => getCandidate(iceCandidate);
    createOffer(peerConnection);

    webSocket.onmessage = (msg) => handleSignalling(peerConnection, JSON.parse(msg.data));
    
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
    type: "store_candidate",
    candidate: iceCandidate.candidate
  });
}

// Cria e envia a oferta de chamada para o servidor socket
function createOffer(peerConnection){
  peerConnection.createOffer((offer) =>{
    sendData({
      type: "store_offer",
      offer: offer
    });

    peerConnection.setLocalDescription(offer);
  }, (error) => console.error(error));
}

// Captura as informações do socket
function handleSignalling(peerConnection, data){
  console.log("Socket says: " + data);
  switch (data.type) {
    case "answer":
      peerConnection.setRemoteDescription(data.answer);
      break;
    
    case "candidate":
      peerConnection.addIceCandidate(data.candidate);
      break
  }
}
