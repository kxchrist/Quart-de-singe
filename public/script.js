const socket = io();

// ===== règles =====

const rules = [
  "interdiction de dire oui",
  "parler avec accent",
  "dire banane avant phrase",
  "interdiction de poser question",
  "tout le monde finit son verre"
];

// ===== joueurs =====

let lobbyPlayers = [];
let playersGame = [];
let currentPlayerName = "";

let bananaInterval = null;


// ===== pages =====

const welcomePage = document.getElementById("welcome");
const gamePage = document.getElementById("game");
const lobbyPage = document.getElementById("lobby");
const playPage = document.getElementById("play");
const rankingPage = document.getElementById("ranking");


// ===== éléments =====

const playerNameInput = document.getElementById("playerNameInput");

const btnHostLobby = document.getElementById("btnHostLobby");
const btnJoinLobby = document.getElementById("btnJoinLobby");

const joinCodeContainer = document.getElementById("joinCodeContainer");
const btnSubmitJoin = document.getElementById("btnSubmitJoin");
const joinCodeInput = document.getElementById("joinCodeInput");

const lobbyPlayersContainer = document.getElementById("lobbyPlayers");
const btnStartGame = document.getElementById("btnStartGame");

const playPlayers = document.getElementById("playPlayers");

const ruleBox = document.getElementById("ruleBox");

const rankingList = document.getElementById("rankingList");

const lobbyCodeDisplay = document.getElementById("lobbyCodeDisplay");


// ===== paramètres =====

const btnSettings = document.getElementById("btnSettings");
const settingsPanel = document.getElementById("settingsPanel");

const btnSettingsSound = document.getElementById("btnSettingsSound");
const btnSettingsRules = document.getElementById("btnSettingsRules");

const soundPanel = document.getElementById("soundPanel");
const rulesPanel = document.getElementById("rulesPanel");


// ===== navigation =====

document.getElementById("btnToGame").onclick = () => {

  welcomePage.style.display = "none";
  gamePage.style.display = "block";

};


// ===== retour menu =====

document.getElementById("btnBackLobby").onclick = () => {

  gamePage.style.display = "none";
  welcomePage.style.display = "block";

  playerNameInput.value = "";

};


// ===== activation boutons =====

playerNameInput.addEventListener("input", () => {

  currentPlayerName = playerNameInput.value.trim();

  const enabled = currentPlayerName.length > 0;

  btnHostLobby.disabled = !enabled;
  btnJoinLobby.disabled = !enabled;

});


// ===== paramètres =====

btnSettings.onclick = () => {

  settingsPanel.style.display =
    settingsPanel.style.display === "block" ? "none" : "block";

  soundPanel.style.display = "none";
  rulesPanel.style.display = "none";

};

btnSettingsSound.onclick = () => {

  soundPanel.style.display = "block";
  rulesPanel.style.display = "none";

};

btnSettingsRules.onclick = () => {

  rulesPanel.style.display = "block";
  soundPanel.style.display = "none";

};


// ======================
// LOBBY
// ======================

btnHostLobby.onclick = () => {

  socket.emit("createLobby", currentPlayerName);

};


btnJoinLobby.onclick = () => {

  joinCodeContainer.style.display = "block";

};


btnSubmitJoin.onclick = () => {

  const code = joinCodeInput.value.trim();

  if(!code) return alert("Entrez un code");

  socket.emit("joinLobby", {
    code: code,
    name: currentPlayerName
  });

};


// ===== recevoir joueurs =====

socket.on("updatePlayers",(players)=>{

  lobbyPlayers = players;

  renderLobbyPlayers();

  gamePage.style.display = "none";
  lobbyPage.style.display = "block";

});


// ===== afficher lobby =====

function renderLobbyPlayers(){

  let html = "";

  lobbyPlayers.forEach((p)=>{

    html += `
      <div class="player">

        ${p.name}

        <div>
        ${p.ready ? "✅ prêt" : "❌ pas prêt"}
        </div>

        ${p.name === currentPlayerName ?
        `<button onclick="toggleReady()">
        ${p.ready ? "Annuler prêt" : "Prêt"}
        </button>` : ""}

      </div>
    `;

  });

  lobbyPlayersContainer.innerHTML = html;

  btnStartGame.disabled =
    !lobbyPlayers.every(p=>p.ready) ||
    lobbyPlayers.length < 3;

}


// ===== READY =====

function toggleReady(){

  socket.emit("toggleReady");

}


// ===== code lobby =====

socket.on("lobbyCode",(code)=>{

  lobbyCodeDisplay.innerText =
  "Code du lobby : " + code;

});


// ===== lancer partie =====

btnStartGame.onclick = () => {

  socket.emit("startGame");

};


socket.on("startGame",(players)=>{

  playersGame = players;

  lobbyPage.style.display = "none";
  playPage.style.display = "block";

  renderPlay();

  bananaRain();

});


// ===== ajouter quart =====

function addQuart(i){

  socket.emit("addQuart",i);

}


socket.on("updateGame",(players)=>{

  playersGame = players;

  renderPlay();

});


// ===== afficher joueurs =====

function renderPlay(){

  let html = "";

  playersGame.forEach((p,i)=>{

    let percent = (p.quart / 4) * 100;

    html += `
    <div class="player ${p.quart >= 4 ? "singe" : ""}">

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


// ===== règle aléatoire =====

document.getElementById("btnRandomRule").onclick = () => {

  const randomRule =
    rules[Math.floor(Math.random()*rules.length)];

  ruleBox.innerText = "🎲 " + randomRule;

};


// ===== confetti =====

function confetti(){

  for(let i=0;i<40;i++){

    let c=document.createElement("div");

    c.className="confetti";

    c.style.left=Math.random()*100+"vw";

    c.style.background=
      `hsl(${Math.random()*360},100%,50%)`;

    document.body.appendChild(c);

    setTimeout(()=>c.remove(),3000);

  }

}


// ===== bananes =====

function bananaRain(){

  if(bananaInterval) return;

  bananaInterval = setInterval(()=>{

    let b=document.createElement("div");

    b.className="banana";

    b.innerText="🍌";

    b.style.left=Math.random()*100+"vw";

    document.body.appendChild(b);

    setTimeout(()=>b.remove(),5000);

  },800);

}


// ===== bulles bière =====

function beerBubbles(){

setInterval(()=>{

let b = document.createElement("div");

b.className = "bubble";

b.style.left = Math.random()*100 + "vw";

b.style.animationDuration =
(4 + Math.random()*4) + "s";

document.body.appendChild(b);

setTimeout(()=>b.remove(),8000);

},500);

}

beerBubbles();