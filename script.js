const board = document.getElementById("game-board");
const message = document.getElementById("message");
const quoteBox = document.getElementById("quote");
const keyboard = document.getElementById("keyboard");

let currentGuess = "";
let attempts = [];
const maxAttempts = 6;
let answer = "";
let quote = "";
let validGuesses = [];
const keyboardStatus = {}; // e.g., { a: "correct", t: "present", x: "absent" }

const keys = [
  "qwertyuiop".split(""),
  "asdfghjkl".split(""),
  ["Enter", ..."zxcvbnm".split(""), "Backspace"]
];

async function loadGameData() {
  const [wordRes, quoteRes, guessRes] = await Promise.all([
    fetch("wordle-answers.json"),
    fetch("quotes.json"),
    fetch("wordle-guesses.json")
  ]);

  const wordList = await wordRes.json();
  const quoteList = await quoteRes.json();
  validGuesses = await guessRes.json();

  const startDate = new Date("2021-06-19");
  const today = new Date();
  const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  answer = wordList[dayDiff % wordList.length];
  quote = quoteList[dayDiff % quoteList.length];
  updateBoard();
  createKeyboard();
}

function updateBoard() {
  board.innerHTML = "";
  for (let attempt of attempts) {
    const status = getGuessStatus(attempt);
    const row = renderRow(attempt, status);
    board.append(...row);
  }
  if (attempts.length < maxAttempts) {
    const row = renderRow(currentGuess);
    board.append(...row);
  }
}

function getGuessStatus(guess) {
  const status = Array(5).fill("absent");
  const answerLetterCount = {};
  for (let i = 0; i < 5; i++) {
    const letter = answer[i];
    answerLetterCount[letter] = (answerLetterCount[letter] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      status[i] = "correct";
      answerLetterCount[guess[i]]--;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (status[i] === "correct") continue;
    const letter = guess[i];
    if (answer.includes(letter) && answerLetterCount[letter] > 0) {
      status[i] = "present";
      answerLetterCount[letter]--;
    }
  }
  return status;
}

function renderRow(guess, status = []) {
  const row = [];
  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = guess[i] || "";
    if (status[i]) {
      tile.classList.add(status[i]);
    }
    row.push(tile);
  }
  return row;
}

document.addEventListener("keydown", (e) => handleKey(e.key));

function handleKey(key) {
  if (!answer || attempts.length >= maxAttempts) return;

  if (key === "Enter") {
    if (currentGuess.length !== 5) return;
    if (!validGuesses.includes(currentGuess)) {
      message.textContent = "Invalid word. Try a valid 5-letter word.";
      return;
    }

    const status = getGuessStatus(currentGuess);

    for (let i = 0; i < 5; i++) {
      const letter = currentGuess[i];
      const state = status[i];
      const prev = keyboardStatus[letter];
      if (
        state === "correct" ||
        (state === "present" && prev !== "correct") ||
        (state === "absent" && !prev)
      ) {
        keyboardStatus[letter] = state;
      }
    }

    attempts.push(currentGuess);
    createKeyboard();
    updateBoard();

    if (currentGuess === answer) {
      message.textContent = "You got it!";
      document.getElementById("popup-quote").textContent = quote;
      document.getElementById("popup").classList.remove("hidden");
    } else if (attempts.length === maxAttempts) {
      message.textContent = `Out of tries! The word was: ${answer}. No quote today 🙁`;
    }

    currentGuess = "";
  } else if (key === "Backspace") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key.toLowerCase();
  }
  updateBoard();
}

function createKeyboard() {
  keyboard.innerHTML = "";
  keys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach(k => {
      const keyBtn = document.createElement("button");
      keyBtn.textContent = k === "Backspace" ? "⌫" : k;
      keyBtn.className = "key";
      if (keyboardStatus[k]) {
        keyBtn.classList.add(keyboardStatus[k]);
      }

      keyBtn.setAttribute("data-key", k);
      keyBtn.setAttribute("aria-label", k);
      keyBtn.onclick = () => handleKey(k);
      rowDiv.appendChild(keyBtn);
    });

    keyboard.appendChild(rowDiv);
  });
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

loadGameData();
