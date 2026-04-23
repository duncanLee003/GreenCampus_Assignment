const body = document.querySelector("body"),
      nav = document.querySelector("nav"),
      modeToggle = document.querySelector(".dark-light"),
      searchToggle = document.querySelector(".searchToggle"),
      sidebarOpen = document.querySelector(".sidebarOpen"),
      siderbarClose = document.querySelector(".siderbarClose");

      let getMode = localStorage.getItem("mode");
          if(getMode && getMode === "dark-mode"){
            body.classList.add("dark");
          }


      modeToggle.addEventListener("click" , () =>{
        modeToggle.classList.toggle("active");
        body.classList.toggle("dark");


        if(!body.classList.contains("dark")){
            localStorage.setItem("mode" , "light-mode");
        }else{
            localStorage.setItem("mode" , "dark-mode");
        }
      });


        searchToggle.addEventListener("click" , () =>{
        searchToggle.classList.toggle("active");
      });
 
      

sidebarOpen.addEventListener("click" , () =>{
    nav.classList.add("active");
});

body.addEventListener("click" , e =>{
    let clickedElm = e.target;

    if(!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")){
        nav.classList.remove("active");
    }
});



//script for resources
let unlockedTitles = [];
let selectedTitle = "";

let xp = 0;
let level = 1;
let totalTasks = 5;

let streak = 0;
let lastActiveDate = null;

function xpToNextLevel(lvl) {
  return lvl * 100;
}


function gainXP(amount) {
  amount = Number(amount);
  if (isNaN(amount)) return;

  xp += amount;

  updateStreak(); 

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
    showReward(level);
  }

  updateUI();
  saveProgress();
}

const milestones = [
  { percent: 0, message: "A new start!" },
  { percent: 25, message: "Keep going!" },
  { percent: 50, message: "Halfway there!" },
  { percent: 75, message: "Almost there!" },

];


function updateUI() {
  const xpNeeded = xpToNextLevel(level);
  const percentage = (xp / xpNeeded) * 100;

  document.getElementById("xpBar").style.width = percentage + "%";
  document.getElementById("xp").innerText = xp;
  document.getElementById("xpNeeded").innerText = xpNeeded;
  document.getElementById("level").innerText = level;

  updateXPMessage(percentage);
}

function createSegments() {
  const container = document.querySelector(".progress-segments");

  if (!container) return; // 🔥 prevent crash

  for (let i = 0; i < 4; i++) { //maybe modify to get rid of segment at the end of bar
    const seg = document.createElement("div");
    container.appendChild(seg);
  }
}



function updateXPMessage(percent) {
  let currentMessage = "";

  for (let i = 0; i < milestones.length; i++) {
    if (percent >= milestones[i].percent) {
      currentMessage = milestones[i].message;
    }
  }

  document.getElementById("xpMessage").innerText = currentMessage;
}


function showReward(level) {
  let newTitle = "";

  if (level === 2) newTitle = "🎉 Beginner";
  else if (level === 5) newTitle = "🔥 Pro";
  else if (level === 10) newTitle = "👑 Elite";

  if (newTitle && !unlockedTitles.includes(newTitle)) {
    unlockedTitles.push(newTitle);
    selectedTitle = newTitle; // auto-equip newest

    document.getElementById("reward").innerText =
      `Unlocked Title: ${newTitle}`;
    
    updateTitleSelector();
  }
}


function saveProgress() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastActiveDate", lastActiveDate);

  localStorage.setItem("titles", JSON.stringify(unlockedTitles));
  localStorage.setItem("selectedTitle", selectedTitle);
}

function loadProgress() {
  xp = parseInt(localStorage.getItem("xp"));
  level = parseInt(localStorage.getItem("level"));

  streak = parseInt(localStorage.getItem("streak"));
  lastActiveDate = localStorage.getItem("lastActiveDate");

  if (isNaN(xp)) xp = 0;
  if (isNaN(level)) level = 1;
  if (isNaN(streak)) streak = 0;

  unlockedTitles = JSON.parse(localStorage.getItem("titles")) || [];
  selectedTitle = localStorage.getItem("selectedTitle") || "";

  updateUI();
  updateTitleSelector();
  updateStreakUI();
}

