const accessCode = "2020";
const accessKey = "userHasAccess";
const quoteKey = "dailyQuote";

function getTodayKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function requireAccess() {
    const hasAccess = localStorage.getItem(accessKey);
    if (hasAccess === "true") return true;

    const userInput = prompt("Enter access code:");
    if (userInput === accessCode) {
        localStorage.setItem(accessKey, "true");
        return true;
    } else {
        alert("Incorrect code. Access denied.");
        return false;
    }
}

function getDeterministicQuote(quotes) {
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}

async function loadQuotes() {
  try {
    const res = await fetch("quotes.json");
    const quotes = await res.json();
    const quote = getDeterministicQuote(quotes);
    document.getElementById("quote").innerText = quote;
  } catch (err) {
    document.getElementById("quote").innerText = "Failed to load quotes.";
    console.error("Error loading quotes:", err);
  }
}

if (requireAccess()) {
    loadQuotes();
} else {
    document.getElementById("quote").innerText = "Access denied.";
}
