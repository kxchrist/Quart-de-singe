const socket = io();

const rules = [
  "interdiction de dire oui",
  "parler avec accent",
  "dire banane avant phrase",
  "interdiction de poser question",
  "tout le monde finit son verre"
];

let lobbyPlayers = [];
let playersGame = [];
let currentPlayerName = "";
let bananaInterval = null;

const welcomePage = document.getElementById("welcome");
const gamePage = document.getElementById("game");
const lobbyPage = document.getElementById("lobby");
const playPage = document.getElementById("play");

const playerNameInput = document.getElementById("playerNameInput");

const btnHostLobby = document.getElementById("btnHostLobby");
const btnJoinLobby = document.getElementById("btnJoinLobby");
const btnStartGame = document.getElementById("btnStartGame");

const joinCodeContainer = document.getElementById("joinCodeContainer");
const joinCodeInput = document.getElementById("joinCodeInput");
const btnSubmitJoin = document.getElementById("btnSubmitJoin");

const lobbyPlayersContainer = document.getElementById("lobbyPlayers");
const lobbyCodeDisplay = document.getElementById("lobbyCodeDisplay");

const playPlayers = document.getElementById("playPlayers");
const ruleBox = document.getElementById("ruleBox");

document.getElementById("btnToGame").onclick = () => {

  welcomePage.style.display = "none";
  gamePage.style.display = "block";

};

playerNameInput.addEventListener("input",()=>{

  currentPlayerName = playerNameInput.value.trim();

  const enabled = currentPlayerName.length > 0;

  btnHostLobby.disabled = !enabled;
  btnJoinLobby.disabled = !enabled;

});

btnHostLobby.onclick = ()=>{

  socket.emit("createLobby",currentPlayerName);

};

btnJoinLobby.onclick = ()=>{

  joinCodeContainer.style.display = "block";

};

btnSubmitJoin.onclick = ()=>{

  const code = joinCodeInput.value.trim();

  if(!code) return;

  socket.emit("joinLobby",{code,name:currentPlayerName});

};

socket.on("lobbyCode",(code)=>{

  lobbyCodeDisplay.innerText = "Code du lobby : " + code;

});

socket.on("updatePlayers",(players)=>{

  lobbyPlayers = players;

  renderLobbyPlayers();

  gamePage.style.display="none";
  lobbyPage.style.display="block";

});

function renderLobbyPlayers(){

  let html="";

  lobbyPlayers.forEach((p)=>{

    html+=`
    <div class="player">

      <h3>${p.name}</h3>

      <p>${p.ready ? "✅ prêt" : "❌ pas prêt"}</p>

      <button onclick="toggleReady()">
      ${p.ready ? "Annuler prêt" : "Prêt"}
      </button>

    </div>
    `;

  });

  lobbyPlayersContainer.innerHTML = html;

  btnStartGame.disabled =
  !lobbyPlayers.every(p=>p.ready) ||
  lobbyPlayers.length < 3;

}

function toggleReady(){

  socket.emit("toggleReady");

}

btnStartGame.onclick = ()=>{

  socket.emit("startGame");

};

socket.on("startGame",(players)=>{

  playersGame = players;

  lobbyPage.style.display="none";
  playPage.style.display="block";

  renderPlay();
  bananaRain();

});

function addQuart(i){

  socket.emit("addQuart",i);

}

socket.on("updateGame",(players)=>{

  playersGame = players;

  renderPlay();

});

function renderPlay(){

  let html="";

  playersGame.forEach((p,i)=>{

    let percent = (p.quart/4)*100;

    html+=`
    <div class="player ${p.quart>=4?"singe":""}">

      <h3>${p.name} 🍻${p.shots}</h3>

      <div class="progress">
        <div class="bar" style="width:${percent}%"></div>
      </div>

      <button onclick="addQuart(${i})">
      +1 quart
      </button>

    </div>
    `;

  });

  playPlayers.innerHTML = html;

}

document.getElementById("btnRandomRule").onclick=()=>{

  const randomRule =
  rules[Math.floor(Math.random()*rules.length)];

  ruleBox.innerText="🎲 "+randomRule;

};

function bananaRain(){

  if(bananaInterval) return;

  bananaInterval=setInterval(()=>{

    let b=document.createElement("div");

    b.className="banana";
    b.innerText="🍌";
    b.style.left=Math.random()*100+"vw";

    document.body.appendChild(b);

    setTimeout(()=>b.remove(),5000);

  },800);

}

function beerBubbles(){

setInterval(()=>{

let b=document.createElement("div");

b.className="bubble";
b.style.left=Math.random()*100+"vw";

document.body.appendChild(b);

setTimeout(()=>b.remove(),8000);

},500);

}

beerBubbles();