function updateStreak() {
  const today = new Date().toDateString();

  // first time ever
  if (!lastActiveDate) {
    streak = 1;
  }

  // same day → do nothing
  else if (lastActiveDate === today) {
    return;
  }

  // consecutive day → increase streak
  else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActiveDate === yesterday.toDateString()) {
      streak++;
    } else {
      streak = 1; // reset streak
    }
  }

  lastActiveDate = today;
  updateStreakUI();
  saveProgress();
}

// =========================
// LEADERBOARD SYSTEM
// =========================




let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

// Submit score to leaderboard
function submitScore() {
  const name = document.getElementById("username").value.trim() || "Anonymous";
  const totalXP = xp + (level * 100);

  // Find existing player
  const existingIndex = leaderboard.findIndex(player => player.name === name);

  if (existingIndex !== -1) {
    // Player exists → update their score & title
    leaderboard[existingIndex].xp = totalXP;
    leaderboard[existingIndex].title = selectedTitle;
  } else {
    // New player → add them
    leaderboard.push({
      name: name,
      xp: totalXP,
      title: selectedTitle
    });
  }

  // Sort leaderboard (highest XP first)
  leaderboard.sort((a, b) => b.xp - a.xp);

  // Keep top 10
  leaderboard = leaderboard.slice(0, 10);

  // Save + render
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

// =========================
// REWARD + LEVEL LOGIC
// =========================
function getLevelFromXP(totalXP) {
  return Math.floor(totalXP / 100);
}

function getReward(level) {
  if (level >= 10) return "👑 Elite";
  if (level >= 5) return "🔥 Pro";
  if (level >= 2) return "🎉 Beginner";
  return "—";
}


// =========================
// RENDER LEADERBOARD TABLE
// =========================
function renderLeaderboard() {
  const tableBody = document.querySelector("#leaderboardTable tbody");
  tableBody.innerHTML = "";

  leaderboard.forEach((player, index) => {
    const row = document.createElement("tr");

    const level = getLevelFromXP(player.xp);
    const reward = getReward(level);


    

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.xp}</td>
      <td>${player.title || "—"}</td>
    `;



    tableBody.appendChild(row);
  });
}


function updateTitleSelector() {
  const selector = document.getElementById("titleSelector");
  selector.innerHTML = "";

  unlockedTitles.forEach(title => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;

    if (title === selectedTitle) {
      option.selected = true;
    }

    selector.appendChild(option);
  });
}

function changeTitle() {
  selectedTitle = document.getElementById("titleSelector").value;
  saveProgress();

}



const defaultChallenges = [
  {
    name: "Reduce food waste",
    type: "daily",
    description: "Use leftovers and avoid wasting food",
    daysLeft: 2,
    xpReward: 50,
    completed: false,
    image: "../img/carddefault.png"
  },
  {
    name: "Litter-picking in town",
    type: "daily",
    description: "Pick up litter in town around the campus",
    daysLeft: 1,
    xpReward: 70,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Use reusable bottles",
    type: "daily",
    description: "Avoid single-use plastic bottles",
    daysLeft: 1,
    xpReward: 50,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Turn off standby devices",
    type: "daily",
    description: "Switch off electronics not in use",
    daysLeft: 5,
    xpReward: 50,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Use bio-degradable containers and cutlery",
    type: "daily",
    description: "Avoid using plastic",
    daysLeft: 1,
    xpReward: 50,
    completed: false,
    image: "img/carddefault.png"
  },

  {
    name: "Recycle waste",
    type: "daily",
    description: "Recycle at least 5 items today",
    daysLeft: 1,
    xpReward: 50,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Recycle properly",
    type: "weekly",
    description: "Sort waste correctly in the designated bins",
    daysLeft: 7,
    xpReward: 100,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Switch off unused lights",
    type: "daily",
    description: "Save energy at home",
    daysLeft: 1,
    xpReward: 20,
    completed: false,
    image: "img/carddefault.png"
  },
   {
    name: "Walk or cycle",
    type: "weekly",
    description: "Avoid vehical transport for a week",
    daysLeft: 1,
    xpReward: 100,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Plant a tree",
    type: "weekly",
    description: "Contribute to greenery",
    daysLeft: 7,
    xpReward: 100,
    completed: false,
    image: "img/carddefault.png"
  },
  {
    name: "Buy local sustainable products",
    type: "weekly",
    description: "Buy from local shops",
    daysLeft: 1,
    xpReward: 70,
    completed: false,
    image: "img/carddefault.png"
  }
];

let challenges = JSON.parse(localStorage.getItem("challenges"));

if (!Array.isArray(challenges) || challenges.length === 0) {
  challenges = [...defaultChallenges]; // clone defaults
  localStorage.setItem("challenges", JSON.stringify(challenges));
}

function renderChallenges() {
  console.log("RUNNING renderChallenges");
  console.log("Challenges:", challenges);

  const activeGrid = document.getElementById("activeChallenges");
  const completedGrid = document.getElementById("completedChallenges");



  // 🚨 stop crash if HTML not loaded
  if (!activeGrid || !completedGrid) {
    console.error("Missing challenge containers in HTML");
    return;
  }

  activeGrid.innerHTML = "";
  completedGrid.innerHTML = "";

  


  const filterElement = document.getElementById("challengeFilter");

  let filter = "all";
  if (filterElement && filterElement.value) {
    filter = filterElement.value;
  }

  challenges.forEach((challenge, index) => {

    const challengeType = challenge.type.toLowerCase();
    const currentFilter = filter.toLowerCase();

    if (currentFilter !== "all" && challengeType !== currentFilter) return;

    const card = document.createElement("div");
    card.className = "challenge-card";

    card.innerHTML = `
      <img src="${challenge.image}" class="challenge-img">
      <h3>${challenge.name}</h3>
      <p>${challenge.description}</p>
      <p><strong>${challenge.type}</strong></p>

      <div class="challenge-footer">
        <span>
          Ends in ${challenge.daysLeft} ${challenge.daysLeft == 1 ? "day" : "days"}
        </span>
        <div>
          ${
            challenge.completed
              ? "Completed"
              : `<button class="complete-btn" onclick="completeChallenge(${index})">✔</button>`
          }
        </div>
      </div>
    `;

    if (challenge.completed) {
      card.style.opacity = "0.6";
      completedGrid.appendChild(card);
    } else {
      activeGrid.appendChild(card);
    }
  });
}

let tempChallenge = null;

function addChallenge() {
  tempChallenge = {};
  document.getElementById("popupModal").style.display = "block";
}

function closeModal() {
  document.getElementById("popupModal").style.display = "none";
}

function confirmChallenge() {
  const name = document.getElementById("challengeName").value;
  const type = document.getElementById("challengeType").value;
  const description = document.getElementById("challengeDesc").value;
  const daysLeft = document.getElementById("challengeDays").value;

  if (!name) return;

  challenges.push({
    name,
    type: type.toLowerCase().trim(),
    description,
    daysLeft,
    xpReward: 20,
    completed: false,
    image: "img/carddefault.png"
  });

  closeModal();
  renderChallenges();
}

function editChallenge(index) {
  const challenge = challenges[index];

  const name = prompt("Edit name:", challenge.name);
  const description = prompt("Edit description:", challenge.description);

  challenges[index].name = name;
  challenges[index].description = description;

  renderChallenges();
}

function completeChallenge(index) {
  const challenge = challenges[index];

  if (challenge.completed) return;

  challenge.completed = true;

  //saves
  localStorage.setItem("challenges", JSON.stringify(challenges));

  gainXP(Number(challenge.xpReward) || 0);
  autoUpdateLeaderboard();

  renderChallenges();
}

function autoUpdateLeaderboard() {
  const name = document.getElementById("username").value || "Anonymous";
  const totalXP = xp + (level * 100);

  const existingIndex = leaderboard.findIndex(
    player => player.name.toLowerCase() === name.toLowerCase()
  );

  if (existingIndex !== -1) {
    leaderboard[existingIndex].xp = totalXP;
    leaderboard[existingIndex].title = selectedTitle;
  } else {
    leaderboard.push({
      name,
      xp: totalXP,
      title: selectedTitle
    });
  }

  leaderboard.sort((a, b) => b.xp - a.xp);
  leaderboard = leaderboard.slice(0, 10);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function showTab(type) {
  const activeGrid = document.getElementById("activeChallenges");
  const completedGrid = document.getElementById("completedChallenges");

  const activeTitle = document.getElementById("activeTitle");
  const completedTitle = document.getElementById("completedTitle");

  if (type === "active") {
    activeGrid.style.display = "grid";
    completedGrid.style.display = "none";

    activeTitle.style.display = "block";     //shows
    completedTitle.style.display = "none";   //hides
  } else {
    activeGrid.style.display = "none";
    completedGrid.style.display = "grid";

    activeTitle.style.display = "none";      //hides
    completedTitle.style.display = "block";  //shows
  }
}


let quizCompletedDate = localStorage.getItem("quizCompletedDate");
function isQuizLocked() {
  const today = new Date().toDateString();
  return quizCompletedDate === today;
}

const quiz = [
  {
    question: "What does recycling help reduce?",
    answers: ["Pollution", "XP", "Internet speed", "Noise"],
    correct: 0
  },
  {
    question: "Which is a daily challenge example?",
    answers: ["Run 5km", "Build a house", "Fly a plane", "Sleep forever"],
    correct: 0
  },
  {
    question: "What does XP stand for in your system?",
    answers: ["Experience Points", "Extra Pizza", "Exercise Power", "Example Process"],
    correct: 0
  }
];

function updateStreakUI() {
  const el = document.getElementById("streakCount");
  if (el) {
    el.innerText = streak;
  }
}

let correctAnswers = 0;

let currentQuestion = 0;

function loadQuestion() {

  if (isQuizLocked()) {
    document.getElementById("questionText").innerText =
      "✅ You’ve completed today’s quiz! Come back tomorrow.";

    document.getElementById("answerButtons").innerHTML = "";
    return;
  }

  const q = quiz[currentQuestion];

  document.getElementById("questionText").innerText = q.question;

  const container = document.getElementById("answerButtons");
  container.innerHTML = "";

  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.innerText = answer;
    btn.onclick = () => checkAnswer(index);
    container.appendChild(btn);
  });

  document.getElementById("quizFeedback").innerText = "";
}

function checkAnswer(selected) {
  const q = quiz[currentQuestion];

  if (selected === q.correct) {
    document.getElementById("quizFeedback").innerText = "✅ Correct! +10 XP";
    gainXP(10);

    correctAnswers++;
  } else {
    document.getElementById("quizFeedback").innerText = "❌ Wrong answer";
  }

  setTimeout(() => {
    nextQuestion();
  }, 800);
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion >= quiz.length) {

    const score = correctAnswers;
    const total = quiz.length;

    let message = `🎉 Quiz complete!\n\nYou scored ${score}/${total}\n`;

    // 🎯 PERFECT SCORE CHECK
    if (score === total) {
      message += "🔥 Perfect score!\n";
      
      const unlocked = unlockQuizTitle(); 
      if (unlocked) {
        message += "🏆 You unlocked: 🧠 Quiz Master!";
      } else {
        message += "🧠 You already have the Quiz Master title!";
      }
    }

    // save completion date
    const today = new Date().toDateString();
    localStorage.setItem("quizCompletedDate", today);
    quizCompletedDate = today;

    // show result
    document.getElementById("questionText").innerText = message;
    document.getElementById("answerButtons").innerHTML = "";
    document.getElementById("quizFeedback").innerText = "";

    // reset for next time
    correctAnswers = 0;

    return;
  }

  loadQuestion();
}

function unlockQuizTitle() {
  const newTitle = "🧠 Quiz Master";

  if (!unlockedTitles.includes(newTitle)) {
    unlockedTitles.push(newTitle);
    selectedTitle = newTitle;

    document.getElementById("reward").innerText =
      `Unlocked Title: ${newTitle}`;

    updateTitleSelector();
    saveProgress();

    return true; // ✅ NEW unlock
  }

  return false; // ❌ already owned
}


// INIT
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();

  const filterElement = document.getElementById("challengeFilter");
  if (filterElement) filterElement.value = "all";

  createSegments();
  renderLeaderboard();
  renderChallenges();

  showTab("active");

  //reset quiz if new day
  const today = new Date().toDateString();
  if (quizCompletedDate !== today) {
    currentQuestion = 0;
  }

  loadQuestion();
});


