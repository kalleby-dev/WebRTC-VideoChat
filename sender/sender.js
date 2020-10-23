const webSocket = new WebSocket("ws://127.0.0.1:3000");

let username;
function onBtnSend(){
  username = document.querySelector("#user-name").value;
  sendData({ type: "store_user" });
}

// Envia informações para o servidor Socket
function sendData(data){
  data.username = username;
  webSocket.send(JSON.stringify(data));
}
