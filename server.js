const Socket = require('websocket').server;
const http = require('http');

const server = http.createServer();

server.listen(3000, () =>{
  console.log("Listening on port 3000");
})

const webWocket = new Socket({ httpServer: server });

let users = [];
function findUser(username){
  let result;
  users.forEach(user => {
    if(user.username === username) result = user;
  });

  return result;
}


webWocket.on('request', (req) =>{
  const connection = req.accept();

  connection.on("message", (msg) =>{
    const data = JSON.parse(msg.utf8Data);
    handleMessage(connection, data);
  });

  connection.on("close", () =>{
    users.forEach(user =>{
      if(user.conn == connection){
        users.splice(users.indexOf(user), 1);
        return;
      }
    });
  });
  
});

function sendData(connection, data){
  connection.send(JSON.stringify(data));
}

// Captura e processa as menssagens dos clients
function handleMessage(connection, data){
  switch (data.type) {
    case "store_user":
      storeUser(connection, data.username);
      break;
    
    case "store_offer":
      storeOffer(data);
      break;
    
    case "store_candidate":
      storeCandidate(data);
      break;
    
    case "send_answer":
      sendAnswer(data);
      console.log("Enviando resposta");
      break;
    
    case "send_candidate":
      sendCandidate(data);
      console.log("Enviando candidate");
      break;
    
    case "join_call":
      joinCall(connection, data);
      break
  
    default:
      break;
  }
}

function storeUser(connection, username){
  if(findUser(username) != null) return;
  
  const newUser = {
    conn: connection,
    username: username
  };

  users.push(newUser);
  console.log("New user: " + newUser.username);
}

function storeOffer(data){
  const user = findUser(data.username);
  if(user == null) return;

  user.offer = data.offer;
  //console.log("Storing offer for: " + user.username, user.offer);
}

function storeCandidate(data){
  const user = findUser(data.username);
  if(user == null) return;

  if(user.candidates == null) user.candidates = [];

  user.candidates.push(data.candidate);
  //console.log("Storing candidates for: " + user.username, user.candidates);
}

function sendAnswer(data){
  const user = findUser(data.username);
  if(user == null) return;

  sendData(user.conn, {
    type: "answer",
    answer: data.answer
  });
}

function sendCandidate(data){
  const user = findUser(data.username);
  if(user == null) return;

  sendData(user.conn, {
    type: "candidate",
    candidate: data.candidate
  });
}

function joinCall(connection, data){
  const user = findUser(data.username);
  if(user == null) return;

  sendData(connection, {
    type: "offer",
    offer: user.offer
  });

  user.candidates.forEach(candidate =>{
    sendData(connection, {
      type: "candidate",
      candidate: candidate
    })
  });
}
