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
});

// Captura e processa as menssagens dos clients
function handleMessage(connection, data){
  switch (data.type) {
    case "store_user":
      storeUser(connection, data.username);
      break;
  
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

