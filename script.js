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

function getDailyQuote(quotes) {
    const todayKey = getTodayKey();
    const stored = JSON.parse(localStorage.getItem(quoteKey));

    if (stored && stored.date === todayKey) {
        return stored.quote;
    } else {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        localStorage.setItem(quoteKey, JSON.stringify({ date: todayKey, quote }));
        return quote;
    }
}

async function loadQuotes() {
    try {
        const res = await fetch("quotes.json");
        const quotes = await res.json();
        const quote = getDailyQuote(quotes);
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