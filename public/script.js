const socket = io();

const rules = [
"interdiction de dire oui",
"parler avec accent",
"dire banane avant phrase",
"interdiction de poser question",
"tout le monde finit son verre"
];

let lobbyPlayers=[];
let playersGame=[];
let currentPlayerName="";
let bananaInterval=null;


// pages

const welcomePage=document.getElementById("welcome");
const gamePage=document.getElementById("game");
const lobbyPage=document.getElementById("lobby");
const playPage=document.getElementById("play");
const rankingPage=document.getElementById("ranking");


// éléments

const playerNameInput=document.getElementById("playerNameInput");

const btnHostLobby=document.getElementById("btnHostLobby");
const btnJoinLobby=document.getElementById("btnJoinLobby");

const joinCodeContainer=document.getElementById("joinCodeContainer");
const btnSubmitJoin=document.getElementById("btnSubmitJoin");
const joinCodeInput=document.getElementById("joinCodeInput");

const lobbyPlayersContainer=document.getElementById("lobbyPlayers");
const lobbyCodeDisplay=document.getElementById("lobbyCodeDisplay");

const btnStartGame=document.getElementById("btnStartGame");

const ruleBox=document.getElementById("ruleBox");
const rankingList=document.getElementById("rankingList");

const playersAround=document.getElementById("playersAround");
const mainPlayerName=document.getElementById("mainPlayerName");


// navigation

document.getElementById("btnToGame").onclick=()=>{

hideAll();
gamePage.style.display="block";

};

document.getElementById("btnBackLobby").onclick=()=>{

hideAll();
welcomePage.style.display="block";

};

document.getElementById("btnBackFromLobby").onclick=()=>{

hideAll();
gamePage.style.display="block";

};

document.getElementById("btnBack").onclick=()=>{

hideAll();
lobbyPage.style.display="block";

};


function hideAll(){

welcomePage.style.display="none";
gamePage.style.display="none";
lobbyPage.style.display="none";
playPage.style.display="none";
rankingPage.style.display="none";

}


// activation boutons

playerNameInput.addEventListener("input",()=>{

currentPlayerName=playerNameInput.value.trim();

const enabled=currentPlayerName.length>0;

btnHostLobby.disabled=!enabled;
btnJoinLobby.disabled=!enabled;

});


// créer lobby

btnHostLobby.onclick=()=>{

socket.emit("createLobby",currentPlayerName);

};


// rejoindre lobby

btnJoinLobby.onclick=()=>{

joinCodeContainer.style.display="block";

};

btnSubmitJoin.onclick=()=>{

const code=joinCodeInput.value.trim();

if(!code) return;

socket.emit("joinLobby",{code,name:currentPlayerName});

};


// recevoir lobby

socket.on("updatePlayers",(players)=>{

lobbyPlayers=players;

renderLobbyPlayers();

hideAll();
lobbyPage.style.display="block";

});


// retour lobby

socket.on("returnLobby",(players)=>{

lobbyPlayers=players;

renderLobbyPlayers();

hideAll();
lobbyPage.style.display="block";

});


// afficher lobby

function renderLobbyPlayers(){

let html="";

lobbyPlayers.forEach((p)=>{

html+=`

<div class="player">

<h3>${p.name}</h3>

<p>${p.ready?"✅ prêt":"❌ pas prêt"}</p>

<button onclick="toggleReady()">

${p.ready?"Annuler prêt":"Prêt"}

</button>

</div>

`;

});

lobbyPlayersContainer.innerHTML=html;

btnStartGame.disabled=
!lobbyPlayers.every(p=>p.ready)||
lobbyPlayers.length<2;

}


// bouton prêt

function toggleReady(){

socket.emit("toggleReady");

}


// code lobby

socket.on("lobbyCode",(code)=>{

lobbyCodeDisplay.innerText="Code du lobby : "+code;

});


// lancer partie

btnStartGame.onclick=()=>{

socket.emit("startGame");

};


socket.on("startGame",(players)=>{

playersGame=players;

hideAll();
playPage.style.display="block";

renderPlay();
bananaRain();

});


// ajouter quart (perso)

function addQuart(){

socket.emit("addQuart");

}


// mise à jour jeu

socket.on("updateGame",(players)=>{

playersGame=players;

renderPlay();

});


// afficher joueurs autour de la carte

function renderPlay(){

let html="";

let total=playersGame.length;

playersGame.forEach((p,i)=>{

let angle=(i/total)*2*Math.PI;

let x=Math.cos(angle)*140+150;
let y=Math.sin(angle)*170+170;

html+=`

<div class="playerCircle"
style="left:${x}px; top:${y}px;">

<div class="name">${p.name}</div>

<div class="quart">🍌 ${p.quart}</div>

<div class="shots">🍻 ${p.shots}</div>

</div>

`;

});

playersAround.innerHTML=html;


// joueur central

let me=playersGame.find(p=>p.name===currentPlayerName);

if(me){

mainPlayerName.innerText=me.name;

}

}


// règle aléatoire

document.getElementById("btnRandomRule").onclick=()=>{

const randomRule=rules[Math.floor(Math.random()*rules.length)];

ruleBox.innerText="🎲 "+randomRule;

};


// reset

document.getElementById("btnReset").onclick=()=>{

socket.emit("resetGame");

};


// fin partie

document.getElementById("btnEndGame").onclick=()=>{

socket.emit("endGame");

};


// classement

socket.on("showRanking",(players)=>{

playersGame=players;

hideAll();
rankingPage.style.display="block";

showRanking();

});


function showRanking(){

let sorted=[...playersGame].sort((a,b)=>b.shots-a.shots);

let html="";

sorted.forEach((p,i)=>{

html+=`

<div class="rankPlayer">

${i+1}. ${p.name} — 🍻 ${p.shots}

</div>

`;

});

rankingList.innerHTML=html;

}


// bananes

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


// bulles

function beerBubbles(){

setInterval(()=>{

let b=document.createElement("div");

b.className="bubble";

b.style.left=Math.random()*100+"vw";

b.style.animationDuration=(4+Math.random()*4)+"s";

document.body.appendChild(b);

setTimeout(()=>b.remove(),8000);

},500);

}

beerBubbles();