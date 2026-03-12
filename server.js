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


// ===== CREER LOBBY =====

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


// ===== REJOINDRE LOBBY =====

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


// ===== READY =====

socket.on("toggleReady",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

let player = players.find(p=>p.id===socket.id);

if(!player) return;

player.ready = !player.ready;

io.to(currentLobby).emit("updatePlayers",players);

});


// ===== START GAME =====

socket.on("startGame",()=>{

if(!currentLobby) return;

let lobby = lobbies[currentLobby];

if(socket.id !== lobby.host) return;

let players = lobby.players;

let ready =
players.length >= 2 &&
players.every(p=>p.ready);

if(!ready) return;

io.to(currentLobby).emit("startGame",players);

});


// ===== AJOUT QUART (PERSONNEL) =====

socket.on("addQuart",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

let player = players.find(p=>p.id===socket.id);

if(!player) return;

if(player.quart >= 4) return;

player.quart++;
player.shots++;

io.to(currentLobby).emit("updateGame",players);

});


// ===== RESET (GARDE LES SHOTS) =====

socket.on("resetGame",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

players.forEach(p=>{

p.quart = 0;

});

io.to(currentLobby).emit("updateGame",players);

});


// ===== FIN PARTIE =====

socket.on("endGame",()=>{

if(!currentLobby) return;

let players = lobbies[currentLobby].players;

io.to(currentLobby).emit("showRanking",players);

});


// ===== DECONNEXION =====

socket.on("disconnect",()=>{

if(!currentLobby) return;

let lobby = lobbies[currentLobby];

if(!lobby) return;

lobby.players =
lobby.players.filter(p=>p.id !== socket.id);

// si lobby vide on supprime
if(lobby.players.length === 0){

delete lobbies[currentLobby];
return;

}

// si host quitte → nouveau host
if(lobby.host === socket.id){

lobby.host = lobby.players[0].id;

}

// renvoyer tout le monde au lobby
io.to(currentLobby).emit("returnLobby",lobby.players);

});

});

server.listen(process.env.PORT || 3000,()=>{

console.log("Serveur lancé");

});