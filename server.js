const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let lobbies = {};

function generateCode(){
  return Math.floor(1000 + Math.random()*9000).toString();
}

io.on("connection",(socket)=>{

let currentLobby = null;

// créer lobby
socket.on("createLobby",(name)=>{

const code = generateCode();

lobbies[code] = {

host: socket.id,

players:[{
id: socket.id,
name: name,
quart:0,
shots:0,
ready:false
}]

};

currentLobby = code;

socket.join(code);

socket.emit("lobbyCode",code);

io.to(code).emit("updatePlayers",lobbies[code].players);

});

// rejoindre lobby
socket.on("joinLobby",({code,name})=>{

if(!lobbies[code]) return;

lobbies[code].players.push({

id:socket.id,
name:name,
quart:0,
shots:0,
ready:false

});

currentLobby = code;

socket.join(code);

io.to(code).emit("updatePlayers",lobbies[code].players);

});

// prêt
socket.on("toggleReady",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

let player = players.find(p=>p.id===socket.id);

if(!player) return;

player.ready = !player.ready;

io.to(currentLobby).emit("updatePlayers",players);

});

// lancer partie
socket.on("startGame",()=>{

if(!currentLobby) return;

let lobby = lobbies[currentLobby];

if(socket.id !== lobby.host) return;

let players = lobby.players;

let ready =
players.length >= 3 &&
players.every(p=>p.ready);

if(!ready) return;

io.to(currentLobby).emit("startGame",players);

});

// ajouter quart
socket.on("addQuart",(i)=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

if(players[i].quart >= 4) return;

players[i].quart++;
players[i].shots++;

io.to(currentLobby).emit("updateGame",players);

});

// reset partie
socket.on("resetGame",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

players.forEach(p=>{

p.quart = 0;
p.shots = 0;

});

io.to(currentLobby).emit("updateGame",players);

});

// fin de partie
socket.on("endGame",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

io.to(currentLobby).emit("showRanking",players);

});

// déconnexion
socket.on("disconnect",()=>{

if(!currentLobby) return;

let lobby = lobbies[currentLobby];

if(!lobby) return;

lobby.players =
lobby.players.filter(p=>p.id !== socket.id);

io.to(currentLobby).emit("updatePlayers",lobby.players);

});

});

server.listen(process.env.PORT || 3000,()=>{
console.log("Serveur lancé");
});